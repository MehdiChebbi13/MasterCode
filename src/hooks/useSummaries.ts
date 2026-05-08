"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSummariesService } from "@/services";
import type { SummaryInput } from "@/types";
import { queryKeys } from "./queryKeys";

export function useSummaries(courseId: string | undefined) {
  return useQuery({
    queryKey: courseId ? queryKeys.summaries.byCourse(courseId) : queryKeys.summaries.byCourse("__missing__"),
    queryFn: () => getSummariesService().listByCourse(courseId as string),
    enabled: Boolean(courseId),
  });
}

export function useSummary(id: string | undefined) {
  return useQuery({
    queryKey: id ? queryKeys.summaries.detail(id) : queryKeys.summaries.detail("__missing__"),
    queryFn: () => getSummariesService().get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateSummary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SummaryInput) => getSummariesService().create(input),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: queryKeys.summaries.byCourse(s.courseId) });
      qc.invalidateQueries({ queryKey: queryKeys.courses.listWithStats() });
    },
  });
}

export function useUpdateSummary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<SummaryInput> }) =>
      getSummariesService().update(id, patch),
    onSuccess: (s) => {
      qc.setQueryData(queryKeys.summaries.detail(s.id), s);
      qc.invalidateQueries({ queryKey: queryKeys.summaries.byCourse(s.courseId) });
    },
  });
}

export function useDeleteSummary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, courseId: _c }: { id: string; courseId: string }) => getSummariesService().delete(id),
    onSuccess: (_void, { id, courseId }) => {
      qc.removeQueries({ queryKey: queryKeys.summaries.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.summaries.byCourse(courseId) });
      qc.invalidateQueries({ queryKey: queryKeys.courses.listWithStats() });
    },
  });
}
