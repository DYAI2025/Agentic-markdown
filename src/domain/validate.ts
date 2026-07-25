import { DOMAIN_STANDARD_FILE, RUNTIMES } from "./catalog";
import { AUTONOMY_LABEL } from "./extract";
import type { AgentManifest, CheckReport, Finding, GeneratedFile, RepairAction } from "./types";

const REQUIRED_SECTIONS: Record<string, string[]> = {
  soul: ["## Identität", "## Werte", "## Das tue ich nie", "## Wenn ich unsicher bin"],
  heartbeat: ["## Vor dem Start", "## Vor der Abgabe", "## Abbruchbedingungen"],
  agents: ["## Ladereihenfolge", "## Eingaben", "## Ergebnisse"],
  "system-prompt": ["AUFGABE", "VERBOTE", "UNSICHERHEIT"],
  tools: ["## Allgemeine Werkzeugregeln", "## Grenzen"],
  standard: ["## Prüfdimensionen", "## Qualitätsmaßstab"],
  guardrails: ["## Harte Verbote", "## Eskalation"],
  evaluation: ["## Abnahmeregel"],
};
const WRITE_VERBS = /\b(ändern|ändert|schreib|erstell|commit|patch|lösch|umbau|refactor|anlegen|pushen|deploy)/i;

