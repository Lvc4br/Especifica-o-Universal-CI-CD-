# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- VS Code engine adapter with a typed command allowlist and argument-vector construction.
- VS Code commands for status, detection, configuration validation, planning, workspace discovery, history and explicitly approved execution.
- Bounded process output capture, configurable timeout and cancellation handling for local engine processes.
- Unit tests covering argument construction and the explicit-approval boundary.

### Security
- PowerShell is launched with `shell: false`; user-controlled project paths are passed as individual arguments.
- Pipeline execution commands request a modal confirmation before the `-Approve` switch is sent.
- No remote execution, GitHub workflow dispatch, or AI provider is enabled by this change.
