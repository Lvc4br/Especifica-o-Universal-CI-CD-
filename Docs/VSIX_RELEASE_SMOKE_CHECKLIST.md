# VSIX Release and Installation Smoke Checklist

This checklist complements automated CI. It does not claim a GUI-based installation test unless one is actually performed.

## Automated checks
- [ ] Monorepo typecheck/build/test green.
- [ ] Extension CI test suite green.
- [ ] Shared contracts are staged inside extension output.
- [ ] VSIX ZIP integrity is verified.
- [ ] Embedded manifest name/version are verified.
- [ ] Extension entrypoint and contracts runtime are present.
- [ ] VSIX artifact is generated and retained.

## Manual installation smoke test (release candidate)
1. Download the CI artifact VSIX from the workflow run.
2. In VS Code, open Extensions view.
3. Use the Extensions view menu: Install from VSIX.
4. Select the downloaded file and confirm installation.
5. Reload VS Code if prompted.
6. Confirm Universal CI/CD appears in Explorer.
7. Open the dashboard and confirm it renders without an extension-host error.
8. Open UPS Inspector against a valid sample; confirm it remains plan-only.
9. Open Output > Universal CI/CD and inspect any errors.
10. Repeat with an invalid UPS file and verify diagnostics rather than execution.
11. Uninstall the extension after testing if this is a disposable environment.

## Safety boundaries
- Do not execute declared job steps during this smoke test.
- Do not connect to or reserve remote runners.
- Do not use real secrets.
- Do not treat successful VSIX installation as validation of the PowerShell engine, remote execution, approval enforcement, or production readiness.

## Evidence
Record VS Code version, OS, artifact version, workflow run, date, and outcomes for each item. Automated package inspection is not a substitute for the GUI installation test.
