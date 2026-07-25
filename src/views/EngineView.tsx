import { PROVIDERS } from "../domain/catalog";
import { PrimaryAction, QuietAction, Tile, ViewHead } from "../components/primitives";
import type { Builder } from "../state/useBuilder";

export function EngineView({ b }: { b: Builder }) {
  const provider = PROVIDERS.find((p) => p.id === b.provider)!;

  return (
    <div className="rise space-y-9">
      <ViewHead
        eyebrow="Schritt 3 von 6"
        title="Wer soll denken?"
        lead="Anbieter und Modell bestimmen Tonfall, Tempo und Kosten. Die Dateien bleiben gleich lesbar – nur die Systemanweisung wird auf das Modell zugeschnitten."
      />

      <section aria-labelledby="provider" className="space-y-4">
        <h3 id="provider" className="text-[15px] font-medium text-muted">
          Anbieter
        </h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PROVIDERS.map((p) => (
            <Tile
              key={p.id}
              glyph={p.glyph}
              title={p.name}
              blurb={p.blurb}
              selected={b.provider === p.id}
              onClick={() => b.chooseProvider(p.id)}
              meta={<span>{p.models.length} Modelle verfügbar</span>}
              className="min-h-[168px]"
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="model" className="space-y-4">
        <h3 id="model" className="text-[15px] font-medium text-muted">
          Modell von {provider.name}
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {provider.models.map((m) => (
            <Tile
              key={m.id}
              title={m.name}
              blurb={m.blurb}
              selected={b.model === m.id}
              onClick={() => b.setModel(m.id)}
              meta={
                <span className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.03] px-3 py-1.5 text-[11.5px] font-semibold tracking-[0.14em] text-muted uppercase">
                  {m.strength}
                </span>
              }
              className="min-h-[190px]"
            />
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-end gap-4 pt-2">
        <PrimaryAction onClick={b.planFiles} caption="Wir lesen jetzt Ihre Beschreibung aus und schlagen Dateien vor.">
          Dateien vorschlagen
        </PrimaryAction>
        <QuietAction onClick={() => b.setStep("targets")}>Zurück zum Zielsystem</QuietAction>
      </div>
    </div>
  );
}
