import { cn } from "../utils/cn";
import { BUILD_STAGES } from "../state/useBuilder";
import { Eyebrow } from "../components/primitives";
import type { Builder } from "../state/useBuilder";

export function BuildView({ b }: { b: Builder }) {
  const total = BUILD_STAGES.length;
  const progress = Math.min(100, Math.round((b.stage / total) * 100));

  return (
    <div className="rise flex min-h-[62vh] flex-col justify-center">
      <div className="bento overflow-hidden p-8 sm:p-12">
        <Eyebrow>Schritt 5 von 6</Eyebrow>
        <h2 className="mt-4 text-[34px] leading-tight font-semibold tracking-[-0.02em] text-ink sm:text-[42px]">
          Wird gebaut und geprüft.
        </h2>
        <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-muted">
          Jede Datei entsteht aus demselben Manifest. Dadurch kann keine Datei etwas behaupten, was eine andere
          widerlegt.
        </p>

        <div className="relative mt-10 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-signal transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <ol className="mt-9 space-y-3" aria-live="polite">
          {BUILD_STAGES.map((label, i) => {
            const done = b.stage > i;
            const active = b.stage === i;
            return (
              <li
                key={label}
                className={cn(
                  "flex items-center gap-4 rounded-2xl border px-5 py-4 transition-colors duration-300",
                  done
                    ? "border-signal/25 bg-signal/[0.07] text-ink"
                    : active
                      ? "border-white/16 bg-white/[0.04] text-ink"
                      : "border-white/[0.06] bg-transparent text-faint",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold",
                    done ? "bg-signal text-[#04120d]" : active ? "bg-white/15 text-ink pulse-dot" : "bg-white/[0.06]",
                  )}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className="text-[16px] font-medium tracking-tight">{label}</span>
                <span className="ml-auto text-[12.5px] tracking-[0.14em] uppercase">
                  {done ? "fertig" : active ? "läuft" : "wartet"}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
