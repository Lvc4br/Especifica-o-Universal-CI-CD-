function Get-CicdDetection {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$ProjectRoot,
        [string[]]$ExcludeDirectories = @(".git", ".cicd", "node_modules", ".venv", "venv", "bin", "obj", "dist", "build", "target")
    )

    $root = [System.IO.Path]::GetFullPath($ProjectRoot)
    $files = @(Get-ChildItem -LiteralPath $root -File -Recurse -ErrorAction SilentlyContinue |
        Where-Object {
            $relativePath = [System.IO.Path]::GetRelativePath($root, $_.FullName)
            $segments = $relativePath -split '[/\\]'
            -not ($segments | Where-Object { $ExcludeDirectories -contains $_ })
        })

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
            $package = Get-Content -LiteralPath $packageFile.FullName -Raw | ConvertFrom-Json -ErrorAction Stop
            foreach ($section in @("dependencies", "devDependencies", "peerDependencies")) {
                $sectionValue = $package.$section
                if ($null -ne $sectionValue -and $sectionValue.PSObject.Properties.Name -contains "react") { $reactDetected = $true }
            }
        } catch {
            Write-CicdLog -Level WARN -Message "Manifesto package.json inválido ou ilegível: $($packageFile.FullName)"
        }
    }
    if ($extensions.ContainsKey(".jsx") -or $extensions.ContainsKey(".tsx") -or $reactDetected) { $found.Add("React (indício; requer validação do projeto)") }
    if ($extensions.ContainsKey(".ts") -or $extensions.ContainsKey(".tsx")) { $found.Add("TypeScript") }
    if ($extensions.ContainsKey(".html")) { $found.Add("HTML") }
    if ($extensions.ContainsKey(".css") -or $extensions.ContainsKey(".scss") -or $extensions.ContainsKey(".sass")) { $found.Add("CSS") }
    if ($extensions.ContainsKey(".java") -or ($names -contains "pom.xml") -or ($names -contains "build.gradle") -or ($names -contains "build.gradle.kts")) { $found.Add("Java") }
    if ($extensions.ContainsKey(".lua")) { $found.Add("Lua") }
    if ($extensions.ContainsKey(".sql")) { $found.Add("SQL") }
    if ($extensions.ContainsKey(".cs") -or @($names | Where-Object { $_ -like "*.csproj" }).Count -gt 0) { $found.Add("C#") }
    if ($extensions.ContainsKey(".go") -or ($names -contains "go.mod")) { $found.Add("Go") }
    if ($extensions.ContainsKey(".rs") -or ($names -contains "Cargo.toml", "composer.json", "Gemfile", "CMakeLists.txt", "Package.swift", "pubspec.yaml")) { $found.Add("Rust") }
    if ($extensions.ContainsKey(".php") -or ($names -contains "composer.json")) { $found.Add("PHP") }
    if ($extensions.ContainsKey(".rb") -or ($names -contains "Gemfile")) { $found.Add("Ruby") }
    if ($extensions.ContainsKey(".c") -or $extensions.ContainsKey(".h") -or $extensions.ContainsKey(".cpp") -or $extensions.ContainsKey(".cc") -or $extensions.ContainsKey(".hpp") -or ($names -contains "CMakeLists.txt")) { $found.Add("C/C++") }
    if ($extensions.ContainsKey(".kt") -or $extensions.ContainsKey(".kts")) { $found.Add("Kotlin") }
    if ($extensions.ContainsKey(".swift") -or ($names -contains "Package.swift")) { $found.Add("Swift") }
    if ($extensions.ContainsKey(".dart") -or ($names -contains "pubspec.yaml")) { $found.Add("Dart") }

    [pscustomobject]@{
        technologies = @($found | Sort-Object -Unique)
        fileCount = $files.Count
        extensionCounts = $extensions
        evidence = @($files | Where-Object {
            $_.Extension.ToLowerInvariant() -in @(".py", ".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx", ".html", ".css", ".scss", ".sass", ".java", ".lua", ".sql", ".cs", ".go", ".rs", ".php", ".rb", ".lua", ".c", ".h", ".cpp", ".cc", ".hpp", ".kt", ".kts", ".swift", ".dart") -or
            $_.Name -in @("pyproject.toml", "requirements.txt", "package.json", "pom.xml", "build.gradle", "build.gradle.kts", "go.mod", "Cargo.toml")
        } | ForEach-Object { [System.IO.Path]::GetRelativePath($root, $_.FullName) })
        scannedAt = (Get-Date).ToString("o")
        scope = "recursive file and marker scan; no project code executed"
    }
}