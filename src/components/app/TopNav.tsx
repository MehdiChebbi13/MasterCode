"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, BookOpen, Code2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/store/uiStore";
import { dataSource } from "@/services";
import { ThemeToggle } from "./ThemeToggle";

export function TopNav() {
  const pathname = usePathname();
  const openAddCourse = useUIStore((s) => s.openAddCourse);
  const openGlobalSandbox = useUIStore((s) => s.openGlobalSandbox);
  const isDetail = pathname?.startsWith("/courses/");

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        {isDetail ? (
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link href="/" aria-label="Back to dashboard">
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </Button>
        ) : null}

        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <BookOpen className="size-5 text-primary" />
          <span>CS Study Hub</span>
        </Link>

        <Badge variant="outline" className="ml-2 hidden font-mono text-[10px] uppercase tracking-wider sm:inline-flex">
          {dataSource()}
        </Badge>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={openGlobalSandbox} className="gap-1.5" aria-label="Open sandbox">
            <Code2 className="size-4" />
            <span className="hidden sm:inline">Sandbox</span>
          </Button>
          <Button size="sm" onClick={openAddCourse} className="gap-1.5">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Add course</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
