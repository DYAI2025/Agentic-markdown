import { EXAMPLES } from "../domain/catalog";
import { PrimaryAction, Tile, ViewHead } from "../components/primitives";
import type { Builder } from "../state/useBuilder";

export function BriefView({ b }: { b: Builder }) {
  const words = b.brief.trim().split(/\s+/).filter(Boolean).length;
  const ready = b.brief.trim().length >= 40;

  return (
    <div className="rise space-y-9">
      <ViewHead
        eyebrow="Schritt 1 von 6"
        title="Beschreiben Sie den Agenten, den Sie brauchen."
        lead="Ein paar Sätze in normaler Sprache genügen. Sagen Sie, was er tun soll, womit er arbeitet und was er auf keinen Fall tun darf."
      />

      <div className="bento p-6 sm:p-8">
        <label htmlFor="brief" className="mb-4 block text-[15px] font-medium text-ink/85">
          Ihre Beschreibung
        </label>
        <textarea
          id="brief"
          value={b.brief}
          onChange={(e) => b.setBrief(e.target.value)}
          spellCheck
          placeholder="Zum Beispiel: Baue mir einen Code-Review-Agenten für ein TypeScript-Monorepo. Er soll Pull-Request-Diffs auf Bugs, Security-Risiken, Architekturverstöße, fehlende Tests und unnötige Komplexität prüfen. Er darf keine Dateien verändern."
          className="min-h-[240px] w-full resize-y rounded-2xl border border-white/10 bg-black/25 p-5 text-[17px] leading-relaxed text-ink placeholder:text-faint/70 focus:border-signal/40 focus:outline-none sm:min-h-[280px] sm:text-[18px]"
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-faint">
          <span>{words} Wörter · alles bleibt in diesem Browser</span>
          <span>{ready ? "Reicht für einen ersten Entwurf" : "Noch etwas mehr, bitte"}</span>
        </div>
      </div>

      <section aria-labelledby="examples" className="space-y-4">
        <h3 id="examples" className="text-[15px] font-medium text-muted">
          Oder ein Beispiel übernehmen
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {EXAMPLES.map((ex) => (
            <Tile
              key={ex.id}
              title={ex.title}
              blurb={`${ex.text.slice(0, 110)}…`}
              glyph="✎"
              stateLabel="Eingesetzt"
              selected={b.brief === ex.text}
              onClick={() => b.setBrief(ex.text)}
              className="min-h-[210px]"
            />
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-end gap-5 pt-2">
        <PrimaryAction
          disabled={!ready}
          onClick={() => b.setStep("targets")}
          caption={ready ? "Als Nächstes: Wo soll der Agent laufen?" : "Bitte mindestens zwei bis drei Sätze schreiben."}
        >
          Weiter zum Zielsystem
        </PrimaryAction>
      </div>
    </div>
  );
}
