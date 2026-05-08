"use client";

import { useState, useEffect } from "react";
import { Code2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SandboxFrame, SandboxLoading } from "./SandboxFrame";
import { useSandboxState } from "@/hooks";
import type { SandboxTemplate } from "@/types";

type LiveTemplate = "vanilla-ts" | "react-ts";

const LIVE_TEMPLATES: { value: LiveTemplate; label: string }[] = [
  { value: "vanilla-ts", label: "vanilla-ts" },
  { value: "react-ts", label: "react-ts" },
];

function isLiveTemplate(t: SandboxTemplate | undefined): t is LiveTemplate {
  return t === "vanilla-ts" || t === "react-ts";
}

export function SandboxTab({ courseId }: { courseId: string }) {
  const { data, isLoading } = useSandboxState(courseId);
  const [template, setTemplate] = useState<LiveTemplate>("vanilla-ts");
  const [resetKey, setResetKey] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  // Pick saved template once the saved state arrives.
  useEffect(() => {
    if (isLoading) return;
    if (data && isLiveTemplate(data.template)) {
      setTemplate(data.template);
    }
    setHydrated(true);
  }, [data, isLoading]);

  function handleTemplateChange(next: LiveTemplate) {
    if (next === template) return;
    setTemplate(next);
    setResetKey((k) => k + 1);
  }

  function handleReset() {
    setResetKey((k) => k + 1);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Code2 className="size-4 text-muted-foreground" />
          <h2 className="text-base font-medium">Code sandbox</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-0.5 rounded-md border border-border/60 p-0.5 text-xs">
            {LIVE_TEMPLATES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => handleTemplateChange(t.value)}
                aria-pressed={template === t.value}
                className={`rounded px-2 py-1 font-mono ${
                  template === t.value ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {isLoading || !hydrated ? (
        <SandboxLoading />
      ) : (
        <SandboxFrame
          storageId={courseId}
          template={template}
          initialFiles={resetKey === 0 && data?.template === template ? data?.files : undefined}
          resetKey={resetKey}
        />
      )}

      <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Edits autosave to your browser.</span>
        <span aria-hidden>·</span>
        <span>Highlight any code, then click <strong className="font-medium text-foreground/85">Explain with AI</strong>.</span>
      </p>
    </div>
  );
}

export function SandboxTabSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-48" />
      </div>
      <SandboxLoading />
    </div>
  );
}
