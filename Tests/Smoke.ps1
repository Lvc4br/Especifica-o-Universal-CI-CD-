[CmdletBinding()]
param()
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$entrypoint = Join-Path $repoRoot "cicd.ps1"
$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("universal-cicd-smoke-" + [guid]::NewGuid().ToString("N"))
function Assert-True {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw "ASSERTION FAILED: $Message" }
}
try {
    New-Item -ItemType Directory -Path $tempRoot | Out-Null
    Copy-Item -LiteralPath $entrypoint -Destination (Join-Path $tempRoot "cicd.ps1")
    Copy-Item -LiteralPath (Join-Path $repoRoot "Core") -Destination $tempRoot -Recurse
    Copy-Item -LiteralPath (Join-Path $repoRoot "Modules") -Destination $tempRoot -Recurse
    $scriptPath = Join-Path $tempRoot "cicd.ps1"
    $version = & pwsh -NoProfile -File $scriptPath version 2>&1 | Out-String
    Assert-True ($version -match "0[.]2[.]0-dev") "version command must report current version"
    & pwsh -NoProfile -File $scriptPath init
    $configPath = Join-Path $tempRoot ".cicd/config.json"
    Assert-True (Test-Path -LiteralPath $configPath) "init must create config.json"
    $validation = & pwsh -NoProfile -File $scriptPath validate-config 2>&1 | Out-String
    Assert-True ($validation -match "Configuração válida") "validate-config must accept default config"
    Set-Content -LiteralPath $configPath -Value '{"sentinel":"preserve-me"}' -Encoding utf8
    & pwsh -NoProfile -File $scriptPath init
    $config = Get-Content -LiteralPath $configPath -Raw
    Assert-True ($config -match "preserve-me") "init must not overwrite existing configuration"
    $null = & pwsh -NoProfile -File $scriptPath validate-config 2>&1 | Out-String
    Assert-True ($LASTEXITCODE -ne 0) "validate-config must reject missing required properties"
    Set-Content -LiteralPath $configPath -Value (@{
        schemaVersion = "1.0"
        project = @{ name = "smoke"; root = "." }
        runtime = @{ powershell = "7.2+" }
        detection = @{ enabled = $true; excludeDirectories = @(".git", ".cicd", "node_modules") }
        pipeline = @{ check = $false; test = $false; build = $false; security = $false; delivery = $false }
    } | ConvertTo-Json -Depth 5) -Encoding utf8
    Set-Content -LiteralPath (Join-Path $tempRoot "sample.py") -Value "print('smoke')" -Encoding utf8
    $detection = & pwsh -NoProfile -File $scriptPath detect 2>&1 | Out-String
    Assert-True ($detection -match "Python") "detect must identify Python"
    Assert-True ($detection -match "sample[.]py") "detect must report evidence"
    $status = & pwsh -NoProfile -File $scriptPath status 2>&1 | Out-String
    Assert-True ($status -match "Configuração: encontrada") "status must find config"
    . (Join-Path $tempRoot "Core/Result.ps1")
    $result = New-CicdResult -Id "unit" -Name "Unit result" -Status "FAILED" -Summary "expected failure"
    Assert-True ($result.status -eq "FAILED") "result contract must preserve status"
    Assert-True ((Get-CicdExitCode -Results @($result)) -eq 1) "failed result maps to exit code 1"
    Write-Host "Smoke tests: PASSED"
} finally {
    if (Test-Path -LiteralPath $tempRoot) { Remove-Item -LiteralPath $tempRoot -Recurse -Force }
}