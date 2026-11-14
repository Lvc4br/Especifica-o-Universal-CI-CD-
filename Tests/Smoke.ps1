[CmdletBinding()]
param()
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("universal-cicd-smoke-" + [guid]::NewGuid().ToString("N"))
function Assert-True {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw "ASSERTION FAILED: $Message" }
}
try {
    New-Item -ItemType Directory -Path $tempRoot | Out-Null
    Copy-Item -LiteralPath (Join-Path $repoRoot "cicd.ps1") -Destination $tempRoot
    foreach ($folder in @("Core", "Modules")) {
        Copy-Item -LiteralPath (Join-Path $repoRoot $folder) -Destination $tempRoot -Recurse
    }
    $scriptPath = Join-Path $tempRoot "cicd.ps1"
    $version = & pwsh -NoProfile -File $scriptPath version 2>&1 | Out-String
    Assert-True ($version -match "0[.]5[.]0-dev") "version must report 0.5.0-dev"
    & pwsh -NoProfile -File $scriptPath init
    $configPath = Join-Path $tempRoot ".cicd/config.json"
    Assert-True (Test-Path -LiteralPath $configPath) "init must create config"
    $validation = & pwsh -NoProfile -File $scriptPath validate-config 2>&1 | Out-String
    Assert-True ($validation -match "Configuração válida") "default config must validate"
    Set-Content -LiteralPath $configPath -Value '{"sentinel":"preserve-me"}' -Encoding utf8
    & pwsh -NoProfile -File $scriptPath init
    Assert-True ((Get-Content -LiteralPath $configPath -Raw) -match "preserve-me") "init must preserve existing config"
    $null = & pwsh -NoProfile -File $scriptPath validate-config 2>&1 | Out-String
    Assert-True ($LASTEXITCODE -ne 0) "invalid config must fail validation"
    $validConfig = @{
        schemaVersion = "1.0"
        project = @{ name = "smoke"; root = "." }
        runtime = @{ powershell = "7.2+" }
        detection = @{ enabled = $true; excludeDirectories = @(".git", ".cicd", "node_modules") }
        pipeline = @{ check = $true; test = $true; build = $true; security = $false; delivery = $false }
    }
    Set-Content -LiteralPath $configPath -Value ($validConfig | ConvertTo-Json -Depth 5) -Encoding utf8
    Set-Content -LiteralPath (Join-Path $tempRoot "sample.py") -Value "print('smoke')" -Encoding utf8
    Set-Content -LiteralPath (Join-Path $tempRoot "go.mod") -Value "module fixture" -Encoding utf8
    Set-Content -LiteralPath (Join-Path $tempRoot "main.go") -Value "package main" -Encoding utf8
    Set-Content -LiteralPath (Join-Path $tempRoot "Cargo.toml") -Value "[package]" -Encoding utf8
    Set-Content -LiteralPath (Join-Path $tempRoot "main.rs") -Value "fn main() {}" -Encoding utf8
    Set-Content -LiteralPath (Join-Path $tempRoot "Example.cs") -Value "public class Example {}" -Encoding utf8
    Set-Content -LiteralPath (Join-Path $tempRoot "pom.xml") -Value "<project></project>" -Encoding utf8
    $detection = & pwsh -NoProfile -File $scriptPath detect 2>&1 | Out-String
    Assert-True ($detection -match "Python") "detect must identify Python"
    Assert-True ($detection -match "sample[.]py") "detect must print evidence"
    $planOutput = & pwsh -NoProfile -File $scriptPath plan 2>&1 | Out-String
    Assert-True ($LASTEXITCODE -eq 0) "plan command must exit successfully; output: $planOutput" 
    Assert-True ($planOutput -match "Execução realizada: não") "plan must state no execution occurred; output: $planOutput"
    $planPath = Join-Path $tempRoot ".cicd/plans/latest-plan.json"
    Assert-True (Test-Path -LiteralPath $planPath) "plan must persist JSON"
    $plan = Get-Content -LiteralPath $planPath -Raw | ConvertFrom-Json
    Assert-True (-not $plan.execution.performed) "plan execution flag must remain false"
    Assert-True ($plan.steps.Count -ge 15) "plan must include language-specific check/test/build stages"
    foreach ($stageId in @("go-vet", "go-tests", "go-build", "rust-format", "rust-tests", "rust-build", "dotnet-format", "dotnet-tests", "dotnet-build", "java-check", "java-tests", "java-build")) {
        Assert-True (@($plan.steps | Where-Object { $_.id -eq $stageId }).Count -eq 1) "plan must include adapter stage"
    }
    Assert-True ($plan.planVersion -eq "0.5.0-dev") "plan must report current version"
    Assert-True (@($plan.steps | Where-Object { $_.executed }).Count -eq 0) "no step may be executed by planner"
    Assert-True (@($plan.steps | Where-Object { $_.id -eq "python-tests" }).Count -eq 1) "python test stage must be represented"
    $status = & pwsh -NoProfile -File $scriptPath status 2>&1 | Out-String
    Assert-True ($status -match "Plano: encontrado") "status must report generated plan"
    . (Join-Path $tempRoot "Core/Result.ps1")
    $result = New-CicdResult -Id "unit" -Name "Unit result" -Status "FAILED" -Summary "expected failure"
    Assert-True ($result.status -eq "FAILED") "result contract must preserve status"
    Assert-True ((Get-CicdExitCode -Results @($result)) -eq 1) "failed result maps to exit code 1"
    $blockedResult = New-CicdResult -Id "blocked" -Name "Missing tool" -Status "BLOCKED"
    Assert-True ((Get-CicdExitCode -Results @($blockedResult)) -eq 3) "blocked result must not look successful"

    . (Join-Path $tempRoot "Core/Process.ps1")
    . (Join-Path $tempRoot "Modules/Engine/Executor.ps1")
    $pwsh = Join-Path $PSHOME $(if ($IsWindows) { "pwsh.exe" } else { "pwsh" })
    $successScript = Join-Path $tempRoot "process-success.ps1"
    Set-Content -LiteralPath $successScript -Value 'Write-Output "runner-ok"; exit 0' -Encoding utf8
    $processOk = Invoke-CicdProcess -Executable $pwsh -Arguments @("-NoProfile", "-File", $successScript) -WorkingDirectory $tempRoot -TimeoutSeconds 15
    Assert-True (-not $processOk.timedOut) "process runner must not time out a short process"
    Assert-True ($processOk.exitCode -eq 0) "process runner must capture exit code 0"
    Assert-True ($processOk.stdout -match "runner-ok") "process runner must capture stdout"
    Assert-True ($processOk.durationMs -ge 0) "process runner must record duration"

    $failureScript = Join-Path $tempRoot "process-failure.ps1"
    Set-Content -LiteralPath $failureScript -Value 'Write-Error "expected-error"; exit 7' -Encoding utf8
    $processFail = Invoke-CicdProcess -Executable $pwsh -Arguments @("-NoProfile", "-File", $failureScript) -WorkingDirectory $tempRoot -TimeoutSeconds 15
    Assert-True ($processFail.exitCode -ne 0) "process runner must preserve non-zero exit codes"
    Assert-True (-not [string]::IsNullOrEmpty($processFail.stderr)) "process runner must capture stderr"

    $timeoutScript = Join-Path $tempRoot "process-timeout.ps1"
    Set-Content -LiteralPath $timeoutScript -Value 'Start-Sleep -Seconds 5' -Encoding utf8
    $processTimeout = Invoke-CicdProcess -Executable $pwsh -Arguments @("-NoProfile", "-File", $timeoutScript) -WorkingDirectory $tempRoot -TimeoutSeconds 1
    Assert-True ($processTimeout.timedOut) "process runner must enforce timeout"

    $redacted = Protect-CicdOutput -Text "token=supersecret authorization: Bearer abcdefghijklmnop"
    Assert-True ($redacted -notmatch "supersecret|abcdefghijklmnop") "report output must redact common secrets"
    Assert-True ((Get-CicdAdapter -StepId "python-tests" -ProjectRoot $tempRoot).tool -eq "pytest") "known adapter must resolve from fixed allowlist"
    Assert-True ((Get-CicdAdapter -StepId "go-tests" -ProjectRoot $tempRoot).arguments -join " " -eq "test ./...") "Go test adapter must use canonical test command"
    Assert-True ((Get-CicdAdapter -StepId "rust-tests" -ProjectRoot $tempRoot).arguments -join " " -eq "test --workspace") "Rust test adapter must target workspace"
    Assert-True ((Get-CicdAdapter -StepId "dotnet-tests" -ProjectRoot $tempRoot).arguments -join " " -eq "test") ".NET test adapter must use dotnet test"
    Assert-True ((Get-CicdAdapter -StepId "java-tests" -ProjectRoot $tempRoot).tool -eq "mvn") "Java adapter must select Maven from pom.xml"
    Assert-True ($null -eq (Get-CicdAdapter -StepId "arbitrary-command" -ProjectRoot $tempRoot)) "unknown command must not resolve to an adapter"

    Write-Host "Smoke tests: PASSED"
} finally {
    if (Test-Path -LiteralPath $tempRoot) { Remove-Item -LiteralPath $tempRoot -Recurse -Force }
}