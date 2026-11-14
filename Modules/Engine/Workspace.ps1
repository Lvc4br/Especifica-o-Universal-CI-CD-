function Get-CicdWorkspaceProjects {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Root,
        [string[]]$ExcludeDirectories = @(".git", ".cicd", "node_modules", ".venv", "venv", "bin", "obj", "dist", "build", "target", "vendor", ".dart_tool", ".gradle")
    )
    $rootPath = [System.IO.Path]::GetFullPath($Root)
    if (-not (Test-Path -LiteralPath $rootPath -PathType Container)) { throw "Raiz de workspace inexistente: $rootPath" }
    $markers = @("package.json", "pyproject.toml", "requirements.txt", "go.mod", "Cargo.toml", "pom.xml", "build.gradle", "build.gradle.kts", "composer.json", "Gemfile", "Package.swift", "pubspec.yaml", "CMakeLists.txt")
    $directories = @($rootPath) + @(Get-ChildItem -LiteralPath $rootPath -Directory -Recurse -ErrorAction SilentlyContinue | Where-Object {
        $relative = [System.IO.Path]::GetRelativePath($rootPath, $_.FullName)
        $segments = $relative -split '[/\\]'
        -not ($segments | Where-Object { $_ -in $ExcludeDirectories })
    } | ForEach-Object { $_.FullName })
    $projects = [System.Collections.Generic.List[object]]::new()
    foreach ($directory in $directories) {
        $found = [System.Collections.Generic.List[string]]::new()
        foreach ($marker in $markers) {
            if (Test-Path -LiteralPath (Join-Path $directory $marker) -PathType Leaf) { $found.Add($marker) }
        }
        if (@(Get-ChildItem -LiteralPath $directory -File -Filter "*.csproj" -ErrorAction SilentlyContinue).Count -gt 0 -or
            @(Get-ChildItem -LiteralPath $directory -File -Filter "*.sln" -ErrorAction SilentlyContinue).Count -gt 0) { $found.Add("*.csproj/*.sln") }
        if ($found.Count -gt 0) {
            $projects.Add([pscustomobject]@{
                name = Split-Path -Leaf $directory
                path = [System.IO.Path]::GetFullPath($directory)
                relativePath = [System.IO.Path]::GetRelativePath($rootPath, $directory)
                markers = @($found | Sort-Object -Unique)
            })
        }
    }
    return @($projects | Sort-Object relativePath)
}

function Invoke-CicdWorkspacePipeline {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Root,
        [Parameter(Mandatory)][object]$Config,
        [switch]$Approve,
        [ValidateRange(1,86400)][int]$TimeoutSeconds = 600
    )
    $projects = @(Get-CicdWorkspaceProjects -Root $Root -ExcludeDirectories @($Config.detection.excludeDirectories))
    if ($projects.Count -eq 0) { throw "Nenhum projeto foi encontrado no workspace." }
    $results = [System.Collections.Generic.List[object]]::new()
    foreach ($project in $projects) {
        $projectConfig = $Config | ConvertTo-Json -Depth 20 | ConvertFrom-Json
        $projectConfig.project.name = $project.name
        $execution = Invoke-CicdPipeline -ProjectRoot $project.path -Config $projectConfig -Approve:$Approve -TimeoutSeconds $TimeoutSeconds
        $results.Add([pscustomobject]@{
            project = $project.relativePath
            technologies = @($execution.plan.technologies)
            approved = [bool]$execution.approved
            performed = [bool]$execution.performed
            exitCode = [int]$execution.exitCode
            reportPath = $execution.reportPath
            results = @($execution.results)
        })
    }
    $exitCode = if (@($results | Where-Object { $_.exitCode -ne 0 }).Count -gt 0) { 1 } else { 0 }
    [pscustomobject]@{
        root = [System.IO.Path]::GetFullPath($Root)
        approved = [bool]$Approve
        performed = [bool]$Approve
        projectCount = $projects.Count
        exitCode = $exitCode
        projects = @($results)
    }
}
