# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- VS Code engine adapter with a typed command allowlist and argument-vector construction.
- VS Code commands for engine version, project initialization, status, detection, configuration validation, planning, workspace discovery, history and report export.
- Explicitly approved pipeline and workspace execution, gated by a successful plan and modal confirmation.
- Bounded process output capture, configurable timeout and cancellation handling for local engine processes.
- Unit tests covering argument construction, approval boundaries and timeout forwarding.

### Security
- PowerShell is launched with `shell: false`; user-controlled project paths are passed as individual arguments.
- Pipeline execution commands request a modal confirmation only after a successful plan.
- No remote execution, GitHub workflow dispatch, or AI provider is enabled by this change.
