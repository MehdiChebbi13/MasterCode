"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { useSaveSandboxState } from "@/hooks";
import type { SandboxState, SandboxTemplate } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ExplainPopover } from "./ExplainPopover";

type LiveTemplate = "vanilla-ts" | "react-ts";

const SANDPACK_TEMPLATE: Record<LiveTemplate, "vanilla-ts" | "react-ts"> = {
  "vanilla-ts": "vanilla-ts",
  "react-ts": "react-ts",
};

const LANGUAGE_HINT: Record<LiveTemplate, string> = {
  "vanilla-ts": "typescript",
  "react-ts": "tsx",
};

interface SandboxFrameProps {
  storageId: string;
  template: LiveTemplate;
  initialFiles?: Record<string, string>;
  /** Distinguishes a fresh template (no save yet) from a restored one — used to key SandpackProvider so it remounts. */
  resetKey?: string | number;
  className?: string;
}

export function SandboxFrame({ storageId, template, initialFiles, resetKey, className }: SandboxFrameProps) {
  const editorScopeRef = useRef<HTMLDivElement | null>(null);

  const sandpackFiles = useMemo(() => {
    if (!initialFiles) return undefined;
    const out: Record<string, { code: string }> = {};
    for (const [path, code] of Object.entries(initialFiles)) {
      out[path] = { code };
    }
    return out;
  }, [initialFiles]);

  return (
    <div className={className}>
      <SandpackProvider
        key={`${storageId}:${template}:${resetKey ?? ""}`}
        template={SANDPACK_TEMPLATE[template]}
        theme="dark"
        files={sandpackFiles}
        options={{ recompileMode: "delayed", recompileDelay: 500 }}
      >
        <SandpackLayout className="!h-[34rem] !rounded-lg !border-border/60">
          <div ref={editorScopeRef} className="contents">
            <SandpackCodeEditor showTabs showLineNumbers showInlineErrors closableTabs wrapContent />
          </div>
          <SandpackPreview showOpenInCodeSandbox={false} />
        </SandpackLayout>
        <PersistFiles storageId={storageId} template={template} />
        <ExplainScope scopeRef={editorScopeRef} template={template} />
      </SandpackProvider>
    </div>
  );
}

function PersistFiles({ storageId, template }: { storageId: string; template: LiveTemplate }) {
  const { sandpack } = useSandpack();
  const save = useSaveSandboxState();
  const [primed, setPrimed] = useState(false);

  // Skip saving the very first state Sandpack reports — that's the template default we'd be persisting on top of nothing.
  useEffect(() => {
    if (!primed) {
      const t = setTimeout(() => setPrimed(true), 600);
      return () => clearTimeout(t);
    }
  }, [primed]);

  useEffect(() => {
    if (!primed) return;
    const t = setTimeout(() => {
      const files: Record<string, string> = {};
      for (const [path, file] of Object.entries(sandpack.files)) {
        if (file && typeof file.code === "string") {
          files[path] = file.code;
        }
      }
      const state: SandboxState = {
        courseId: storageId,
        template: template satisfies SandboxTemplate,
        files,
        updatedAt: new Date().toISOString(),
      };
      save.mutate(state);
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sandpack.files, storageId, template, primed]);

  return null;
}

function ExplainScope({
  scopeRef,
  template,
}: {
  scopeRef: React.RefObject<HTMLDivElement | null>;
  template: LiveTemplate;
}) {
  const { sandpack } = useSandpack();
  const activePath = sandpack.activeFile;
  const activeFile = activePath ? sandpack.files[activePath] : undefined;
  const context = activeFile && typeof activeFile.code === "string" ? activeFile.code : undefined;

  return (
    <ExplainPopover
      scopeRef={scopeRef}
      mode="code"
      context={context}
      language={LANGUAGE_HINT[template]}
    />
  );
}

export function SandboxLoading() {
  return (
    <div className="grid h-[34rem] grid-cols-2 gap-px overflow-hidden rounded-lg border border-border/60 bg-border/40">
      <Skeleton className="h-full rounded-none bg-muted/40" />
      <Skeleton className="h-full rounded-none bg-muted/40" />
    </div>
  );
}
