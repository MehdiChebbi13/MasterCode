export type BlockType =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "bullet"
  | "numbered"
  | "quote"
  | "code"
  | "highlight"
  | "divider"
  | "table";

export interface Block {
  id: string;
  type: BlockType;
  text: string;
  lang?: string;
}

export interface BlockDefinition {
  type: BlockType;
  label: string;
  hint: string;
  icon: string;
  shortcut: string;
  keywords: string[];
}

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  { type: "paragraph", label: "Text",        hint: "Plain paragraph",          icon: "¶",  shortcut: "/text",   keywords: ["text", "paragraph", "p"] },
  { type: "h1",        label: "Heading 1",   hint: "Big section title",        icon: "H₁", shortcut: "/h1",     keywords: ["h1", "heading", "title", "big"] },
  { type: "h2",        label: "Heading 2",   hint: "Medium section title",     icon: "H₂", shortcut: "/h2",     keywords: ["h2", "heading", "subtitle"] },
  { type: "h3",        label: "Heading 3",   hint: "Small section title",      icon: "H₃", shortcut: "/h3",     keywords: ["h3", "heading"] },
  { type: "bullet",    label: "Bullet list", hint: "An unordered list item",   icon: "•",  shortcut: "/bullet", keywords: ["bullet", "list", "ul", "unordered"] },
  { type: "numbered",  label: "Numbered",    hint: "An ordered list item",     icon: "1.", shortcut: "/num",    keywords: ["number", "numbered", "list", "ol", "ordered"] },
  { type: "quote",     label: "Quote",       hint: "A blockquote",             icon: "❝",  shortcut: "/quote",  keywords: ["quote", "blockquote"] },
  { type: "code",      label: "Code",        hint: "Syntax-highlighted code",  icon: "</>",shortcut: "/code",   keywords: ["code", "snippet", "block"] },
  { type: "highlight", label: "Highlight",   hint: "Yellow callout block",     icon: "✦",  shortcut: "/hi",      keywords: ["highlight", "callout", "mark", "note"] },
  { type: "divider",   label: "Divider",    hint: "Horizontal separator line", icon: "―",  shortcut: "/divider", keywords: ["divider", "hr", "separator", "line", "rule"] },
  { type: "table",     label: "Table",      hint: "Grid of rows and columns",  icon: "⊞",  shortcut: "/table",   keywords: ["table", "grid", "columns", "rows"] },
];

export const BLOCK_DEFINITION_BY_TYPE: Record<BlockType, BlockDefinition> =
  BLOCK_DEFINITIONS.reduce(
    (acc, def) => {
      acc[def.type] = def;
      return acc;
    },
    {} as Record<BlockType, BlockDefinition>,
  );

export function makeBlockId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `b_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

export const DEFAULT_TABLE_TEXT =
  "| Header 1 | Header 2 |\n| --- | --- |\n|  |  |";

export function makeBlock(type: BlockType = "paragraph", text = ""): Block {
  if (type === "table" && text === "") text = DEFAULT_TABLE_TEXT;
  return { id: makeBlockId(), type, text };
}

export function parseTableRows(text: string): string[][] {
  if (!text.trim()) return [["Header 1", "Header 2"], ["", ""]];
  const lines = text.trim().split("\n");
  const rows: string[][] = [];
  for (const line of lines) {
    // Separator rows have cells that are only dashes/colons (e.g. "---", ":---:", "---:")
    const segments = line.replace(/^\||\|$/g, "").split("|");
    if (segments.length > 0 && segments.every((s) => /^\s*:?-+:?\s*$/.test(s))) continue;
    const cells = segments.map((c) => c.trim());
    rows.push(cells);
  }
  return rows.length ? rows : [["Header 1", "Header 2"], ["", ""]];
}

export function serializeTableRows(rows: string[][]): string {
  if (!rows.length) return DEFAULT_TABLE_TEXT;
  const colCount = Math.max(...rows.map((r) => r.length));
  const pad = (r: string[]) => {
    const out = [...r];
    while (out.length < colCount) out.push("");
    return out;
  };
  return [
    `| ${pad(rows[0]).join(" | ")} |`,
    `| ${Array(colCount).fill("---").join(" | ")} |`,
    ...rows.slice(1).map((r) => `| ${pad(r).join(" | ")} |`),
  ].join("\n");
}

export function emptyBlocks(): Block[] {
  return [makeBlock("paragraph", "")];
}

// ── Serialize blocks → markdown ───────────────────────────────────────────────
export function serializeBlocksToMarkdown(blocks: Block[]): string {
  const trimmed = trimTrailingEmpty(blocks);
  const out: string[] = [];
  let numberedRun = 0;

  for (let i = 0; i < trimmed.length; i++) {
    const b = trimmed[i];
    const prev = trimmed[i - 1];

    if (b.type === "numbered") {
      if (!prev || prev.type !== "numbered") numberedRun = 0;
      numberedRun += 1;
    } else {
      numberedRun = 0;
    }

    switch (b.type) {
      case "paragraph":
        out.push(b.text);
        break;
      case "h1":
        out.push(`# ${b.text}`);
        break;
      case "h2":
        out.push(`## ${b.text}`);
        break;
      case "h3":
        out.push(`### ${b.text}`);
        break;
      case "bullet":
        out.push(`- ${b.text}`);
        break;
      case "numbered":
        out.push(`${numberedRun}. ${b.text}`);
        break;
      case "quote":
        out.push(`> ${b.text}`);
        break;
      case "highlight":
        out.push(`==${b.text}==`);
        break;
      case "divider":
        out.push("---");
        break;
      case "table":
        out.push(b.text);
        break;
      case "code": {
        const lang = b.lang?.trim() || "";
        out.push(`\`\`\`${lang}\n${b.text}\n\`\`\``);
        break;
      }
    }

    // Insert a blank line between blocks except when consecutive list items of
    // the same kind — markdown joins those into one list either way.
    const next = trimmed[i + 1];
    if (next) {
      const sameList =
        (b.type === "bullet" && next.type === "bullet") ||
        (b.type === "numbered" && next.type === "numbered");
      out.push(sameList ? "" : "");
      // Always blank line. (Both branches push "" — kept explicit for clarity.)
    }
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

