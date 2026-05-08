"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/uiStore";

const isTypingTarget = (el: EventTarget | null): boolean => {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable) return true;
  return false;
};

export function useGlobalShortcuts() {
  const router = useRouter();
  const openAddCourse = useUIStore((s) => s.openAddCourse);
  const openGlobalSandbox = useUIStore((s) => s.openGlobalSandbox);
  const explainOpen = useUIStore((s) => s.explainRequest !== null);
  const isAddOpen = useUIStore((s) => s.isAddCourseOpen);
  const isSandboxOpen = useUIStore((s) => s.isGlobalSandboxOpen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      // Don't fire when other overlays own the keyboard.
      if (isAddOpen || isSandboxOpen || explainOpen) return;

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        openAddCourse();
        return;
      }
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        openGlobalSandbox();
        return;
      }
      if (e.key === "g" || e.key === "G") {
        e.preventDefault();
        router.push("/");
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, openAddCourse, openGlobalSandbox, explainOpen, isAddOpen, isSandboxOpen]);
}
