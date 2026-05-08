import type { AIExplainRequest, AIExplainResponse, AIExplainStreamChunk, ExplainMode } from "@/types";

export interface AIFollowUpRequest {
  question: string;
  previousResponse: string;
  mode: ExplainMode;
}

export interface AIService {
  explain(req: AIExplainRequest): Promise<AIExplainResponse>;
  explainStream(req: AIExplainRequest): AsyncIterable<AIExplainStreamChunk>;
  followUp(req: AIFollowUpRequest): Promise<AIExplainResponse>;
}
