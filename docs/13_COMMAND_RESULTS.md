# Command and Check Results

| Check | Result | Interpretation |
|---|---|---|
| ZIP extraction | PASS | 26 files and 9 directories extracted |
| Source inventory | PASS | 19 TS/TSX files; 3,032 source lines |
| Static import/API scan | PASS | 61 imports; no fetch/WebSocket/persistence APIs; no tests found |
| `npm ci` | NOT_COMPLETED | Timed out in the audit environment; retry returned a container client error |
| `npm run build` | NOT_RUN_VALIDLY | `vite` unavailable because dependency installation did not complete |
| `npx tsc --noEmit` | NOT_RUN_VALIDLY | Node type definitions unavailable because dependency installation did not complete |
| Browser/E2E | NOT_TESTED | No built app and no E2E suite |
| SAST/SCA/SBOM/license | NOT_TESTED | No configured tools and no successful dependency installation |
| Runtime adapter smoke tests | NOT_TESTED | No target clients were executed |

The failed local baseline is a verification limitation, not proof that the repository cannot build in a correctly provisioned environment.
