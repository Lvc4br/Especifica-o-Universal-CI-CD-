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
    $version = & pwsh -NoProfile -File (Join-Path $tempRoot "cicd.ps1") version 2>&1 | Out-String
    Assert-True ($version -match "0[.]1[.]0-dev") "version command must report the bootstrap version"
    & pwsh -NoProfile -File (Join-Path $tempRoot "cicd.ps1") init
    $configPath = Join-Path $tempRoot ".cicd/config.json"
    Assert-True (Test-Path -LiteralPath $configPath) "init must create config.json"
    Set-Content -LiteralPath $configPath -Value '{"sentinel":"preserve-me"}' -Encoding utf8
    & pwsh -NoProfile -File (Join-Path $tempRoot "cicd.ps1") init
    $config = Get-Content -LiteralPath $configPath -Raw
    Assert-True ($config -match "preserve-me") "init must not overwrite existing configuration"
    Set-Content -LiteralPath (Join-Path $tempRoot "sample.py") -Value "print('smoke')" -Encoding utf8
    $detection = & pwsh -NoProfile -File (Join-Path $tempRoot "cicd.ps1") detect 2>&1 | Out-String
    Assert-True ($detection -match "Python") "detect must identify a Python source file"
    $status = & pwsh -NoProfile -File (Join-Path $tempRoot "cicd.ps1") status 2>&1 | Out-String
    Assert-True ($status -match "Configuração: encontrada") "status must find the initialized configuration"
    Write-Host "Smoke tests: PASSED"
} finally {
    if (Test-Path -LiteralPath $tempRoot) { Remove-Item -LiteralPath $tempRoot -Recurse -Force }
}
