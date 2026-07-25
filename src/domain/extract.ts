import { DOMAIN_LABEL } from "./catalog";
import type {
  AgentManifest,
  Autonomy,
  DomainKey,
  ProviderId,
  RuntimeId,
  ToolSpec,
  TruthMarker,
} from "./types";

/**
 * Schema-validated extraction.
 *
 * Deterministic and local: the brief is parsed with an explicit rule set,
 * every inferred value is recorded as ASSUMPTION, every absent value as MISSING.
 * No network call happens here — see UNVERIFIED marker.
 */

const has = (t: string, ...words: string[]) => words.some((w) => t.includes(w));

interface DomainRule {
  key: DomainKey;
  words: string[];
  dimensions: string[];
  inputs: string[];
  outputs: string[];
  bars: string[];
  cadence: string[];
}

const DOMAIN_RULES: DomainRule[] = [
  { key: "code-review", words: ["code-review", "code review", "pull request", "pull-request", "diff", "merge request", "review", "quelltext"], dimensions: ["Fehler und Randfälle", "Sicherheitsrisiken", "Architektur und Abhängigkeiten", "Testabdeckung", "Unnötige Komplexität", "Lesbarkeit und Benennung"], inputs: ["Diff des Pull Requests", "Beschreibung des Pull Requests", "Betroffene Dateien und Pfade"], outputs: ["Befund-Liste nach Schweregrad", "Konkreter Änderungsvorschlag je Befund", "Kurzes Gesamturteil"], bars: ["Jeder Befund nennt Datei und Zeile", "Jeder Befund nennt Schweregrad: blockierend, wichtig, Hinweis", "Keine Stilkommentare ohne Regelbezug"], cadence: ["Vor dem Lesen: Umfang und Ziel des Diffs erfassen", "Nach jeder Datei: offene Fragen notieren", "Vor der Abgabe: Befunde entdoppeln und sortieren"] },
  { key: "research", words: ["recherche", "research", "quellen", "studie", "belege", "markt", "wettbewerb"], dimensions: ["Belegtiefe", "Aktualität", "Gegenpositionen", "Widersprüche", "Übertragbarkeit"], inputs: ["Fragestellung", "Zeitraum und Sprache", "Erlaubte Quellenarten"], outputs: ["Antwort mit Quellenangabe", "Liste offener Fragen", "Kurze Bewertung der Quellenlage"], bars: ["Jede Aussage hat eine Quelle oder die Markierung SOURCE_NEEDED", "Zitate wörtlich und gekennzeichnet"], cadence: ["Vor der Suche: Fragestellung schriftlich zuspitzen", "Nach jeder Quelle: Gegenposition suchen", "Vor der Abgabe: unbelegte Sätze markieren"] },
  { key: "support", words: ["kunde", "support", "ticket", "postfach", "anfrage", "beschwerde", "service"], dimensions: ["Verständlichkeit", "Tonfall", "Vollständigkeit", "Zusagen und Haftung", "Übergabe an Menschen"], inputs: ["Kundennachricht", "Bisheriger Verlauf", "Erlaubte Antwortbausteine"], outputs: ["Antwortentwurf", "Einstufung der Dringlichkeit", "Hinweis auf nötige Übergabe"], bars: ["Keine Zusagen zu Preis, Frist oder Erstattung", "Antwort in der Sprache der Anfrage"], cadence: ["Vor der Antwort: Anliegen in einem Satz zusammenfassen", "Vor dem Senden: auf verbotene Zusagen prüfen", "Bei Unsicherheit: an Menschen übergeben"] },
  { key: "data", words: ["daten", "sql", "tabelle", "analyse", "kennzahl", "dashboard", "etl", "datensatz"], dimensions: ["Datenqualität", "Nachvollziehbarkeit", "Rechenweg", "Datenschutz", "Ausreißer"], inputs: ["Datenquelle und Zeitraum", "Definition der Kennzahl", "Zugriffsrechte"], outputs: ["Ergebnis mit Rechenweg", "Annahmenliste", "Hinweis auf Datenlücken"], bars: ["Jede Zahl ist reproduzierbar", "Personenbezogene Daten werden nicht ausgegeben"], cadence: ["Vor der Abfrage: Kennzahl definieren", "Nach der Abfrage: Plausibilität prüfen", "Vor der Abgabe: Annahmen offenlegen"] },
  { key: "writing", words: ["text", "artikel", "blog", "redaktion", "content", "newsletter", "schreib"], dimensions: ["Zielgruppe", "Struktur", "Tonfall", "Faktentreue", "Länge"], inputs: ["Thema und Ziel", "Zielgruppe", "Stilvorgaben"], outputs: ["Textentwurf", "Alternative Überschriften", "Liste offener Fakten"], bars: ["Keine erfundenen Fakten", "Vorgegebene Länge wird eingehalten"], cadence: ["Vor dem Schreiben: Kernaussage festlegen", "Nach dem Entwurf: gegen Stilvorgabe prüfen", "Vor der Abgabe: Fakten markieren, die belegt werden müssen"] },
  { key: "ops", words: ["deploy", "betrieb", "incident", "monitoring", "infrastruktur", "pipeline", "ci", "release"], dimensions: ["Auswirkung", "Rückrollbarkeit", "Beobachtbarkeit", "Berechtigungen", "Eskalation"], inputs: ["Systemzustand", "Änderungswunsch", "Freigabelage"], outputs: ["Handlungsplan mit Reihenfolge", "Rückrollplan", "Meldung an Verantwortliche"], bars: ["Kein Eingriff ohne Rückrollplan", "Jede Aktion ist protokolliert"], cadence: ["Vor dem Eingriff: Auswirkung abschätzen", "Während des Eingriffs: Zustand beobachten", "Nach dem Eingriff: Ergebnis melden"] },
];

