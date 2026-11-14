function New-CicdResult {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Id,
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)]
        [ValidateSet("PASSED", "FAILED", "WARNING", "SKIPPED", "NOT_IMPLEMENTED")]
        [string]$Status,
        [string]$Summary = "",
        [string]$Tool = "",
        [Nullable[int]]$ExitCode = $null,
        [string]$Command = ""
    )

    [pscustomobject]@{
        id = $Id
        name = $Name
        status = $Status
        startedAt = $null
        finishedAt = (Get-Date).ToString("o")
        durationMs = $null
        tool = $Tool
        command = $Command
        exitCode = $ExitCode
        summary = $Summary
        artifacts = @()
    }
}

function Get-CicdExitCode {
    [CmdletBinding()]
    param([Parameter(Mandatory)][object[]]$Results)

    if (@($Results | Where-Object { $_.status -eq "FAILED" }).Count -gt 0) { return 1 }
    if (@($Results | Where-Object { $_.status -eq "NOT_IMPLEMENTED" }).Count -gt 0) { return 2 }
    return 0
}