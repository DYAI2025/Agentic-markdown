import { RUNTIMES } from "../domain/catalog";
import { PrimaryAction, QuietAction, Tile, ViewHead } from "../components/primitives";
import type { Builder } from "../state/useBuilder";

export function TargetsView({ b }: { b: Builder }) {
  const chosen = RUNTIMES.filter((r) => b.targets.includes(r.id));
  const nonNative = chosen.filter((r) => !r.loadsSoulNatively);

  return (
    <div className="rise space-y-9">
      <ViewHead
        eyebrow="Schritt 2 von 6"
        title="Wo soll der Agent laufen?"
        lead="Wählen Sie ein oder mehrere Zielsysteme. Für jedes erzeugen wir zusätzlich die Startdatei, die dort tatsächlich gelesen wird."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {RUNTIMES.map((rt) => (
          <Tile
            key={rt.id}
            glyph={rt.glyph}
            title={rt.name}
            blurb={rt.blurb}
            selected={b.targets.includes(rt.id)}
            onClick={() => b.toggleTarget(rt.id)}
            meta={
              <span className="font-mono text-[12.5px] text-muted">
                Startdatei: <span className="text-ink/80">{rt.entryFile}</span>
              </span>
            }
          />
        ))}
      </div>

      {nonNative.length > 0 && (
        <div className="bento flex flex-col gap-3 border-amber/25 p-6 sm:p-7">
          <span className="inline-flex w-fit items-center rounded-full border border-amber/40 bg-amber/12 px-3 py-1.5 text-[11.5px] font-semibold tracking-[0.14em] text-amber uppercase">
            Wichtig zu wissen
          </span>
          <p className="max-w-[80ch] text-[16px] leading-relaxed text-ink/85">
            {nonNative.map((r) => r.name).join(", ")} lädt <span className="font-mono text-[15px]">SOUL.md</span> und{" "}
            <span className="font-mono text-[15px]">HEARTBEAT.md</span> nicht von allein. Wir schreiben beide Dateien
            trotzdem und tragen in der jeweiligen Startdatei einen sichtbaren Verweis darauf ein.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-4 pt-2">
        <PrimaryAction
          onClick={() => b.setStep("engine")}
          caption={`${b.targets.length} Zielsystem${b.targets.length === 1 ? "" : "e"} gewählt · mindestens eines nötig`}
        >
          Weiter zum Modell
        </PrimaryAction>
        <QuietAction onClick={() => b.setStep("brief")}>Zurück zur Beschreibung</QuietAction>
      </div>
    </div>
  );
}
