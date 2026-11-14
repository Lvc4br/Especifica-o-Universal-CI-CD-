function Get-CicdRunHistory {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$ProjectRoot)
    $directory = Join-Path $ProjectRoot ".cicd/reports"
    if (-not (Test-Path -LiteralPath $directory -PathType Container)) { return @() }
    $history = [System.Collections.Generic.List[object]]::new()
    foreach ($file in @(Get-ChildItem -LiteralPath $directory -File -Filter "*-run.json" | Sort-Object LastWriteTime -Descending)) {
        try {
            $report = Get-Content -LiteralPath $file.FullName -Raw | ConvertFrom-Json -ErrorAction Stop
            $history.Add([pscustomobject]@{
                generatedAt = $report.generatedAt
                project = $report.project
                exitCode = $report.exitCode
                resultCount = @($report.results).Count
                passed = @($report.results | Where-Object status -eq "PASSED").Count
                failed = @($report.results | Where-Object status -eq "FAILED").Count
                blocked = @($report.results | Where-Object status -eq "BLOCKED").Count
                path = $file.FullName
            })
        } catch { Write-CicdLog -Level WARN -Message "Relatório ignorado por JSON inválido: $($file.Name)" }
    }
    return @($history)
}

function Export-CicdReport {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$ProjectRoot,
        [string]$ReportPath,
        [ValidateSet("html","markdown")][string]$Format = "html"
    )
    if ([string]::IsNullOrWhiteSpace($ReportPath)) {
        $latest = Get-CicdRunHistory -ProjectRoot $ProjectRoot | Select-Object -First 1
        if ($null -eq $latest) { throw "Nenhum relatório de execução disponível para exportação." }
        $ReportPath = $latest.path
    }
    $resolvedReport = (Resolve-Path -LiteralPath $ReportPath -ErrorAction Stop).Path
    $reportDirectory = (Resolve-Path -LiteralPath (Join-Path $ProjectRoot ".cicd/reports") -ErrorAction Stop).Path
    if (-not $resolvedReport.StartsWith($reportDirectory, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "O relatório precisa estar dentro da pasta .cicd/reports do projeto."
    }
    $report = Get-Content -LiteralPath $resolvedReport -Raw | ConvertFrom-Json -ErrorAction Stop
    $rows = @($report.results | ForEach-Object {
        [pscustomobject]@{
            Etapa = [string]$_.name
            Status = [string]$_.status
            Ferramenta = [string]$_.tool
            Código = if ($null -eq $_.exitCode) { "" } else { [string]$_.exitCode }
            Duração_ms = if ($null -eq $_.durationMs) { "" } else { [string]$_.durationMs }
            Resumo = [string]$_.summary
        }
    })
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss-fff"
    if ($Format -eq "markdown") {
        $lines = @("# Relatório CI/CD", "", "- Projeto: $($report.project)", "- Data: $($report.generatedAt)", "- Exit code: $($report.exitCode)", "", "| Etapa | Status | Ferramenta | Código | Duração (ms) | Resumo |", "|---|---|---|---:|---:|---|")
        foreach ($row in $rows) {
            $cells = @($row.Etapa,$row.Status,$row.Ferramenta,$row.Código,$row.Duração_ms,$row.Resumo) | ForEach-Object { ([string]$_ -replace '\|','\|' -replace '[\r\n]+',' ') }
            $lines += "| " + ($cells -join " | ") + " |"
        }
        $outputPath = Join-Path $reportDirectory "$stamp-report.md"
        $lines -join [Environment]::NewLine | Set-Content -LiteralPath $outputPath -Encoding utf8
    } else {
        $table = $rows | ConvertTo-Html -Fragment
        $html = ConvertTo-Html -Title "Universal CI/CD report" -PreContent "<h1>Relatório CI/CD</h1><p>Projeto: $([System.Net.WebUtility]::HtmlEncode([string]$report.project))</p><p>Data: $([System.Net.WebUtility]::HtmlEncode([string]$report.generatedAt))</p><p>Exit code: $($report.exitCode)</p>" -PostContent $table
        $outputPath = Join-Path $reportDirectory "$stamp-report.html"
        $html | Set-Content -LiteralPath $outputPath -Encoding utf8
    }
    return $outputPath
}
