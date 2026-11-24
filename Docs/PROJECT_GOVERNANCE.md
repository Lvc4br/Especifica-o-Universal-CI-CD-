# Project Governance

## Ownership and collaboration
- **Luca:** product owner, architecture direction and core implementation.
- **Higor:** project coordination, validation planning, tracking and review.
- **Arthur:** design, layout and usability work when the interface design phase begins.
- Roles may evolve; decisions and deliverables are recorded in issues, PRs and docs.

## Workflow
- Never push directly to main.
- Use small, reviewable branches and draft PRs.
- For stacked PRs, document base branch and dependency; avoid merges that skip prerequisites.
- PRs must describe intent, change scope, test evidence, limitations, risks and rollback.
- CI evidence must be associated with the current head SHA.
- Do not state tests passed unless the actual run passed on the relevant revision.
- Prefer conventional commits, but consistency matters more than rigid syntax.

## PR checklist
- [ ] Scope and rationale are clear.
- [ ] Tests added/updated and run.
- [ ] Docs/changelog updated.
- [ ] Security/privacy implications considered.
- [ ] Backwards compatibility and schema impact considered.
- [ ] No secrets or sensitive data committed.
- [ ] CI checked at exact head.
- [ ] Feature is not described as production-ready without evidence.

## Decision records
Major changes record problem, options, decision, trade-offs, security impact and revisit conditions in an ADR or issue.

## Releases
Release notes, compatibility matrix, known issues, migration notes and reproducible validation are required. Release gates and versioning policy to be finalized before public beta.
