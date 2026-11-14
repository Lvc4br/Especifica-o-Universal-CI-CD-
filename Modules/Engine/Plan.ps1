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
    $hasPhp = $technologies -contains "PHP"
    $hasRuby = $technologies -contains "Ruby"
    $hasLua = $technologies -contains "Lua"
    $hasCpp = $technologies -contains "C/C++"
    $hasKotlin = $technologies -contains "Kotlin"
    $hasSwift = $technologies -contains "Swift"
    $hasDart = $technologies -contains "Dart"
    $files = @(Get-ChildItem -LiteralPath $ProjectRoot -File -Recurse -ErrorAction SilentlyContinue)
    $names = @($files | ForEach-Object { $_.Name })
    $javaTool = if ($names -contains "pom.xml") { "mvn" } elseif (($names -contains "build.gradle") -or ($names -contains "build.gradle.kts")) { "gradle" } else { "" }
    if ($hasPython) { $toolNames.Add("ruff"); $toolNames.Add("pytest"); $toolNames.Add("python") }
    $pythonBuildEnabled = $false
    $pythonProjectFile = Join-Path $ProjectRoot "pyproject.toml"
    if ($hasPython -and (Test-Path -LiteralPath $pythonProjectFile)) {
        $pythonProjectText = Get-Content -LiteralPath $pythonProjectFile -Raw
        $pythonBuildEnabled = $pythonProjectText -match "(?m)^\s*\[build-system\]\s*$"
    }
    $packageScripts = @{}
    $packagePath = Join-Path $ProjectRoot "package.json"
    if ($hasJs -and (Test-Path -LiteralPath $packagePath)) {
        try {
            $packageJson = Get-Content -LiteralPath $packagePath -Raw | ConvertFrom-Json -ErrorAction Stop
            if ($null -ne $packageJson.scripts) {
                foreach ($property in $packageJson.scripts.PSObject.Properties) { $packageScripts[$property.Name] = [string]$property.Value }
            }
        } catch { throw "package.json inválido: $($_.Exception.Message)" }
    }
    if ($hasJs) { $toolNames.Add("npm"); $toolNames.Add("node") }
    if ($hasGo) { $toolNames.Add("go") }
    if ($hasRust) { $toolNames.Add("cargo"); $toolNames.Add("rustfmt") }
    if ($hasDotnet) { $toolNames.Add("dotnet") }
    if ($javaTool) { $toolNames.Add($javaTool) }
    if ($hasPhp) { $toolNames.Add("php"); $toolNames.Add("composer") }
    if ($hasRuby) { $toolNames.Add("ruby"); $toolNames.Add("bundle") }
    if ($hasLua) { $toolNames.Add("lua"); $toolNames.Add("luacheck"); $toolNames.Add("busted") }
    if ($hasCpp) { $toolNames.Add("cmake"); $toolNames.Add("ctest") }
    if ($hasKotlin) { $toolNames.Add("gradle") }
    if ($hasSwift) { $toolNames.Add("swift") }
    if ($hasDart) { $toolNames.Add("dart") }
    if ($technologies -contains "HTML") { $toolNames.Add("htmlhint") }
    if ($technologies -contains "CSS") { $toolNames.Add("stylelint") }
    if ($technologies -contains "SQL") { $toolNames.Add("sqlfluff") }
    if ([bool]$Config.pipeline.security) { $toolNames.Add("gitleaks"); $toolNames.Add("trivy") }
    $checks = @(
        @{ enabled=[bool]$Config.pipeline.check; id="python-lint"; name="Python static checks"; category="check"; technology="Python"; tool="ruff"; command="ruff check ."; applies=$hasPython },
        @{ enabled=[bool]$Config.pipeline.test; id="python-tests"; name="Python tests"; category="test"; technology="Python"; tool="pytest"; command="pytest"; applies=$hasPython },
        @{ enabled=[bool]$Config.pipeline.build; id="python-build"; name="Python package build"; category="build"; technology="Python"; tool="python"; command="python -m build"; applies=($hasPython -and $pythonBuildEnabled) },
        @{ enabled=[bool]$Config.pipeline.check; id="js-lint"; name="JavaScript/TypeScript lint"; category="check"; technology="JavaScript/TypeScript"; tool="npm"; command="npm run lint"; applies=$hasJs; scriptName="lint" },
        @{ enabled=[bool]$Config.pipeline.test; id="js-tests"; name="JavaScript/TypeScript tests"; category="test"; technology="JavaScript/TypeScript"; tool="npm"; command="npm test"; applies=$hasJs; scriptName="test" },
        @{ enabled=[bool]$Config.pipeline.build; id="js-build"; name="JavaScript/TypeScript build"; category="build"; technology="JavaScript/TypeScript"; tool="npm"; command="npm run build"; applies=$hasJs; scriptName="build" },
        @{ enabled=[bool]$Config.pipeline.check; id="php-lint"; name="PHP static analysis"; category="check"; technology="PHP"; tool="composer"; command="composer run-script lint"; applies=($hasPhp -and (Test-Path (Join-Path $ProjectRoot "composer.json"))) },
        @{ enabled=[bool]$Config.pipeline.test; id="php-tests"; name="PHP tests"; category="test"; technology="PHP"; tool="composer"; command="composer run-script test"; applies=($hasPhp -and (Test-Path (Join-Path $ProjectRoot "composer.json"))) },
        @{ enabled=[bool]$Config.pipeline.build; id="php-build"; name="PHP dependency validation"; category="build"; technology="PHP"; tool="composer"; command="composer validate --no-check-publish"; applies=($hasPhp -and (Test-Path (Join-Path $ProjectRoot "composer.json"))) },
        @{ enabled=[bool]$Config.pipeline.check; id="ruby-lint"; name="Ruby lint"; category="check"; technology="Ruby"; tool="bundle"; command="bundle exec rubocop"; applies=($hasRuby -and (Test-Path (Join-Path $ProjectRoot "Gemfile"))) },
        @{ enabled=[bool]$Config.pipeline.test; id="ruby-tests"; name="Ruby tests"; category="test"; technology="Ruby"; tool="bundle"; command="bundle exec rspec"; applies=($hasRuby -and (Test-Path (Join-Path $ProjectRoot "Gemfile"))) },
        @{ enabled=[bool]$Config.pipeline.build; id="ruby-build"; name="Ruby dependency check"; category="build"; technology="Ruby"; tool="bundle"; command="bundle check"; applies=($hasRuby -and (Test-Path (Join-Path $ProjectRoot "Gemfile"))) },
        @{ enabled=[bool]$Config.pipeline.check; id="lua-lint"; name="Lua lint"; category="check"; technology="Lua"; tool="luacheck"; command="luacheck ."; applies=$hasLua },
        @{ enabled=[bool]$Config.pipeline.test; id="lua-tests"; name="Lua tests"; category="test"; technology="Lua"; tool="busted"; command="busted"; applies=$hasLua },
        @{ enabled=[bool]$Config.pipeline.build; id="lua-build"; name="Lua syntax validation"; category="build"; technology="Lua"; tool="lua"; command="lua -e \"assert(loadfile('init.lua'))\""; applies=$false },
        @{ enabled=[bool]$Config.pipeline.check; id="cpp-configure"; name="C/C++ configure"; category="check"; technology="C/C++"; tool="cmake"; command="cmake -S . -B build"; applies=($hasCpp -and (Test-Path (Join-Path $ProjectRoot "CMakeLists.txt"))) },
        @{ enabled=[bool]$Config.pipeline.test; id="cpp-tests"; name="C/C++ tests"; category="test"; technology="C/C++"; tool="ctest"; command="ctest --test-dir build --output-on-failure"; applies=($hasCpp -and (Test-Path (Join-Path $ProjectRoot "CMakeLists.txt"))) },
        @{ enabled=[bool]$Config.pipeline.build; id="cpp-build"; name="C/C++ build"; category="build"; technology="C/C++"; tool="cmake"; command="cmake --build build --parallel"; applies=($hasCpp -and (Test-Path (Join-Path $ProjectRoot "CMakeLists.txt"))) },
        @{ enabled=[bool]$Config.pipeline.check; id="kotlin-check"; name="Kotlin checks"; category="check"; technology="Kotlin"; tool="gradle"; command="gradle check"; applies=($hasKotlin -and ($names -contains "build.gradle" -or $names -contains "build.gradle.kts")) },
        @{ enabled=[bool]$Config.pipeline.test; id="kotlin-tests"; name="Kotlin tests"; category="test"; technology="Kotlin"; tool="gradle"; command="gradle test"; applies=($hasKotlin -and ($names -contains "build.gradle" -or $names -contains "build.gradle.kts")) },
        @{ enabled=[bool]$Config.pipeline.build; id="kotlin-build"; name="Kotlin build"; category="build"; technology="Kotlin"; tool="gradle"; command="gradle build"; applies=($hasKotlin -and ($names -contains "build.gradle" -or $names -contains "build.gradle.kts")) },
        @{ enabled=[bool]$Config.pipeline.check; id="swift-check"; name="Swift checks"; category="check"; technology="Swift"; tool="swift"; command="swift package diagnose"; applies=($hasSwift -and (Test-Path (Join-Path $ProjectRoot "Package.swift"))) },
        @{ enabled=[bool]$Config.pipeline.test; id="swift-tests"; name="Swift tests"; category="test"; technology="Swift"; tool="swift"; command="swift test"; applies=($hasSwift -and (Test-Path (Join-Path $ProjectRoot "Package.swift"))) },
        @{ enabled=[bool]$Config.pipeline.build; id="swift-build"; name="Swift build"; category="build"; technology="Swift"; tool="swift"; command="swift build"; applies=($hasSwift -and (Test-Path (Join-Path $ProjectRoot "Package.swift"))) },
        @{ enabled=[bool]$Config.pipeline.check; id="dart-check"; name="Dart analysis"; category="check"; technology="Dart"; tool="dart"; command="dart analyze"; applies=($hasDart -and (Test-Path (Join-Path $ProjectRoot "pubspec.yaml"))) },
        @{ enabled=[bool]$Config.pipeline.test; id="dart-tests"; name="Dart tests"; category="test"; technology="Dart"; tool="dart"; command="dart test"; applies=($hasDart -and (Test-Path (Join-Path $ProjectRoot "pubspec.yaml"))) },
        @{ enabled=[bool]$Config.pipeline.build; id="dart-build"; name="Dart build"; category="build"; technology="Dart"; tool="dart"; command="dart compile exe bin/main.dart"; applies=($hasDart -and (Test-Path (Join-Path $ProjectRoot "bin/main.dart"))) },
        @{ enabled=[bool]$Config.pipeline.check; id="html-lint"; name="HTML validation"; category="check"; technology="HTML"; tool="htmlhint"; command="htmlhint ."; applies=($technologies -contains "HTML") },
        @{ enabled=[bool]$Config.pipeline.check; id="css-lint"; name="CSS lint"; category="check"; technology="CSS"; tool="stylelint"; command="stylelint \"**/*.{css,scss,sass}\""; applies=($technologies -contains "CSS") },
        @{ enabled=[bool]$Config.pipeline.check; id="sql-lint"; name="SQL lint"; category="check"; technology="SQL"; tool="sqlfluff"; command="sqlfluff lint ."; applies=($technologies -contains "SQL") },
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
        if ($item.ContainsKey("scriptName") -and -not $packageScripts.ContainsKey([string]$item.scriptName)) {
            $steps.Add((New-CicdPlanStep -Id $item.id -Name $item.name -Category $item.category -Technology $item.technology -Tool $item.tool -Command $item.command -Status "NOT_APPLICABLE" -Reason "O script '$($item.scriptName)' não está definido em package.json."))
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
    if ([bool]$Config.pipeline.security) {
        foreach ($securityStep in @(
            @{ id="security-secrets"; name="Secret scanning"; tool="gitleaks"; command="gitleaks dir --redact --exit-code 1 ." },
            @{ id="security-vulnerabilities"; name="Dependency and filesystem scanning"; tool="trivy"; command="trivy fs --scanners vuln,misconfig --exit-code 1 --no-progress ." }
        )) {
            $availability = Get-CicdCommandAvailability -Name $securityStep.tool
            $status = if ($availability.available) { "PLANNED" } else { "BLOCKED" }
            $reason = if ($availability.available) { "Scanner encontrado; execução exige aprovação explícita." } else { "Ferramenta '$($securityStep.tool)' não encontrada no PATH." }
            $steps.Add((New-CicdPlanStep -Id $securityStep.id -Name $securityStep.name -Category "security" -Technology "All" -Tool $securityStep.tool -Command $securityStep.command -Status $status -Reason $reason))
        }
    } else {
        $steps.Add((New-CicdPlanStep -Id "security" -Name "Security pipeline" -Category "security" -Technology "All" -Tool "" -Command "" -Status "DISABLED" -Reason "Etapa desabilitada na configuração."))
    }
    $deliveryStatus = if ([bool]$Config.pipeline.delivery) { "PLANNED" } else { "DISABLED" }
    $deliveryReason = if ([bool]$Config.pipeline.delivery) { "Pacote ZIP do código-fonte será criado localmente após aprovação; publicação remota/deploy não está configurada." } else { "Etapa desabilitada na configuração." }
    $steps.Add((New-CicdPlanStep -Id "delivery-source-archive" -Name "Create source artifact" -Category "delivery" -Technology "All" -Tool "internal" -Command "Create .cicd/artifacts/source-<timestamp>.zip" -Status $deliveryStatus -Reason $deliveryReason))
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
