# Functionality Assessment

## Proven by source inspection

| Capability | Status | Evidence boundary |
|---|---|---|
| Six-step wizard | Implemented | Source-inspected; browser runtime not executed |
| Rule-based brief extraction | Implemented | Source-inspected; no corpus accuracy evaluation |
| Canonical single-agent manifest | Implemented | TypeScript type only; no runtime schema validation |
| File blueprint proposal | Implemented | Source-inspected |
| Markdown/JSON rendering | Implemented | Source-inspected |
| Heuristic validation | Implemented | Source-inspected; not a semantic model |
| Targeted manifest repair | Implemented | Source-inspected |
| Preview and copy | Implemented | Source-inspected |
| Individual downloads | Implemented with path defect | Nested directory path is removed |
| ZIP export | Implemented | Source-inspected; no round-trip test |
| Local/no-provider operation | Implemented by design | No network API found; runtime network proof absent |

## Important truth corrections

1. **“Schema-validated extraction” is not implemented.** The repository has TypeScript interfaces, but no runtime schema validator or schema artifact.
2. **“Same input, same result” is not true byte-for-byte.** Manifest, report and ZIP metadata use current time.
3. **“Semantic validation” is a heuristic rule set.** It can be valuable, but the label suggests a broader capability than the code provides.
4. **The progress animation is not processing telemetry.** Timers advance labels; the actual compilation runs only at the end.
5. **A Markdown guardrail is not a permission boundary.** The repository states this limitation, but the score/release UX does not enforce it.
6. **Runtime file references are not equivalent to runtime imports.** In particular, Claude Code imports require `@path`; backticked file names remain literal.
