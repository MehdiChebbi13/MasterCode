export type TokenType = "keyword" | "string" | "comment" | "number" | "function" | "type" | "plain";

export interface Token {
  type: TokenType;
  value: string;
}

const JAVA_KEYWORDS = new Set([
  "public", "private", "protected", "static", "final", "abstract", "class", "interface",
  "extends", "implements", "new", "return", "if", "else", "for", "while", "do", "switch",
  "case", "default", "break", "continue", "try", "catch", "finally", "throw", "throws",
  "void", "int", "double", "float", "long", "short", "byte", "boolean", "char", "String",
  "true", "false", "null", "this", "super"
]);

const JAVA_TYPES = new Set([
  "String", "Integer", "Double", "Float", "Long", "Short", "Byte", "Boolean", "Character",
  "Object", "ArrayList", "HashMap", "HashSet", "LinkedList", "Queue", "Stack", "Array",
  "List", "Map", "Set", "Collection", "Stream"
]);

const PYTHON_KEYWORDS = new Set([
  "def", "class", "if", "elif", "else", "for", "while", "break", "continue", "return",
  "import", "from", "as", "try", "except", "finally", "raise", "with", "lambda", "yield",
  "and", "or", "not", "in", "is", "None", "True", "False", "pass", "assert", "del", "global",
  "nonlocal", "async", "await"
]);

const PYTHON_TYPES = new Set([
  "int", "str", "float", "bool", "list", "dict", "tuple", "set", "frozenset", "range",
  "bytes", "bytearray", "object", "type", "None"
]);

function isJavaFunctionCall(text: string, index: number): boolean {
  let i = index - 1;
  while (i >= 0 && /[a-zA-Z0-9_]/.test(text[i])) i--;
  const identifier = text.substring(i + 1, index);

  if (!/^[a-z]/.test(identifier)) return false;

  i = index;
  while (i < text.length && /\s/.test(text[i])) i++;
  return i < text.length && text[i] === "(";
}

function isPythonFunctionCall(text: string, index: number): boolean {
  let i = index - 1;
  while (i >= 0 && /[a-zA-Z0-9_]/.test(text[i])) i--;

  i = index;
  while (i < text.length && /\s/.test(text[i])) i++;
  return i < text.length && text[i] === "(";
}

export function tokenizeJava(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    // Line comment
    if (code[i] === "/" && code[i + 1] === "/") {
      let j = i;
      while (j < code.length && code[j] !== "\n") j++;
      tokens.push({ type: "comment", value: code.substring(i, j) });
      i = j;
      continue;
    }

    // Block comment
    if (code[i] === "/" && code[i + 1] === "*") {
      let j = i + 2;
      while (j < code.length - 1 && !(code[j] === "*" && code[j + 1] === "/")) j++;
      tokens.push({ type: "comment", value: code.substring(i, j + 2) });
      i = j + 2;
      continue;
    }

    // String
    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i];
      let j = i + 1;
      while (j < code.length && code[j] !== quote) {
        if (code[j] === "\\") j += 2;
        else j++;
      }
      tokens.push({ type: "string", value: code.substring(i, j + 1) });
      i = j + 1;
      continue;
    }

    // Number
    if (/\d/.test(code[i])) {
      let j = i;
      while (j < code.length && /[\d.]/.test(code[j])) j++;
      tokens.push({ type: "number", value: code.substring(i, j) });
      i = j;
      continue;
    }

    // Identifier/Keyword
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) j++;
      const word = code.substring(i, j);

      if (JAVA_KEYWORDS.has(word)) {
        tokens.push({ type: "keyword", value: word });
      } else if (JAVA_TYPES.has(word)) {
        tokens.push({ type: "type", value: word });
      } else if (isJavaFunctionCall(code, j)) {
        tokens.push({ type: "function", value: word });
      } else {
        tokens.push({ type: "plain", value: word });
      }
      i = j;
      continue;
    }

    tokens.push({ type: "plain", value: code[i] });
    i++;
  }

  return tokens;
}

export function tokenizePython(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    // Line comment
    if (code[i] === "#") {
      let j = i;
      while (j < code.length && code[j] !== "\n") j++;
      tokens.push({ type: "comment", value: code.substring(i, j) });
      i = j;
      continue;
    }

    // String (single/double quote)
    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i];
      let j = i + 1;
      while (j < code.length && code[j] !== quote) {
        if (code[j] === "\\") j += 2;
        else j++;
      }
      tokens.push({ type: "string", value: code.substring(i, j + 1) });
      i = j + 1;
      continue;
    }

    // Number
    if (/\d/.test(code[i])) {
      let j = i;
      while (j < code.length && /[\d.]/.test(code[j])) j++;
      tokens.push({ type: "number", value: code.substring(i, j) });
      i = j;
      continue;
    }

    // Identifier/Keyword
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) j++;
      const word = code.substring(i, j);

      if (PYTHON_KEYWORDS.has(word)) {
        tokens.push({ type: "keyword", value: word });
      } else if (PYTHON_TYPES.has(word)) {
        tokens.push({ type: "type", value: word });
      } else if (isPythonFunctionCall(code, j)) {
        tokens.push({ type: "function", value: word });
      } else {
        tokens.push({ type: "plain", value: word });
      }
      i = j;
      continue;
    }

    tokens.push({ type: "plain", value: code[i] });
    i++;
  }

  return tokens;
}

export function tokenize(code: string, language: "java" | "python"): Token[] {
  return language === "java" ? tokenizeJava(code) : tokenizePython(code);
}
