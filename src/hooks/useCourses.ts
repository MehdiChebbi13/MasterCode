"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCoursesService } from "@/services";
import type { Course, CourseInput, CourseWithStats } from "@/types";
import { queryKeys } from "./queryKeys";

export function useCourses() {
  return useQuery({
    queryKey: queryKeys.courses.list(),
    queryFn: () => getCoursesService().list(),
  });
}

export function useCoursesWithStats() {
  return useQuery({
    queryKey: queryKeys.courses.listWithStats(),
    queryFn: () => getCoursesService().listWithStats(),
  });
}

export function useCourse(id: string | undefined) {
  return useQuery({
    queryKey: id ? queryKeys.courses.detail(id) : queryKeys.courses.detail("__missing__"),
    queryFn: () => getCoursesService().get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CourseInput) => getCoursesService().create(input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: queryKeys.courses.all });
      const previousList = qc.getQueryData<Course[]>(queryKeys.courses.list());
      const previousStats = qc.getQueryData<CourseWithStats[]>(queryKeys.courses.listWithStats());
      const optimistic: Course = {
        id: `tmp_${Math.random().toString(36).slice(2, 8)}`,
        name: input.name,
        code: input.code,
        color: input.color,
        emoji: input.emoji,
        description: input.description,
        createdAt: new Date().toISOString(),
        lastStudiedAt: input.lastStudiedAt,
      };
      qc.setQueryData<Course[]>(queryKeys.courses.list(), (cur) => [optimistic, ...(cur ?? [])]);
      qc.setQueryData<CourseWithStats[]>(queryKeys.courses.listWithStats(), (cur) => [
        { ...optimistic, flashcardCount: 0, summaryCount: 0 },
        ...(cur ?? []),
      ]);
      return { previousList, previousStats };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previousList) qc.setQueryData(queryKeys.courses.list(), ctx.previousList);
      if (ctx?.previousStats) qc.setQueryData(queryKeys.courses.listWithStats(), ctx.previousStats);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.courses.list() });
      qc.invalidateQueries({ queryKey: queryKeys.courses.listWithStats() });
    },
  });
}

export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<CourseInput> }) =>
      getCoursesService().update(id, patch),
    onSuccess: (course) => {
      qc.setQueryData(queryKeys.courses.detail(course.id), course);
      qc.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getCoursesService().delete(id),
    onSuccess: (_void, id) => {
      qc.removeQueries({ queryKey: queryKeys.courses.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
}

export function useMarkCourseStudied() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getCoursesService().markStudied(id),
    onSuccess: (course) => {
      qc.setQueryData(queryKeys.courses.detail(course.id), course);
      qc.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
}
