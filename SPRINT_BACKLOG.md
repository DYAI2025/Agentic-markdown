# Production Backlog

| Task | Priority | Size | Title | Dependencies |
|---|---|---|---|---|
| [PRR-001](tasks/PRR-001.md) | P1 | M | Preserve and confirm explicit requirements | — |
| [PRR-002](tasks/PRR-002.md) | P0 | L | Add runtime schemas and migrations | — |
| [PRR-003](tasks/PRR-003.md) | P0 | M | Make builds reproducible | PRR-002 |
| [PRR-004](tasks/PRR-004.md) | P0 | L | Implement canonical multi-agent graph | PRR-002 |
| [PRR-005](tasks/PRR-005.md) | P0 | L | Implement task ownership and handoffs | PRR-004 |
| [PRR-006](tasks/PRR-006.md) | P0 | L | Create versioned runtime adapter registry | PRR-002 |
| [PRR-007](tasks/PRR-007.md) | P0 | L | Compile real runtime imports and scopes | PRR-006 |
| [PRR-008](tasks/PRR-008.md) | P0 | L | Validate rendered Markdown and paths | PRR-002, PRR-007 |
| [PRR-009](tasks/PRR-009.md) | P0 | L | Harden untrusted brief rendering | PRR-002 |
| [PRR-010](tasks/PRR-010.md) | P0 | L | Add complete automated test baseline | PRR-002 |
| [PRR-011](tasks/PRR-011.md) | P0 | M | Add CI and reproducible install gate | PRR-010 |
| [PRR-012](tasks/PRR-012.md) | P0 | M | Replace score with fail-closed release decision | PRR-008, PRR-010 |
| [PRR-013](tasks/PRR-013.md) | P1 | S | Make build progress truthful | — |
| [PRR-014](tasks/PRR-014.md) | P1 | L | Add local workspace persistence and versioning | PRR-002, PRR-003 |
| [PRR-015](tasks/PRR-015.md) | P1 | S | Preserve nested installation paths | PRR-006 |
| [PRR-016](tasks/PRR-016.md) | P1 | L | Build executable evaluation harness | PRR-010 |
| [PRR-017](tasks/PRR-017.md) | P1 | L | Compile runtime enforcement configurations | PRR-006 |
| [PRR-018](tasks/PRR-018.md) | P1 | M | Externalize compatibility and model catalog | PRR-006 |
| [PRR-019](tasks/PRR-019.md) | P1 | L | Add browser E2E and accessibility verification | PRR-011, PRR-015 |
| [PRR-020](tasks/PRR-020.md) | P1 | M | Add supply-chain and release integrity | PRR-011 |
| [PRR-021](tasks/PRR-021.md) | P2 | M | Create production documentation and runbook | PRR-011, PRR-012 |
| [PRR-022](tasks/PRR-022.md) | P2 | L | Add optional provider-backed extractor plugin | PRR-002, PRR-009 |
