# Feature-Slice: Agent Markdown Network Builder

## Zweck

Aus einer frei formulierten Beschreibung entsteht ein zusammenhängendes, geprüftes Netzwerk
agentischer Markdown-Dateien. Die Anwendung ist ein **Compiler für Agentenkonfigurationen**,
kein freier Multi-Datei-Textgenerator.

## Pipeline

```text
Nutzerbeschreibung
→ schema-validierte Extraktion        src/domain/extract.ts
→ Canonical Agent Manifest (CAM)      src/domain/types.ts
→ Dateivorschläge                     src/domain/render.ts  (buildBlueprints)
→ Nutzerfreigabe                      src/views/FilesView.tsx
→ Runtime-Adapter                     src/domain/render.ts  (renderRuntime)
→ deterministisches Rendering         src/domain/render.ts  (renderFiles)
→ deterministische Prüfung            src/domain/validate.ts (runChecks, Abschnitte 1–5, 11)
→ begrenzte semantische Prüfung       src/domain/validate.ts (runChecks, Abschnitte 6–10)
→ gezielte Reparatur                  src/domain/validate.ts (applyRepair)
→ Download                            src/lib/zip.ts
```

Jede Datei wird aus **einer** Quelle gerendert (dem Manifest). Dadurch kann keine Datei
etwas behaupten, was eine andere widerlegt.

## Schichten und Grenzen

| Schicht | Pfad | Regel |
| --- | --- | --- |
| Domain | `src/domain/*` | rein, ohne React, ohne DOM, deterministisch |
| Infrastruktur | `src/lib/zip.ts` | Browser-APIs (Blob, Clipboard), keine Domainlogik |
| Application | `src/state/useBuilder.ts` | Zustandsmaschine, orchestriert die Pipeline |
| UI | `src/components/*`, `src/views/*` | darstellungsfrei von Fachlogik, nur Anzeige und Eingabe |

Die Domainschicht ist ohne UI aufrufbar und damit direkt unit-testbar
(`extractManifest`, `buildBlueprints`, `renderFiles`, `runChecks`, `applyRepair`, `createZip`).

## Produktregeln

- `SOUL.md` und `HEARTBEAT.md` sind fest im Paket und nicht abwählbar (`locked: true`).
- Lädt eine Zielruntime diese Dateien nicht nativ, wird das an drei Stellen sichtbar:
  Zielsystem-Schritt, Dateikachel (`notNativelyLoaded`) und Prüfbericht (`native-load`).
- Pro Ansicht genau eine priorisierte Hauptaktion (`PrimaryAction`), alles Weitere `QuietAction`.
- Keine Dropdowns, Selects, Drei-Punkte- oder Hamburger-Menüs, keine unbeschrifteten Symbole.

## Wahrheitsmarkierungen

`MISSING` · `ASSUMPTION` · `SOURCE_NEEDED` · `UNVERIFIED` · `BLOCKER`

Sie stammen aus der Extraktion (`extractManifest`) und der Prüfung (`runChecks`) und laufen
unverändert bis in `agent.manifest.json` und `VALIDATION_REPORT.md` durch.

## Status dieses Slices

- `UNVERIFIED` — Es besteht keine Verbindung zu einem Anbieter. Provider und Modelle sind
  Auswahlmetadaten, die in die erzeugten Dateien einfließen; es findet kein API-Aufruf statt.
- `UNVERIFIED` — Die erzeugten Dateien wurden nicht gegen ein laufendes Modell getestet.
  Wirksamkeit ist erst nach den Prüffällen aus `EVALUATION.md` belegbar.
- `ASSUMPTION` — Die Modellnamen im Katalog (`src/domain/catalog.ts`) sind austauschbare
  Platzhalter einer Produktentscheidung, keine Zusicherung über Verfügbarkeit oder Preise.
- `ASSUMPTION` — Die Extraktion arbeitet regelbasiert (deutsch/englische Schlüsselwörter).
  Ein LLM-Extraktor kann sie ersetzen, ohne dass sich das Manifest-Schema ändert.
- `MISSING` — Persistenz, Mehrbenutzerbetrieb und Telemetrie sind nicht Teil dieses Slices.
- Kein Build-, Deployment- oder Produktionsreifeversprechen über das hinaus, was
  `npm run build` tatsächlich zeigt.

## Erweiterungspunkte

1. **Neue Zielruntime**: Eintrag in `RUNTIMES` ergänzen → Startdatei, Blueprint, Adapter-Rendering
   und Abdeckungsprüfung entstehen automatisch.
2. **Neues Fachgebiet**: Regel in `DOMAIN_RULES` und Dateiname in `DOMAIN_STANDARD_FILE` ergänzen.
3. **Neue Prüfung**: Finding in `runChecks` ergänzen, optional mit `RepairAction`; die Reparatur
   verändert ausschließlich das Manifest und löst ein vollständiges Neu-Rendern aus.
