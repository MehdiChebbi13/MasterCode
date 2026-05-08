"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

export interface SelectionState {
  text: string;
  rect: DOMRect | null;
}

const EMPTY: SelectionState = { text: "", rect: null };

/**
 * Listens for text selection inside the given scope.
 * Returns the trimmed selection text and its bounding rect (in viewport coords).
 */
export function useTextSelectionWithin<T extends HTMLElement>(scopeRef: RefObject<T | null>) {
  const [selection, setSelection] = useState<SelectionState>(EMPTY);

  useEffect(() => {
    const compute = () => {
      const sel = typeof window !== "undefined" ? window.getSelection() : null;
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
        setSelection((prev) => (prev.text ? EMPTY : prev));
        return;
      }
      const text = sel.toString().trim();
      if (!text) {
        setSelection((prev) => (prev.text ? EMPTY : prev));
        return;
      }
      const range = sel.getRangeAt(0);
      const scope = scopeRef.current;
      if (!scope) {
        setSelection((prev) => (prev.text ? EMPTY : prev));
        return;
      }
      const inside =
        scope.contains(range.startContainer) && scope.contains(range.endContainer);
      if (!inside) {
        setSelection((prev) => (prev.text ? EMPTY : prev));
        return;
      }
      setSelection({ text, rect: range.getBoundingClientRect() });
    };

    const onMouseUp = () => compute();
    const onSelectionChange = () => compute();

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("touchend", onMouseUp);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("touchend", onMouseUp);
    };
  }, [scopeRef]);

  const clear = useCallback(() => {
    if (typeof window !== "undefined") window.getSelection()?.removeAllRanges();
    setSelection(EMPTY);
  }, []);

  return { ...selection, clear };
}
