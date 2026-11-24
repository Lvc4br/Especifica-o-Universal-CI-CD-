# VS Code UPS Inspector — preview 0.7.0

## Purpose

Provide a read-only entry point for inspecting an explicit UPS v1 JSON document from VS Code. This is the first editor integration of the shared UPS validator, deterministic plan generator and Pipeline Intelligence Engine.

## User flow

1. Run **Universal CI/CD: Inspecionar pipeline UPS (somente leitura)** from the Command Palette.
2. Select one JSON document.
3. The extension reads the selected file and validates it through `@universal-cicd/contracts`.
4. For a valid document, it generates a `plan-only` plan and analyzes its dependency DAG.
5. The report is written to the **Universal CI/CD** Output channel.

## Report contents

- Pipeline name and graph summary.
- Dependency waves, job names/IDs, declared dependencies and required capabilities.
- Deterministic topological order.
- Structural critical path measured in number of jobs, never elapsed time.
- Diagnostics and recommendations emitted by Pipeline Intelligence.

## Defensive limits

- Maximum selected file size: 1 MB.
- Maximum number of jobs: 500.
- Maximum report length: 100,000 characters.
- Invalid documents show at most 100 validation issues in Output.

## Trust and execution boundary

The inspector is analysis-only. It does not:
- launch a step executable;
- invoke the PowerShell engine;
- contact, reserve or provision a runner;
- resolve or inject secrets;
- approve a pipeline or grant execution authorization;
- claim that a local executor is a sandbox.

The selected document is data. Executable names and argument arrays are displayed only as part of the declared specification and are never passed to a process runner by this command.

## Shared contract dependency

The extension consumes `@universal-cicd/contracts` rather than maintaining a second UPS validator or DAG implementation. The root typecheck script and VS Code CI build the contracts package before compiling the extension. VSIX packaging includes the internal workspace dependency.

## Current limitation

The result is a textual report in the Output channel, not yet a graphical DAG canvas or dashboard section. Interactive graph layout, filtering, and file-change watching for selected UPS documents remain future work and must preserve the same analysis-only boundary.
