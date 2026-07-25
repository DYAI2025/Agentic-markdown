import { useEffect, useRef, useState } from "react";
import { copyText, saveText } from "../lib/zip";
import { QuietAction } from "../components/primitives";
import type { GeneratedFile } from "../domain/types";

export function PreviewPanel({ file, onClose }: { file: GeneratedFile; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Vorschau ${file.path}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        tabIndex={-1}
        className="bento rise flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden focus:outline-none sm:h-[86vh]"
      >
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/8 p-6 sm:p-8">
          <div className="min-w-0">
            <p className="text-[11.5px] font-semibold tracking-[0.24em] text-signal/80 uppercase">Vorschau</p>
            <h3 className="mt-2 font-mono text-[22px] leading-tight font-medium tracking-tight text-ink">{file.path}</h3>
            <p className="mt-2 text-[14px] text-muted">{file.blurb}</p>
            <p className="mt-2 text-[12.5px] text-faint">
              {file.lines} Zeilen · {(file.bytes / 1024).toFixed(1)} KB
              {file.notNativelyLoaded ? " · wird vom Zielsystem nicht automatisch geladen" : ""}
            </p>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-auto bg-black/25 p-6 sm:p-8">
          <pre className="md-body">{file.content}</pre>
        </div>

        <footer className="flex flex-wrap gap-3 border-t border-white/8 p-5 sm:p-6">
          <QuietAction
            onClick={async () => {
              const ok = await copyText(file.content);
              setCopied(ok);
              setTimeout(() => setCopied(false), 2200);
            }}
          >
            {copied ? "In der Zwischenablage" : "Text kopieren"}
          </QuietAction>
          <QuietAction
            onClick={() =>
              saveText(file.content, file.path, file.path.endsWith(".json") ? "application/json" : undefined)
            }
          >
            Diese Datei laden
          </QuietAction>
          <QuietAction className="ml-auto" onClick={onClose}>
            Schließen
          </QuietAction>
        </footer>
      </div>
    </div>
  );
}
