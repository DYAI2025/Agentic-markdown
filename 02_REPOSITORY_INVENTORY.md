# Repository Inventory

## Scope

Analyzed target: `agent-markdown-network-builder (3).zip`.

- 26 files, 9 directories after extraction.
- 19 TypeScript/TSX source files, 3,032 source lines.
- React + Vite + Tailwind single-file browser application.
- No backend, database, network API, authentication, persistence, tests, CI, or deployment configuration found.
- No Git history was included.

## File map

```text
agent-markdown-network-builder/
├── docs/agent-network-builder.md
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── App.tsx
    ├── components/
    │   ├── StepRail.tsx
    │   └── primitives.tsx
    ├── domain/
    │   ├── catalog.ts
    │   ├── extract.ts
    │   ├── render.ts
    │   ├── types.ts
    │   └── validate.ts
    ├── lib/zip.ts
    ├── state/useBuilder.ts
    ├── utils/cn.ts
    └── views/
        ├── BriefView.tsx
        ├── TargetsView.tsx
        ├── EngineView.tsx
        ├── FilesView.tsx
        ├── BuildView.tsx
        ├── ResultView.tsx
        └── PreviewPanel.tsx
```

## Entrypoints

- Browser entry: `src/main.tsx`
- UI composition: `src/App.tsx`
- Application orchestration: `src/state/useBuilder.ts`
- Domain entrypoints: `extractManifest`, `buildBlueprints`, `renderFiles`, `runChecks`, `applyRepair`
- Artifact export: `createZip`, `saveText`, `saveBlob`

## Package state

`package.json` has only `dev`, `build`, and `preview` scripts. The package still uses the generic name `react-vite-tailwind` and version `0.0.0`; no license, repository metadata, engine declaration, test, lint, typecheck, or release scripts are present.
