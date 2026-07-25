import { useCallback, useMemo, useRef, useState } from "react";
import { PROVIDERS, RUNTIMES } from "../domain/catalog";
import { extractManifest } from "../domain/extract";
import { buildBlueprints, renderFiles } from "../domain/render";
import { applyRepair, renderReport, runChecks } from "../domain/validate";
import type { AgentManifest, CheckReport, FileBlueprint, Finding, GeneratedFile, ProviderId, RuntimeId, StepId } from "../domain/types";

export const STEPS: Array<{ id: StepId; label: string; hint: string }> = [
  { id: "brief", label: "Beschreiben", hint: "Was soll der Agent tun?" },
  { id: "targets", label: "Zielsystem", hint: "Wo läuft er?" },
  { id: "engine", label: "Modell", hint: "Wer denkt?" },
  { id: "files", label: "Dateien", hint: "Was wird gebaut?" },
  { id: "build", label: "Erzeugen", hint: "Bauen und prüfen" },
  { id: "result", label: "Ergebnis", hint: "Prüfen und laden" },
];

export const BUILD_STAGES = ["Beschreibung auswerten", "Manifest festschreiben", "Dateien schreiben", "Deterministisch prüfen", "Semantisch prüfen", "Bericht erstellen"];

function composeFiles(manifest: AgentManifest, blueprints: FileBlueprint[], selectedIds: string[]) {
  const chosen = blueprints.filter((b) => b.locked || selectedIds.includes(b.id));
  const rendered = renderFiles(manifest, chosen);
  const withoutReport = rendered.filter((f) => f.kind !== "report");
  const report = runChecks(manifest, withoutReport);
  const reportMd = renderReport(manifest, withoutReport, report);
  const files = rendered.map((f) => f.kind === "report" ? { ...f, content: reportMd, bytes: new TextEncoder().encode(reportMd).length, lines: reportMd.split("\n").length } : f);
  return { files, report };
}

export function useBuilder() {
  const [step, setStep] = useState<StepId>("brief");
  const [brief, setBrief] = useState("");
  const [targets, setTargets] = useState<RuntimeId[]>(["claude-code"]);
  const [provider, setProvider] = useState<ProviderId>("anthropic");
  const [model, setModel] = useState<string>("claude-sonnet-4-5");
  const [manifest, setManifest] = useState<AgentManifest | null>(null);
  const [blueprints, setBlueprints] = useState<FileBlueprint[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [report, setReport] = useState<CheckReport | null>(null);
  const [stage, setStage] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [repairs, setRepairs] = useState<string[]>([]);
  const timers = useRef<number[]>([]);

  const toggleTarget = useCallback((id: RuntimeId) => { setTargets((prev) => prev.includes(id) ? prev.length === 1 ? prev : prev.filter((t) => t !== id) : [...prev, id]); }, []);
  const chooseProvider = useCallback((id: ProviderId) => { setProvider(id); const p = PROVIDERS.find((x) => x.id === id); if (p) setModel(p.models[0].id); }, []);
  const planFiles = useCallback(() => { const m = extractManifest({ brief, targets, provider, model }); const bps = buildBlueprints(m); setManifest(m); setBlueprints(bps); setSelected(bps.filter((b) => b.proposed && !b.locked).map((b) => b.id)); setRepairs([]); setStep("files"); }, [brief, targets, provider, model]);
  const toggleFile = useCallback((id: string) => { const bp = blueprints.find((b) => b.id === id); if (!bp || bp.locked) return; setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]); }, [blueprints]);

  const build = useCallback(() => {
    if (!manifest) return;
    timers.current.forEach(clearTimeout); timers.current = []; setStage(0); setRepairs([]); setPreview(null); setStep("build");
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches; const tick = reduced ? 90 : 460;
    BUILD_STAGES.forEach((_, i) => { timers.current.push(window.setTimeout(() => setStage(i + 1), tick * (i + 1))); });
    timers.current.push(window.setTimeout(() => { const { files: f, report: r } = composeFiles(manifest, blueprints, selected); setFiles(f); setReport(r); setStep("result"); }, tick * (BUILD_STAGES.length + 0.6)));
  }, [manifest, blueprints, selected]);

  const applyFix = useCallback((finding: Finding) => {
    if (!manifest || !finding.repair) return;
    let nextManifest = manifest; let nextBlueprints = blueprints; let nextSelected = selected;
    if (finding.repair.type === "add-file") {
      const path = finding.repair.value; const existing = blueprints.find((b) => b.path === path);
      if (existing) nextSelected = selected.includes(existing.id) ? selected : [...selected, existing.id];
      else { const rt = RUNTIMES.find((r) => r.entryFile === path); const created: FileBlueprint = { id: rt ? `runtime-${rt.id}` : `extra-${path}`, kind: rt ? "runtime" : "standard", path, title: path, blurb: rt ? `Startdatei für ${rt.name}.` : "Ergänzte Datei aus der Reparatur.", locked: false, proposed: true, runtime: rt?.id, references: ["SOUL.md", "HEARTBEAT.md"] }; nextBlueprints = [...blueprints, created]; nextSelected = [...selected, created.id]; }
    } else nextManifest = applyRepair(manifest, finding.repair);
    const { files: f, report: r } = composeFiles(nextManifest, nextBlueprints, nextSelected);
    setManifest(nextManifest); setBlueprints(nextBlueprints); setSelected(nextSelected); setFiles(f); setReport(r); setRepairs((prev) => [...prev, finding.id]);
  }, [manifest, blueprints, selected]);

  const reset = useCallback(() => { timers.current.forEach(clearTimeout); setStep("brief"); setBrief(""); setManifest(null); setBlueprints([]); setSelected([]); setFiles([]); setReport(null); setRepairs([]); setPreview(null); }, []);
  const activeFiles = useMemo(() => blueprints.filter((b) => b.locked || selected.includes(b.id)), [blueprints, selected]);
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return { step, stepIndex, setStep, brief, setBrief, targets, toggleTarget, provider, chooseProvider, model, setModel, manifest, blueprints, selected, toggleFile, activeFiles, files, report, stage, build, planFiles, applyFix, repairs, preview, setPreview, reset };
}

export type Builder = ReturnType<typeof useBuilder>;
