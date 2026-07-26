# Proposed Fix-for-Production-Ready Sprint

## Critical framing

A full production-ready target is not a credible one-sprint promise from the current state. The proposed sprint is therefore a **Production Candidate Core Sprint**. Capacity is `MISSING`; the final commitment must be cut after the team provides available developer days and skill mix.

## Sprint goal

> Produce a deterministic, schema-valid, minimally multi-agent package whose runtime adapters are source-bound and whose release is blocked unless automated core checks pass.

## Candidate commitment order

| Order | Task | Priority | Size | Why now |
|---:|---|---|---|---|
| 1 | PRR-002 Runtime schemas and migrations | P0 | L | Contract foundation |
| 2 | PRR-003 Reproducible builds | P0 | M | Trust and diffability |
| 3 | PRR-004 Multi-agent graph | P0 | L | Core target capability |
| 4 | PRR-005 Task ownership and handoffs | P0 | L | Core target capability |
| 5 | PRR-006 Runtime adapter registry | P0 | L | Compatibility foundation |
| 6 | PRR-007 Real imports and scopes | P0 | L | Runtime effectiveness |
| 7 | PRR-008 Markdown/path validation | P0 | L | Fail broken packages |
| 8 | PRR-009 Untrusted input hardening | P0 | L | Security/integrity |
| 9 | PRR-010 Automated test baseline | P0 | L | Evidence |
| 10 | PRR-011 CI gate | P0 | M | Reproducibility |
| 11 | PRR-012 Fail-closed release decision | P0 | M | Production truth |

## Capacity gate

- Do **not** commit all 11 items automatically.
- Start with PRR-002, PRR-003, PRR-006 and PRR-010 as enabling work.
- Add PRR-004/005 only if the sprint has enough capacity for schema, graph and fixtures together.
- PRR-007/008/009/011/012 form the release gate chain and should not be split across an unbounded gap.
- Remaining P1/P2 tasks stay in the production backlog.

## Definition of Done

- Clean checkout install succeeds on a pinned supported Node version.
- Typecheck, unit/property/integration tests and production build pass in CI.
- Canonical manifest validates at runtime.
- Same canonical input produces byte-identical deterministic artifacts.
- At least one two-agent/two-task/handoff fixture compiles and validates.
- Claude, Codex, Cursor, Copilot and Windsurf adapter fixtures pass.
- Broken link, malformed frontmatter, prompt-injection and path traversal fixtures fail closed.
- Release report says `release`, `revise` or `block`; unresolved P0 findings force `block`.
- Browser runtime and download path are E2E-tested before any production-ready claim.

## Sprint review evidence

- CI run URL or exported logs.
- Generated fixture ZIP and checksums.
- Validation report JSON and Markdown.
- Adapter fixture snapshots.
- E2E recording/screenshots.
- List of residual gaps moved to the next sprint.
