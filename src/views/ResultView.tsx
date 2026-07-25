import { cn } from "../utils/cn";
import { createZip, saveBlob, saveText } from "../lib/zip";
import { MarkerChip, PrimaryAction, QuietAction, Stat, ViewHead } from "../components/primitives";
import type { Finding, FindingSeverity, GeneratedFile } from "../domain/types";
import type { Builder } from "../state/useBuilder";

const SEV: Record<FindingSeverity, { label: string; ring: string; text: string; dot: string }> = {
  blocker: { label: "Muss gelöst werden", ring: "border-rose/40", text: "text-rose", dot: "bg-rose" },
  conflict: { label: "Widerspruch", ring: "border-amber/40", text: "text-amber", dot: "bg-amber" },
  gap: { label: "Lücke", ring: "border-iris/35", text: "text-iris", dot: "bg-iris" },
  note: { label: "Hinweis", ring: "border-white/12", text: "text-muted", dot: "bg-white/40" },
};

function FindingCard({ f, fixed, onFix }: { f: Finding; fixed: boolean; onFix: () => void }) {
  const s = SEV[f.severity];
  return <article className={cn("bento p-6 sm:p-7", s.ring, fixed && "opacity-60")}>
    <div className="flex flex-wrap items-center gap-3"><span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold tracking-[0.14em] uppercase", s.ring, s.text)}><span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />{fixed ? "Repariert" : s.label}</span><MarkerChip kind={f.marker} plain /></div>
    <h4 className="mt-4 text-[19px] leading-snug font-semibold tracking-tight text-ink">{f.title}</h4><p className="mt-3 max-w-[72ch] text-[15.5px] leading-relaxed text-muted">{f.detail}</p><p className="mt-4 font-mono text-[12.5px] text-faint">{f.files.join(" · ")}</p>
    <div className="mt-6">{f.repairLabel && !fixed ? <QuietAction className="h-[60px] border-signal/35 bg-signal/10 text-signal hover:bg-signal/16" onClick={onFix}>{f.repairLabel}</QuietAction> : <p className="text-[13.5px] text-faint">{fixed ? "Erledigt. Die betroffenen Dateien wurden neu geschrieben." : "Diese Entscheidung kann Ihnen niemand abnehmen."}</p>}</div>
  </article>;
}

function FileCard({ file, onOpen }: { file: GeneratedFile; onOpen: () => void }) {
  return <div className="bento flex flex-col justify-between gap-5 p-6 sm:p-7"><div><div className="flex items-start justify-between gap-3"><h4 className="font-mono text-[16.5px] leading-tight font-medium tracking-tight break-all text-ink">{file.path}</h4>{file.locked ? <span className="shrink-0 rounded-full border border-iris/40 bg-iris/12 px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-iris uppercase">Fest</span> : null}</div><p className="mt-3 text-[14.5px] leading-relaxed text-muted">{file.blurb}</p><p className="mt-4 text-[12.5px] text-faint">{file.lines} Zeilen · {(file.bytes / 1024).toFixed(1)} KB</p>{file.notNativelyLoaded ? <p className="mt-3 rounded-xl border border-amber/25 bg-amber/[0.07] px-3 py-2.5 text-[12.5px] leading-relaxed text-amber">Wird vom Zielsystem nicht automatisch gelesen. In der Startdatei ist ein Verweis eingetragen.</p> : null}</div><div className="flex gap-3"><button type="button" onClick={onOpen} className="h-[56px] flex-1 rounded-2xl border border-white/12 bg-white/[0.04] text-[15px] font-medium text-ink transition-colors hover:border-white/25 hover:bg-white/[0.08]">Ansehen</button><button type="button" onClick={() => saveText(file.content, file.path, file.path.endsWith(".json") ? "application/json" : undefined)} className="h-[56px] flex-1 rounded-2xl border border-white/12 bg-white/[0.04] text-[15px] font-medium text-ink transition-colors hover:border-white/25 hover:bg-white/[0.08]">Laden</button></div></div>;
}

