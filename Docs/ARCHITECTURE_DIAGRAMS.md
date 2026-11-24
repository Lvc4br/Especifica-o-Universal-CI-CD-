# Diagramas de arquitetura

## Arquitetura lógica (estado atual + componentes planejados)

```mermaid
flowchart TB
  DEV[Desenvolvedor] --> VSC[VS Code Extension / TypeScript]
  VSC -->|local adapter| CLI[CLI / PowerShell 7.2+]
  CLI --> DET[Detector]
  DET --> PLAN[Planner]
  PLAN --> REG[Registry / allowlist]
  REG --> EXEC[Executor aprovado]
  EXEC --> TOOLS[Toolchains: Python, Node, Go, Rust, .NET, Java, etc.]
  EXEC --> REP[Relatórios JSON / HTML / Markdown]
  GH[GitHub PR / event] -. roadmap .-> APP[GitHub App / TypeScript / Probot]
  APP -.-> ORCH[Orchestration contract]
  ORCH -.-> PG[(PostgreSQL foundation / PR)]
  ORCH -. roadmap .-> WORK[Isolated worker / runner]
  WORK -.-> ACTIONS[GitHub Actions provider]
```

## Pipeline local

```mermaid
flowchart TD
  A[Init / project path] --> B[Validate config]
  B --> C[Detect technologies]
  C --> D[Generate plan]
  D --> E{Explicit approval?}
  E -->|No| F[Preview only]
  E -->|Yes| G[Execute allowlisted steps]
  G --> H[Capture exit code, logs, duration]
  H --> I[Report and history]
```

## Orchestration remota futura

```mermaid
flowchart TD
  EV[Webhook: PR event] --> SIG[Signature and replay checks]
  SIG --> DED{Delivery already processed?}
  DED -->|Yes| STOP[Ignore duplicate]
  DED -->|No| TX[Atomic delivery + job transaction]
  TX --> Q[Persistent queue]
  Q --> CLAIM[Worker claims job / lease]
  CLAIM --> HEAD[Re-check PR head and policy]
  HEAD -->|Stale| CANCEL[Cancel / mark stale]
  HEAD -->|Current and approved policy| ISO[Ephemeral isolated environment]
  ISO --> ENGINE[Universal CI/CD engine]
  ENGINE --> RESULT[Logs and results]
  RESULT --> CHECK[Update GitHub Check Run]
```

**Roadmap diagram:** nodes dashed/not wired imply planned capability; current GitHub App foundation does not execute PR code, dispatch workflows, or create Check Runs.
