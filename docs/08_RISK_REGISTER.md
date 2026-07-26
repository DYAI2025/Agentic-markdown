# Risk Register

| ID | Risk | Likelihood | Impact | Evidence | Control |
|---|---|---:|---:|---|---|
| R-01 | Users interpret a high validation score as production readiness | High | High | Score ignores notes and unverified runtime behavior | Separate score from fail-closed release gate |
| R-02 | Generated runtime files are not actually loaded | High | High | Literal links/import mismatch and stale adapter paths | Versioned adapters plus client fixture tests |
| R-03 | User instructions are dropped or replaced by generic presets | High | High | Domain defaults populate core fields | Provenance-aware extraction and confirmation UI |
| R-04 | Output is not reproducible | Certain | Medium | Current timestamps in manifest/report/archive | Injected clock and canonical build mode |
| R-05 | Cross-file validation misses broken references | Medium | High | Metadata and rendered content diverge | Markdown AST validation |
| R-06 | Prompt/Markdown injection corrupts generated package | Medium | High | Unescaped user-derived text in fenced content | Encoding, AST renderer and adversarial tests |
| R-07 | Dependency or browser regression goes unnoticed | High | High | No CI or automated tests | Full baseline and release CI |
| R-08 | Advisory guardrails are mistaken for enforced permissions | High | High | Markdown cannot enforce runtime tools | Compile supported enforcement configs and label limits |
| R-09 | Vendor compatibility silently drifts | High | Medium | Hard-coded catalog without source date | Compatibility registry and scheduled review |
| R-10 | Single sprint is overcommitted | High | Medium | Production target adds graph, schemas, adapters, tests and persistence | Capacity gate; commit P0 slice only |
