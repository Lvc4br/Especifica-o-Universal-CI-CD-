[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateSet("version", "init", "detect", "status", "help")]
    [string]$Command = "help"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$script:ProjectRoot = $PSScriptRoot
$script:CicdRoot = Join-Path $script:ProjectRoot ".cicd"
$script:ConfigPath = Join-Path $script:CicdRoot "config.json"
$script:Version = "0.1.0-dev"

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-WarningMessage {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Show-Help {
    @"
Universal CI/CD $script:Version

Uso:
  pwsh ./cicd.ps1 <comando>

Comandos disponíveis:
  version  Exibe a versão
  init     Cria a configuração inicial sem sobrescrever arquivos
  detect   Detecta tecnologias por arquivos e marcadores
  status   Exibe o estado da configuração e relatórios locais
  help     Exibe esta ajuda

Observação: detecção identifica indícios no repositório; não executa
validadores, testes, builds ou verificações de segurança.
"@
}

function Initialize-Project {
    if (Test-Path -LiteralPath $script:ConfigPath) {
        Write-WarningMessage "A configuração já existe e não será sobrescrita: $script:ConfigPath"
        return
    }

    if (-not (Test-Path -LiteralPath $script:CicdRoot)) {
        New-Item -ItemType Directory -Path $script:CicdRoot -Force | Out-Null
    }

    $config = [ordered]@{
        schemaVersion = "1.0"
        project = @{
            name = Split-Path -Leaf $script:ProjectRoot
            root = "."
        }
        runtime = @{
            powershell = "7.2+"
        }
        detection = @{
            enabled = $true
            excludeDirectories = @(".git", ".cicd", "node_modules", ".venv", "venv", "bin", "obj", "dist", "build", "target")
        }
        pipeline = @{
            check = $false
            test = $false
            build = $false
            security = $false
            delivery = $false
        }
    }

    $json = $config | ConvertTo-Json -Depth 10
    Set-Content -LiteralPath $script:ConfigPath -Value $json -Encoding utf8
    Write-Info "Configuração criada: $script:ConfigPath"
    Write-WarningMessage "Nenhum pipeline de validação foi habilitado automaticamente."
}

function Get-DetectedTechnologies {
    $excludeDirectories = @(".git", ".cicd", "node_modules", ".venv", "venv", "bin", "obj", "dist", "build", "target")
    $files = Get-ChildItem -LiteralPath $script:ProjectRoot -File -Recurse -ErrorAction SilentlyContinue |
        Where-Object {
            $relativePath = [System.IO.Path]::GetRelativePath($script:ProjectRoot, $_.FullName)
            $segments = $relativePath -split '[/\\]'
            -not ($segments | Where-Object { $excludeDirectories -contains $_ })
        }

    $extensions = @{}
    foreach ($file in $files) {
        $ext = $file.Extension.ToLowerInvariant()
        if ($ext) {
            if (-not $extensions.ContainsKey($ext)) { $extensions[$ext] = 0 }
            $extensions[$ext]++
        }
    }

    $names = @($files | ForEach-Object { $_.Name })
    $found = [System.Collections.Generic.List[string]]::new()

    if ($extensions.ContainsKey(".py") -or ($names -contains "pyproject.toml") -or ($names -contains "requirements.txt")) { $found.Add("Python") }
    if ($extensions.ContainsKey(".js") -or $extensions.ContainsKey(".mjs") -or $extensions.ContainsKey(".cjs") -or ($names -contains "package.json")) { $found.Add("JavaScript") }

    $reactDetected = $false
    foreach ($packageFile in @($files | Where-Object { $_.Name -eq "package.json" })) {
        try {
            $package = Get-Content -LiteralPath $packageFile.FullName -Raw | ConvertFrom-Json
            foreach ($section in @("dependencies", "devDependencies", "peerDependencies")) {
                $sectionValue = $package.$section
                if ($null -ne $sectionValue -and $sectionValue.PSObject.Properties.Name -contains "react") {
                    $reactDetected = $true
                }
            }
        } catch {
            Write-WarningMessage "Manifesto package.json inválido ou ilegível: $($packageFile.FullName)"
        }
    }
    if ($extensions.ContainsKey(".jsx") -or $extensions.ContainsKey(".tsx") -or $reactDetected) { $found.Add("React (indício; requer validação do projeto)") }
    if ($extensions.ContainsKey(".ts") -or $extensions.ContainsKey(".tsx")) { $found.Add("TypeScript") }
    if ($extensions.ContainsKey(".html") -or ($names -contains "index.html")) { $found.Add("HTML") }
    if ($extensions.ContainsKey(".css") -or $extensions.ContainsKey(".scss") -or $extensions.ContainsKey(".sass")) { $found.Add("CSS") }
    if ($extensions.ContainsKey(".java") -or ($names -contains "pom.xml") -or ($names -contains "build.gradle") -or ($names -contains "build.gradle.kts")) { $found.Add("Java") }
    if ($extensions.ContainsKey(".lua")) { $found.Add("Lua") }
    if ($extensions.ContainsKey(".sql")) { $found.Add("SQL") }
    if ($extensions.ContainsKey(".cs") -or @($names | Where-Object { $_ -like "*.csproj" }).Count -gt 0) { $found.Add("C#") }
    if ($extensions.ContainsKey(".go") -or ($names -contains "go.mod")) { $found.Add("Go") }
    if ($extensions.ContainsKey(".rs") -or ($names -contains "Cargo.toml")) { $found.Add("Rust") }

    [pscustomobject]@{
        technologies = @($found | Sort-Object -Unique)
        fileCount = @($files).Count
        extensionCounts = $extensions
        scannedAt = (Get-Date).ToString("o")
        scope = "recursive file and marker scan; no project code executed"
    }
}

function Invoke-Detection {
    $result = Get-DetectedTechnologies
    Write-Info "Arquivos analisados: $($result.fileCount)"
    if ($result.technologies.Count -eq 0) {
        Write-WarningMessage "Nenhuma tecnologia reconhecida pelos marcadores básicos."
    } else {
        Write-Host "Tecnologias identificadas:"
        $result.technologies | ForEach-Object { Write-Host "  - $_" }
    }
    Write-Host "Atenção: identificação não significa suporte funcional a testes ou builds."
}

function Show-Status {
    Write-Host "Universal CI/CD - status local"
    Write-Host "Raiz: $script:ProjectRoot"
    Write-Host "Versão: $script:Version"

    if (Test-Path -LiteralPath $script:ConfigPath) {
        Write-Host "Configuração: encontrada ($script:ConfigPath)"
    } else {
        Write-WarningMessage "Configuração não encontrada. Execute: pwsh ./cicd.ps1 init"
    }

    $reportsPath = Join-Path $script:CicdRoot "reports"
    if (Test-Path -LiteralPath $reportsPath) {
        $reports = @(Get-ChildItem -LiteralPath $reportsPath -File -ErrorAction SilentlyContinue)
        Write-Host "Relatórios locais: $($reports.Count)"
    } else {
        Write-Host "Relatórios locais: 0"
    }

    Write-Host "Pipeline: ainda não implementado neste bootstrap."
}

try {
    switch ($Command) {
        "version" { Write-Host "Universal CI/CD $script:Version" }
        "init" { Initialize-Project }
        "detect" { Invoke-Detection }
        "status" { Show-Status }
        default { Show-Help }
    }
} catch {
    Write-Error "Falha ao executar '$Command': $($_.Exception.Message)"
    exit 1
}
