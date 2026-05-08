import { ServiceError, type AIExplainRequest, type AIExplainResponse, type AIExplainStreamChunk } from "@/types";
import { simulateRequest, simulateStream } from "@/services/_internal/latency";
import type { AIFollowUpRequest, AIService } from "./ai.service";

const MIN_SELECTION = 2;
const RATE_LIMIT_PER_WINDOW = 8;
const WINDOW_MS = 30_000;

const recentRequests: number[] = [];

function checkRateLimit() {
  const now = Date.now();
  while (recentRequests.length && now - recentRequests[0] > WINDOW_MS) {
    recentRequests.shift();
  }
  if (recentRequests.length >= RATE_LIMIT_PER_WINDOW) {
    throw new ServiceError("Rate limit hit (mock). Wait a few seconds and try again.", "rate_limit");
  }
  recentRequests.push(now);
}

function buildExplanation(req: AIExplainRequest): string {
  const trimmed = req.selection.trim();
  const len = trimmed.length;

  if (req.mode === "code") {
    const lang = req.language ?? "the code";
    const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const overview =
      lines.length > 1
        ? `This snippet of ${lang} runs in roughly ${lines.length} steps.`
        : `This is a single line of ${lang}.`;
    const guess = guessCodeIntent(trimmed);
    const followUp =
      len < 60
        ? `It's short enough that the intent is mostly the syntax — make sure you can read it line by line without the explanation.`
        : `Trace it on a small example to make sure the control flow matches what you'd predict.`;
    return [
      `**What this does.** ${overview} ${guess}`,
      ``,
      `**Walkthrough.**`,
      ...lines.slice(0, 5).map((l, i) => `${i + 1}. \`${l.trim().slice(0, 80)}\` — ${describeLine(l)}`),
      ``,
      `**Tip.** ${followUp}`,
    ].join("\n");
  }

  const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(Boolean);
  const lead = sentences[0] ?? trimmed;
  const ctxNote = req.context
    ? `In the context of this chapter, this passage connects to ideas you've already seen — try to map it back to the worked example above it.`
    : `Without surrounding context, treat this as a definition you should be able to restate in your own words.`;

  if (len < 40) {
    return [
      `**Short version.** ${lead}`,
      ``,
      `This is a tight phrase. Two paths to remember it:`,
      `- Restate it without using any of the same words.`,
      `- Construct a small concrete example that the phrase describes.`,
      ``,
      ctxNote,
    ].join("\n");
  }

  return [
    `**Plain-English summary.** ${lead}`,
    ``,
    `**Why it matters.** ${classifyTopic(trimmed)} ideas like this come up across the course because they constrain what algorithms or systems are possible — once you see the pattern, lots of later material is just applying it in a new setting.`,
    ``,
    `**Things to check yourself on.**`,
    `1. Can you give a worked example?`,
    `2. Can you state the *opposite* — the case where this doesn't apply?`,
    `3. Can you compare it to the closest related concept and say what's different?`,
    ``,
    ctxNote,
  ].join("\n");
}

function describeLine(line: string): string {
  const t = line.trim();
  if (/^(if|elif|else)\b/.test(t)) return "branches on a condition.";
  if (/^(for|while)\b/.test(t)) return "iterates.";
  if (/^(return)\b/.test(t)) return "returns the result of the function.";
  if (/^(def|function|fn|const\s+\w+\s*=\s*\()/.test(t)) return "defines a function.";
  if (/=/.test(t)) return "assigns or computes a value.";
  return "performs the next step of the computation.";
}

function classifyTopic(text: string): string {
  const lower = text.toLowerCase();
  if (/(complexity|big.?o|n log n|asymptotic)/.test(lower)) return "Performance";
  if (/(thread|lock|race|mutex|concurrency)/.test(lower)) return "Concurrency";
  if (/(tcp|udp|packet|congestion|dns)/.test(lower)) return "Networking";
  if (/(transaction|index|sql|query|acid)/.test(lower)) return "Database";
  if (/(page|virtual|paging|tlb|frame)/.test(lower)) return "Memory";
  return "Foundational";
}

function guessCodeIntent(code: string): string {
  const lower = code.toLowerCase();
  if (/merge_?sort|quicksort/.test(lower)) return "It looks like a sorting routine.";
  if (/dijkstra|bfs|dfs|bellman/.test(lower)) return "It looks like a graph traversal or shortest-path routine.";
  if (/lock|mutex|atomic|cas/.test(lower)) return "It's coordinating concurrent access to shared state.";
  if (/select\s+|from\s+|where\s+/i.test(code)) return "It's a SQL-style query.";
  return "It's transforming the inputs into a result.";
}

function buildFollowUps(req: AIExplainRequest): string[] {
  const base =
    req.mode === "code"
      ? [
          "Walk me through what happens with a degenerate input.",
          "What's the time complexity of this?",
          "How would I write a unit test for this?",
        ]
      : [
          "Give me a worked example.",
          "What's the most common misconception about this?",
          "How does this connect to the previous chapter?",
        ];
  return base.slice(0, req.selection.length > 200 ? 3 : 2);
}

function explanationToChunks(text: string): string[] {
  return text.match(/.{1,18}(\s|$)|\S+/g) ?? [text];
}

export class MockAIService implements AIService {
  async explain(req: AIExplainRequest): Promise<AIExplainResponse> {
    return simulateRequest(
      () => {
        validate(req);
        checkRateLimit();
        return {
          explanation: buildExplanation(req),
          followUps: buildFollowUps(req),
        };
      },
      { errorRate: 0.06, errorMessage: "The mock AI service is busy. Try again." },
    );
  }

  async *explainStream(req: AIExplainRequest): AsyncIterable<AIExplainStreamChunk> {
    validate(req);
    checkRateLimit();
    const text = buildExplanation(req);
    const chunks = explanationToChunks(text);
    let i = 0;
    for await (const piece of simulateStream(chunks)) {
      i += 1;
      const last = i === chunks.length;
      yield { delta: piece, done: last, followUps: last ? buildFollowUps(req) : undefined };
    }
  }

  async followUp(req: AIFollowUpRequest): Promise<AIExplainResponse> {
    return simulateRequest(
      () => {
        if (!req.question?.trim()) throw new ServiceError("Follow-up question is required", "validation");
        checkRateLimit();
        return {
          explanation: [
            `**Re: "${req.question.trim()}"**`,
            ``,
            `Building on the previous explanation: the key idea is that the answer depends on which side of the trade-off you care about. In ${req.mode === "code" ? "this snippet" : "this passage"}, the relevant trade-off is between clarity and performance — favor clarity unless you have a measured reason not to.`,
            ``,
            `If you'd like, ask a more specific follow-up and I'll narrow in.`,
          ].join("\n"),
        };
      },
      { errorRate: 0.04 },
    );
  }
}

function validate(req: AIExplainRequest) {
  if (!req.selection || req.selection.trim().length < MIN_SELECTION) {
    throw new ServiceError("Selection is too short to explain", "validation");
  }
}
