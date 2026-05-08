"use client";

import { useEffect, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Sparkles } from "lucide-react";
import { useTextSelectionWithin } from "@/hooks/useTextSelectionWithin";
import { useUIStore } from "@/store/uiStore";
import type { ExplainMode } from "@/types";

interface ExplainPopoverProps<T extends HTMLElement> {
  scopeRef: RefObject<T | null>;
  mode: ExplainMode;
  context?: string;
  language?: string;
  /** Minimum selection length to show the trigger. Defaults to 2. */
  minLength?: number;
}

export function ExplainPopover<T extends HTMLElement>({
  scopeRef,
  mode,
  context,
  language,
  minLength = 2,
}: ExplainPopoverProps<T>) {
  const { text, rect, clear } = useTextSelectionWithin(scopeRef);
  const openExplain = useUIStore((s) => s.openExplain);
  const explainRequest = useUIStore((s) => s.explainRequest);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Hide the trigger while a panel is open for the current selection.
  const showTrigger =
    text.length >= minLength &&
    rect &&
    !(explainRequest && explainRequest.selection === text);

  if (!mounted || !showTrigger) return null;

  const top = Math.max(8, rect.top - 44);
  const left = Math.min(window.innerWidth - 16, Math.max(16, rect.left + rect.width / 2));

  return createPortal(
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        openExplain({ selection: text, context, mode, language });
        clear();
      }}
      style={{ top, left, transform: "translateX(-50%)" }}
      className="fixed z-40 inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-lg ring-1 ring-foreground/5 transition hover:bg-muted"
    >
      <Sparkles className="size-3.5 text-primary" />
      Explain with AI
    </button>,
    document.body,
  );
}
