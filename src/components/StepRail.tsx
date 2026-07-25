import { cn } from "../utils/cn";
import { STEPS } from "../state/useBuilder";
import type { StepId } from "../domain/types";

export function StepRail({
  current,
  index,
  onJump,
}: {
  current: StepId;
  index: number;
  onJump: (id: StepId) => void;
}) {
  return (
    <nav aria-label="Fortschritt" className="w-full">
      <ol className="flex flex-wrap items-stretch gap-2.5">
        {STEPS.map((s, i) => {
          const done = i < index;
          const active = s.id === current;
          const reachable = done && current !== "build" && s.id !== "build";
          return (
            <li key={s.id} className="min-w-0 flex-1 basis-[150px]">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => reachable && onJump(s.id)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex h-[64px] w-full flex-col justify-center gap-0.5 rounded-2xl border px-4 text-left transition-all duration-200",
                  active
                    ? "border-signal/50 bg-signal/12 text-ink"
                    : done
                      ? "border-white/12 bg-white/[0.035] text-ink/80 hover:border-white/25"
                      : "border-white/[0.07] bg-white/[0.012] text-faint",
                  reachable ? "cursor-pointer" : "cursor-default",
                )}
              >
                <span className="flex items-center gap-2 text-[13.5px] font-semibold tracking-tight">
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 items-center justify-center rounded-full text-[10.5px] font-bold",
                      active ? "bg-signal text-[#04120d]" : done ? "bg-white/15 text-ink" : "bg-white/[0.06] text-faint",
                    )}
                    aria-hidden
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  {s.label}
                </span>
                <span className="truncate pl-7 text-[12px] text-faint">{s.hint}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