const GENERIC_RULE: DomainRule = { key: "generic", words: [], dimensions: ["Korrektheit", "Vollständigkeit", "Verständlichkeit", "Grenzen der Zuständigkeit"], inputs: ["Auftrag des Nutzers", "Vorhandener Kontext"], outputs: ["Ergebnis in klarer Sprache", "Liste der Annahmen", "Liste offener Fragen"], bars: ["Keine Behauptung ohne Grundlage", "Unsicherheit wird ausgesprochen"], cadence: ["Vor dem Start: Auftrag zusammenfassen", "Zwischendurch: Zwischenstand prüfen", "Vor der Abgabe: Annahmen offenlegen"] };

function detectDomain(t: string): DomainRule { for (const rule of DOMAIN_RULES) if (has(t, ...rule.words)) return rule; return GENERIC_RULE; }

const STACK_WORDS: Array<[string, string[]]> = [
  ["TypeScript", ["typescript", " ts ", "tsx"]], ["JavaScript", ["javascript", "node", "js-"]], ["Python", ["python", "django", "fastapi"]], ["Go", ["golang", " go "]], ["Rust", ["rust"]], ["Java", ["java ", "spring"]], ["Monorepo", ["monorepo", "mono-repo"]], ["React", ["react", "next.js", "nextjs"]], ["Kubernetes", ["kubernetes", "k8s"]], ["SQL", ["sql", "postgres", "bigquery"]],
];
function detectStack(t: string): string[] { const out: string[] = []; for (const [label, words] of STACK_WORDS) if (has(t, ...words)) out.push(label); return out; }
function detectAutonomy(t: string): { value: Autonomy; inferred: boolean } {
  if (has(t, "darf keine", "nicht verändern", "nichts ändern", "read-only", "nur lesen", "keine dateien")) return { value: "read-only", inferred: false };
  if (has(t, "ohne rückfrage", "eigenständig", "autonom", "selbstständig")) return { value: "autonomous", inferred: false };
  if (has(t, "freigabe", "bestätigung", "genehmigung", "approval")) return { value: "write-with-approval", inferred: false };
  if (has(t, "ändern", "schreiben", "erstellen", "commit", "patch", "fix")) return { value: "write-with-approval", inferred: true };
  return { value: "suggest", inferred: true };
}
function fragments(brief: string): string[] { return brief.split(/[.;!?\n•]+|,\s*(?=(?:und|sowie|aber|jedoch)\b)/i).map((s) => s.trim()).filter((s) => s.length > 12); }
const PROHIBITION_HINTS = ["darf nicht", "darf keine", "keine ", "nicht ", "ohne ", "niemals", "verboten"];
function detectProhibitions(brief: string, autonomy: Autonomy): string[] { const out = new Set<string>(); for (const frag of fragments(brief)) { const low = frag.toLowerCase(); if (PROHIBITION_HINTS.some((h) => low.includes(h))) out.add(frag.charAt(0).toUpperCase() + frag.slice(1)); } if (autonomy === "read-only") { out.add("Keine Datei im Projekt verändern, anlegen oder löschen"); out.add("Keine Befehle ausführen, die Zustand verändern"); } out.add("Keine erfundenen Fakten, Pfade oder Ergebnisse"); out.add("Bei Unsicherheit nachfragen statt raten"); return [...out].slice(0, 7); }
function detectCapabilities(brief: string, rule: DomainRule): string[] { const out = new Set<string>(); for (const frag of fragments(brief)) { const low = frag.toLowerCase(); if (PROHIBITION_HINTS.some((h) => low.includes(h))) continue; if (/\b(soll|prüf|analys|erstell|schreib|sammel|beantwort|bewert|vergleich|erkenn|melde)/i.test(low)) out.add(frag.charAt(0).toUpperCase() + frag.slice(1)); } if (out.size === 0) rule.dimensions.slice(0, 3).forEach((d) => out.add(`${d} prüfen und bewerten`)); return [...out].slice(0, 6); }
function detectTools(rule: DomainRule, autonomy: Autonomy): ToolSpec[] {
  const readOnly = autonomy === "read-only";
  const base: ToolSpec[] = [
    { name: "repo_read", purpose: "Dateien und Ordner im Projekt lesen", access: "lesen", guard: "Nur innerhalb des Projektordners. Keine Geheimnisse ausgeben." },
    { name: "search", purpose: "Nach Textstellen und Mustern suchen", access: "lesen", guard: "Treffer immer mit Pfad und Zeile nennen." },
  ];
  if (rule.key === "code-review") { base.push({ name: "diff_read", purpose: "Änderungen eines Pull Requests einlesen", access: "lesen", guard: "Nur den angefragten Vergleich lesen." }); base.push({ name: "test_report_read", purpose: "Testergebnisse und Abdeckung einsehen", access: "lesen", guard: "Keine Tests neu starten, wenn nur gelesen werden darf." }); }
  if (rule.key === "research") base.push({ name: "web_search", purpose: "Quellen im Netz suchen und öffnen", access: "netzwerk", guard: "Jede Quelle mit Titel, Datum und Adresse festhalten." });
  if (rule.key === "data") base.push({ name: "query", purpose: "Lesende Abfragen auf den Datenbestand stellen", access: "lesen", guard: "Nur SELECT. Keine Änderungen am Datenbestand." });
  if (!readOnly) base.push({ name: "file_write", purpose: "Dateien anlegen oder ändern", access: "schreiben", guard: "Nur nach ausdrücklicher Freigabe und nur im vereinbarten Pfad." });
  return base;
}
function titleFrom(brief: string, rule: DomainRule): string { const stack = detectStack(brief.toLowerCase()); const label = DOMAIN_LABEL[rule.key]; const suffix = stack.length ? ` ${stack[0]}` : ""; return `${label}-Agent${suffix}`.trim(); }
export interface ExtractionInput { brief: string; targets: RuntimeId[]; provider: ProviderId; model: string; }

