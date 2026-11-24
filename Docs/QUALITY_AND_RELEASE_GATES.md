# Quality & Release Gates

## Pull request gate
- Reproducible install with lockfile.
- Typecheck/build/test for all affected workspaces.
- Tests use deterministic fixtures and include negative cases.
- CI status is green at current head commit.
- Documentation and changelog updated.
- Security review for permissions, process execution, secrets, external calls and dependencies.

## Release gate
- [ ] CI green on release candidate.
- [ ] Regression and integration suite.
- [ ] Extension packaging and install smoke test.
- [ ] Verify VSIX contains the internal shared-contract runtime (not only a successful package command).
- [ ] PowerShell engine compatibility check.
- [ ] GitHub App permission/webhook audit if relevant.
- [ ] Security review and unresolved-risk review.
- [ ] README, quick start, docs, changelog and migration notes.
- [ ] Known limitations and supported matrix explicit.
- [ ] Rollback/recovery plan.
- [ ] Release artifacts reproducible and provenance considered.

## Support maturity
Do not label a provider, language, runner or feature as fully supported based only on detection, schema presence or a happy-path test. Use levels such as experimental, tested, supported with criteria to be defined.