export function runChecks(manifest: AgentManifest, files: GeneratedFile[]): CheckReport {
  const deterministic: Finding[] = []; const semantic: Finding[] = []; const passed: string[] = [];
  const paths = new Set(files.map((f) => f.path)); const byKind = (k: string) => files.filter((f) => f.kind === k);
  let structureOk = true;
  for (const file of files) { const required = REQUIRED_SECTIONS[file.kind]; if (!required) continue; const missing = required.filter((s) => !file.content.includes(s)); if (missing.length) { structureOk = false; deterministic.push({ id: `struct-${file.id}`, severity: "conflict", title: `${file.title} ist unvollständig`, detail: `In dieser Datei fehlen Abschnitte, die dort erwartet werden: ${missing.join(", ")}.`, files: [file.path], marker: "BLOCKER", repairLabel: null }); } }
  if (structureOk) passed.push("Alle Dateien haben die erwarteten Abschnitte");
  const brokenLinks: string[] = [];
  for (const file of files) for (const ref of file.references) if (!paths.has(ref)) brokenLinks.push(`${file.path} → ${ref}`);
  if (brokenLinks.length) { const missingRefs = [...new Set(brokenLinks.map((b) => b.split(" → ")[1]))]; deterministic.push({ id: "links", severity: "gap", title: "Ein Verweis zeigt ins Leere", detail: `Folgende Dateien werden erwähnt, sind aber nicht Teil Ihrer Auswahl: ${missingRefs.join(", ")}. Entweder aufnehmen oder den Verweis entfernen.`, files: [...new Set(brokenLinks.map((b) => b.split(" → ")[0]))], marker: "MISSING", repairLabel: `${missingRefs[0]} aufnehmen`, repair: { type: "add-file", value: missingRefs[0] } }); } else passed.push("Alle Verweise zwischen den Dateien führen zu vorhandenen Dateien");
  const missingEntries = manifest.targets.map((id) => RUNTIMES.find((r) => r.id === id)!).filter((rt) => rt && !paths.has(rt.entryFile));
  if (missingEntries.length) deterministic.push({ id: "runtime-entry", severity: "blocker", title: `${missingEntries[0].name} findet keinen Einstieg`, detail: `${missingEntries[0].name} liest beim Start ausschließlich \`${missingEntries[0].entryFile}\`. Ohne diese Datei bleibt der Agent dort wirkungslos.`, files: [missingEntries[0].entryFile], marker: "BLOCKER", repairLabel: `${missingEntries[0].entryFile} aufnehmen`, repair: { type: "add-file", value: missingEntries[0].entryFile } }); else if (manifest.targets.length) passed.push("Jedes gewählte Zielsystem hat seine Startdatei");
  const nonNative = manifest.targets.map((id) => RUNTIMES.find((r) => r.id === id)!).filter((rt) => rt && !rt.loadsSoulNatively);
  if (nonNative.length) deterministic.push({ id: "native-load", severity: "note", title: "SOUL.md wird nicht von allein geladen", detail: `${nonNative.map((r) => r.name).join(", ")} liest SOUL.md und HEARTBEAT.md nicht automatisch. Wir haben in der jeweiligen Startdatei einen Verweis eingetragen. Ob das Modell dem Verweis folgt, ist nicht garantiert.`, files: nonNative.map((r) => r.entryFile), marker: "UNVERIFIED", repairLabel: null });
  const promptFile = byKind("system-prompt")[0];
  if (promptFile && promptFile.bytes > 7000) deterministic.push({ id: "budget", severity: "note", title: "Die Systemanweisung ist lang", detail: `Rund ${Math.round(promptFile.bytes / 4)} Token gehen bei jeder Anfrage mit. Das kostet Geld und verdrängt Kontext. Kürzen lohnt sich.`, files: [promptFile.path], marker: "ASSUMPTION", repairLabel: null }); else if (promptFile) passed.push("Die Systemanweisung bleibt im sinnvollen Umfang");
  const writeCapability = manifest.capabilities.find((c) => WRITE_VERBS.test(c));
  if (manifest.autonomy === "read-only" && writeCapability) semantic.push({ id: "sem-autonomy", severity: "blocker", title: "Eine Fähigkeit widerspricht dem Verbot", detail: `Der Agent soll „${writeCapability.slice(0, 90)}“ – gleichzeitig darf er nichts verändern. Beides zusammen geht nicht. Entweder wird die Fähigkeit auf „vorschlagen“ begrenzt oder das Verbot fällt.`, files: ["SOUL.md", "GUARDRAILS.md", "SYSTEM_PROMPT.md"], marker: "BLOCKER", repairLabel: "Auf Vorschlagen begrenzen", repair: { type: "add-prohibition", value: "Änderungen nur als Vorschlag ausgeben, niemals selbst anwenden" } });
  const writeTool = manifest.tools.find((t) => t.access === "schreiben" || t.access === "ausführen");
  if (manifest.autonomy === "read-only" && writeTool) semantic.push({ id: "sem-tool", severity: "conflict", title: "Ein Werkzeug kann mehr, als erlaubt ist", detail: `Das Werkzeug „${writeTool.name}“ darf schreiben, der Agent aber nicht. Solche Lücken werden im Betrieb irgendwann genutzt.`, files: ["TOOLS.md"], marker: "BLOCKER", repairLabel: "Werkzeug sperren", repair: { type: "add-tool-guard", value: writeTool.name } }); else if (manifest.tools.length) passed.push("Werkzeugrechte passen zum erlaubten Handlungsrahmen");
  if (manifest.markers.some((m) => m.field === "qualityBars" && m.kind === "MISSING")) semantic.push({ id: "sem-quality", severity: "gap", title: "Es steht nicht fest, wann die Arbeit gut ist", detail: "Ihre Beschreibung nennt kein Erfolgskriterium. Wir haben fachübliche Maßstäbe eingesetzt. Ein eigener Maßstab wirkt deutlich stärker.", files: [DOMAIN_STANDARD_FILE[manifest.domain]], marker: "MISSING", repairLabel: "Prüfbaren Maßstab ergänzen", repair: { type: "add-quality-bar", value: "Jedes Ergebnis nennt Umfang, Grenzen und offene Fragen in höchstens fünf Sätzen" } });
  if (manifest.autonomy !== "read-only" && !manifest.escalations.some((e) => /freigabe|mensch|rückfrage/i.test(e))) semantic.push({ id: "sem-escalation", severity: "gap", title: "Es fehlt der Weg zurück zum Menschen", detail: "Der Agent darf verändern, aber es ist nicht festgelegt, wann ein Mensch entscheiden muss. Ohne diesen Halt läuft er im Zweifel weiter.", files: ["GUARDRAILS.md", "HEARTBEAT.md"], marker: "MISSING", repairLabel: "Freigabe durch Menschen festlegen", repair: { type: "add-escalation", value: "Vor jeder verändernden Handlung eine ausdrückliche Freigabe einholen" } }); else passed.push("Für Zweifelsfälle ist ein Halt und eine Rückfrage vorgesehen");
  if ((manifest.domain === "support" || manifest.domain === "data") && !manifest.prohibitions.some((p) => /personen|datenschutz|dsgvo|geheim/i.test(p))) semantic.push({ id: "sem-privacy", severity: "conflict", title: "Personenbezogene Daten sind nicht geschützt", detail: "In diesem Aufgabenfeld fließen fast sicher Kundendaten. Ohne ausdrückliches Verbot landen sie in Ausgaben und Protokollen.", files: ["GUARDRAILS.md", "SOUL.md"], marker: "BLOCKER", repairLabel: "Datenschutzverbot ergänzen", repair: { type: "add-prohibition", value: "Keine personenbezogenen Daten in Ausgaben, Beispielen oder Protokollen wiedergeben" } });
  if (manifest.confidence < 0.55) semantic.push({ id: "sem-thin", severity: "note", title: "Die Beschreibung trägt nur begrenzt", detail: `Sicherheit der Auswertung: ${Math.round(manifest.confidence * 100)} Prozent. Vieles beruht auf Erfahrungswerten. Zwei bis drei zusätzliche Sätze zu Eingaben, Ergebnis und Grenzen heben das deutlich.`, files: ["SOUL.md"], marker: "SOURCE_NEEDED", repairLabel: null });
  if (!manifest.outputs.length) deterministic.push({ id: "outputs", severity: "gap", title: "Die Ergebnisform ist offen", detail: "Es ist nicht beschrieben, wie ein Ergebnis aussehen soll. Damit ist es nicht prüfbar.", files: ["AGENTS.md"], marker: "MISSING", repairLabel: "Ergebnisform festlegen", repair: { type: "add-output", value: "Ergebnis als kurze Liste mit Begründung je Punkt" } });
  const blockers = [...deterministic, ...semantic].filter((f) => f.severity === "blocker").length; const conflicts = [...deterministic, ...semantic].filter((f) => f.severity === "conflict").length; const gaps = [...deterministic, ...semantic].filter((f) => f.severity === "gap").length;
  return { deterministic, semantic, passed, score: Math.max(0, Math.min(100, 100 - blockers * 26 - conflicts * 13 - gaps * 6)) };
}

