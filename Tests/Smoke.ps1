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
    Assert-True ($version -match "0[.]3[.]0-dev") "version must report 0.3.0-dev"
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
        pipeline = @{ check = $true; test = $true; build = $false; security = $false; delivery = $false }
    }
    Set-Content -LiteralPath $configPath -Value ($validConfig | ConvertTo-Json -Depth 5) -Encoding utf8
    Set-Content -LiteralPath (Join-Path $tempRoot "sample.py") -Value "print('smoke')" -Encoding utf8
    $detection = & pwsh -NoProfile -File $scriptPath detect 2>&1 | Out-String
    Assert-True ($detection -match "Python") "detect must identify Python"
    Assert-True ($detection -match "sample[.]py") "detect must print evidence"
    $planOutput = & pwsh -NoProfile -File $scriptPath plan 2>&1 | Out-String
    Assert-True ($planOutput -match "Execução realizada: não") "plan must state no execution occurred"
    $planPath = Join-Path $tempRoot ".cicd/plans/latest-plan.json"
    Assert-True (Test-Path -LiteralPath $planPath) "plan must persist JSON"
    $plan = Get-Content -LiteralPath $planPath -Raw | ConvertFrom-Json
    Assert-True (-not $plan.execution.performed) "plan execution flag must remain false"
    Assert-True ($plan.steps.Count -ge 5) "plan must include configured and unsupported stages"
    Assert-True (@($plan.steps | Where-Object { $_.executed }).Count -eq 0) "no step may be executed by planner"
    Assert-True (@($plan.steps | Where-Object { $_.id -eq "python-tests" }).Count -eq 1) "python test stage must be represented"
    $status = & pwsh -NoProfile -File $scriptPath status 2>&1 | Out-String
    Assert-True ($status -match "Plano: encontrado") "status must report generated plan"
    . (Join-Path $tempRoot "Core/Result.ps1")
    $result = New-CicdResult -Id "unit" -Name "Unit result" -Status "FAILED" -Summary "expected failure"
    Assert-True ($result.status -eq "FAILED") "result contract must preserve status"
    Assert-True ((Get-CicdExitCode -Results @($result)) -eq 1) "failed result maps to exit code 1"
    Write-Host "Smoke tests: PASSED"
} finally {
    if (Test-Path -LiteralPath $tempRoot) { Remove-Item -LiteralPath $tempRoot -Recurse -Force }
}