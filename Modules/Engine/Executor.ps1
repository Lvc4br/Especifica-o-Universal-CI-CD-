function Get-CicdAdapter {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$StepId,[Parameter(Mandatory)][string]$ProjectRoot)
    switch ($StepId) {
        "python-lint" { return [pscustomobject]@{ tool="ruff"; arguments=@("check", ".") } }
        "python-tests" { return [pscustomobject]@{ tool="pytest"; arguments=@() } }
        "python-build" { return [pscustomobject]@{ tool="python"; arguments=@("-m", "build") } }
        "js-lint" { return [pscustomobject]@{ tool="npm"; arguments=@("run", "lint") } }
        "js-tests" { return [pscustomobject]@{ tool="npm"; arguments=@("test") } }
        "js-build" { return [pscustomobject]@{ tool="npm"; arguments=@("run", "build") } }
        "html-lint" { return [pscustomobject]@{ tool="htmlhint"; arguments=@(".") } }
        "css-lint" { return [pscustomobject]@{ tool="stylelint"; arguments=@("**/*.{css,scss,sass}") } }
        "sql-lint" { return [pscustomobject]@{ tool="sqlfluff"; arguments=@("lint", ".") } }
        "security-secrets" { return [pscustomobject]@{ tool="gitleaks"; arguments=@("dir", "--redact", "--exit-code", "1", ".") } }
        "security-vulnerabilities" { return [pscustomobject]@{ tool="trivy"; arguments=@("fs", "--scanners", "vuln,misconfig", "--exit-code", "1", "--no-progress", ".") } }
        "security-sast" { return [pscustomobject]@{ tool="semgrep"; arguments=@("scan", "--config", "auto", "--error", ".") } }
        "security-supply-chain" { return [pscustomobject]@{ tool="osv-scanner"; arguments=@("scan", "--recursive", ".") } }
        "php-lint" { return [pscustomobject]@{ tool="composer"; arguments=@("run-script", "lint") } }
        "php-tests" { return [pscustomobject]@{ tool="composer"; arguments=@("run-script", "test") } }
        "php-build" { return [pscustomobject]@{ tool="composer"; arguments=@("validate", "--no-check-publish") } }
        "ruby-lint" { return [pscustomobject]@{ tool="bundle"; arguments=@("exec", "rubocop") } }
        "ruby-tests" { return [pscustomobject]@{ tool="bundle"; arguments=@("exec", "rspec") } }
        "ruby-build" { return [pscustomobject]@{ tool="bundle"; arguments=@("check") } }
        "lua-lint" { return [pscustomobject]@{ tool="luacheck"; arguments=@(".") } }
        "lua-tests" { return [pscustomobject]@{ tool="busted"; arguments=@() } }
        "cpp-configure" { return [pscustomobject]@{ tool="cmake"; arguments=@("-S", ".", "-B", "build") } }
        "cpp-tests" { return [pscustomobject]@{ tool="ctest"; arguments=@("--test-dir", "build", "--output-on-failure") } }
        "cpp-build" { return [pscustomobject]@{ tool="cmake"; arguments=@("--build", "build", "--parallel") } }
        "kotlin-check" { return [pscustomobject]@{ tool="gradle"; arguments=@("check") } }
        "kotlin-tests" { return [pscustomobject]@{ tool="gradle"; arguments=@("test") } }
        "kotlin-build" { return [pscustomobject]@{ tool="gradle"; arguments=@("build") } }
        "swift-check" { return [pscustomobject]@{ tool="swift"; arguments=@("package", "diagnose") } }
        "swift-tests" { return [pscustomobject]@{ tool="swift"; arguments=@("test") } }
        "swift-build" { return [pscustomobject]@{ tool="swift"; arguments=@("build") } }
        "dart-check" { return [pscustomobject]@{ tool="dart"; arguments=@("analyze") } }
        "dart-tests" { return [pscustomobject]@{ tool="dart"; arguments=@("test") } }
        "dart-build" { return [pscustomobject]@{ tool="dart"; arguments=@("compile", "exe", "bin/main.dart") } }
        "go-vet" { return [pscustomobject]@{ tool="go"; arguments=@("vet", "./...") } }
        "go-tests" { return [pscustomobject]@{ tool="go"; arguments=@("test", "./...") } }
        "go-build" { return [pscustomobject]@{ tool="go"; arguments=@("build", "./...") } }
        "rust-format" { return [pscustomobject]@{ tool="cargo"; arguments=@("fmt", "--all", "--", "--check") } }
        "rust-tests" { return [pscustomobject]@{ tool="cargo"; arguments=@("test", "--workspace") } }
        "rust-build" { return [pscustomobject]@{ tool="cargo"; arguments=@("build", "--workspace") } }
        "dotnet-format" { return [pscustomobject]@{ tool="dotnet"; arguments=@("format", "--verify-no-changes") } }
        "dotnet-tests" { return [pscustomobject]@{ tool="dotnet"; arguments=@("test") } }
        "dotnet-build" { return [pscustomobject]@{ tool="dotnet"; arguments=@("build") } }
        "java-check" {
            if (Test-Path -LiteralPath (Join-Path $ProjectRoot "pom.xml")) { return [pscustomobject]@{ tool="mvn"; arguments=@("validate") } }
            return [pscustomobject]@{ tool="gradle"; arguments=@("check") }
        }
        "java-tests" {
            if (Test-Path -LiteralPath (Join-Path $ProjectRoot "pom.xml")) { return [pscustomobject]@{ tool="mvn"; arguments=@("test") } }
            return [pscustomobject]@{ tool="gradle"; arguments=@("test") }
        }
        "java-build" {
            if (Test-Path -LiteralPath (Join-Path $ProjectRoot "pom.xml")) { return [pscustomobject]@{ tool="mvn"; arguments=@("package") } }
            return [pscustomobject]@{ tool="gradle"; arguments=@("build") }
        }
        default { return $null }
    }
}

