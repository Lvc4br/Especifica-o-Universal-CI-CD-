function Get-CicdAdapter {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$StepId,[Parameter(Mandatory)][string]$ProjectRoot)
    return Get-CicdAdapterDefinition -StepId $StepId -ProjectRoot $ProjectRoot
}

function New-CicdSourceArtifact {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$ProjectRoot)

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $root = [System.IO.Path]::GetFullPath($ProjectRoot)
    $artifactDirectory = Join-Path $root ".cicd/artifacts"
    if (-not (Test-Path -LiteralPath $artifactDirectory -PathType Container)) {
        New-Item -ItemType Directory -Path $artifactDirectory -Force | Out-Null
    }

    $stamp = Get-Date -Format "yyyyMMdd-HHmmss-fff"
    $artifactPath = Join-Path $artifactDirectory "$stamp-source.zip"
    $excluded = @(
        ".git", ".cicd", ".ssh", ".aws", ".azure", "secrets",
        "node_modules", ".venv", "venv", "bin", "obj", "dist", "build",
        "target", "vendor", "__pycache__", ".pytest_cache", ".mypy_cache",
        ".ruff_cache", ".gradle", ".dart_tool", "coverage"
    )

    $files = @(Get-ChildItem -LiteralPath $root -File -Recurse -Force -ErrorAction Stop | Where-Object {
        $relative = [System.IO.Path]::GetRelativePath($root, $_.FullName)
        $segments = $relative -split '[/\\]'
        $name = $_.Name
        $sensitiveFile = (
            $name -match '^(?i)(\.env($|\.)|id_rsa$|id_ed25519$|credentials($|\.)|secrets($|\.))' -or
            $name -match '(?i)\.(pem|key|pfx|p12|jks|keystore)$'
        )
        $isExcluded = @($segments | Where-Object { $_ -in $excluded }).Count -gt 0
        $isLink = ($_.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0
        -not $isExcluded -and -not $sensitiveFile -and -not $isLink
    })

    if ($files.Count -eq 0) { throw "Nenhum arquivo elegível encontrado para empacotar." }

    $archive = [System.IO.Compression.ZipFile]::Open($artifactPath, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($file in $files) {
            $relative = [System.IO.Path]::GetRelativePath($root, $file.FullName).Replace('\', '/')
            [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                $archive, $file.FullName, $relative, [System.IO.Compression.CompressionLevel]::Optimal
            )
        }
    } finally {
        $archive.Dispose()
    }
    return $artifactPath
}

function Invoke-CicdPipeline {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$ProjectRoot,
        [Parameter(Mandatory)][object]$Config,
        [switch]$Approve,
        [ValidateRange(1,86400)][int]$TimeoutSeconds = 600
    )

    $plan = Get-CicdExecutionPlan -ProjectRoot $ProjectRoot -Config $Config
    $results = [System.Collections.Generic.List[object]]::new()
    $planned = @($plan.steps | Where-Object {
        $_.status -eq "PLANNED" -and $_.category -in @("check","test","build","security","delivery")
    })

    if (-not $Approve) {
        foreach ($step in $planned) {
            $results.Add((New-CicdResult -Id $step.id -Name $step.name -Status "SKIPPED" -Summary "Aguardando aprovação explícita."))
        }
        return [pscustomobject]@{
            approved = $false
            performed = $false
            plan = $plan
            results = @($results)
            exitCode = 0
            reportPath = $null
        }
    }

    foreach ($step in $plan.steps) {
        if ($step.status -ne "PLANNED" -or $step.category -notin @("check","test","build","security","delivery")) {
            $status = switch ($step.status) {
                "BLOCKED" { "BLOCKED" }
                "DISABLED" { "SKIPPED" }
                "NOT_APPLICABLE" { "SKIPPED" }
                "NOT_IMPLEMENTED" { "NOT_IMPLEMENTED" }
                default { "SKIPPED" }
            }
            $results.Add((New-CicdResult -Id $step.id -Name $step.name -Status $status -Summary $step.reason))
            continue
        }

        if ($step.id -eq "delivery-source-archive") {
            try {
                $artifact = New-CicdSourceArtifact -ProjectRoot $ProjectRoot
                $deliveryResult = New-CicdResult -Id $step.id -Name $step.name -Status "PASSED" -Summary "Pacote de código-fonte criado." -Tool "internal" -Command "Create source archive"
                $deliveryResult | Add-Member -NotePropertyName artifacts -NotePropertyValue @($artifact)
                $results.Add($deliveryResult)
            } catch {
                $results.Add((New-CicdResult -Id $step.id -Name $step.name -Status "FAILED" -Summary "Falha ao criar artefato: $($_.Exception.Message)" -Tool "internal"))
            }
            continue
        }

        $adapter = Get-CicdAdapter -StepId $step.id -ProjectRoot $ProjectRoot
        if ($null -eq $adapter) {
            $results.Add((New-CicdResult -Id $step.id -Name $step.name -Status "NOT_IMPLEMENTED" -Summary "Adaptador não registrado na allowlist."))
            continue
        }

        $command = Get-Command -Name $adapter.tool -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($null -eq $command) {
            $results.Add((New-CicdResult -Id $step.id -Name $step.name -Status "BLOCKED" -Summary "Executável '$($adapter.tool)' não encontrado."))
            continue
        }

        $processResult = Invoke-CicdProcess -Executable $command.Source -Arguments $adapter.arguments -WorkingDirectory $ProjectRoot -TimeoutSeconds $TimeoutSeconds
        $status = if ($processResult.timedOut -or $processResult.exitCode -ne 0) { "FAILED" } else { "PASSED" }
        $summary = if ($processResult.timedOut) {
            "Tempo limite excedido após $TimeoutSeconds segundo(s)."
        } elseif ($status -eq "PASSED") {
            "Processo concluído com código 0."
        } else {
            "Processo terminou com código $($processResult.exitCode)."
        }

        $result = New-CicdResult -Id $step.id -Name $step.name -Status $status -Summary $summary -Tool $adapter.tool -ExitCode $processResult.exitCode -Command ($adapter.tool + " " + ($adapter.arguments -join " "))
        $result.startedAt = $processResult.startedAt
        $result.finishedAt = $processResult.finishedAt
        $result.durationMs = $processResult.durationMs
        $result | Add-Member -NotePropertyName stdout -NotePropertyValue (Protect-CicdOutput -Text $processResult.stdout)
        $result | Add-Member -NotePropertyName stderr -NotePropertyValue (Protect-CicdOutput -Text $processResult.stderr)
        $results.Add($result)
    }

    $exitCode = Get-CicdExitCode -Results @($results)
    $reportDirectory = Join-Path $ProjectRoot ".cicd/reports"
    if (-not (Test-Path -LiteralPath $reportDirectory -PathType Container)) {
        New-Item -ItemType Directory -Path $reportDirectory -Force | Out-Null
    }
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss-fff"
    $reportPath = Join-Path $reportDirectory "$stamp-run.json"
    $report = [pscustomobject]@{
        schemaVersion = "1.0"
        toolVersion = "0.5.0-dev"
        project = $plan.project
        projectRoot = $plan.projectRoot
        generatedAt = (Get-Date).ToString("o")
        approved = $true
        performed = $true
        exitCode = $exitCode
        technologies = $plan.technologies
        results = @($results)
    }
    $report | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $reportPath -Encoding utf8

    return [pscustomobject]@{
        approved = $true
        performed = $true
        plan = $plan
        results = @($results)
        exitCode = $exitCode
        reportPath = $reportPath
    }
}
