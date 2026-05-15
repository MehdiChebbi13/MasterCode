import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import {
  FLASHCARDS_SCHEMA,
  FLASHCARDS_SYSTEM_PROMPT,
} from "@/services/ai/flashcards.prompt";

export const runtime = "nodejs";

type ExistingCard = { question: string; answer: string };

const MIN_WORDS = 40;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 500 });
  }

  let body: { contentMarkdown?: unknown; existingFlashcards?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const { contentMarkdown, existingFlashcards } = body;
  if (typeof contentMarkdown !== "string") {
    return NextResponse.json(
      { error: "contentMarkdown string required" },
      { status: 400 },
    );
  }
  const existing: ExistingCard[] = Array.isArray(existingFlashcards)
    ? (existingFlashcards as unknown[])
        .filter(
          (c): c is ExistingCard =>
            !!c &&
            typeof c === "object" &&
            typeof (c as ExistingCard).question === "string" &&
            typeof (c as ExistingCard).answer === "string",
        )
        .map((c) => ({ question: c.question, answer: c.answer }))
    : [];

  if (wordCount(contentMarkdown) < MIN_WORDS) {
    return NextResponse.json({ insufficient: true, flashcards: [] });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: FLASHCARDS_SYSTEM_PROMPT },
        {
          role: "user",
          content:
            `SUMMARY MARKDOWN:\n\n${contentMarkdown}\n\n` +
            `EXISTING FLASHCARDS (do not repeat or paraphrase these):\n` +
            `${JSON.stringify(existing, null, 2)}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "summary_flashcards",
          strict: true,
          schema: FLASHCARDS_SCHEMA,
        },
      },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "empty response" }, { status: 502 });
    }
    const parsed = JSON.parse(content) as {
      insufficient: boolean;
      flashcards: { question: string; answer: string }[];
    };

    if (parsed.insufficient || parsed.flashcards.length === 0) {
      return NextResponse.json({ insufficient: true, flashcards: [] });
    }

    return NextResponse.json({
      insufficient: false,
      flashcards: parsed.flashcards.slice(0, 3),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "OpenAI request failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
