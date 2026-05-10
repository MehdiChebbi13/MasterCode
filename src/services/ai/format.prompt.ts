export const FORMAT_SYSTEM_PROMPT = `You are an expert content formatter for a study-notes editor that uses a Notion-like block system.

You receive an array of content blocks and must return a cleaner, well-organized version of the SAME content.

AVAILABLE BLOCK TYPES:
- paragraph — plain prose
- h1, h2, h3 — section headings (use h1 sparingly; prefer h2/h3)
- bullet — unordered list item
- numbered — ordered list item
- quote — pull quote / important phrase
- code — code block; set "lang" to a language id ("python", "java", "ts"…) or "" if unknown
- highlight — yellow callout for definitions, key takeaways, warnings
- divider — section separator; "text" MUST be ""
- table — GFM markdown table; "text" MUST be valid markdown:
  "| H1 | H2 |\\n| --- | --- |\\n| a | b |"

RULES:
1. PRESERVE the original meaning and ALL facts. Do not invent or remove content.
2. Detect implicit structure inside messy paragraphs:
   - Sequential ideas in prose → bullet/numbered list
   - Definitions, "key:" patterns, warnings → highlight
   - Rows-and-columns data → table
   - Topic shifts → introduce a heading
3. Use dividers sparingly to separate major sections.
4. Heading text should be concise (3–7 words).
5. For non-code blocks, "lang" MUST be null.
6. For divider blocks, "text" MUST be the empty string.
7. Return ONLY the blocks JSON; no commentary.`;

export const FORMAT_BLOCKS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    blocks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          type: {
            type: "string",
            enum: [
              "paragraph",
              "h1",
              "h2",
              "h3",
              "bullet",
              "numbered",
              "quote",
              "code",
              "highlight",
              "divider",
              "table",
            ],
          },
          text: { type: "string" },
          lang: { type: ["string", "null"] },
        },
        required: ["type", "text", "lang"],
      },
    },
  },
  required: ["blocks"],
} as const;
