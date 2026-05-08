"use client";

import { useMutation } from "@tanstack/react-query";
import { getAIService, type AIFollowUpRequest } from "@/services";
import type { AIExplainRequest } from "@/types";

export function useExplain() {
  return useMutation({
    mutationFn: (req: AIExplainRequest) => getAIService().explain(req),
  });
}

export function useFollowUp() {
  return useMutation({
    mutationFn: (req: AIFollowUpRequest) => getAIService().followUp(req),
  });
}

export function explainStream(req: AIExplainRequest) {
  return getAIService().explainStream(req);
}
