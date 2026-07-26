# Agent / Developer Handoff

## Immediate implementation sequence

1. Introduce schemas and validators without changing current UI behavior.
2. Make timestamps and IDs injectable; add deterministic fixture output.
3. Add NetworkManifest as a superset of AgentManifest and migrate the current single-agent flow.
4. Add TaskNode and HandoffContract.
5. Extract runtime adapters from `catalog.ts` into versioned data and renderer modules.
6. Replace metadata link checks with parsed output checks.
7. Add adversarial input handling.
8. Build tests before expanding UI.
9. Add fail-closed release state.
10. Add persistence and E2E after core contracts stabilize.

## Preserve

- Domain/UI separation.
- Local-first default.
- Canonical manifest as the source of rendered artifacts.
- Explicit truth markers.
- Re-render after approved repairs.
- Honest statement that Markdown cannot enforce runtime permissions by itself.

## Avoid

- Adding an LLM before contracts and tests are stable.
- Treating model names as compatibility proof.
- Creating one giant prompt instead of composable, scoped contracts.
- Hiding missing evidence behind a score.
- Coupling the canonical model to one runtime client.
