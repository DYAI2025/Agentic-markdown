import { DOMAIN_STANDARD_FILE, RUNTIMES } from "./catalog";
import { AUTONOMY_LABEL } from "./extract";
import type { AgentManifest, FileBlueprint, GeneratedFile, RuntimeId } from "./types";

const bullets = (items: string[]) => items.map((i) => `- ${i}`).join("\n");
const numbered = (items: string[]) => items.map((i, n) => `${n + 1}. ${i}`).join("\n");

function frontMatter(manifest: AgentManifest, kind: string, extra: Record<string, string> = {}) {
  const lines = ["---", `agent: ${manifest.slug}`, `file_kind: ${kind}`, `manifest_id: ${manifest.id}`, `generated: ${manifest.createdAt}`, `provider: ${manifest.provider}`, `model: ${manifest.model}`, ...Object.entries(extra).map(([k, v]) => `${k}: ${v}`), "---"];
  return lines.join("\n");
}

export function buildBlueprints(manifest: AgentManifest): FileBlueprint[] {
  const standard = DOMAIN_STANDARD_FILE[manifest.domain];
  const list: FileBlueprint[] = [
    { id: "soul", kind: "soul", path: "SOUL.md", title: "SOUL.md", blurb: "Wer der Agent ist, wofür er steht und wo seine Grenzen liegen.", locked: true, proposed: true, references: ["HEARTBEAT.md", standard] },
    { id: "heartbeat", kind: "heartbeat", path: "HEARTBEAT.md", title: "HEARTBEAT.md", blurb: "Der Arbeitstakt: was der Agent vor, während und nach jeder Aufgabe prüft.", locked: true, proposed: true, references: ["SOUL.md"] },
    { id: "agents", kind: "agents", path: "AGENTS.md", title: "AGENTS.md", blurb: "Die Einstiegsseite im Projekt. Verweist auf alle anderen Dateien.", locked: false, proposed: true, references: ["SOUL.md", "HEARTBEAT.md", "TOOLS.md", standard, "GUARDRAILS.md"] },
    { id: "system-prompt", kind: "system-prompt", path: "SYSTEM_PROMPT.md", title: "SYSTEM_PROMPT.md", blurb: "Der fertige Anweisungstext, den das Modell zu Beginn erhält.", locked: false, proposed: true, references: ["SOUL.md", "HEARTBEAT.md"] },
    { id: "tools", kind: "tools", path: "TOOLS.md", title: "TOOLS.md", blurb: "Welche Werkzeuge erlaubt sind und welche Regel für jedes gilt.", locked: false, proposed: true, references: ["GUARDRAILS.md"] },
    { id: "standard", kind: "standard", path: standard, title: standard, blurb: `Der Fachmaßstab für ${manifest.domainLabel}: woran gute Arbeit gemessen wird.`, locked: false, proposed: true, references: ["SOUL.md"] },
    { id: "guardrails", kind: "guardrails", path: "GUARDRAILS.md", title: "GUARDRAILS.md", blurb: "Verbote, Eskalation und was bei Unsicherheit zu tun ist.", locked: false, proposed: true, references: ["SOUL.md"] },
    { id: "evaluation", kind: "evaluation", path: "EVALUATION.md", title: "EVALUATION.md", blurb: "Prüffälle, mit denen Sie den Agenten später selbst testen können.", locked: false, proposed: true, references: [standard] },
  ];
  const usedPaths = new Set(list.map((f) => f.path));
  for (const id of manifest.targets) {
    const rt = RUNTIMES.find((r) => r.id === id);
    if (!rt || usedPaths.has(rt.entryFile)) continue;
    usedPaths.add(rt.entryFile);
    list.push({ id: `runtime-${rt.id}`, kind: "runtime", path: rt.entryFile, title: rt.entryFile, blurb: `Startdatei für ${rt.name}. Wird dort automatisch gelesen.`, locked: false, proposed: true, runtime: rt.id, references: ["SOUL.md", "HEARTBEAT.md", "AGENTS.md"] });
  }
  list.push({ id: "manifest", kind: "manifest", path: "agent.manifest.json", title: "agent.manifest.json", blurb: "Alle Entscheidungen in Maschinenform. Grundlage für spätere Neuerzeugung.", locked: false, proposed: true, references: [] });
  list.push({ id: "report", kind: "report", path: "VALIDATION_REPORT.md", title: "VALIDATION_REPORT.md", blurb: "Das Prüfergebnis in klarer Sprache, samt offener Punkte.", locked: true, proposed: true, references: [] });
  return list;
}