function New-CicdSourceArtifact {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$ProjectRoot)
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $artifactDirectory = Join-Path $ProjectRoot ".cicd/artifacts"
    if (-not (Test-Path -LiteralPath $artifactDirectory)) { New-Item -ItemType Directory -Path $artifactDirectory -Force | Out-Null }
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss-fff"
    $artifactPath = Join-Path $artifactDirectory "$stamp-source.zip"
    $excluded = @(".git", ".cicd", "node_modules", ".venv", "venv", "bin", "obj", "dist", "build", "target", "__pycache__", ".pytest_cache")
    $files = @(Get-ChildItem -LiteralPath $ProjectRoot -File -Recurse -ErrorAction Stop | Where-Object {
        $relative = [System.IO.Path]::GetRelativePath($ProjectRoot, $_.FullName)
        $segments = $relative -split '[/\\]'
        -not ($segments | Where-Object { $_ -in $excluded })
    })
    if ($files.Count -eq 0) { throw "Nenhum arquivo elegível encontrado para empacotar." }
    $archive = [System.IO.Compression.ZipFile]::Open($artifactPath, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($file in $files) {
            $relative = [System.IO.Path]::GetRelativePath($ProjectRoot, $file.FullName).Replace('\', '/')
            [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $relative, [System.IO.Compression.CompressionLevel]::Optimal)
        }
    } finally { $archive.Dispose() }
    return $artifactPath
}