export function applyRepair(manifest: AgentManifest, action: RepairAction): AgentManifest {
  const next: AgentManifest = { ...manifest, capabilities: [...manifest.capabilities], prohibitions: [...manifest.prohibitions], qualityBars: [...manifest.qualityBars], escalations: [...manifest.escalations], outputs: [...manifest.outputs], tools: manifest.tools.map((t) => ({ ...t })), markers: [...manifest.markers] };
  switch (action.type) {
    case "add-prohibition": if (!next.prohibitions.includes(action.value)) next.prohibitions.unshift(action.value); if (action.value.includes("Vorschlag")) next.capabilities = next.capabilities.map((c) => WRITE_VERBS.test(c) ? `${c} — ausschließlich als Vorschlag` : c); break;
    case "add-quality-bar": if (!next.qualityBars.includes(action.value)) next.qualityBars.push(action.value); next.markers = next.markers.filter((m) => !(m.field === "qualityBars" && m.kind === "MISSING")); break;
    case "add-escalation": if (!next.escalations.includes(action.value)) next.escalations.unshift(action.value); break;
    case "downgrade-autonomy": next.autonomy = action.value; break;
    case "add-output": if (!next.outputs.includes(action.value)) next.outputs.push(action.value); break;
    case "add-tool-guard": next.tools = next.tools.filter((t) => t.name !== action.value); break;
    case "add-file": break;
  }
  next.markers = [...next.markers, { kind: "ASSUMPTION", field: "repair", message: `Gezielte Reparatur angewendet: ${describeRepair(action)}. Umkehrbar durch neue Erzeugung.` }];
  return next;
}