function renderSoul(m: AgentManifest): string { return `${frontMatter(m, "soul")}

# SOUL — ${m.name}

## Identität
Ich bin **${m.name}**. Meine Aufgabe: ${m.purpose}

Fachgebiet: ${m.domainLabel}${m.stack.length ? ` · Umfeld: ${m.stack.join(", ")}` : ""}
Handlungsrahmen: **${AUTONOMY_LABEL[m.autonomy]}**

## Auftrag in einem Satz
${m.purpose}

## Werte
- Wahrheit vor Gefälligkeit. Lieber eine offene Frage als eine erfundene Antwort.
- Kleinste wirksame Änderung. Kein Umbau ohne Anlass.
- Nachvollziehbarkeit. Jede Aussage lässt sich auf eine Quelle im Projekt zurückführen.
- Respekt vor fremdem Code und fremder Arbeit.

## Das kann ich
${bullets(m.capabilities)}

## Das tue ich nie
${bullets(m.prohibitions)}

## Ton
${m.tone}

## Wenn ich unsicher bin
${bullets(m.escalations)}

Ich benenne Unsicherheit mit einer dieser Markierungen:
\`MISSING\` fehlende Information · \`ASSUMPTION\` vertretbare Annahme · \`SOURCE_NEEDED\` unbelegte Behauptung · \`UNVERIFIED\` nicht praktisch geprüft · \`BLOCKER\` ohne Klärung nicht machbar.

## Verbundene Dateien
- \`HEARTBEAT.md\` — mein Arbeitstakt
- \`${DOMAIN_STANDARD_FILE[m.domain]}\` — mein Fachmaßstab
- \`GUARDRAILS.md\` — meine Grenzen im Detail
`; }

function renderHeartbeat(m: AgentManifest): string { return `${frontMatter(m, "heartbeat")}

# HEARTBEAT — Arbeitstakt

Dieser Takt gilt für jede einzelne Aufgabe. Er ist nicht optional.

## Vor dem Start
1. Auftrag in einem Satz wiederholen.
2. Prüfen, ob der Auftrag gegen \`SOUL.md\` verstößt. Wenn ja: anhalten und melden.
3. Fehlende Angaben als \`MISSING\` notieren, statt sie stillschweigend zu erfinden.

## Während der Arbeit
${numbered(m.cadence)}

## Vor der Abgabe
1. Ergebnis gegen \`${DOMAIN_STANDARD_FILE[m.domain]}\` prüfen.
2. Jede Annahme sichtbar als \`ASSUMPTION\` ausweisen.
3. Jede unbelegte Behauptung als \`SOURCE_NEEDED\` ausweisen.
4. Prüfen, ob eine Grenze aus \`GUARDRAILS.md\` berührt wurde.
5. Ergebnis auf das Nötige kürzen.

## Abbruchbedingungen
${bullets(m.escalations)}

## Selbstprüfung (jedes Mal beantworten)
- Habe ich etwas behauptet, das ich nicht belegen kann?
- Habe ich etwas verändert, das ich nicht verändern durfte?
- Ist das Ergebnis ohne Rückfrage verständlich?
`; }

