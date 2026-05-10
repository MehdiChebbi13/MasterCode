const javaKeywords = new Set([
  "public", "private", "static", "void", "class", "int", "return",
  "if", "else", "for", "while", "new", "final", "this", "true", "false",
]);
const pythonKeywords = new Set([
  "def", "return", "if", "else", "elif", "for", "while", "in",
  "not", "and", "or", "None", "True", "False", "import",
]);
const pythonBuiltins = new Set(["print", "len", "range", "enumerate"]);

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

type TokenType = "keyword" | "string" | "comment" | "number" | "fn" | "builtin" | "plain";

export function highlight(code: string, lang: "java" | "python"): string {
  const tokens: { type: TokenType; val: string }[] = [];
  let i = 0;
  while (i < code.length) {
    const ch = code[i];
    const next = code[i + 1];

    if ((lang === "java" && ch === "/" && next === "/") || (lang === "python" && ch === "#")) {
      let end = code.indexOf("\n", i);
      if (end === -1) end = code.length;
      tokens.push({ type: "comment", val: code.slice(i, end) });
      i = end;
      continue;
    }

    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < code.length && code[j] !== ch) {
        if (code[j] === "\\") j += 2;
        else j++;
      }
      if (j < code.length) j++;
      tokens.push({ type: "string", val: code.slice(i, j) });
      i = j;
      continue;
    }

    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < code.length && /[0-9.]/.test(code[j])) j++;
      tokens.push({ type: "number", val: code.slice(i, j) });
      i = j;
      continue;
    }

    if (/[a-zA-Z_]/.test(ch)) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) j++;
      const word = code.slice(i, j);
      let type: TokenType = "plain";
      if (lang === "java" && javaKeywords.has(word)) type = "keyword";
      else if (lang === "python" && pythonKeywords.has(word)) type = "keyword";
      else if (lang === "python" && pythonBuiltins.has(word)) type = "builtin";
      else if (code[j] === "(") type = "fn";
      tokens.push({ type, val: word });
      i = j;
      continue;
    }

    tokens.push({ type: "plain", val: ch });
    i++;
  }

  return tokens
    .map((t) => {
      const safe = escapeHtml(t.val);
      switch (t.type) {
        case "keyword": return `<span class="mkt-tok-keyword">${safe}</span>`;
        case "string":  return `<span class="mkt-tok-string">${safe}</span>`;
        case "comment": return `<span class="mkt-tok-comment">${safe}</span>`;
        case "number":  return `<span class="mkt-tok-number">${safe}</span>`;
        case "fn":      return `<span class="mkt-tok-fn">${safe}</span>`;
        case "builtin": return `<span class="mkt-tok-builtin">${safe}</span>`;
        default:        return safe;
      }
    })
    .join("");
}

export const JAVA_SNIPPET = `int search(int[] arr, int target) {
    int lo = 0, hi = arr.length - 1;
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`;

export const PYTHON_SNIPPET = `def search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`;
