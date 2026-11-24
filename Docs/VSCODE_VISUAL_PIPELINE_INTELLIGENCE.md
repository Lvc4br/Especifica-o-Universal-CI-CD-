# Visual Pipeline Intelligence — VS Code 0.8.0

## Purpose

The UPS Inspector opens a second VS Code Webview panel that renders the validated UPS v1 dependency graph. The graph is derived exclusively from the shared contracts package and the deterministic Pipeline Intelligence Engine.

## User flow

1. Run **Universal CI/CD: Inspecionar pipeline UPS (somente leitura)**.
2. Select a UPS v1 JSON document.
3. The extension enforces the 1 MB input, 500-job and 100-step-per-job bounds.
4. The shared UPS validator checks the document.
5. The shared planner creates a declarative plan-only representation.
6. Pipeline Intelligence computes deterministic dependency waves, topological order, structural critical path and diagnostics.
7. The extension opens the text report and visual DAG side by side.

## Visual capabilities

- Nodes represent UPS jobs; directed edges represent declared dependencies.
- Horizontal columns represent dependency waves from the analysis.
- Jobs in a multi-job wave are highlighted as structurally parallelizable.
- Jobs in the structural critical path receive a distinct outline; edges along that path are emphasized.
- Selecting a node shows its ID, declared dependencies, required capabilities, number of steps and wave position.
- Diagnostics include severity, affected job IDs, explanation and recommendation.
- The graph is scrollable for large pipelines and supports keyboard selection with Enter/Space.

## Security controls

- Webview has `default-src 'none'`, nonce-scoped inline style/script, and no local resource roots.
- No remote assets, network calls, command execution or runner APIs are present in the graph panel.
- The webview receives a bounded, normalized in-memory projection via VS Code `postMessage`; it does not read arbitrary workspace files.
- Pipeline-controlled strings are inserted using DOM text nodes and SVG text nodes, never `innerHTML`.
- The graph panel accepts only a `ready` message from the webview; it exposes no command bridge.
- Existing input bounds remain: 1 MB, 500 jobs, and 100,000 characters for the text report.

## Interpretation limits

A wave is a topological depth group, not a guarantee that a runner can execute every member concurrently. Runner inventory, resource capacity, policy and trust gates are not evaluated by the graph UI.

The critical path is measured by job count because UPS v1 does not provide trustworthy duration history in this analysis. It is not a wall-clock estimate.

The panel is an analysis visualization, not an execution monitor. It does not imply that a pipeline is running, that GitHub is connected, or that remote execution is available.

## Test coverage

Automated tests verify the restrictive CSP, absence of external asset loading, DOM text-node rendering, keyboard interaction, and use of the shared analysis fields for critical path, waves and diagnostics.