function Invoke-CicdPipeline {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$ProjectRoot,[Parameter(Mandatory)][object]$Config,[switch]$Approve,[ValidateRange(1,86400)][int]$TimeoutSeconds=600)
    $plan = Get-CicdExecutionPlan -ProjectRoot $ProjectRoot -Config $Config
    $results = [System.Collections.Generic.List[object]]::new()
    $planned = @($plan.steps | Where-Object { $_.status -eq "PLANNED" -and $_.category -in @("check","test","build","security","delivery") })
    if (-not $Approve) {
        foreach ($step in $planned) { $results.Add((New-CicdResult -Id $step.id -Name $step.name -Status "SKIPPED" -Summary "Aguardando aprovação explícita.")) }
        return [pscustomobject]@{ approved=$false; performed=$false; plan=$plan; results=@($results); exitCode=0; reportPath=$null }
    }
    foreach ($step in $plan.steps) {
        if ($step.status -ne "PLANNED" -or $step.category -notin @("check","test","build","security","delivery")) {
            $status = switch ($step.status) { "BLOCKED" {"BLOCKED"} "DISABLED" {"SKIPPED"} "NOT_APPLICABLE" {"SKIPPED"} "NOT_IMPLEMENTED" {"NOT_IMPLEMENTED"} default {"SKIPPED"} }
            $results.Add((New-CicdResult -Id $step.id -Name $step.name -Status $status -Summary $step.reason))
            continue
        }
        if ($step.id -eq "delivery-source-archive") {
            try {
                $artifact = New-CicdSourceArtifact -ProjectRoot $ProjectRoot
                $deliveryResult = New-CicdResult -Id $step.id -Name $step.name -Status "PASSED" -Summary "Pacote de código-fonte criado." -Tool "internal" -Command "Create source archive"
                $deliveryResult.artifacts = @($artifact)
                $results.Add($deliveryResult)
            } catch {
                $results.Add((New-CicdResult -Id $step.id -Name $step.name -Status "FAILED" -Summary "Falha ao criar artefato: $($_.Exception.Message)" -Tool "internal"))
            }
            continue
        }
        $adapter = Get-CicdAdapter -StepId $step.id -ProjectRoot $ProjectRoot
        if ($null -eq $adapter) { $results.Add((New-CicdResult -Id $step.id -Name $step.name -Status "NOT_IMPLEMENTED" -Summary "Adaptador não registrado na allowlist.")); continue }
        $command = Get-Command -Name $adapter.tool -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($null -eq $command) { $results.Add((New-CicdResult -Id $step.id -Name $step.name -Status "BLOCKED" -Summary "Executável '$($adapter.tool)' não encontrado.")); continue }
        $processResult = Invoke-CicdProcess -Executable $command.Source -Arguments $adapter.arguments -WorkingDirectory $ProjectRoot -TimeoutSeconds $TimeoutSeconds
        $status = if ($processResult.timedOut -or $processResult.exitCode -ne 0) { "FAILED" } else { "PASSED" }
        $summary = if ($processResult.timedOut) { "Tempo limite excedido após $TimeoutSeconds segundo(s)." } elseif ($status -eq "PASSED") { "Processo concluído com código 0." } else { "Processo terminou com código $($processResult.exitCode)." }
        $result = New-CicdResult -Id $step.id -Name $step.name -Status $status -Summary $summary -Tool $adapter.tool -ExitCode $processResult.exitCode -Command ($adapter.tool + " " + ($adapter.arguments -join " "))
        $result.startedAt=$processResult.startedAt; $result.finishedAt=$processResult.finishedAt; $result.durationMs=$processResult.durationMs
        $result | Add-Member -NotePropertyName stdout -NotePropertyValue (Protect-CicdOutput -Text $processResult.stdout)
        $result | Add-Member -NotePropertyName stderr -NotePropertyValue (Protect-CicdOutput -Text $processResult.stderr)
        $results.Add($result)
    }
    $exitCode = Get-CicdExitCode -Results @($results)
    $reportDirectory = Join-Path $ProjectRoot ".cicd/reports"
    if (-not (Test-Path -LiteralPath $reportDirectory)) { New-Item -ItemType Directory -Path $reportDirectory -Force | Out-Null }
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss-fff"
    $reportPath = Join-Path $reportDirectory "$stamp-run.json"
    $report = [pscustomobject]@{ schemaVersion="1.0"; toolVersion="0.5.0-dev"; project=$plan.project; projectRoot=$plan.projectRoot; generatedAt=(Get-Date).ToString("o"); approved=$true; performed=$true; exitCode=$exitCode; technologies=$plan.technologies; results=@($results) }
    $report | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $reportPath -Encoding utf8
    [pscustomobject]@{ approved=$true; performed=$true; plan=$plan; results=@($results); exitCode=$exitCode; reportPath=$reportPath }
}
