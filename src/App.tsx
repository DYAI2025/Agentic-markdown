import { PROVIDERS, RUNTIMES } from "./domain/catalog";
import { useBuilder } from "./state/useBuilder";
import { StepRail } from "./components/StepRail";
import { BriefView } from "./views/BriefView";
import { TargetsView } from "./views/TargetsView";
import { EngineView } from "./views/EngineView";
import { FilesView } from "./views/FilesView";
import { BuildView } from "./views/BuildView";
import { ResultView } from "./views/ResultView";
import { PreviewPanel } from "./views/PreviewPanel";

export default function App() {
  const b = useBuilder();
  const previewFile = b.preview ? b.files.find((f) => f.id === b.preview) : undefined;
  const providerName = PROVIDERS.find((p) => p.id === b.provider)?.name ?? "";
  const modelName =
    PROVIDERS.find((p) => p.id === b.provider)?.models.find((m) => m.id === b.model)?.name ?? b.model;
  const targetNames = RUNTIMES.filter((r) => b.targets.includes(r.id))
    .map((r) => r.name)
    .join(" · ");

  return (
    <div className="relative min-h-screen">
      <div className="field-bg" aria-hidden />
      <div className="field-grid" aria-hidden />

      <div className="relative mx-auto w-full max-w-[1280px] px-5 pt-8 pb-24 sm:px-8 sm:pt-12">
        <header className="mb-10 flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              aria-hidden
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-signal/35 bg-signal/12 text-[22px] text-signal"
            >
              ◫
            </div>
            <div>
              <h1 className="text-[21px] leading-tight font-semibold tracking-tight text-ink sm:text-[23px]">
                Agent Markdown Network Builder
              </h1>
              <p className="mt-1.5 max-w-[56ch] text-[14.5px] leading-relaxed text-muted">
                Aus einer Beschreibung wird ein zusammenhängendes Netzwerk geprüfter Markdown-Dateien.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-[13px] leading-relaxed text-muted">
            <span className="block text-[11px] font-semibold tracking-[0.2em] text-faint uppercase">
              Aktuelle Wahl
            </span>
            <span className="mt-1.5 block text-ink/85">{targetNames || "kein Zielsystem"}</span>
            <span className="block text-faint">
              {providerName} · {modelName}
            </span>
          </div>
        </header>

        <div className="mb-10">
          <StepRail current={b.step} index={b.stepIndex} onJump={b.setStep} />
        </div>

        <main>
          {b.step === "brief" && <BriefView b={b} />}
          {b.step === "targets" && <TargetsView b={b} />}
          {b.step === "engine" && <EngineView b={b} />}
          {b.step === "files" && <FilesView b={b} />}
          {b.step === "build" && <BuildView b={b} />}
          {b.step === "result" && <ResultView b={b} />}
        </main>

        <footer className="mt-20 border-t border-white/8 pt-8 text-[13px] leading-relaxed text-faint">
          Alles läuft lokal in diesem Browser. Keine Anmeldung, kein Schlüssel, keine Übertragung an einen Anbieter.
          Erzeugung und Prüfung sind deterministisch: gleiche Eingabe, gleiches Ergebnis.
        </footer>
      </div>

      {previewFile && <PreviewPanel file={previewFile} onClose={() => b.setPreview(null)} />}
    </div>
  );
}
