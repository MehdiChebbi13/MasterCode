import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import {
  FORMAT_BLOCKS_SCHEMA,
  FORMAT_SYSTEM_PROMPT,
} from "@/services/ai/format.prompt";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 500 });
  }

  let body: { blocks?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const { blocks } = body;
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return NextResponse.json({ error: "blocks array required" }, { status: 400 });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: FORMAT_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Reformat these blocks:\n\n${JSON.stringify({ blocks })}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "summary_blocks",
          strict: true,
          schema: FORMAT_BLOCKS_SCHEMA,
        },
      },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "empty response" }, { status: 502 });
    }
    const parsed = JSON.parse(content);
    return NextResponse.json({ blocks: parsed.blocks });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "OpenAI request failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
