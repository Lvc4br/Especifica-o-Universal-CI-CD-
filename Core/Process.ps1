function Invoke-CicdProcess {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Executable,
        [Parameter(Mandatory)][string[]]$Arguments,
        [Parameter(Mandatory)][string]$WorkingDirectory,
        [ValidateRange(1, 86400)][int]$TimeoutSeconds = 600
    )

    if (-not (Test-Path -LiteralPath $WorkingDirectory -PathType Container)) {
        throw "Diretório de trabalho inválido: $WorkingDirectory"
    }
    if (-not [System.IO.Path]::IsPathRooted($Executable) -or -not (Test-Path -LiteralPath $Executable -PathType Leaf)) {
        throw "O executável precisa ser um caminho absoluto existente."
    }

    $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = [System.IO.Path]::GetFullPath($Executable)
    $startInfo.WorkingDirectory = [System.IO.Path]::GetFullPath($WorkingDirectory)
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    foreach ($argument in $Arguments) { [void]$startInfo.ArgumentList.Add([string]$argument) }

    $process = [System.Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    $startedAt = Get-Date
    $timer = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        if (-not $process.Start()) { throw "Não foi possível iniciar o processo." }
        $stdoutTask = $process.StandardOutput.ReadToEndAsync()
        $stderrTask = $process.StandardError.ReadToEndAsync()
        $completed = $process.WaitForExit($TimeoutSeconds * 1000)
        if (-not $completed) {
            try { $process.Kill($true) } catch { try { $process.Kill() } catch {} }
            $process.WaitForExit()
        }
        $timer.Stop()
        $stdout = $stdoutTask.GetAwaiter().GetResult()
        $stderr = $stderrTask.GetAwaiter().GetResult()
        [pscustomobject]@{
            executable = $startInfo.FileName
            arguments = @($Arguments)
            workingDirectory = $startInfo.WorkingDirectory
            startedAt = $startedAt.ToString("o")
            finishedAt = (Get-Date).ToString("o")
            durationMs = [long]$timer.ElapsedMilliseconds
            timedOut = (-not $completed)
            exitCode = if ($completed) { [int]$process.ExitCode } else { $null }
            stdout = $stdout
            stderr = $stderr
        }
    } finally {
        $process.Dispose()
    }
}

function Protect-CicdOutput {
    [CmdletBinding()]
    param([AllowEmptyString()][string]$Text)
    if ([string]::IsNullOrEmpty($Text)) { return $Text }
    $safe = $Text
    $patterns = @(
        '(?i)(authorization\s*[:=]\s*bearer\s+)\S+',
        '(?i)((?:password|passwd|token|secret|api[_-]?key|client[_-]?secret)\s*[:=]\s*)[^\s,;]+',
        '(?i)(gh[pousr]_[A-Za-z0-9_]{20,})',
        '(?i)(github_pat_[A-Za-z0-9_]{20,})'
    )
    foreach ($pattern in $patterns) { $safe = [regex]::Replace($safe, $pattern, '$1[REDACTED]') }
    return $safe
}
