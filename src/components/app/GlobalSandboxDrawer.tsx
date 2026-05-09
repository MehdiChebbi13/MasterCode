"use client";

import { useEffect, useState } from "react";
import { Code2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/uiStore";
import { useSandboxState } from "@/hooks";
import { SandboxFrame, SandboxLoading } from "./SandboxFrame";

const GLOBAL_ID = "__global__";

type LiveTemplate = "vanilla-ts" | "react-ts";
const TEMPLATES: { value: LiveTemplate; label: string }[] = [
  { value: "vanilla-ts", label: "vanilla-ts" },
  { value: "react-ts", label: "react-ts" },
];

function isLiveTemplate(t: string | undefined): t is LiveTemplate {
  return t === "vanilla-ts" || t === "react-ts";
}

export function GlobalSandboxDrawer() {
  const open = useUIStore((s) => s.isGlobalSandboxOpen);
  const close = useUIStore((s) => s.closeGlobalSandbox);
  const { data, isLoading } = useSandboxState(open ? GLOBAL_ID : undefined);

  const [template, setTemplate] = useState<LiveTemplate>("vanilla-ts");
  const [resetKey, setResetKey] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!open) {
      setHydrated(false);
      return;
    }
    if (isLoading) return;
    if (data && isLiveTemplate(data.template)) {
      setTemplate(data.template);
    }
    setHydrated(true);
  }, [open, data, isLoading]);

  // Body scroll lock + Esc to close.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Global code sandbox" className="fixed inset-0 z-40 flex flex-col bg-background">
      <header className="flex flex-wrap items-center gap-3 border-b border-border/60 px-4 py-3 sm:px-6">
        <Button variant="ghost" size="icon" aria-label="Close sandbox" onClick={close}>
          <X className="size-4" />
        </Button>
        <Code2 className="size-4 text-muted-foreground" />
        <h2 className="text-base font-medium">Sandbox</h2>
        <span className="hidden text-xs text-muted-foreground sm:inline">Scratch space — autosaves to your browser.</span>

        <div className="ml-auto flex items-center gap-2">
          <div className="inline-flex items-center gap-0.5 rounded-md border border-border/60 p-0.5 text-xs">
            {TEMPLATES.map((t) => (
              <button
                key={t.value}
                type="button"
                aria-pressed={template === t.value}
                onClick={() => {
                  if (t.value !== template) {
                    setTemplate(t.value);
                    setResetKey((k) => k + 1);
                  }
                }}
                className={`rounded px-2 py-1 font-mono ${
                  template === t.value ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setResetKey((k) => k + 1)} className="gap-1.5">
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mx-auto max-w-6xl">
          {!hydrated ? (
            <SandboxLoading />
          ) : (
            <SandboxFrame
              storageId={GLOBAL_ID}
              template={template}
              initialFiles={resetKey === 0 && data?.template === template ? data?.files : undefined}
              resetKey={resetKey}
              className="[&_.sp-layout]:!h-[70vh]"
            />
          )}
        </div>
      </div>
    </div>
  );
}
