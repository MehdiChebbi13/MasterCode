"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Layers, FileText, Code2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlashcardsTab } from "./FlashcardsTab";
import { SummariesTab } from "./SummariesTab";
import { SandboxTab } from "./SandboxTab";

type TabValue = "flashcards" | "summaries" | "sandbox";

const TABS: { value: TabValue; label: string; icon: React.ReactNode }[] = [
  { value: "flashcards", label: "Flashcards", icon: <Layers className="size-3.5" /> },
  { value: "summaries", label: "Summaries", icon: <FileText className="size-3.5" /> },
  { value: "sandbox", label: "Sandbox", icon: <Code2 className="size-3.5" /> },
];

function isTabValue(v: string | null): v is TabValue {
  return v === "flashcards" || v === "summaries" || v === "sandbox";
}

export function CourseTabs({ courseId, courseName }: { courseId: string; courseName: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const raw = params?.get("tab") ?? null;
  const value: TabValue = isTabValue(raw) ? raw : "flashcards";

  const setTab = useCallback(
    (next: string) => {
      const sp = new URLSearchParams(params?.toString() ?? "");
      sp.set("tab", next);
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [router, pathname, params],
  );

  const triggers = useMemo(
    () =>
      TABS.map((t) => (
        <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
          {t.icon}
          {t.label}
        </TabsTrigger>
      )),
    [],
  );

  return (
    <Tabs value={value} onValueChange={setTab} className="mt-6">
      <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex">{triggers}</TabsList>

      <TabsContent value="flashcards" className="mt-6">
        <FlashcardsTab courseId={courseId} courseName={courseName} />
      </TabsContent>

      <TabsContent value="summaries" className="mt-6">
        <SummariesTab courseId={courseId} />
      </TabsContent>

      <TabsContent value="sandbox" className="mt-6">
        <SandboxTab courseId={courseId} />
      </TabsContent>
    </Tabs>
  );
}
