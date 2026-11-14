function Get-CicdCommandAvailability {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$Name)
    $command = Get-Command -Name $Name -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -eq $command) { return [pscustomobject]@{ name=$Name; available=$false; path=$null } }
    [pscustomobject]@{ name=$Name; available=$true; path=$command.Source }
}
function New-CicdPlanStep {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Id,[Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][string]$Category,[Parameter(Mandatory)][string]$Technology,
        [Parameter(Mandatory)][AllowEmptyString()][string]$Tool,
        [Parameter(Mandatory)][AllowEmptyString()][string]$Command,
        [Parameter(Mandatory)][string]$Status,[Parameter(Mandatory)][string]$Reason
    )
    [pscustomobject]@{ id=$Id; name=$Name; category=$Category; technology=$Technology; tool=$Tool; command=$Command; status=$Status; reason=$Reason; executed=$false }
}
function Get-CicdExecutionPlan {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$ProjectRoot,[Parameter(Mandatory)][object]$Config)
    $detectorPath = Join-Path (Join-Path $PSScriptRoot "..") "Detector/Detector.ps1"
    if (-not (Get-Command Get-CicdDetection -ErrorAction SilentlyContinue)) { . $detectorPath }
    $detection = Get-CicdDetection -ProjectRoot $ProjectRoot -ExcludeDirectories @($Config.detection.excludeDirectories)
    $steps = [System.Collections.Generic.List[object]]::new()
    $toolNames = [System.Collections.Generic.List[string]]::new()
    $technologies = @($detection.technologies)
    $hasPython = $technologies -contains "Python"
    $hasJs = ($technologies -contains "JavaScript") -or ($technologies -contains "TypeScript")
    $hasGo = $technologies -contains "Go"
    $hasRust = $technologies -contains "Rust"
    $hasDotnet = $technologies -contains "C#"
    $hasJava = $technologies -contains "Java"
    $files = @(Get-ChildItem -LiteralPath $ProjectRoot -File -Recurse -ErrorAction SilentlyContinue)
    $names = @($files | ForEach-Object { $_.Name })
    $javaTool = if ($names -contains "pom.xml") { "mvn" } elseif (($names -contains "build.gradle") -or ($names -contains "build.gradle.kts")) { "gradle" } else { "" }
    if ($hasPython) { $toolNames.Add("ruff"); $toolNames.Add("pytest") }
    if ($hasJs) { $toolNames.Add("npm"); $toolNames.Add("node") }
    if ($hasGo) { $toolNames.Add("go") }
    if ($hasRust) { $toolNames.Add("cargo"); $toolNames.Add("rustfmt") }
    if ($hasDotnet) { $toolNames.Add("dotnet") }
    if ($javaTool) { $toolNames.Add($javaTool) }
    $checks = @(
        @{ enabled=[bool]$Config.pipeline.check; id="python-lint"; name="Python static checks"; category="check"; technology="Python"; tool="ruff"; command="ruff check ."; applies=$hasPython },
        @{ enabled=[bool]$Config.pipeline.test; id="python-tests"; name="Python tests"; category="test"; technology="Python"; tool="pytest"; command="pytest"; applies=$hasPython },
        @{ enabled=[bool]$Config.pipeline.check; id="js-lint"; name="JavaScript/TypeScript lint"; category="check"; technology="JavaScript/TypeScript"; tool="npm"; command="npm run lint --if-present"; applies=$hasJs },
        @{ enabled=[bool]$Config.pipeline.test; id="js-tests"; name="JavaScript/TypeScript tests"; category="test"; technology="JavaScript/TypeScript"; tool="npm"; command="npm test"; applies=$hasJs },
        @{ enabled=[bool]$Config.pipeline.build; id="js-build"; name="JavaScript/TypeScript build"; category="build"; technology="JavaScript/TypeScript"; tool="npm"; command="npm run build --if-present"; applies=$hasJs },
        @{ enabled=[bool]$Config.pipeline.check; id="go-vet"; name="Go vet"; category="check"; technology="Go"; tool="go"; command="go vet ./..."; applies=$hasGo },
        @{ enabled=[bool]$Config.pipeline.test; id="go-tests"; name="Go tests"; category="test"; technology="Go"; tool="go"; command="go test ./..."; applies=$hasGo },
        @{ enabled=[bool]$Config.pipeline.build; id="go-build"; name="Go build"; category="build"; technology="Go"; tool="go"; command="go build ./..."; applies=$hasGo },
        @{ enabled=[bool]$Config.pipeline.check; id="rust-format"; name="Rust format check"; category="check"; technology="Rust"; tool="cargo"; command="cargo fmt --all -- --check"; applies=$hasRust },
        @{ enabled=[bool]$Config.pipeline.test; id="rust-tests"; name="Rust tests"; category="test"; technology="Rust"; tool="cargo"; command="cargo test --workspace"; applies=$hasRust },
        @{ enabled=[bool]$Config.pipeline.build; id="rust-build"; name="Rust build"; category="build"; technology="Rust"; tool="cargo"; command="cargo build --workspace"; applies=$hasRust },
        @{ enabled=[bool]$Config.pipeline.check; id="dotnet-format"; name=".NET format check"; category="check"; technology="C#"; tool="dotnet"; command="dotnet format --verify-no-changes"; applies=$hasDotnet },
        @{ enabled=[bool]$Config.pipeline.test; id="dotnet-tests"; name=".NET tests"; category="test"; technology="C#"; tool="dotnet"; command="dotnet test"; applies=$hasDotnet },
        @{ enabled=[bool]$Config.pipeline.build; id="dotnet-build"; name=".NET build"; category="build"; technology="C#"; tool="dotnet"; command="dotnet build"; applies=$hasDotnet },
        @{ enabled=[bool]$Config.pipeline.check; id="java-check"; name="Java validation"; category="check"; technology="Java"; tool=$javaTool; command=$(if ($javaTool -eq "mvn") {"mvn validate"} elseif ($javaTool -eq "gradle") {"gradle check"} else {""}); applies=($hasJava -and [bool]$javaTool) },
        @{ enabled=[bool]$Config.pipeline.test; id="java-tests"; name="Java tests"; category="test"; technology="Java"; tool=$javaTool; command=$(if ($javaTool -eq "mvn") {"mvn test"} elseif ($javaTool -eq "gradle") {"gradle test"} else {""}); applies=($hasJava -and [bool]$javaTool) },
        @{ enabled=[bool]$Config.pipeline.build; id="java-build"; name="Java build"; category="build"; technology="Java"; tool=$javaTool; command=$(if ($javaTool -eq "mvn") {"mvn package"} elseif ($javaTool -eq "gradle") {"gradle build"} else {""}); applies=($hasJava -and [bool]$javaTool) }
    )
    foreach ($item in $checks) {
        if (-not $item.enabled) {
            $steps.Add((New-CicdPlanStep -Id $item.id -Name $item.name -Category $item.category -Technology $item.technology -Tool $item.tool -Command $item.command -Status "DISABLED" -Reason "Etapa desabilitada em pipeline.$($item.category)."))
            continue
        }
        if (-not $item.applies) {
            $reason = if ($item.technology -eq "Java" -and $hasJava) { "Projeto Java detectado, mas pom.xml/build.gradle não foi encontrado." } else { "A tecnologia correspondente não foi identificada." }
            $steps.Add((New-CicdPlanStep -Id $item.id -Name $item.name -Category $item.category -Technology $item.technology -Tool $item.tool -Command $item.command -Status "NOT_APPLICABLE" -Reason $reason))
            continue
        }
        $availability = Get-CicdCommandAvailability -Name $item.tool
        if (-not $availability.available) {
            $steps.Add((New-CicdPlanStep -Id $item.id -Name $item.name -Category $item.category -Technology $item.technology -Tool $item.tool -Command $item.command -Status "BLOCKED" -Reason "Ferramenta '$($item.tool)' não encontrada no PATH."))
            continue
        }
        $steps.Add((New-CicdPlanStep -Id $item.id -Name $item.name -Category $item.category -Technology $item.technology -Tool $item.tool -Command $item.command -Status "PLANNED" -Reason "Ferramenta encontrada; comando allowlisted aguardando aprovação."))
    }
    foreach ($category in @("security", "delivery")) {
        $enabled = [bool]$Config.pipeline.$category
        $status = if ($enabled) { "NOT_IMPLEMENTED" } else { "DISABLED" }
        $reason = if ($enabled) { "Etapa habilitada, mas o adaptador ainda não foi implementado." } else { "Etapa desabilitada na configuração." }
        $steps.Add((New-CicdPlanStep -Id $category -Name "$category pipeline" -Category $category -Technology "All" -Tool "" -Command "" -Status $status -Reason $reason))
    }
    [pscustomobject]@{
        schemaVersion="1.0"; planVersion="0.5.0-dev"; project=[string]$Config.project.name
        projectRoot=[System.IO.Path]::GetFullPath($ProjectRoot); generatedAt=(Get-Date).ToString("o")
        technologies=$technologies; detectedFileCount=$detection.fileCount
        tools=@($toolNames | Sort-Object -Unique | ForEach-Object { Get-CicdCommandAvailability -Name $_ })
        steps=@($steps)
        execution=[pscustomobject]@{ performed=$false; requiresApproval=$true; note="Plano declarativo: nenhum comando do projeto foi executado." }
    }
}
function Save-CicdExecutionPlan {
    [CmdletBinding()]
    param([Parameter(Mandatory)][object]$Plan,[Parameter(Mandatory)][string]$ProjectRoot)
    $directory = Join-Path $ProjectRoot ".cicd/plans"
    if (-not (Test-Path -LiteralPath $directory)) { New-Item -ItemType Directory -Path $directory -Force | Out-Null }
    $path = Join-Path $directory "latest-plan.json"
    $Plan | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $path -Encoding utf8
    return $path
}
