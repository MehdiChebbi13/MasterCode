"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSandboxStorageService } from "@/services";
import type { SandboxState } from "@/types";
import { queryKeys } from "./queryKeys";

export function useSandboxState(courseId: string | undefined) {
  return useQuery({
    queryKey: courseId ? queryKeys.sandbox.forCourse(courseId) : queryKeys.sandbox.forCourse("__missing__"),
    queryFn: () => getSandboxStorageService().get(courseId as string),
    enabled: Boolean(courseId),
  });
}

export function useSaveSandboxState() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (state: SandboxState) => getSandboxStorageService().save(state),
    onSuccess: (_void, state) => {
      qc.setQueryData(queryKeys.sandbox.forCourse(state.courseId), state);
    },
  });
}
