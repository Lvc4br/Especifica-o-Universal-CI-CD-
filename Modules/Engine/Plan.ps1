function Get-CicdCommandAvailability {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$Name)

    $command = Get-Command -Name $Name -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -eq $command) {
        return [pscustomobject]@{ name = $Name; available = $false; path = $null }
    }
    [pscustomobject]@{ name = $Name; available = $true; path = $command.Source }
}

function New-CicdPlanStep {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Id,
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][string]$Category,
        [Parameter(Mandatory)][string]$Technology,
        [Parameter(Mandatory)][string]$Tool,
        [Parameter(Mandatory)][string]$Command,
        [Parameter(Mandatory)][string]$Status,
        [Parameter(Mandatory)][string]$Reason
    )
    [pscustomobject]@{
        id = $Id
        name = $Name
        category = $Category
        technology = $Technology
        tool = $Tool
        command = $Command
        status = $Status
        reason = $Reason
        executed = $false
    }
}

function Get-CicdExecutionPlan {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$ProjectRoot,
        [Parameter(Mandatory)][object]$Config
    )

    . (Join-Path $PSScriptRoot "..\Detector\Detector.ps1")
    $detection = Get-CicdDetection -ProjectRoot $ProjectRoot -ExcludeDirectories @($Config.detection.excludeDirectories)
    $steps = [System.Collections.Generic.List[object]]::new()
    $tools = [System.Collections.Generic.List[object]]::new()
    $technologies = @($detection.technologies)

    $python = $technologies -contains "Python"
    $javascript = $technologies -contains "JavaScript"
    $typescript = $technologies -contains "TypeScript"

    $toolNames = @()
    if ($python) { $toolNames += @("ruff", "pytest") }
    if ($javascript -or $typescript) { $toolNames += @("npm", "node") }
    foreach ($toolName in ($toolNames | Sort-Object -Unique)) {
        $tools.Add((Get-CicdCommandAvailability -Name $toolName))
    }

    $checks = @(
        @{ enabled = [bool]$Config.pipeline.check; id = "python-lint"; name = "Python static checks"; category = "check"; technology = "Python"; tool = "ruff"; command = "ruff check ." ; applies = $python },
        @{ enabled = [bool]$Config.pipeline.test; id = "python-tests"; name = "Python tests"; category = "test"; technology = "Python"; tool = "pytest"; command = "pytest"; applies = $python },
        @{ enabled = [bool]$Config.pipeline.check; id = "js-lint"; name = "JavaScript/TypeScript static checks"; category = "check"; technology = "JavaScript/TypeScript"; tool = "npm"; command = "npm run lint --if-present"; applies = ($javascript -or $typescript) },
        @{ enabled = [bool]$Config.pipeline.test; id = "js-tests"; name = "JavaScript/TypeScript tests"; category = "test"; technology = "JavaScript/TypeScript"; tool = "npm"; command = "npm test -- --run"; applies = ($javascript -or $typescript) }
    )

    foreach ($item in $checks) {
        if (-not $item.enabled) {
            $steps.Add((New-CicdPlanStep -Id $item.id -Name $item.name -Category $item.category -Technology $item.technology -Tool $item.tool -Command $item.command -Status "DISABLED" -Reason "Etapa desabilitada em pipeline.$($item.category)."))
            continue
        }
        if (-not $item.applies) {
            $steps.Add((New-CicdPlanStep -Id $item.id -Name $item.name -Category $item.category -Technology $item.technology -Tool $item.tool -Command $item.command -Status "NOT_APPLICABLE" -Reason "A tecnologia correspondente não foi identificada."))
            continue
        }
        $availability = Get-CicdCommandAvailability -Name $item.tool
        if (-not $availability.available) {
            $steps.Add((New-CicdPlanStep -Id $item.id -Name $item.name -Category $item.category -Technology $item.technology -Tool $item.tool -Command $item.command -Status "BLOCKED" -Reason "Ferramenta '$($item.tool)' não encontrada no PATH."))
            continue
        }
        $steps.Add((New-CicdPlanStep -Id $item.id -Name $item.name -Category $item.category -Technology $item.technology -Tool $item.tool -Command $item.command -Status "PLANNED" -Reason "Ferramenta encontrada; comando apenas proposto, ainda não executado."))
    }

    foreach ($category in @("build", "security", "delivery")) {
        $enabled = [bool]$Config.pipeline.$category
        $steps.Add((New-CicdPlanStep -Id $category -Name "$category pipeline" -Category $category -Technology "All" -Tool "" -Command "" -Status $(if ($enabled) { "NOT_IMPLEMENTED" } else { "DISABLED" }) -Reason $(if ($enabled) { "Etapa habilitada, mas o adaptador ainda não foi implementado." } else { "Etapa desabilitada na configuração." })))
    }

    [pscustomobject]@{
        schemaVersion = "1.0"
        planVersion = "0.3.0-dev"
        project = [string]$Config.project.name
        projectRoot = [System.IO.Path]::GetFullPath($ProjectRoot)
        generatedAt = (Get-Date).ToString("o")
        technologies = $technologies
        detectedFileCount = $detection.fileCount
        tools = @($tools)
        steps = @($steps)
        execution = [pscustomobject]@{
            performed = $false
            requiresApproval = $true
            note = "Este documento é somente um plano. Nenhum comando do projeto foi executado."
        }
    }
}

function Save-CicdExecutionPlan {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][object]$Plan,
        [Parameter(Mandatory)][string]$ProjectRoot
    )

    $directory = Join-Path $ProjectRoot ".cicd/plans"
    if (-not (Test-Path -LiteralPath $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }
    $path = Join-Path $directory "latest-plan.json"
    $Plan | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $path -Encoding utf8
    return $path
}