export function extractManifest({ brief, targets, provider, model }: ExtractionInput): AgentManifest {
  const t = ` ${brief.toLowerCase()} `; const rule = detectDomain(t); const autonomy = detectAutonomy(t); const stack = detectStack(t); const capabilities = detectCapabilities(brief, rule); const prohibitions = detectProhibitions(brief, autonomy.value); const markers: TruthMarker[] = [];
  if (autonomy.inferred) markers.push({ kind: "ASSUMPTION", field: "autonomy", message: "Wir nehmen an: Der Agent schlägt vor und wartet auf Freigabe. Diese Annahme ist jederzeit umkehrbar." });
  if (!stack.length) markers.push({ kind: "MISSING", field: "stack", message: "Es ist nicht gesagt, mit welcher Technik gearbeitet wird. Wir bleiben deshalb allgemein." });
  if (!/\b(erfolg|fertig|abnahme|akzeptanz|gut genug|qualität)\b/i.test(brief)) markers.push({ kind: "MISSING", field: "qualityBars", message: "Woran gute Arbeit erkannt wird, steht nicht in der Beschreibung. Wir setzen fachübliche Maßstäbe ein." });
  if (brief.trim().length < 90) markers.push({ kind: "SOURCE_NEEDED", field: "brief", message: "Die Beschreibung ist kurz. Vieles beruht daher auf Erfahrungswerten, nicht auf Ihren Angaben." });
  markers.push({ kind: "UNVERIFIED", field: "pipeline", message: "Die Dateien entstehen hier ohne Verbindung zu einem Anbieter. Ob das Modell sich im Betrieb daran hält, ist noch nicht praktisch geprüft." });
  const wordCount = brief.trim().split(/\s+/).filter(Boolean).length;
  const confidence = Math.max(0.28, Math.min(0.96, 0.3 + Math.min(wordCount, 90) / 220 + (rule.key === "generic" ? 0 : 0.16) + (stack.length ? 0.09 : 0) + (autonomy.inferred ? 0 : 0.1)));
  const name = titleFrom(brief, rule);
  const slug = name.toLowerCase().replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" })[c] ?? c).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const purposeSentence = brief.split(/[.!?\n]/).map((s) => s.trim()).filter((s) => s.length > 20)[0] ?? brief.trim();
  return { id: `cam_${slug}_${Math.abs(hash(brief)).toString(36)}`, name, slug, purpose: purposeSentence.replace(/^(baue|erstelle|ich brauche|bau)\s+(mir\s+)?/i, "").trim() || "Aufgabe laut Beschreibung", brief: brief.trim(), domain: rule.key, domainLabel: DOMAIN_LABEL[rule.key], stack, capabilities, prohibitions, inputs: rule.inputs, outputs: rule.outputs, qualityBars: rule.bars, dimensions: rule.dimensions, escalations: ["Der Auftrag ist mehrdeutig oder widersprüchlich", "Eine Handlung würde eine Grenze aus SOUL.md verletzen", "Die nötige Information fehlt und lässt sich nicht sicher beschaffen"], tools: detectTools(rule, autonomy.value), autonomy: autonomy.value, tone: "Sachlich, knapp, freundlich. Keine Floskeln. Unsicherheit wird benannt.", cadence: rule.cadence, targets, provider, model, createdAt: new Date().toISOString(), confidence, markers };
}
function hash(s: string): number { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h | 0; }
export const AUTONOMY_LABEL: Record<Autonomy, string> = { "read-only": "Nur lesen", suggest: "Vorschlagen", "write-with-approval": "Ändern nach Freigabe", autonomous: "Eigenständig handeln" };