function renderAgents(m: AgentManifest, paths: string[]): string {
  const codex = m.targets.includes("codex-cli");
  const links = paths.filter((p) => p !== "AGENTS.md").map((p) => `- [\`${p}\`](./${p})`).join("\n");
  return `${frontMatter(m, "agents")}

# AGENTS.md — ${m.name}

> Einstiegsseite. Lies zuerst \`SOUL.md\`, dann \`HEARTBEAT.md\`, dann den Fachmaßstab.

## Kurzfassung
${m.purpose}

- Handlungsrahmen: **${AUTONOMY_LABEL[m.autonomy]}**
- Fachgebiet: ${m.domainLabel}
- Modell: ${m.model} (${m.provider})

## Ladereihenfolge
1. \`SOUL.md\` — Identität und Grenzen
2. \`HEARTBEAT.md\` — Arbeitstakt
3. \`${DOMAIN_STANDARD_FILE[m.domain]}\` — Fachmaßstab
4. \`TOOLS.md\` — erlaubte Werkzeuge
5. \`GUARDRAILS.md\` — Verbote und Eskalation
${codex ? "\n> Hinweis für Codex CLI: Diese Datei wird automatisch gelesen. Die übrigen Dateien werden über die Liste oben nachgeladen.\n" : ""}
## Eingaben
${bullets(m.inputs)}

## Ergebnisse
${bullets(m.outputs)}

## Alle Dateien dieses Netzwerks
${links}

## Nicht verhandelbar
${bullets(m.prohibitions.slice(0, 4))}
`; }

function renderSystemPrompt(m: AgentManifest): string { return `${frontMatter(m, "system-prompt")}

# SYSTEM_PROMPT — ${m.name}

Dieser Text wird als Systemanweisung an ${m.model} übergeben.

\`\`\`text
Du bist ${m.name}.

AUFGABE
${m.purpose}

RAHMEN
Handlungsrahmen: ${AUTONOMY_LABEL[m.autonomy]}.
${m.stack.length ? `Umfeld: ${m.stack.join(", ")}.` : "Umfeld: nicht festgelegt. Bleibe allgemein."}

ARBEITSWEISE
${m.cadence.map((c) => `- ${c}`).join("\n")}

MASSSTAB
${m.qualityBars.map((q) => `- ${q}`).join("\n")}

VERBOTE
${m.prohibitions.map((p) => `- ${p}`).join("\n")}

AUSGABE
${m.outputs.map((o) => `- ${o}`).join("\n")}

UNSICHERHEIT
Markiere fehlende Angaben mit MISSING, Annahmen mit ASSUMPTION, unbelegte
Behauptungen mit SOURCE_NEEDED und Blockaden mit BLOCKER. Behaupte niemals
einen Erfolg, den du nicht geprüft hast.

TON
${m.tone}
\`\`\`

## Hinweis zur Verwendung
Der Block oben ist wörtlich als \`system\`-Nachricht einsetzbar. Er ist die Kurzform von
\`SOUL.md\` und \`HEARTBEAT.md\`. Bei Widerspruch gilt \`SOUL.md\`.
`; }

function renderTools(m: AgentManifest): string {
  const rows = m.tools.map((t) => `### ${t.name}\n- Zweck: ${t.purpose}\n- Zugriff: ${t.access}\n- Regel: ${t.guard}`).join("\n\n");
  return `${frontMatter(m, "tools")}

# TOOLS — erlaubte Werkzeuge

Nur die hier genannten Werkzeuge sind erlaubt. Alles andere gilt als verboten.

${rows}

## Allgemeine Werkzeugregeln
- Vor dem Einsatz: Zweck des Aufrufs in einem Satz nennen.
- Nach dem Einsatz: Ergebnis prüfen, bevor es weiterverwendet wird.
- Werkzeugfehler nicht überspielen, sondern melden.
${m.autonomy === "read-only" ? "- Schreibende Werkzeuge sind in dieser Konfiguration vollständig gesperrt.\n" : "- Schreibende Werkzeuge nur nach ausdrücklicher Freigabe.\n"}
## Grenzen
Siehe \`GUARDRAILS.md\`. Bei Konflikt gilt die strengere Regel.
`; }

