# Security & Risk Register

This register is a living planning artifact, not a security certification.

| ID | Risk | Current mitigation / boundary | Next action |
|---|---|---|---|
| S-01 | Untrusted pipeline command execution | Execution is gated/limited to existing local approved workflow; remote execution not enabled | threat model; adversarial testing; isolate runner |
| S-02 | Shell injection | use argument arrays and shell:false in TS adapter | regression tests and review all process calls |
| S-03 | Secret exposure | no secret resolution in UPS planner/resolver | secret lifecycle, masking, scope and rotation design |
| S-04 | PR event spoofing/replay | webhook signature, dedupe foundations documented; not yet live end-to-end | validate signature, replay, delivery IDs and idempotency |
| S-05 | Stale PR commit results | orchestration state has stale-SHA contract | test races, retries and terminal transitions |
| S-06 | Runner compromise/lateral movement | remote runners not active | ephemeral isolation, network policy, credential isolation |
| S-07 | Excessive permissions | GitHub App permissions should be minimal; inactive capabilities | permission audit and deployment checklist |
| S-08 | AI data leakage or prompt injection | AI optional, planned opt-in and data minimization | threat model, provider controls, redaction and evals |
| S-09 | Output/log leakage | bounded output documented in local adapter | secret scanning, redaction tests, retention policy |
| S-10 | Dependency supply chain | CI and package foundations | lockfiles, SBOM, provenance, dependency scanning |
| S-11 | Denial of service / resource exhaustion | time/output bounds in existing adapter | resource budgets, queue quotas, abuse controls |
| S-12 | Tenant isolation (future) | hosted multi-tenant system not implemented | isolation model, authorization and penetration tests |
| S-13 | Unverified marketing/security claims | docs mark incomplete capabilities | claim-review checklist before releases |

## Security release gate (future execution)
- [ ] Threat model reviewed and updated.
- [ ] Untrusted code boundary identified.
- [ ] Isolation implementation independently tested.
- [ ] Credentials short-lived, least-privilege and isolated.
- [ ] Network, filesystem and resource policies enforced.
- [ ] Approval and policy checks are server-enforced, not UI-only.
- [ ] Logs/artifacts/outputs redacted and retention defined.
- [ ] Runner lifecycle, cancel, retry and cleanup tested.
- [ ] Incident response and vulnerability reporting process documented.
- [ ] Security review completed; no unsupported sandbox claims.
