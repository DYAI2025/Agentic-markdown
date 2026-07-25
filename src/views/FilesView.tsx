import { AUTONOMY_LABEL } from "../domain/extract";
import { MarkerChip, PrimaryAction, QuietAction, Stat, Tile, ViewHead } from "../components/primitives";
import type { Builder } from "../state/useBuilder";

export function FilesView({ b }: { b: Builder }) {
  const m = b.manifest;
  if (!m) return null;
  const count = b.activeFiles.length;

  return (
    <div className="rise space-y-9">
      <ViewHead eyebrow="Schritt 4 von 6" title="Das haben wir verstanden." lead="Prüfen Sie die Auslegung und die vorgeschlagenen Dateien. Alles Angekreuzte wird gebaut, alles andere bleibt weg." />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="bento p-6 sm:p-8 lg:col-span-2">
          <h3 className="text-[22px] leading-snug font-semibold tracking-tight text-ink">{m.name}</h3>
          <p className="mt-3 max-w-[70ch] text-[16.5px] leading-relaxed text-muted">{m.purpose}</p>
          <div className="mt-7 grid grid-cols-2 gap-6 border-t border-white/8 pt-6 sm:grid-cols-4">
            <Stat label="Fachgebiet" value={m.domainLabel} /><Stat label="Rahmen" value={AUTONOMY_LABEL[m.autonomy]} /><Stat label="Umfeld" value={m.stack.length ? m.stack.slice(0, 2).join(", ") : "offen"} /><Stat label="Sicherheit" value={`${Math.round(m.confidence * 100)} %`} tone={m.confidence < 0.55 ? "text-amber" : "text-signal"} />
          </div>
        </div>
        <div className="bento space-y-4 p-6 sm:p-8">
          <h3 className="text-[15px] font-semibold tracking-tight text-ink">Was wir dabei annehmen mussten</h3>
          <ul className="space-y-4">{m.markers.slice(0, 4).map((marker, i) => <li key={i} className="space-y-2"><MarkerChip kind={marker.kind} /><p className="text-[14px] leading-relaxed text-muted">{marker.message}</p></li>)}</ul>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bento p-6 sm:p-7"><h3 className="mb-4 text-[15px] font-semibold tracking-tight text-ink">Das soll er können</h3><ul className="space-y-3">{m.capabilities.map((c, i) => <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-muted"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />{c}</li>)}</ul></div>
        <div className="bento p-6 sm:p-7"><h3 className="mb-4 text-[15px] font-semibold tracking-tight text-ink">Das darf er nie</h3><ul className="space-y-3">{m.prohibitions.map((c, i) => <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-muted"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose" />{c}</li>)}</ul></div>
      </div>
      <section aria-labelledby="proposal" className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3"><h3 id="proposal" className="text-[15px] font-medium text-muted">Vorgeschlagene Dateien</h3><p className="text-[13px] text-faint">SOUL.md und HEARTBEAT.md sind immer dabei und lassen sich nicht abwählen.</p></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {b.blueprints.map((bp) => <Tile key={bp.id} title={bp.title} blurb={bp.blurb} locked={bp.locked} stateLabel={bp.locked ? "Immer dabei" : "Gewählt"} selected={b.selected.includes(bp.id)} onClick={() => b.toggleFile(bp.id)} glyph={bp.kind === "manifest" ? "{ }" : bp.kind === "report" ? "✓" : "▤"} meta={bp.runtime ? <span className="text-[12.5px] text-muted">Wird vom Zielsystem automatisch gelesen</span> : bp.references.length ? <span className="font-mono text-[12px] text-faint">verweist auf {bp.references.length} Dateien</span> : null} />)}
        </div>
      </section>
      <div className="flex flex-wrap items-end gap-4 pt-2"><PrimaryAction onClick={b.build} caption={`${count} Dateien werden geschrieben und anschließend geprüft.`}>Alle Dateien erzeugen</PrimaryAction><QuietAction onClick={() => b.setStep("engine")}>Zurück zum Modell</QuietAction></div>
    </div>
  );
}