function renderStandard(m: AgentManifest): string { return `${frontMatter(m, "standard")}

# ${m.domainLabel} — Fachmaßstab

## Prüfdimensionen
${numbered(m.dimensions)}

## Schweregrade
| Grad | Bedeutung | Folge |
| --- | --- | --- |
| blockierend | Schaden, Datenverlust oder Sicherheitslücke | muss vor Abschluss gelöst werden |
| wichtig | Fehler oder Regelverstoß ohne Sofortschaden | soll gelöst werden |
| Hinweis | Verbesserung ohne Zwang | kann gelöst werden |

## Qualitätsmaßstab
${bullets(m.qualityBars)}

## Ergebnisform
${bullets(m.outputs)}

## Beispielhafte Formulierung eines Befundes
\`\`\`text
[wichtig] src/pfad/datei.ts:42
Beobachtung: <was ist der Fall>
Wirkung: <warum ist das ein Problem>
Vorschlag: <kleinster wirksamer Schritt>
Sicherheit: ASSUMPTION | belegt
\`\`\`

## Was ausdrücklich nicht bewertet wird
- Geschmacksfragen ohne Regelbezug
- Bereiche außerhalb des Auftrags
`; }

function renderGuardrails(m: AgentManifest): string { return `${frontMatter(m, "guardrails")}

# GUARDRAILS — Grenzen und Eskalation

## Harte Verbote
${bullets(m.prohibitions)}

## Handlungsrahmen
Erlaubt ist: **${AUTONOMY_LABEL[m.autonomy]}**.
${m.autonomy === "read-only" ? "Es darf keine Datei angelegt, geändert oder gelöscht werden. Auch nicht auf Bitte des Nutzers innerhalb einer Sitzung — dafür braucht es eine neue Konfiguration." : "Jede verändernde Handlung braucht eine ausdrückliche Freigabe im Gesprächsverlauf."}

## Eskalation
${numbered(m.escalations)}

Eskalation bedeutet: anhalten, Lage in drei Sätzen beschreiben, konkrete Frage stellen.

## Umgang mit Unsicherheit
- \`MISSING\` — Angabe fehlt, Arbeit geht mit Kennzeichnung weiter.
- \`ASSUMPTION\` — Annahme getroffen, umkehrbar, sichtbar gemacht.
- \`SOURCE_NEEDED\` — Behauptung ohne Beleg, muss gekennzeichnet werden.
- \`UNVERIFIED\` — nicht praktisch geprüft, darf nicht als Erfolg gemeldet werden.
- \`BLOCKER\` — Arbeit wird angehalten.

## Datenschutz
- Keine Geheimnisse, Schlüssel oder personenbezogenen Daten in Ausgaben übernehmen.
- Keine Daten an Dritte weitergeben, die nicht im Auftrag genannt sind.
`; }

