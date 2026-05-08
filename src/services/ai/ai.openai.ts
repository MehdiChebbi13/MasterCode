import { ServiceError, type AIExplainRequest, type AIExplainResponse, type AIExplainStreamChunk } from "@/types";
import type { AIFollowUpRequest, AIService } from "./ai.service";

const NOT_IMPLEMENTED = (op: string) =>
  new ServiceError(`OpenAIService.${op} is not implemented yet — wire this up to OpenAI's API.`, "not_implemented");

export class OpenAIService implements AIService {
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