export function describeRepair(action: RepairAction): string {
  switch (action.type) {
    case "add-prohibition": return `Verbot ergänzt („${action.value}“)`;
    case "add-quality-bar": return "Qualitätsmaßstab ergänzt";
    case "add-escalation": return "Eskalationsregel ergänzt";
    case "downgrade-autonomy": return "Handlungsrahmen enger gefasst";
    case "add-output": return "Ergebnisform festgelegt";
    case "add-tool-guard": return `Werkzeug „${action.value}“ entfernt`;
    case "add-file": return `Datei ${action.value} aufgenommen`;
  }
}

const SEV_LABEL = { blocker: "BLOCKER", conflict: "Widerspruch", gap: "Lücke", note: "Hinweis" } as const;
export function renderReport(manifest: AgentManifest, files: GeneratedFile[], report: CheckReport): string {
  const all = [...report.deterministic, ...report.semantic];
  const section = (title: string, list: Finding[]) => list.length ? `## ${title}\n\n${list.map((f) => `### [${SEV_LABEL[f.severity]}] ${f.title}\n- Markierung: \`${f.marker}\`\n- Betrifft: ${f.files.map((p) => `\`${p}\``).join(", ")}\n- Erklärung: ${f.detail}\n- Reparatur: ${f.repairLabel ?? "nur durch menschliche Entscheidung"}`).join("\n\n")}\n` : `## ${title}\n\nKeine Befunde.\n`;
  return `---\nagent: ${manifest.slug}\nfile_kind: report\nmanifest_id: ${manifest.id}\ngenerated: ${new Date().toISOString()}\nscore: ${report.score}\n---\n\n# VALIDATION_REPORT — ${manifest.name}\n\nDieses Paket wurde deterministisch erzeugt und geprüft. Es wurde **nicht** gegen ein\nlaufendes Modell getestet. Status der Wirksamkeit: \`UNVERIFIED\`.\n\n- Dateien im Paket: ${files.length}\n- Gesamtumfang: ${(files.reduce((a, f) => a + f.bytes, 0) / 1024).toFixed(1)} KB\n- Sicherheit der Auswertung: ${Math.round(manifest.confidence * 100)} Prozent\n- Prüfstand: ${report.score} von 100\n- Handlungsrahmen: ${AUTONOMY_LABEL[manifest.autonomy]}\n\n${section("Deterministische Prüfung", report.deterministic)}\n${section("Semantische Prüfung (begrenzt)", report.semantic)}\n## Bestandene Prüfungen\n\n${report.passed.length ? report.passed.map((p) => `- ${p}`).join("\n") : "- keine"}\n\n## Wahrheitsmarkierungen aus der Auswertung\n\n${manifest.markers.map((m) => `- \`${m.kind}\` (${m.field}): ${m.message}`).join("\n")}\n\n## Offene Punkte vor dem Produktivbetrieb\n\n1. Prüffälle aus \`EVALUATION.md\` einmal von Hand durchspielen.\n2. Verbotsliste in \`GUARDRAILS.md\` mit einer zweiten Person gegenlesen.\n3. Werkzeugrechte im Zielsystem tatsächlich einschränken — eine Markdown-Datei erzwingt nichts.\n${all.some((f) => f.severity === "blocker") ? "4. Alle BLOCKER auflösen. Bis dahin gilt das Paket als nicht einsatzbereit.\n" : ""}`;
}
