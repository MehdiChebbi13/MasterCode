"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Code2 } from "lucide-react";

interface SandboxFrameProps {
  storageId: string;
  template: string;
  initialFiles?: Record<string, string>;
  resetKey?: string | number;
  className?: string;
}

export function SandboxFrame({ className }: SandboxFrameProps) {
  return (
    <div className={`flex h-[34rem] flex-col items-center justify-center gap-3 rounded-lg border border-border/60 bg-muted/20 text-muted-foreground ${className ?? ""}`}>
      <Code2 className="size-8 opacity-40" />
      <p className="text-sm">Code sandbox coming soon.</p>
    </div>
  );
}

export function SandboxLoading() {
  return (
    <div className="grid h-[34rem] grid-cols-2 gap-px overflow-hidden rounded-lg border border-border/60 bg-border/40">
      <Skeleton className="h-full rounded-none bg-muted/40" />
      <Skeleton className="h-full rounded-none bg-muted/40" />
    </div>
  );
}
