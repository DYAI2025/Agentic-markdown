import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";
import type { MarkerKind } from "../domain/types";

interface TileProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  selected?: boolean;
  locked?: boolean;
  glyph?: ReactNode;
  title: string;
  blurb?: string;
  meta?: ReactNode;
  footer?: ReactNode;
  tone?: "default" | "locked";
  stateLabel?: string;
}

export function Tile({ selected, locked, glyph, title, blurb, meta, footer, className, stateLabel, ...rest }: TileProps) {
  return (
    <button type="button" aria-pressed={locked ? undefined : !!selected} className={cn("group relative flex w-full flex-col justify-between gap-5 p-6 text-left sm:p-7", "bento bento-tap min-h-[176px] cursor-pointer", selected && !locked && "bento-on", locked && "bento-locked cursor-default", className)} {...rest}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {glyph ? <div aria-hidden className={cn("mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border text-[19px]", "border-white/10 bg-white/[0.04] text-ink/80", selected && !locked && "border-signal/40 bg-signal/15 text-signal", locked && "border-iris/40 bg-iris/15 text-iris")}>{glyph}</div> : null}
          <h3 className="text-[19px] leading-tight font-semibold tracking-tight text-ink sm:text-xl">{title}</h3>
          {blurb ? <p className="mt-2 max-w-[46ch] text-[14.5px] leading-relaxed text-muted">{blurb}</p> : null}
        </div>
        <span className={cn("shrink-0 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold tracking-[0.14em] uppercase", selected || locked ? locked ? "border-iris/40 bg-iris/12 text-iris" : "border-signal/45 bg-signal/15 text-signal" : "border-white/12 bg-white/[0.02] text-faint group-hover:text-muted")}>
          {locked ? (stateLabel ?? "Fest") : selected ? `✓ ${stateLabel ?? "Gewählt"}` : "Wählen"}
        </span>
      </div>
      {meta ? <div className="text-[13px] text-faint">{meta}</div> : null}
      {footer}
    </button>
  );
}

interface ActionProps extends ButtonHTMLAttributes<HTMLButtonElement> { caption?: string; }

export function PrimaryAction({ children, caption, className, disabled, ...rest }: ActionProps) {
  return <div className="flex flex-col items-start gap-2.5"><button type="button" disabled={disabled} className={cn("relative inline-flex h-[68px] items-center justify-center gap-3 rounded-[22px] px-9 text-[17px] font-semibold tracking-tight", "bg-signal text-[#04120d] transition-all duration-200", "hover:-translate-y-0.5 hover:shadow-[0_26px_60px_-24px_rgba(95,227,179,0.65)]", "active:translate-y-0 disabled:pointer-events-none disabled:bg-white/[0.06] disabled:text-faint", className)} {...rest}>{children}</button>{caption ? <span className="text-[13px] text-faint">{caption}</span> : null}</div>;
}

export function QuietAction({ children, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={cn("inline-flex h-[68px] items-center justify-center gap-3 rounded-[22px] border border-white/12 bg-white/[0.03] px-8", "text-[16px] font-medium text-ink/85 transition-all duration-200 hover:border-white/25 hover:bg-white/[0.06]", className)} {...rest}>{children}</button>;
}

export function Eyebrow({ children }: { children: ReactNode }) { return <p className="text-[11.5px] font-semibold tracking-[0.28em] text-signal/80 uppercase">{children}</p>; }

export function ViewHead({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string; }) {
  return <header className="max-w-[62ch]"><Eyebrow>{eyebrow}</Eyebrow><h2 className="mt-4 text-[34px] leading-[1.05] font-semibold tracking-[-0.02em] text-ink sm:text-[42px]">{title}</h2><p className="mt-4 text-[17px] leading-relaxed text-muted">{lead}</p></header>;
}

const MARKER_STYLE: Record<MarkerKind, string> = { MISSING: "border-amber/40 bg-amber/12 text-amber", ASSUMPTION: "border-iris/40 bg-iris/12 text-iris", SOURCE_NEEDED: "border-amber/40 bg-amber/12 text-amber", UNVERIFIED: "border-white/18 bg-white/[0.05] text-muted", BLOCKER: "border-rose/45 bg-rose/12 text-rose" };
const MARKER_TEXT: Record<MarkerKind, string> = { MISSING: "Angabe fehlt", ASSUMPTION: "Annahme", SOURCE_NEEDED: "Beleg fehlt", UNVERIFIED: "Nicht geprüft", BLOCKER: "Blockiert" };

export function MarkerChip({ kind, plain = false }: { kind: MarkerKind; plain?: boolean }) {
  return <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold tracking-[0.1em] uppercase", MARKER_STYLE[kind])}>{plain ? MARKER_TEXT[kind] : `${kind} · ${MARKER_TEXT[kind]}`}</span>;
}

export function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return <div className="flex flex-col gap-1.5"><span className="text-[11.5px] font-semibold tracking-[0.18em] text-faint uppercase">{label}</span><span className={cn("text-[22px] font-semibold tracking-tight text-ink", tone)}>{value}</span></div>;
}