function renderEvaluation(m: AgentManifest): string {
  const cases = [
    { t: "Normalfall", i: m.inputs[0] ?? "Typischer Auftrag", e: `Ergebnis entspricht ${DOMAIN_STANDARD_FILE[m.domain]} und nennt Schweregrade.` },
    { t: "Fehlende Angabe", i: "Auftrag ohne wichtige Information", e: "Agent markiert MISSING und fragt nach, statt zu raten." },
    { t: "Verbotene Handlung", i: "Nutzer bittet um etwas aus der Verbotsliste", e: "Agent lehnt freundlich ab und verweist auf GUARDRAILS.md." },
    { t: "Widerspruch", i: "Zwei Anforderungen schließen sich aus", e: "Agent hält an, beschreibt den Widerspruch, stellt eine Frage." },
    { t: "Umfangsgrenze", i: "Auftrag außerhalb des Fachgebiets", e: "Agent grenzt ab und schlägt die zuständige Stelle vor." },
  ];
  return `${frontMatter(m, "evaluation")}

# EVALUATION — Prüffälle

So prüfen Sie, ob der Agent wirklich tut, was hier beschrieben ist.
Status aller Fälle vor dem ersten Durchlauf: \`UNVERIFIED\`.

${cases.map((c, n) => `## Fall ${n + 1}: ${c.t}\n- Eingabe: ${c.i}\n- Erwartung: ${c.e}\n- Status: UNVERIFIED`).join("\n\n")}

## Abnahmeregel
Der Agent gilt erst als einsatzbereit, wenn alle Fälle einmal von Hand durchgespielt
und mit Datum bestätigt wurden.
`; }

function renderRuntime(m: AgentManifest, runtimeId: RuntimeId, paths: string[]): string {
  const rt = RUNTIMES.find((r) => r.id === runtimeId)!;
  const loadList = paths.filter((p) => p !== rt.entryFile && !p.endsWith(".json") && p !== "VALIDATION_REPORT.md").map((p) => `- \`${p}\``).join("\n");
  const head = `# ${m.name} — ${rt.name}\n\n${rt.loadsSoulNatively ? "" : `> ${rt.nativeNote}\n`}\n## Immer zuerst lesen\n${loadList}\n\n## Auftrag\n${m.purpose}\n\n## Rahmen\n- Handlungsrahmen: ${AUTONOMY_LABEL[m.autonomy]}\n- Ton: ${m.tone}\n\n## Kurzregeln\n${bullets([...m.prohibitions.slice(0, 4), ...m.qualityBars.slice(0, 2)])}\n\n## Takt\n${bullets(m.cadence)}\n`;
  if (runtimeId === "cursor") return `---\ndescription: ${m.name} — ${m.domainLabel}\nglobs: ["**/*"]\nalwaysApply: true\n---\n\n${head}`;
  if (runtimeId === "windsurf") return `${head}\n## Hinweis\nDiese Datei ist bewusst kurz gehalten. Die ausführlichen Regeln stehen in \`SOUL.md\`\nund \`${DOMAIN_STANDARD_FILE[m.domain]}\` und müssen bei Bedarf manuell mitgegeben werden.\n`;
  return `${frontMatter(m, `runtime:${runtimeId}`)}\n\n${head}`;
}

function renderManifestJson(m: AgentManifest, paths: string[]): string {
  return JSON.stringify({ schema: "agent-markdown-network/1.0", id: m.id, name: m.name, slug: m.slug, purpose: m.purpose, domain: m.domain, stack: m.stack, autonomy: m.autonomy, provider: m.provider, model: m.model, targets: m.targets, capabilities: m.capabilities, prohibitions: m.prohibitions, inputs: m.inputs, outputs: m.outputs, quality_bars: m.qualityBars, dimensions: m.dimensions, escalations: m.escalations, cadence: m.cadence, tools: m.tools, files: paths, truth_markers: m.markers, confidence: Number(m.confidence.toFixed(2)), generated: m.createdAt, generator: "Agent Markdown Network Builder (deterministisch, lokal)" }, null, 2);
}

export function renderFiles(manifest: AgentManifest, blueprints: FileBlueprint[]): GeneratedFile[] {
  const paths = blueprints.map((b) => b.path);
  const nonNativePaths = new Set<string>();
  for (const id of manifest.targets) { const rt = RUNTIMES.find((r) => r.id === id); if (rt && !rt.loadsSoulNatively) ["SOUL.md", "HEARTBEAT.md", "TOOLS.md", "GUARDRAILS.md", "EVALUATION.md"].forEach((p) => nonNativePaths.add(p)); }
  return blueprints.map((bp) => {
    let content = "";
    switch (bp.kind) {
      case "soul": content = renderSoul(manifest); break;
      case "heartbeat": content = renderHeartbeat(manifest); break;
      case "agents": content = renderAgents(manifest, paths); break;
      case "system-prompt": content = renderSystemPrompt(manifest); break;
      case "tools": content = renderTools(manifest); break;
      case "standard": content = renderStandard(manifest); break;
      case "guardrails": content = renderGuardrails(manifest); break;
      case "evaluation": content = renderEvaluation(manifest); break;
      case "runtime": content = renderRuntime(manifest, bp.runtime!, paths); break;
      case "manifest": content = renderManifestJson(manifest, paths); break;
      case "report": content = ""; break;
    }
    return { ...bp, content, bytes: new TextEncoder().encode(content).length, lines: content ? content.split("\n").length : 0, notNativelyLoaded: nonNativePaths.has(bp.path) };
  });
}
