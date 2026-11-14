 [CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateSet("version", "init", "detect", "status", "validate-config", "plan", "run", "help")]
    [string]$Command = "help",
    [switch]$Approve,
    [ValidateRange(1, 86400)][int]$TimeoutSeconds = 600
)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$script:ProjectRoot = $PSScriptRoot
$script:CicdRoot = Join-Path $script:ProjectRoot ".cicd"
$script:ConfigPath = Join-Path $script:CicdRoot "config.json"
$script:Version = "0.4.0-dev"
. (Join-Path $PSScriptRoot "Core/Logger.ps1")
. (Join-Path $PSScriptRoot "Core/Result.ps1")
. (Join-Path $PSScriptRoot "Modules/Config/Config.ps1")
. (Join-Path $PSScriptRoot "Modules/Detector/Detector.ps1")
. (Join-Path $PSScriptRoot "Modules/Engine/Plan.ps1")
. (Join-Path $PSScriptRoot "Core/Process.ps1")
. (Join-Path $PSScriptRoot "Modules/Engine/Executor.ps1")
function Show-Help {
@"
Universal CI/CD $script:Version
Uso: pwsh ./cicd.ps1 <comando>
  version          Exibe a versão
  init             Cria configuração sem sobrescrever
  detect           Detecta tecnologias e apresenta evidências
  validate-config  Valida a configuração local
  plan             Gera plano de pipeline sem executar comandos
  status           Exibe estado da configuração e relatórios
  help             Exibe esta ajuda
"@
}
function Initialize-Project {
    $created = Initialize-CicdConfig -Path $script:ConfigPath -ProjectRoot $script:ProjectRoot
    if ($created) { Write-CicdLog -Level WARN -Message "Nenhum pipeline foi habilitado automaticamente." }
}
function Invoke-Detection {
    $exclude = @(".git", ".cicd", "node_modules", ".venv", "venv", "bin", "obj", "dist", "build", "target")
    if (Test-Path -LiteralPath $script:ConfigPath) {
        $config = Get-CicdConfig -Path $script:ConfigPath
        if ($config.detection.excludeDirectories) { $exclude = @($config.detection.excludeDirectories) }
        if (-not $config.detection.enabled) {
            Write-CicdLog -Level WARN -Message "Detecção desabilitada em .cicd/config.json."
            return
        }
    }
    $result = Get-CicdDetection -ProjectRoot $script:ProjectRoot -ExcludeDirectories $exclude
    Write-CicdLog -Level INFO -Message "Arquivos analisados: $($result.fileCount)"
    if ($result.technologies.Count -eq 0) {
        Write-CicdLog -Level WARN -Message "Nenhuma tecnologia reconhecida pelos marcadores básicos."
    } else {
        Write-Host "Tecnologias identificadas:"
        $result.technologies | ForEach-Object { Write-Host "  - $_" }
    }
    if ($result.evidence.Count -gt 0) {
        Write-Host "Evidências:"
        $result.evidence | Select-Object -First 20 | ForEach-Object { Write-Host "  - $_" }
        if ($result.evidence.Count -gt 20) { Write-Host "  ... e mais $($result.evidence.Count - 20) arquivo(s)" }
    }
    Write-Host "Atenção: identificação não significa suporte funcional a testes ou builds."
}
function Invoke-ConfigValidation {
    $config = Get-CicdConfig -Path $script:ConfigPath
    Write-CicdLog -Level INFO -Message "Configuração válida (schema $($config.schemaVersion))."
}
function Invoke-Plan {
    $config = Get-CicdConfig -Path $script:ConfigPath
    $plan = Get-CicdExecutionPlan -ProjectRoot $script:ProjectRoot -Config $config
    $path = Save-CicdExecutionPlan -Plan $plan -ProjectRoot $script:ProjectRoot
    Write-CicdLog -Level INFO -Message "Plano gerado: $path"
    Write-Host "Tecnologias: $($plan.technologies -join ', ')"
    Write-Host "Etapas:"
    foreach ($step in $plan.steps) {
        Write-Host ("  [{0}] {1} — {2}" -f $step.status, $step.name, $step.reason)
    }
    Write-Host "Execução realizada: não"
    Write-Host "Aprovação necessária antes de qualquer execução futura: sim"
}
function Invoke-Run {\n    $config = Get-CicdConfig -Path $script:ConfigPath\n    $execution = Invoke-CicdPipeline -ProjectRoot $script:ProjectRoot -Config $config -Approve:$Approve -TimeoutSeconds $TimeoutSeconds\n    if (-not $execution.approved) {\n        Write-CicdLog -Level WARN -Message "Modo de simulação: nenhuma etapa foi executada. Use -Approve após revisar o plano."\n        foreach ($result in $execution.results) { Write-Host ("  [{0}] {1}" -f $result.status, $result.name) }\n        return\n    }\n    foreach ($result in $execution.results) {\n        Write-Host ("  [{0}] {1} — {2}" -f $result.status, $result.name, $result.summary)\n    }\n    Write-Host "Relatório: $($execution.reportPath)"\n    if ($execution.exitCode -ne 0) { exit $execution.exitCode }\n}\nfunction Show-Status {
    Write-Host "Universal CI/CD - status local"
    Write-Host "Raiz: $script:ProjectRoot"
    Write-Host "Versão: $script:Version"
    if (Test-Path -LiteralPath $script:ConfigPath) {
        Write-Host "Configuração: encontrada ($script:ConfigPath)"
    } else {
        Write-CicdLog -Level WARN -Message "Configuração não encontrada. Execute: pwsh ./cicd.ps1 init"
    }
    $reportsPath = Join-Path $script:CicdRoot "reports"
    if (Test-Path -LiteralPath $reportsPath) {
        $reports = @(Get-ChildItem -LiteralPath $reportsPath -File -ErrorAction SilentlyContinue)
        Write-Host "Relatórios locais: $($reports.Count)"
    } else { Write-Host "Relatórios locais: 0" }
    $planPath = Join-Path $script:CicdRoot "plans/latest-plan.json"
    if (Test-Path -LiteralPath $planPath) { Write-Host "Plano: encontrado ($planPath)" } else { Write-Host "Plano: não gerado" }
    Write-Host "Execução: disponível com aprovação explícita (-Approve)."
}
try {
    switch ($Command) {
        "version" { Write-Host "Universal CI/CD $script:Version" }
        "init" { Initialize-Project }
        "detect" { Invoke-Detection }
        "validate-config" { Invoke-ConfigValidation }
        "plan" { Invoke-Plan }\n        "run" { Invoke-Run }
        "status" { Show-Status }
        default { Show-Help }
    }
} catch {
    Write-CicdLog -Level ERROR -Message "Falha ao executar '$Command': $($_.Exception.Message)"
    exit 1
}