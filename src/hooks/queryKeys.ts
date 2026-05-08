export const queryKeys = {
  courses: {
    all: ["courses"] as const,
    list: () => [...queryKeys.courses.all, "list"] as const,
    listWithStats: () => [...queryKeys.courses.all, "listWithStats"] as const,
    detail: (id: string) => [...queryKeys.courses.all, "detail", id] as const,
  },
  flashcards: {
    all: ["flashcards"] as const,
    byCourse: (courseId: string) => [...queryKeys.flashcards.all, "byCourse", courseId] as const,
    detail: (id: string) => [...queryKeys.flashcards.all, "detail", id] as const,
  },
  summaries: {
    all: ["summaries"] as const,
    byCourse: (courseId: string) => [...queryKeys.summaries.all, "byCourse", courseId] as const,
    detail: (id: string) => [...queryKeys.summaries.all, "detail", id] as const,
  },
  sandbox: {
    all: ["sandbox"] as const,
    forCourse: (courseId: string) => [...queryKeys.sandbox.all, courseId] as const,
  },
};