export function ResultView({ b }: { b: Builder }) {
  const m = b.manifest; const r = b.report; if (!m || !r) return null;
  const findings = [...r.deterministic, ...r.semantic].sort((a, c) => ["blocker", "conflict", "gap", "note"].indexOf(a.severity) - ["blocker", "conflict", "gap", "note"].indexOf(c.severity));
  const open = findings.filter((f) => !b.repairs.includes(f.id)); const blockers = open.filter((f) => f.severity === "blocker").length; const totalKb = b.files.reduce((a, f) => a + f.bytes, 0) / 1024;
  const downloadZip = () => { const zip = createZip(b.files.map((f) => ({ path: f.path, content: f.content }))); saveBlob(zip, `${m.slug}-agent-netzwerk.zip`); };
  return <div className="rise space-y-9">
    <ViewHead eyebrow="Schritt 6 von 6" title="Fertig gebaut und geprüft." lead="Links steht, was noch offen ist. Rechts liegen die Dateien. Alles lässt sich einzeln ansehen oder in einem Paket laden." />
    <div className="bento flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between"><div className="grid flex-1 grid-cols-2 gap-7 sm:grid-cols-4"><Stat label="Dateien" value={String(b.files.length)} /><Stat label="Umfang" value={`${totalKb.toFixed(1)} KB`} /><Stat label="Prüfstand" value={`${r.score}/100`} tone={r.score > 84 ? "text-signal" : r.score > 60 ? "text-amber" : "text-rose"} /><Stat label="Offene Punkte" value={String(open.length)} tone={blockers ? "text-rose" : open.length ? "text-amber" : "text-signal"} /></div><PrimaryAction onClick={downloadZip} caption={blockers ? `${blockers} Punkt${blockers === 1 ? "" : "e"} sollten vorher gelöst werden.` : "Enthält alle Dateien samt Prüfbericht."}>Alles als ZIP laden</PrimaryAction></div>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]"><section aria-labelledby="findings" className="space-y-4"><h3 id="findings" className="text-[15px] font-medium text-muted">Prüfbericht in klarer Sprache</h3>{findings.length === 0 ? <div className="bento p-7"><p className="text-[16px] text-ink">Keine Befunde. Das Paket ist in sich stimmig.</p></div> : findings.map((f) => <FindingCard key={f.id} f={f} fixed={b.repairs.includes(f.id)} onFix={() => b.applyFix(f)} />)}{r.passed.length > 0 && <div className="bento p-6 sm:p-7"><h4 className="text-[15px] font-semibold tracking-tight text-ink">Was bereits stimmt</h4><ul className="mt-4 space-y-3">{r.passed.map((p, i) => <li key={i} className="flex gap-3 text-[14.5px] leading-relaxed text-muted"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />{p}</li>)}</ul></div>}</section><section aria-labelledby="files" className="space-y-4"><h3 id="files" className="text-[15px] font-medium text-muted">Ihre Dateien</h3><div className="grid gap-4 md:grid-cols-2">{b.files.map((f) => <FileCard key={f.id} file={f} onOpen={() => b.setPreview(f.id)} />)}</div></section></div>
    <div className="bento border-white/8 p-6 sm:p-7"><div className="flex flex-wrap items-center gap-3"><MarkerChip kind="UNVERIFIED" /><span className="text-[13px] text-faint">Ehrlichkeitshinweis</span></div><p className="mt-4 max-w-[86ch] text-[15.5px] leading-relaxed text-muted">Diese Dateien wurden hier im Browser deterministisch erzeugt. Es gab keine Verbindung zu einem Anbieter, keinen Testlauf und keine Messung. Ob sich ein Modell im Betrieb an die Regeln hält, ist offen, bis Sie die Prüffälle aus <span className="font-mono text-ink/80">EVALUATION.md</span> einmal von Hand durchgespielt haben. Eine Markdown-Datei beschreibt Grenzen – erzwingen kann sie nichts. Rechte müssen zusätzlich im Zielsystem gesetzt werden.</p></div>
    <div className="flex flex-wrap items-end gap-4 pt-2"><QuietAction onClick={() => b.setStep("files")}>Dateiauswahl ändern</QuietAction><QuietAction onClick={b.reset}>Neuen Agenten beschreiben</QuietAction></div>
  </div>;
}
