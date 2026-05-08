"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Loader2, Send, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store/uiStore";
import { useFollowUp } from "@/hooks";
import { getAIService } from "@/services";
import { ServiceError, type AIExplainRequest } from "@/types";
import { MarkdownView } from "./MarkdownView";

type Message =
  | { id: string; role: "selection"; text: string }
  | { id: string; role: "assistant"; text: string; followUps?: string[]; streaming: boolean }
  | { id: string; role: "user"; text: string };

const newId = () => Math.random().toString(36).slice(2, 10);

export function ExplainPanel() {
  const request = useUIStore((s) => s.explainRequest);
  const closeExplain = useUIStore((s) => s.closeExplain);
  const followUpMutation = useFollowUp();

  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<ServiceError | null>(null);
  const [followUpText, setFollowUpText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);

  // Run streaming explanation whenever a new request arrives.
  useEffect(() => {
    if (!request) {
      setMessages([]);
      setError(null);
      setFollowUpText("");
      return;
    }
    let cancelled = false;
    const assistantId = newId();
    setError(null);
    setFollowUpText("");
    setMessages([
      { id: newId(), role: "selection", text: request.selection },
      { id: assistantId, role: "assistant", text: "", streaming: true },
    ]);

    (async () => {
      try {
        for await (const chunk of getAIService().explainStream(request)) {
          if (cancelled) return;
          setMessages((cur) =>
            cur.map((m) =>
              m.id === assistantId && m.role === "assistant"
                ? { ...m, text: m.text + chunk.delta, streaming: !chunk.done, followUps: chunk.done ? chunk.followUps : m.followUps }
                : m,
            ),
          );
        }
      } catch (e) {
        if (cancelled) return;
        const err = e instanceof ServiceError ? e : new ServiceError("Unknown error", "unknown");
        setError(err);
        setMessages((cur) =>
          cur.map((m) =>
            m.id === assistantId && m.role === "assistant" ? { ...m, streaming: false } : m,
          ),
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [request]);

  // Auto-scroll to bottom as messages stream in.
  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Esc closes the panel.
  useEffect(() => {
    if (!request) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeExplain();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [request, closeExplain]);

  if (!request) return null;

  const lastAssistant = [...messages].reverse().find((m): m is Message & { role: "assistant" } => m.role === "assistant");
  const inputDisabled = followUpMutation.isPending || (lastAssistant?.streaming ?? false);

  async function copyText(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1500);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  }

  async function submitFollowUp(question: string) {
    const q = question.trim();
    if (!q || !lastAssistant) return;
    setFollowUpText("");
    setError(null);
    const userId = newId();
    const assistantId = newId();
    setMessages((cur) => [
      ...cur,
      { id: userId, role: "user", text: q },
      { id: assistantId, role: "assistant", text: "", streaming: true },
    ]);
    try {
      const response = await followUpMutation.mutateAsync({
        question: q,
        previousResponse: lastAssistant.text,
        mode: (request as AIExplainRequest).mode,
      });
      setMessages((cur) =>
        cur.map((m) =>
          m.id === assistantId && m.role === "assistant"
            ? { ...m, text: response.explanation, streaming: false, followUps: response.followUps }
            : m,
        ),
      );
    } catch (e) {
      const err = e instanceof ServiceError ? e : new ServiceError("Unknown error", "unknown");
      setError(err);
      setMessages((cur) =>
        cur.map((m) =>
          m.id === assistantId && m.role === "assistant"
            ? { ...m, streaming: false, text: m.text || "Couldn't fetch a response." }
            : m,
        ),
      );
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="AI explanation"
      className="fixed inset-y-0 right-0 z-30 flex w-full flex-col border-l border-border/60 bg-background shadow-2xl sm:max-w-md"
    >
      <header className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
        <Sparkles className="size-4 text-primary" />
        <span className="text-sm font-medium">Explain</span>
        <Badge variant="outline" className="font-mono text-[10px] uppercase">
          {request.mode}
        </Badge>
        <Button variant="ghost" size="icon" className="ml-auto" onClick={closeExplain} aria-label="Close explanation">
          <X className="size-4" />
        </Button>
      </header>

      <div ref={threadRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((m) => {
          if (m.role === "selection") {
            return (
              <figure key={m.id} className="rounded-md border-l-2 border-primary/60 bg-muted/40 px-3 py-2 text-xs">
                <figcaption className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  You highlighted
                </figcaption>
                <blockquote className="line-clamp-6 italic text-foreground/85">{m.text}</blockquote>
              </figure>
            );
          }
          if (m.role === "user") {
            return (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[80%] rounded-lg bg-primary/15 px-3 py-2 text-sm text-foreground">{m.text}</p>
              </div>
            );
          }
          // assistant
          return (
            <div key={m.id} className="space-y-2">
              <div className="rounded-lg bg-muted/30 px-3 py-3 text-sm">
                {m.text ? (
                  <MarkdownView source={m.text} className="text-sm" />
                ) : (
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" />
                    Thinking…
                  </span>
                )}
                {m.streaming && m.text && (
                  <span className="ml-1 inline-block h-3 w-1.5 animate-pulse bg-foreground align-middle" aria-hidden />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-xs text-muted-foreground"
                  onClick={() => copyText(m.id, m.text)}
                  disabled={!m.text || m.streaming}
                >
                  {copiedId === m.id ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copiedId === m.id ? "Copied" : "Copy"}
                </Button>
                {!m.streaming && m.followUps && m.followUps.length > 0 && (
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Try:</span>
                )}
                {!m.streaming &&
                  m.followUps?.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => submitFollowUp(suggestion)}
                      className="rounded-full border border-border/60 px-2.5 py-0.5 text-xs text-foreground/85 transition hover:bg-muted disabled:opacity-50"
                      disabled={inputDisabled}
                    >
                      {suggestion}
                    </button>
                  ))}
              </div>
            </div>
          );
        })}

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error.code === "rate_limit"
              ? "Rate limit hit. Wait a few seconds and try the follow-up again."
              : `${error.code}: ${error.message}`}
          </div>
        )}
      </div>

      <form
        className="flex items-center gap-2 border-t border-border/60 px-3 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!inputDisabled) submitFollowUp(followUpText);
        }}
      >
        <Input
          value={followUpText}
          onChange={(e) => setFollowUpText(e.target.value)}
          placeholder="Ask a follow-up…"
          className="h-9"
          disabled={inputDisabled}
          aria-label="Follow-up question"
        />
        <Button type="submit" size="icon" className="size-9 shrink-0" disabled={inputDisabled || !followUpText.trim()} aria-label="Send follow-up">
          {followUpMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </form>
    </div>
  );
}
