"use client";

import { create } from "zustand";
import type { AIExplainRequest } from "@/types";

interface UIState {
  isAddCourseOpen: boolean;
  openAddCourse: () => void;
  closeAddCourse: () => void;

  isGlobalSandboxOpen: boolean;
  openGlobalSandbox: () => void;
  closeGlobalSandbox: () => void;

  studyModeCardId: string | null;
  setStudyModeCardId: (id: string | null) => void;

  explainRequest: AIExplainRequest | null;
  openExplain: (req: AIExplainRequest) => void;
  closeExplain: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAddCourseOpen: false,
  openAddCourse: () => set({ isAddCourseOpen: true }),
  closeAddCourse: () => set({ isAddCourseOpen: false }),

  isGlobalSandboxOpen: false,
  openGlobalSandbox: () => set({ isGlobalSandboxOpen: true }),
  closeGlobalSandbox: () => set({ isGlobalSandboxOpen: false }),

  studyModeCardId: null,
  setStudyModeCardId: (id) => set({ studyModeCardId: id }),

  explainRequest: null,
  openExplain: (req) => set({ explainRequest: req }),
  closeExplain: () => set({ explainRequest: null }),
}));
