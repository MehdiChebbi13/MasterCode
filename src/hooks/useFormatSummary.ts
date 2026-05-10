"use client";

import { useMutation } from "@tanstack/react-query";
import { type Block, makeBlockId } from "@/lib/summaryBlocks";

type ApiBlock = { type: Block["type"]; text: string; lang: string | null };

export function useFormatSummary() {
  return useMutation<Block[], Error, Block[]>({
    mutationFn: async (blocks) => {
      const payload = blocks.map((b) => ({
        type: b.type,
        text: b.text,
        lang: b.lang ?? null,
      }));
      const res = await fetch("/api/ai/format", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks: payload }),
      });
      if (!res.ok) {
        const e: { error?: string } = await res.json().catch(() => ({}));
        throw new Error(e.error || `Format request failed: ${res.status}`);
      }
      const data = (await res.json()) as { blocks: ApiBlock[] };
      return data.blocks.map<Block>((b) => ({
        id: makeBlockId(),
        type: b.type,
        text: b.text,
        ...(b.lang ? { lang: b.lang } : {}),
      }));
    },
  });
}
