function Get-CicdAdapter {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$StepId)

    # Adapter IDs are fixed in source. Configuration and plan JSON cannot inject commands.
    switch ($StepId) {
        "python-lint" { return [pscustomobject]@{ tool = "ruff"; arguments = @("check", ".") } }
        "python-tests" { return [pscustomobject]@{ tool = "pytest"; arguments = @() } }
        "js-lint" { return [pscustomobject]@{ tool = "npm"; arguments = @("run", "lint", "--if-present") } }
        "js-tests" { return [pscustomobject]@{ tool = "npm"; arguments = @("test", "--", "--run") } }
        default { return $null }
    }
}

function Invoke-CicdPipeline {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$ProjectRoot,
        [Parameter(Mandatory)][object]$Config,
        [switch]$Approve,
        [ValidateRange(1, 86400)][int]$TimeoutSeconds = 600
    )

    $plan = Get-CicdExecutionPlan -ProjectRoot $ProjectRoot -Config $Config
    $results = [System.Collections.Generic.List[object]]::new()
    $planned = @($plan.steps | Where-Object { $_.status -eq "PLANNED" -and $_.category -in @("check", "test") })
    if (-not $Approve) {
        foreach ($step in $planned) {
            $results.Add((New-CicdResult -Id $step.id -Name $step.name -Status "SKIPPED" -Summary "Aguardando aprovação explícita."))
        }
        return [pscustomobject]@{ approved = $false; performed = $false; plan = $plan; results = @($results); exitCode = 0; reportPath = $null }
    }

    foreach ($step in $plan.steps) {
        if ($step.status -ne "PLANNED" -or $step.category -notin @("check", "test")) {
            $status = switch ($step.status) {
                "BLOCKED" { "SKIPPED" }
                "DISABLED" { "SKIPPED" }
                "NOT_APPLICABLE" { "SKIPPED" }
                "NOT_IMPLEMENTED" { "NOT_IMPLEMENTED" }
                default { "SKIPPED" }
            }
            $results.Add((New-CicdResult -Id $step.id -Name $step.name -Status $status -Summary $step.reason))
            continue
        }

        $adapter = Get-CicdAdapter -StepId $step.id
        if ($null -eq $adapter) {
            $results.Add((New-CicdResult -Id $step.id -Name $step.name -Status "NOT_IMPLEMENTED" -Summary "Adaptador não registrado na allowlist."))
            continue
        }
        $command = Get-Command -Name $adapter.tool -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($null -eq $command) {
            $results.Add((New-CicdResult -Id $step.id -Name $step.name -Status "SKIPPED" -Summary "Executável '$($adapter.tool)' não encontrado."))
            continue
        }

        $processResult = Invoke-CicdProcess -Executable $command.Source -Arguments $adapter.arguments -WorkingDirectory $ProjectRoot -TimeoutSeconds $TimeoutSeconds
        $status = if ($processResult.timedOut -or $processResult.exitCode -ne 0) { "FAILED" } else { "PASSED" }
        $summary = if ($processResult.timedOut) { "Tempo limite excedido após $TimeoutSeconds segundo(s)." } elseif ($status -eq "PASSED") { "Processo concluído com código 0." } else { "Processo terminou com código $($processResult.exitCode)." }
        $result = New-CicdResult -Id $step.id -Name $step.name -Status $status -Summary $summary -Tool $adapter.tool -ExitCode $processResult.exitCode -Command (($adapter.tool) + " " + ($adapter.arguments -join " "))
        $result.startedAt = $processResult.startedAt
        $result.finishedAt = $processResult.finishedAt
        $result.durationMs = $processResult.durationMs
        $result | Add-Member -NotePropertyName stdout -NotePropertyValue (Protect-CicdOutput -Text $processResult.stdout)
        $result | Add-Member -NotePropertyName stderr -NotePropertyValue (Protect-CicdOutput -Text $processResult.stderr)
        $results.Add($result)
    }

    $exitCode = Get-CicdExitCode -Results @($results)
    $reportDirectory = Join-Path $ProjectRoot ".cicd/reports"
    if (-not (Test-Path -LiteralPath $reportDirectory)) { New-Item -ItemType Directory -Path $reportDirectory -Force | Out-Null }
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss-fff"
    $reportPath = Join-Path $reportDirectory "$stamp-run.json"
    $report = [pscustomobject]@{
        schemaVersion = "1.0"
        toolVersion = "0.4.0-dev"
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
    [pscustomobject]@{ approved = $true; performed = $true; plan = $plan; results = @($results); exitCode = $exitCode; reportPath = $reportPath }
}
