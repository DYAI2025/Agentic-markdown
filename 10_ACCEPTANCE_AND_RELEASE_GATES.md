# Acceptance and Release Gates

## Mandatory gates

| Gate | Pass condition | Failure decision |
|---|---|---|
| Install | Clean, pinned install succeeds | BLOCK |
| Type | Typecheck succeeds with no ignored production errors | BLOCK |
| Schema | Canonical manifest and reports validate | BLOCK |
| Determinism | Repeated deterministic build is byte-identical | BLOCK |
| Graph | No missing agent/task/handoff references or forbidden cycles | BLOCK |
| Adapter | Required target adapter fixtures pass | BLOCK for selected target |
| Markdown | Frontmatter, links, imports and paths validate | BLOCK |
| Security | Injection/path traversal/secret fixtures pass | BLOCK |
| Tests | Mandatory unit/integration/archive tests pass | BLOCK |
| E2E | Core browser flow and downloads pass | REVISE/BLOCK depending release tier |
| Accessibility | No critical automated issue | REVISE |
| Supply chain | No unapproved critical dependency/license/secret issue | BLOCK |
| Behavioral eval | Result recorded with target model/version | Required for behavior claims; otherwise UNVERIFIED |

## Release tiers

- **Draft:** files can be previewed/downloaded but are explicitly unverified.
- **Release candidate:** deterministic and all static/local automated gates pass.
- **Production-ready:** release candidate plus browser E2E, selected runtime smoke tests, security/supply-chain evidence and documented operational ownership.

The application must never use a single percentage as a substitute for these gates.
