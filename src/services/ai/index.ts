import { aiProvider } from "@/services/_internal/dataSource";
import { MockAIService } from "./ai.mock";
import { AnthropicAIService } from "./ai.anthropic";
import { OpenAIService } from "./ai.openai";
import type { AIService } from "./ai.service";

let instance: AIService | null = null;

export function getAIService(): AIService {
  if (instance) return instance;
  switch (aiProvider()) {
    case "openai":
      instance = new OpenAIService();
      break;
    case "anthropic":
      instance = new AnthropicAIService();
      break;
    case "mock":
    default:
      instance = new MockAIService();
      break;
  }
  return instance;
}

export function _resetAIServiceForTests(): void {
  instance = null;
}

export type { AIService, AIFollowUpRequest } from "./ai.service";
