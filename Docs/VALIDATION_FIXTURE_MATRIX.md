# Validation Fixture Matrix

The matrix is a validation plan, not a declaration of fully supported ecosystems.

| Ecosystem | Fixture intent | Expected detection | Validation command examples | Status |
|---|---|---|---|---|
| Python | pyproject + tests | Python, Ruff/pytest when configured | ruff check; python -m pytest | Planned |
| Node.js | package.json scripts | Node + package manager/scripts | npm run lint/test/build if scripts exist | Planned |
| TypeScript | tsconfig + scripts | TypeScript compiler | npm run typecheck | Planned |
| Go | go.mod | Go modules | go test ./...; go vet ./... | Planned |
| Rust | Cargo.toml | Cargo | cargo fmt --check; cargo test | Planned |
| .NET | solution/project | SDK/project type | dotnet test; dotnet build | Planned |
| Java Maven | pom.xml | Maven | mvn test; mvn package | Planned |
| Java Gradle | build files | Gradle | gradle check/build | Planned |
| PHP | composer.json | Composer | composer validate; scripts only when defined | Planned |
| Ruby | Gemfile | Bundler | bundle check; configured tests | Planned |
| C/C++ | CMakeLists | CMake | configure + CTest if configured | Planned |
| HTML/CSS | project config | static web tooling | configured lint only | Planned |

## Fixture acceptance criteria
- Fixture is minimal, deterministic, and safe.
- Tests validate detection and generated plan, not run arbitrary project scripts by default.
- Tool availability is explicit; missing tools yield unavailable/skipped with reason, not success.
- Commands and arguments are inspected and never shell-interpolated.
- Negative fixtures cover malformed config, ambiguous detection and unsupported tools.
- CI should use fixtures and mocked executable resolution initially; real tool integration jobs are opt-in.
- Evidence of test execution and environment versions is recorded before marking an ecosystem validated.

## Validation status
No ecosystem in this matrix is certified by this document alone.
