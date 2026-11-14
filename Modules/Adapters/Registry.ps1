function Get-CicdAdapterDefinition {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$StepId,[Parameter(Mandatory)][string]$ProjectRoot)

    $registry = @{
        "python-lint" = @{ tool="ruff"; arguments=@("check", ".") }
        "python-tests" = @{ tool="pytest"; arguments=@() }
        "python-build" = @{ tool="python"; arguments=@("-m", "build") }
        "js-lint" = @{ tool="npm"; arguments=@("run", "lint") }
        "js-tests" = @{ tool="npm"; arguments=@("test") }
        "js-build" = @{ tool="npm"; arguments=@("run", "build") }
        "security-secrets" = @{ tool="gitleaks"; arguments=@("dir", "--redact", "--exit-code", "1", ".") }
        "security-vulnerabilities" = @{ tool="trivy"; arguments=@("fs", "--scanners", "vuln,misconfig", "--exit-code", "1", "--no-progress", ".") }
        "security-sast" = @{ tool="semgrep"; arguments=@("scan", "--config", "auto", "--error", ".") }
        "security-supply-chain" = @{ tool="osv-scanner"; arguments=@("scan", "--recursive", ".") }
        "php-lint" = @{ tool="composer"; arguments=@("run-script", "lint") }
        "php-tests" = @{ tool="composer"; arguments=@("run-script", "test") }
        "php-build" = @{ tool="composer"; arguments=@("validate", "--no-check-publish") }
        "ruby-lint" = @{ tool="bundle"; arguments=@("exec", "rubocop") }
        "ruby-tests" = @{ tool="bundle"; arguments=@("exec", "rspec") }
        "ruby-build" = @{ tool="bundle"; arguments=@("check") }
        "lua-lint" = @{ tool="luacheck"; arguments=@(".") }
        "lua-tests" = @{ tool="busted"; arguments=@() }
        "html-lint" = @{ tool="htmlhint"; arguments=@(".") }
        "css-lint" = @{ tool="stylelint"; arguments=@("**/*.{css,scss,sass}") }
        "sql-lint" = @{ tool="sqlfluff"; arguments=@("lint", ".") }
        "cpp-configure" = @{ tool="cmake"; arguments=@("-S", ".", "-B", "build") }
        "cpp-build" = @{ tool="cmake"; arguments=@("--build", "build", "--parallel") }
        "cpp-tests" = @{ tool="ctest"; arguments=@("--test-dir", "build", "--output-on-failure") }
        "kotlin-check" = @{ tool="gradle"; arguments=@("check") }
        "kotlin-tests" = @{ tool="gradle"; arguments=@("test") }
        "kotlin-build" = @{ tool="gradle"; arguments=@("build") }
        "swift-check" = @{ tool="swift"; arguments=@("package", "diagnose") }
        "swift-tests" = @{ tool="swift"; arguments=@("test") }
        "swift-build" = @{ tool="swift"; arguments=@("build") }
        "dart-check" = @{ tool="dart"; arguments=@("analyze") }
        "dart-tests" = @{ tool="dart"; arguments=@("test") }
        "dart-build" = @{ tool="dart"; arguments=@("compile", "exe", "bin/main.dart") }
        "go-vet" = @{ tool="go"; arguments=@("vet", "./...") }
        "go-tests" = @{ tool="go"; arguments=@("test", "./...") }
        "go-build" = @{ tool="go"; arguments=@("build", "./...") }
        "rust-format" = @{ tool="cargo"; arguments=@("fmt", "--all", "--", "--check") }
        "rust-tests" = @{ tool="cargo"; arguments=@("test", "--workspace") }
        "rust-build" = @{ tool="cargo"; arguments=@("build", "--workspace") }
        "dotnet-format" = @{ tool="dotnet"; arguments=@("format", "--verify-no-changes") }
        "dotnet-tests" = @{ tool="dotnet"; arguments=@("test") }
        "dotnet-build" = @{ tool="dotnet"; arguments=@("build") }
    }
    if (Test-Path -LiteralPath (Join-Path $ProjectRoot "pom.xml")) {
        $registry["java-check"] = @{ tool="mvn"; arguments=@("validate") }
        $registry["java-tests"] = @{ tool="mvn"; arguments=@("test") }
        $registry["java-build"] = @{ tool="mvn"; arguments=@("package") }
    } else {
        $registry["java-check"] = @{ tool="gradle"; arguments=@("check") }
        $registry["java-tests"] = @{ tool="gradle"; arguments=@("test") }
        $registry["java-build"] = @{ tool="gradle"; arguments=@("build") }
    }
    if (-not $registry.ContainsKey($StepId)) { return $null }
    return [pscustomobject]@{ tool=$registry[$StepId].tool; arguments=@($registry[$StepId].arguments) }
}
