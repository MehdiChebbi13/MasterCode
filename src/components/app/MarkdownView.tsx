"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";

interface MarkdownViewProps {
  source: string;
  className?: string;
  /** Optional ref so callers (e.g. selection handlers) can scope DOM lookups. */
  bodyRef?: React.Ref<HTMLDivElement>;
}

const components: Components = {
  h1: ({ className, ...props }) => (
    <h1 className={cn("mb-4 mt-8 text-3xl font-semibold tracking-tight first:mt-0", className)} {...props} />
  ),
  h2: ({ className, ...props }) => (
    <h2 className={cn("mb-3 mt-8 text-xl font-semibold tracking-tight", className)} {...props} />
  ),
  h3: ({ className, ...props }) => (
    <h3 className={cn("mb-2 mt-6 text-base font-semibold", className)} {...props} />
  ),
  h4: ({ className, ...props }) => (
    <h4 className={cn("mb-2 mt-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground", className)} {...props} />
  ),
  p: ({ className, ...props }) => (
    <p className={cn("mb-4 leading-7 text-foreground/90", className)} {...props} />
  ),
  a: ({ className, ...props }) => (
    <a className={cn("font-medium text-primary underline-offset-4 hover:underline", className)} target="_blank" rel="noreferrer" {...props} />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("mb-4 list-disc space-y-1 pl-6 marker:text-muted-foreground", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol className={cn("mb-4 list-decimal space-y-1 pl-6 marker:text-muted-foreground", className)} {...props} />
  ),
  li: ({ className, ...props }) => <li className={cn("leading-7", className)} {...props} />,
  blockquote: ({ className, ...props }) => (
    <blockquote className={cn("mb-4 border-l-2 border-border pl-4 italic text-muted-foreground", className)} {...props} />
  ),
  hr: ({ className, ...props }) => <hr className={cn("my-8 border-border/60", className)} {...props} />,
  table: ({ className, ...props }) => (
    <div className="my-4 overflow-x-auto rounded-md border border-border/60">
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  ),
  thead: ({ className, ...props }) => (
    <thead className={cn("bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground", className)} {...props} />
  ),
  th: ({ className, ...props }) => (
    <th className={cn("border-b border-border/60 px-3 py-2 text-left font-medium", className)} {...props} />
  ),
  td: ({ className, ...props }) => (
    <td className={cn("border-b border-border/40 px-3 py-2 align-top", className)} {...props} />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "mb-4 overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-4 text-sm leading-relaxed",
        className,
      )}
      {...props}
    />
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = typeof className === "string" && className.includes("language-");
    if (isBlock) {
      return (
        <code className={cn(className, "font-mono text-[0.9em]")} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className={cn("rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground/90", className)}
        {...props}
      >
        {children}
      </code>
    );
  },
  strong: ({ className, ...props }) => <strong className={cn("font-semibold text-foreground", className)} {...props} />,
};

export function MarkdownView({ source, className, bodyRef }: MarkdownViewProps) {
  return (
    <div ref={bodyRef} className={cn("text-[15px] text-foreground/90", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
