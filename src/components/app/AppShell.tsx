"use client";

import type { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { CourseDialog } from "./CourseDialog";
import { ExplainPanel } from "./ExplainPanel";
import { GlobalSandboxDrawer } from "./GlobalSandboxDrawer";
import { useUIStore } from "@/store/uiStore";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";

export function AppShell({ children }: { children: ReactNode }) {
  const isAddOpen = useUIStore((s) => s.isAddCourseOpen);
  const closeAddCourse = useUIStore((s) => s.closeAddCourse);
  useGlobalShortcuts();

  return (
    <>
      <TopNav />
      {children}
      <CourseDialog open={isAddOpen} onOpenChange={(open) => !open && closeAddCourse()} />
      <GlobalSandboxDrawer />
      <ExplainPanel />
    </>
  );
}