function trimTrailingEmpty(blocks: Block[]): Block[] {
  let end = blocks.length;
  while (end > 0) {
    const b = blocks[end - 1];
    if (b.type === "paragraph" && b.text.trim() === "") end--;
    else break;
  }
  return blocks.slice(0, end);
}

// ── Parse markdown → blocks ───────────────────────────────────────────────────
export function parseMarkdownToBlocks(md: string): Block[] {
  if (!md || !md.trim()) return emptyBlocks();

  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  const push = (type: BlockType, text: string, lang?: string) => {
    const b = makeBlock(type, text);
    if (lang !== undefined) b.lang = lang;
    blocks.push(b);
  };

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      const lang = fence[1] || "";
      i++;
      const buf: string[] = [];
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // consume closing fence
      push("code", buf.join("\n"), lang);
      continue;
    }

    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }

    // Thematic break (divider)
    if (/^[-*_]{3,}\s*$/.test(line)) { push("divider", ""); i++; continue; }

    // Heading
    const h1 = line.match(/^#\s+(.*)$/);
    const h2 = line.match(/^##\s+(.*)$/);
    const h3 = line.match(/^###\s+(.*)$/);
    if (h3) { push("h3", h3[1]); i++; continue; }
    if (h2) { push("h2", h2[1]); i++; continue; }
    if (h1) { push("h1", h1[1]); i++; continue; }

    // Highlight (single line)
    const hi = line.match(/^==(.+)==\s*$/);
    if (hi) { push("highlight", hi[1]); i++; continue; }

    // Quote (group consecutive)
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      push("quote", buf.join(" "));
      continue;
    }

    // Bullet list item
    const bullet = line.match(/^[-*+]\s+(.*)$/);
    if (bullet) { push("bullet", bullet[1]); i++; continue; }

    // Numbered list item
    const num = line.match(/^\d+\.\s+(.*)$/);
    if (num) { push("numbered", num[1]); i++; continue; }

    // Table — collect consecutive | lines
    if (/^\|/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\|/.test(lines[i])) { buf.push(lines[i]); i++; }
      push("table", buf.join("\n"));
      continue;
    }

    // Paragraph (group consecutive non-blank, non-special lines)
    const buf: string[] = [line];
    i++;
    while (i < lines.length) {
      const l = lines[i];
      if (
        /^\s*$/.test(l) ||
        /^```/.test(l) ||
        /^#{1,3}\s+/.test(l) ||
        /^>\s?/.test(l) ||
        /^[-*+]\s+/.test(l) ||
        /^\d+\.\s+/.test(l) ||
        /^==(.+)==\s*$/.test(l) ||
        /^\|/.test(l) ||
        /^[-*_]{3,}\s*$/.test(l)
      ) break;
      buf.push(l);
      i++;
    }
    push("paragraph", buf.join("\n"));
  }

  return blocks.length ? blocks : emptyBlocks();
}
