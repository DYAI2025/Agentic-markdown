# Gap Analysis

## Release conclusion

**Current decision: BLOCKED for production-ready claims.** The repository is a credible prototype and architectural seed, but the core target architecture is incomplete and runtime/build evidence is insufficient.

## Gap register

| ID | Priority | Gap | Evidence | Consequence | Remediation | Task |
|---|---|---|---|---|---|---|
| GAP-001 | P0 | Reproducibility contract is false | Timestamps are created inside extraction, reports and ZIP metadata. | Same canonical input cannot be rebuilt byte-for-byte; diffs and provenance become noisy. | Inject a clock/build metadata object, canonicalize serialization, and add reproducibility tests. | PRR-003 |
| GAP-002 | P0 | No runtime schema validation | Documentation says schema-validated, but only TypeScript interfaces exist. | Invalid or migrated manifests can silently reach renderers. | Add JSON Schemas, runtime validation, schema versions and migrations. | PRR-002 |
| GAP-003 | P0 | No multi-agent network model | The core type is one AgentManifest. | The app cannot characterize multiple agents, assign responsibilities or express dependencies. | Introduce NetworkManifest, AgentNode and graph validation. | PRR-004 |
| GAP-004 | P0 | No task and handoff graph | No TaskNode or HandoffContract exists. | Task distribution and agent coordination are absent. | Add task decomposition, ownership, dependencies, handoffs and cycle checks. | PRR-005 |
| GAP-005 | P0 | Runtime adapters are not source-bound | Adapters are hard-coded and not versioned; Claude imports are literal; Windsurf path is stale relative to current docs. | Generated files can look plausible but not load as intended. | Create versioned adapter registry, official-source metadata and fixture tests. | PRR-006 |
| GAP-006 | P0 | Actual import semantics are missing | Runtime files list paths in backticks rather than using client-specific inclusion syntax. | Secondary rules may never enter model context. | Compile client-specific imports/inlining and verify with fixtures. | PRR-007 |
| GAP-007 | P0 | Link validation is unsound | Checks use blueprint references instead of parsed rendered content; metadata omits some rendered references. | Missing links can pass and harmless omissions can fail. | Parse Markdown/frontmatter and validate actual links/imports. | PRR-008 |
| GAP-008 | P0 | No prompt/Markdown boundary protection | User-derived text is inserted into Markdown and a fenced system-prompt block without robust escaping. | Malformed files or instruction-boundary injection are possible. | Add untrusted-field encoding, fence escaping, AST render and adversarial fixtures. | PRR-009 |
| GAP-009 | P0 | No automated tests or CI | No tests, test script, lint, typecheck script or workflow exists. | Core correctness and regressions are unproven. | Add unit, property, integration, ZIP round-trip, adapter and E2E tests plus CI. | PRR-010 |
| GAP-010 | P0 | Release gate does not fail closed | A penalty score can be high while runtime behavior remains UNVERIFIED; download remains available. | Users can mistake internal consistency for production readiness. | Separate quality score from release decision and block artifacts on mandatory gate failures. | PRR-012 |
| GAP-011 | P1 | Build progress is simulated | Stage labels advance by timers; compilation occurs once at the end. | UI communicates work that has not yet happened. | Use real synchronous stage events or remove artificial processing claims. | PRR-013 |
| GAP-012 | P1 | Explicit user requirements are lost | Inputs, outputs, quality bars and workflows mostly come from domain templates. | Generated agents may not match the user's stated acceptance criteria. | Add structured extracted fields, provenance pointers and confirmation/edit step. | PRR-001 |
| GAP-013 | P1 | Individual downloads lose nested paths | saveText keeps only the basename. | Cursor/Copilot/Windsurf files can be installed in the wrong location. | Download folder-preserving bundles or display exact placement instructions. | PRR-015 |
| GAP-014 | P1 | No persistence, import, diff or rollback | State exists only in the current React session. | Projects cannot be sustainably maintained or regenerated. | Add IndexedDB workspace storage, manifest import/export, version history and diffs. | PRR-014 |
| GAP-015 | P1 | Evaluation is documentation-only | EVALUATION.md contains manual UNVERIFIED cases. | There is no repeatable acceptance evidence. | Add executable fixture runner and stored results. | PRR-016 |
| GAP-016 | P1 | Guardrails are not compiled to enforcement | Tool permissions remain prose. | The runtime may ignore constraints. | Generate supported permission/hook configs and mark unsupported enforcement explicitly. | PRR-017 |
| GAP-017 | P1 | Hard-coded model/runtime catalog drifts | No verified date or source map is stored. | Compatibility and model availability age silently. | Move catalog to data with source, verified date, capability flags and deprecation policy. | PRR-018 |
| GAP-018 | P1 | No supply-chain or release metadata | No SBOM, license scan, secret scan, checksums or signed release process. | Production distribution lacks integrity and dependency evidence. | Add release scripts, SBOM/license/secret checks and checksum manifest. | PRR-020 |
| GAP-019 | P1 | Accessibility and UI behavior unverified | Source has useful accessibility elements but no browser/E2E evidence. | Keyboard, screen-reader and responsive defects may remain. | Add Playwright flows and automated accessibility checks. | PRR-019 |
| GAP-020 | P2 | No compatibility update workflow | Current official documentation can change without detection. | Adapters can regress after vendor changes. | Add scheduled source review and compatibility contract tests. | PRR-018 |
| GAP-021 | P2 | No optional provider-backed extractor | Provider/model selection is metadata only. | Complex briefs cannot be semantically normalized beyond regex heuristics. | Add an optional, sandboxed extractor interface while keeping deterministic core and manual fallback. | PRR-022 |
| GAP-022 | P2 | No operational documentation | No root README, deployment guide, ADRs, support bundle or release runbook. | Maintenance and handoff are fragile. | Create production documentation and architecture decision records. | PRR-021 |

## Verification boundary

- **Proven by source inspection:** architecture shape, generated file types, rule-based extraction, validation logic, repair flow and export code.
- **Static-analysis evidence:** source-file/line counts, import graph, absence of network/persistence API calls and tests.
- **Not proven:** successful dependency installation, build, typecheck, browser runtime, ZIP round trip, adapter loading in real clients, model behavior, security scans and deployment.
- **Bias risk:** the code is cleanly organized, which can create architecture-quality bias. Clear folders do not prove correctness or product completeness.
