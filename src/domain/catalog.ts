import type { DomainKey, Provider, Runtime } from "./types";

export const RUNTIMES: Runtime[] = [
  { id: "claude-code", name: "Claude Code", blurb: "Terminal-Assistent von Anthropic. Liest eine Projektdatei beim Start.", glyph: "◐", entryFile: "CLAUDE.md", loadsSoulNatively: false, nativeNote: "Lädt SOUL.md und HEARTBEAT.md nicht von selbst. Wir binden sie per Verweis ein." },
  { id: "codex-cli", name: "Codex CLI", blurb: "Kommandozeilen-Agent von OpenAI. Nutzt AGENTS.md als Einstieg.", glyph: "◇", entryFile: "AGENTS.md", loadsSoulNatively: false, nativeNote: "Lädt nur AGENTS.md automatisch. SOUL.md und HEARTBEAT.md werden dort verlinkt." },
  { id: "cursor", name: "Cursor", blurb: "Editor mit Agentenmodus. Nutzt Regeldateien im Projekt.", glyph: "▲", entryFile: ".cursor/rules/agent.mdc", loadsSoulNatively: false, nativeNote: "Lädt nur Regeldateien. Die Grundhaltung wird als Verweis eingetragen." },
  { id: "copilot", name: "GitHub Copilot", blurb: "Assistent in GitHub und im Editor. Liest eine Anweisungsdatei.", glyph: "◎", entryFile: ".github/copilot-instructions.md", loadsSoulNatively: false, nativeNote: "Liest eine einzige Anweisungsdatei. Alles Weitere muss verlinkt werden." },
  { id: "windsurf", name: "Windsurf", blurb: "Editor mit Agentenmodus und eigener Regeldatei.", glyph: "≋", entryFile: ".windsurfrules", loadsSoulNatively: false, nativeNote: "Nutzt eine kompakte Regeldatei. Lange Texte werden gekürzt verlinkt." },
  { id: "portable", name: "Ohne Zielsystem", blurb: "Reine Markdown-Sammlung. Überall einsetzbar, ohne feste Anbindung.", glyph: "○", entryFile: "README_AGENT.md", loadsSoulNatively: true, nativeNote: "Alle Dateien werden von Hand oder durch eigene Skripte geladen." },
];

export const PROVIDERS: Provider[] = [
  { id: "anthropic", name: "Anthropic", blurb: "Lange Anweisungen, sehr sorgfältige Textarbeit.", glyph: "◐", accent: "#F6C453", models: [
    { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5", blurb: "Ausgewogen und schnell.", strength: "Alltag" },
    { id: "claude-opus-4-1", name: "Claude Opus 4.1", blurb: "Tiefste Analyse, höchster Preis.", strength: "Tiefe" },
    { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", blurb: "Sehr schnell und günstig.", strength: "Tempo" },
  ] },
  { id: "openai", name: "OpenAI", blurb: "Breites Werkzeugverständnis, viele Integrationen.", glyph: "◇", accent: "#5FE3B3", models: [
    { id: "gpt-5.1", name: "GPT-5.1", blurb: "Allrounder mit starkem Werkzeugeinsatz.", strength: "Alltag" },
    { id: "o4-mini", name: "o4-mini", blurb: "Denkt in Schritten, günstig.", strength: "Logik" },
    { id: "gpt-4.1", name: "GPT-4.1", blurb: "Bewährt und gut verfügbar.", strength: "Stabil" },
  ] },
  { id: "google", name: "Google", blurb: "Sehr großes Kontextfenster für viele Dateien.", glyph: "◆", accent: "#9DB4FF", models: [
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", blurb: "Riesiger Kontext, gute Analyse.", strength: "Kontext" },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", blurb: "Schnell und sparsam.", strength: "Tempo" },
  ] },
  { id: "mistral", name: "Mistral", blurb: "Europäischer Anbieter, offene Modellvarianten.", glyph: "▣", accent: "#FF9F6E", models: [
    { id: "mistral-large-2", name: "Mistral Large 2", blurb: "Starkes Allgemeinmodell.", strength: "Alltag" },
    { id: "codestral", name: "Codestral", blurb: "Auf Quelltext ausgerichtet.", strength: "Code" },
  ] },
  { id: "local", name: "Lokal", blurb: "Läuft auf eigener Hardware. Keine Daten verlassen den Rechner.", glyph: "▢", accent: "#C9D3DD", models: [
    { id: "qwen3-coder-30b", name: "Qwen3 Coder 30B", blurb: "Guter Code-Begleiter offline.", strength: "Code" },
    { id: "llama-4-scout", name: "Llama 4 Scout", blurb: "Vielseitig und offen.", strength: "Offen" },
  ] },
];

export const DOMAIN_LABEL: Record<DomainKey, string> = {
  "code-review": "Code-Review", research: "Recherche", support: "Kundenkontakt", data: "Datenarbeit", writing: "Redaktion", ops: "Betrieb", generic: "Allgemein",
};

export const DOMAIN_STANDARD_FILE: Record<DomainKey, string> = {
  "code-review": "CODE_REVIEW_STANDARD.md", research: "RESEARCH_STANDARD.md", support: "SUPPORT_STANDARD.md", data: "DATA_STANDARD.md", writing: "EDITORIAL_STANDARD.md", ops: "OPERATIONS_STANDARD.md", generic: "WORK_STANDARD.md",
};

export interface ExampleBrief { id: string; title: string; text: string; }

export const EXAMPLES: ExampleBrief[] = [
  { id: "review", title: "Code-Review", text: "Baue mir einen Code-Review-Agenten für ein TypeScript-Monorepo. Er soll Pull-Request-Diffs auf Bugs, Security-Risiken, Architekturverstöße, fehlende Tests und unnötige Komplexität prüfen. Er darf keine Dateien verändern." },
  { id: "research", title: "Recherche", text: "Ich brauche einen Recherche-Agenten, der zu einem Thema Quellen sammelt, sie vergleicht, Widersprüche benennt und jede Aussage mit Beleg versieht. Ohne Beleg keine Behauptung." },
  { id: "support", title: "Kundenantworten", text: "Erstelle einen Agenten, der Kundenanfragen im Support-Postfach beantwortet, freundlich und knapp formuliert, keine Preise zusagt und bei Beschwerden an einen Menschen übergibt." },
];
