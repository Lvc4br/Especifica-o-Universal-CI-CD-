function New-CicdDefaultConfig {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$ProjectRoot)

    [ordered]@{
        schemaVersion = "1.0"
        project = @{ name = (Split-Path -Leaf $ProjectRoot); root = "." }
        runtime = @{ powershell = "7.2+" }
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
}

function Initialize-CicdConfig {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$ProjectRoot
    )

    if (Test-Path -LiteralPath $Path) {
        Write-CicdLog -Level WARN -Message "A configuração já existe e não será sobrescrita: $Path"
        return $false
    }

    $parent = Split-Path -Parent $Path
    if (-not (Test-Path -LiteralPath $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }

    $config = New-CicdDefaultConfig -ProjectRoot $ProjectRoot
    $config | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $Path -Encoding utf8
    Write-CicdLog -Level INFO -Message "Configuração criada: $Path"
    return $true
}

function Get-CicdConfig {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "Arquivo de configuração não encontrado: $Path"
    }

    try {
        $config = Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json -ErrorAction Stop
    } catch {
        throw "JSON de configuração inválido: $($_.Exception.Message)"
    }

    $required = @("schemaVersion", "project", "runtime", "detection", "pipeline")
    foreach ($property in $required) {
        if ($config.PSObject.Properties.Name -notcontains $property) {
            throw "Configuração inválida: propriedade obrigatória ausente '$property'."
        }
    }
    if ([string]$config.schemaVersion -ne "1.0") {
        throw "Versão de schema não suportada: '$($config.schemaVersion)'. Esperado: '1.0'."
    }
    $allowedRoot = @("schemaVersion", "project", "runtime", "detection", "pipeline")
    foreach ($property in $config.PSObject.Properties.Name) {
        if ($property -notin $allowedRoot) { throw "Configuração inválida: propriedade não permitida '$property'." }
    }
    foreach ($pair in @(
        @{ name="project"; required=@("name","root") },
        @{ name="runtime"; required=@("powershell") },
        @{ name="detection"; required=@("enabled","excludeDirectories") },
        @{ name="pipeline"; required=@("check","test","build","security","delivery") }
    )) {
        $object = $config.($pair.name)
        if ($null -eq $object -or $object -isnot [pscustomobject]) { throw "Configuração inválida: '$($pair.name)' deve ser um objeto." }
        foreach ($requiredProperty in $pair.required) {
            if ($object.PSObject.Properties.Name -notcontains $requiredProperty) { throw "Configuração inválida: propriedade obrigatória ausente '$($pair.name).$requiredProperty'." }
        }
        $allowedProperties = @($pair.required)
        foreach ($nestedProperty in $object.PSObject.Properties.Name) {
            if ($nestedProperty -notin $allowedProperties) { throw "Configuração inválida: propriedade não permitida '$($pair.name).$nestedProperty'." }
        }
    }
    if ([string]::IsNullOrWhiteSpace([string]$config.project.name)) { throw "Configuração inválida: project.name não pode estar vazio." }
    if ([string]::IsNullOrWhiteSpace([string]$config.project.root)) { throw "Configuração inválida: project.root não pode estar vazio." }
    if ([string]::IsNullOrWhiteSpace([string]$config.runtime.powershell)) { throw "Configuração inválida: runtime.powershell não pode estar vazio." }
    if ($config.detection.enabled -isnot [bool]) { throw "Configuração inválida: detection.enabled deve ser booleano." }
    if ($config.detection.excludeDirectories -isnot [array]) { throw "Configuração inválida: detection.excludeDirectories deve ser uma lista." }
    foreach ($directory in $config.detection.excludeDirectories) {
        if ($directory -isnot [string] -or [string]::IsNullOrWhiteSpace($directory)) { throw "Configuração inválida: cada item de detection.excludeDirectories deve ser texto não vazio." }
    }
    foreach ($flag in @("check", "test", "build", "security", "delivery")) {
        $property = $config.pipeline.PSObject.Properties[$flag]
        if ($null -eq $property -or $property.Value -isnot [bool]) {
            throw "Configuração inválida: pipeline.$flag deve ser booleano."
        }
    }

    return $config
}