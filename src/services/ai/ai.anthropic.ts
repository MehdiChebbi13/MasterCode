import { ServiceError, type AIExplainRequest, type AIExplainResponse, type AIExplainStreamChunk } from "@/types";
import type { AIFollowUpRequest, AIService } from "./ai.service";

const NOT_IMPLEMENTED = (op: string) =>
  new ServiceError(`AnthropicAIService.${op} is not implemented yet — wire this up to Anthropic's API.`, "not_implemented");

export class AnthropicAIService implements AIService {
  explain(_req: AIExplainRequest): Promise<AIExplainResponse> {
    throw NOT_IMPLEMENTED("explain");
  }
  explainStream(_req: AIExplainRequest): AsyncIterable<AIExplainStreamChunk> {
    throw NOT_IMPLEMENTED("explainStream");
  }
  followUp(_req: AIFollowUpRequest): Promise<AIExplainResponse> {
    throw NOT_IMPLEMENTED("followUp");
  }
}
