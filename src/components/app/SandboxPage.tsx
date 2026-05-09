"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Lang = "java" | "python";
type Status = "idle" | "running" | "success" | "error";
interface ConsoleLine { type: "system" | "out" | "success" | "error" | "muted"; text: string; }
interface Example { label: string; file: string; meta: string; code: string; output: ConsoleLine[]; stats: { time: string; mem: string; exit: string }; }

const EXAMPLES: Record<Lang, Record<string, Example>> = {
  java: {
    hello: {
      label: "👋 Hello", file: "Hello.java", meta: "Hello.main()",
      code: `// Hello, future engineer.
public class Hello {
    public static void main(String[] args) {
        String name = "world";
        System.out.println("hello, " + name + "!");
        for (int i = 1; i <= 3; i++) {
            System.out.println("count " + i);
        }
    }
}`,
      output: [
        { type: "system", text: "> javac Hello.java && java Hello" },
        { type: "out", text: "hello, world!" },
        { type: "out", text: "count 1" },
        { type: "out", text: "count 2" },
        { type: "out", text: "count 3" },
        { type: "success", text: "✓ Process finished — exit 0" },
      ],
      stats: { time: "0.04s", mem: "12 MB", exit: "0" },
    },
    bsearch: {
      label: "🔍 Binary search", file: "BinarySearch.java", meta: "BinarySearch.main()",
      code: `// O(log n) search on a sorted array.
public class BinarySearch {

    static int search(int[] arr, int target) {
        int lo = 0, hi = arr.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) lo = mid + 1;
            else                    hi = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] data = {1, 3, 5, 7, 9, 11, 13, 17, 23, 31};
        int[] keys = {7, 23, 4, 31};
        for (int k : keys) {
            int i = search(data, k);
            System.out.println("search(" + k + ") -> index " + i);
        }
    }
}`,
      output: [
        { type: "system", text: "> javac BinarySearch.java && java BinarySearch" },
        { type: "out", text: "search(7) -> index 3" },
        { type: "out", text: "search(23) -> index 8" },
        { type: "out", text: "search(4) -> index -1" },
        { type: "out", text: "search(31) -> index 9" },
        { type: "success", text: "✓ Process finished — exit 0" },
      ],
      stats: { time: "0.06s", mem: "14 MB", exit: "0" },
    },
    mergesort: {
      label: "🪜 Merge sort", file: "MergeSort.java", meta: "MergeSort.main()",
      code: `// Classic divide-and-conquer. O(n log n).
import java.util.Arrays;

public class MergeSort {

    static int[] sort(int[] a) {
        if (a.length <= 1) return a;
        int mid = a.length / 2;
        int[] left  = sort(Arrays.copyOfRange(a, 0, mid));
        int[] right = sort(Arrays.copyOfRange(a, mid, a.length));
        return merge(left, right);
    }

    static int[] merge(int[] l, int[] r) {
        int[] out = new int[l.length + r.length];
        int i = 0, j = 0, k = 0;
        while (i < l.length && j < r.length)
            out[k++] = (l[i] <= r[j]) ? l[i++] : r[j++];
        while (i < l.length) out[k++] = l[i++];
        while (j < r.length) out[k++] = r[j++];
        return out;
    }

    public static void main(String[] args) {
        int[] data = {38, 27, 43, 3, 9, 82, 10};
        System.out.println("input:  " + Arrays.toString(data));
        System.out.println("sorted: " + Arrays.toString(sort(data)));
    }
}`,
      output: [
        { type: "system", text: "> javac MergeSort.java && java MergeSort" },
        { type: "out", text: "input:  [38, 27, 43, 3, 9, 82, 10]" },
        { type: "out", text: "sorted: [3, 9, 10, 27, 38, 43, 82]" },
        { type: "success", text: "✓ Process finished — exit 0" },
      ],
      stats: { time: "0.05s", mem: "14 MB", exit: "0" },
    },
    fib: {
      label: "🐰 Fibonacci", file: "Fib.java", meta: "Fib.main()",
      code: `// Bottom-up dynamic programming.
public class Fib {

    static long fib(int n) {
        if (n < 2) return n;
        long a = 0, b = 1;
        for (int i = 2; i <= n; i++) {
            long next = a + b;
            a = b;
            b = next;
        }
        return b;
    }

    public static void main(String[] args) {
        for (int n : new int[]{0, 1, 5, 10, 20, 50}) {
            System.out.println("fib(" + n + ") = " + fib(n));
        }
    }
}`,
      output: [
        { type: "system", text: "> javac Fib.java && java Fib" },
        { type: "out", text: "fib(0) = 0" },
        { type: "out", text: "fib(1) = 1" },
        { type: "out", text: "fib(5) = 5" },
        { type: "out", text: "fib(10) = 55" },
        { type: "out", text: "fib(20) = 6765" },
        { type: "out", text: "fib(50) = 12586269025" },
        { type: "success", text: "✓ Process finished — exit 0" },
      ],
      stats: { time: "0.04s", mem: "12 MB", exit: "0" },
    },
  },
  python: {
    hello: {
      label: "👋 Hello", file: "hello.py", meta: "hello.py · main",
      code: `# hello, future engineer.
name = "world"
print(f"hello, {name}!")

for i in range(1, 4):
    print(f"count {i}")`,
      output: [
        { type: "system", text: "$ python3 hello.py" },
        { type: "out", text: "hello, world!" },
        { type: "out", text: "count 1" },
        { type: "out", text: "count 2" },
        { type: "out", text: "count 3" },
        { type: "success", text: "✓ Process finished — exit 0" },
      ],
      stats: { time: "0.02s", mem: "8 MB", exit: "0" },
    },
    bsearch: {
      label: "🔍 Binary search", file: "binary_search.py", meta: "binary_search.py · main",
      code: `# O(log n) search on a sorted list.
def search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

data = [1, 3, 5, 7, 9, 11, 13, 17, 23, 31]
for k in [7, 23, 4, 31]:
    print(f"search({k}) -> index {search(data, k)}")`,
      output: [
        { type: "system", text: "$ python3 binary_search.py" },
        { type: "out", text: "search(7) -> index 3" },
        { type: "out", text: "search(23) -> index 8" },
        { type: "out", text: "search(4) -> index -1" },
        { type: "out", text: "search(31) -> index 9" },
        { type: "success", text: "✓ Process finished — exit 0" },
      ],
      stats: { time: "0.03s", mem: "8 MB", exit: "0" },
    },
    mergesort: {
      label: "🪜 Merge sort", file: "merge_sort.py", meta: "merge_sort.py · main",
      code: `# Classic divide-and-conquer. O(n log n).
def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left  = merge_sort(a[:mid])
    right = merge_sort(a[mid:])
    return merge(left, right)

def merge(l, r):
    out, i, j = [], 0, 0
    while i < len(l) and j < len(r):
        if l[i] <= r[j]:
            out.append(l[i]); i += 1
        else:
            out.append(r[j]); j += 1
    out.extend(l[i:])
    out.extend(r[j:])
    return out

data = [38, 27, 43, 3, 9, 82, 10]
print(f"input:  {data}")
print(f"sorted: {merge_sort(data)}")`,
      output: [
        { type: "system", text: "$ python3 merge_sort.py" },
        { type: "out", text: "input:  [38, 27, 43, 3, 9, 82, 10]" },
        { type: "out", text: "sorted: [3, 9, 10, 27, 38, 43, 82]" },
        { type: "success", text: "✓ Process finished — exit 0" },
      ],
      stats: { time: "0.03s", mem: "9 MB", exit: "0" },
    },
    fib: {
      label: "🐰 Fibonacci", file: "fib.py", meta: "fib.py · main",
      code: `# Bottom-up dynamic programming.
def fib(n):
    if n < 2:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

for n in (0, 1, 5, 10, 20, 50):
    print(f"fib({n}) = {fib(n)}")`,
      output: [
        { type: "system", text: "$ python3 fib.py" },
        { type: "out", text: "fib(0) = 0" },
        { type: "out", text: "fib(1) = 1" },
        { type: "out", text: "fib(5) = 5" },
        { type: "out", text: "fib(10) = 55" },
        { type: "out", text: "fib(20) = 6765" },
        { type: "out", text: "fib(50) = 12586269025" },
        { type: "success", text: "✓ Process finished — exit 0" },
      ],
      stats: { time: "0.02s", mem: "8 MB", exit: "0" },
    },
  },
};

const JAVA_KEYWORDS = new Set(["public","private","protected","static","final","void","class","interface","extends","implements","import","package","new","return","if","else","for","while","do","switch","case","break","continue","try","catch","finally","throw","throws","this","super","null","true","false","abstract","enum","instanceof"]);
const JAVA_TYPES = new Set(["int","long","short","byte","double","float","char","boolean","String","Object","Integer","Long","Boolean","Character","Double","Float","Arrays","List","Map","HashMap","ArrayList","System"]);
const PY_KEYWORDS = new Set(["def","return","if","else","elif","for","while","in","not","and","or","import","from","as","class","pass","break","continue","try","except","finally","raise","with","lambda","yield","global","nonlocal","None","True","False","is","async","await"]);
const PY_BUILTINS = new Set(["print","len","range","int","str","float","bool","list","dict","set","tuple","enumerate","zip","map","filter","sorted","reversed","sum","min","max","abs","round","open","input","type","isinstance"]);

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlight(code: string, lang: Lang): string {
  type Token = { type: string; val: string };
  const tokens: Token[] = [];
  let i = 0;
  const len = code.length;
  while (i < len) {
    const ch = code[i], next = code[i + 1];
    if ((lang === "java" && ch === "/" && next === "/") || (lang === "python" && ch === "#")) {
      let end = code.indexOf("\n", i); if (end === -1) end = len;
      tokens.push({ type: "comment", val: code.slice(i, end) }); i = end; continue;
    }
    if (lang === "java" && ch === "/" && next === "*") {
      let end = code.indexOf("*/", i + 2); if (end === -1) end = len; else end += 2;
      tokens.push({ type: "comment", val: code.slice(i, end) }); i = end; continue;
    }
    if (lang === "python" && (code.startsWith('"""', i) || code.startsWith("'''", i))) {
      const q = code.slice(i, i + 3);
      let end = code.indexOf(q, i + 3); if (end === -1) end = len; else end += 3;
      tokens.push({ type: "string", val: code.slice(i, end) }); i = end; continue;
    }
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      let start = i;
      if (lang === "python" && i > 0 && /[fr]/i.test(code[i - 1]) && tokens.length) {
        const last = tokens[tokens.length - 1];
        if (last.type === "plain" && /[fr]$/i.test(last.val)) { last.val = last.val.slice(0, -1); start = i - 1; }
      }
      while (j < len && code[j] !== ch) { if (code[j] === "\\") j += 2; else j++; }
      if (j < len) j++;
      tokens.push({ type: "string", val: code.slice(start, j) }); i = j; continue;
    }
    if (/[0-9]/.test(ch)) {
      let k = i; while (k < len && /[0-9.]/.test(code[k])) k++;
      tokens.push({ type: "number", val: code.slice(i, k) }); i = k; continue;
    }
    if (/[a-zA-Z_$]/.test(ch)) {
      let j = i; while (j < len && /[a-zA-Z0-9_$]/.test(code[j])) j++;
      const word = code.slice(i, j);
      let type = "plain";
      if (lang === "java") {
        if (JAVA_KEYWORDS.has(word)) type = "keyword";
        else if (JAVA_TYPES.has(word)) type = "type";
        else if (code[j] === "(") type = "fn";
      } else {
        if (PY_KEYWORDS.has(word)) type = "keyword";
        else if (PY_BUILTINS.has(word)) type = "builtin";
        else if (code[j] === "(") type = "fn";
      }
      tokens.push({ type, val: word }); i = j; continue;
    }
    tokens.push({ type: "plain", val: ch }); i++;
  }
  return tokens.map(t => {
    const s = escapeHtml(t.val);
    switch (t.type) {
      case "keyword": return `<span class="tok-keyword">${s}</span>`;
      case "string":  return `<span class="tok-string">${s}</span>`;
      case "comment": return `<span class="tok-comment">${s}</span>`;
      case "number":  return `<span class="tok-number">${s}</span>`;
      case "fn":      return `<span class="tok-fn">${s}</span>`;
      case "type":    return `<span class="tok-type">${s}</span>`;
      case "builtin": return `<span class="tok-builtin">${s}</span>`;
      default:        return s;
    }
  }).join("");
}

const STATUS_LABELS: Record<Status, string> = { idle: "Idle", running: "Running…", success: "Success", error: "Error" };

const SB_CSS = `
  :root {
    --sb-cream: #fff5dc; --sb-cream-deep: #f4e6bf; --sb-paper: #fffaef;
    --sb-ink: #1a1612; --sb-ink-soft: #4a4339; --sb-ink-faint: #8a8275;
    --sb-algo-deep: #6d3afc; --sb-pink: #ff6b9d; --sb-yellow: #fcc419;
    --sb-mint: #66d9a6; --sb-java: #ff8c5a; --sb-python: #5fb8e8;
    --tok-keyword: #6d3afc; --tok-string: #8b6914; --tok-comment: #8a8275;
    --tok-number: #c2410c; --tok-fn: #0891b2; --tok-type: #4d7c0f;
    --sb-shadow-sm: 3px 3px 0 var(--sb-ink); --sb-shadow: 6px 6px 0 var(--sb-ink); --sb-shadow-lg: 10px 10px 0 var(--sb-ink);
  }
  .sb-root { font-family: 'DM Sans', system-ui, sans-serif; color: var(--sb-ink); }
  .sb-deco { position: absolute; pointer-events: none; z-index: 0; }

  .sb-page-head { max-width: 1320px; margin: 0 auto; padding: 40px 40px 24px; }
  .sb-breadcrumb { font-size: 13px; color: var(--sb-ink-soft); margin-bottom: 18px; font-weight: 600; }
  .sb-breadcrumb a { color: var(--sb-ink-soft); text-decoration: none; cursor: pointer; }
  .sb-breadcrumb a:hover { color: var(--sb-ink); }
  .sb-breadcrumb .sb-sep { margin: 0 8px; color: var(--sb-ink-faint); }
  .sb-breadcrumb .sb-here { color: var(--sb-ink); }
  .sb-page-title { font-family: var(--font-bricolage, 'Bricolage Grotesque', serif); font-weight: 700; font-size: clamp(40px,6vw,64px); letter-spacing: -0.03em; line-height: 1; }
  .sb-squiggle { color: var(--sb-algo-deep); font-style: italic; font-weight: 600; position: relative; display: inline-block; }
  .sb-squiggle::after {
    content: ''; position: absolute; left: 0; right: 0; bottom: -4px; height: 10px;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 14'><path d='M2 8 Q 25 -2 50 6 T 100 6 T 150 6 T 198 6' fill='none' stroke='%23fcc419' stroke-width='4' stroke-linecap='round'/></svg>");
    background-repeat: no-repeat; background-size: 100% 100%;
  }
  .sb-tag-line { font-size: 17px; color: var(--sb-ink-soft); margin-top: 14px; max-width: 620px; }

  .sb-lang-row {
    max-width: 1320px; margin: 0 auto; padding: 8px 40px 0;
    display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;
  }
  .sb-segmented {
    position: relative; display: inline-flex;
    background: var(--sb-paper); border: 2.5px solid var(--sb-ink);
    border-radius: 14px; padding: 5px; box-shadow: var(--sb-shadow);
  }
  .sb-seg-indicator {
    position: absolute; top: 5px; bottom: 5px;
    background: var(--sb-ink); border-radius: 9px;
    transition: left 0.32s cubic-bezier(.5,1.6,.4,1), width 0.32s cubic-bezier(.5,1.6,.4,1);
    z-index: 0;
  }
  .sb-seg {
    position: relative; z-index: 1; background: transparent; border: none;
    font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 14px;
    color: var(--sb-ink); padding: 9px 18px; border-radius: 9px;
    cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
    transition: color 0.32s ease;
  }
  .sb-seg .sb-icon-circle {
    width: 22px; height: 22px; border: 2px solid var(--sb-ink);
    border-radius: 50%; display: grid; place-items: center;
    font-size: 11px; font-weight: 800; background: var(--sb-paper);
    transition: background 0.32s ease;
  }
  .sb-seg[data-lang="java"] .sb-icon-circle { background: var(--sb-java); }
  .sb-seg[data-lang="python"] .sb-icon-circle { background: var(--sb-python); }
  .sb-seg.sb-active { color: var(--sb-paper); }
  .sb-seg.sb-active .sb-icon-circle { border-color: var(--sb-paper); }

  .sb-examples { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .sb-examples-label { font-family: var(--font-jetbrains,'JetBrains Mono',monospace); font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--sb-ink-soft); margin-right: 4px; }
  .sb-chip {
    background: var(--sb-paper); border: 2px solid var(--sb-ink); border-radius: 999px;
    padding: 7px 13px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 13px;
    cursor: pointer; transition: transform 0.12s ease, background 0.18s ease;
    box-shadow: 2px 2px 0 var(--sb-ink); color: var(--sb-ink);
    display: inline-flex; align-items: center; gap: 6px;
  }
  .sb-chip:hover { transform: translate(-1.5px,-1.5px); box-shadow: 3.5px 3.5px 0 var(--sb-ink); }
  .sb-chip.sb-active { background: var(--sb-yellow); }

  .sb-workspace {
    max-width: 1320px; margin: 0 auto; padding: 28px 40px 80px;
    display: grid; grid-template-columns: 1.25fr 1fr; gap: 28px; align-items: start;
  }
  .sb-panel {
    background: var(--sb-paper); border: 2.5px solid var(--sb-ink);
    border-radius: 18px; box-shadow: var(--sb-shadow-lg);
    overflow: hidden; position: relative;
    transition: transform 0.3s cubic-bezier(.2,.8,.3,1);
  }
  .sb-panel.sb-editor { transform: rotate(-0.4deg); }
  .sb-panel.sb-console { transform: rotate(0.4deg); }

  .sb-panel-tabs {
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 2.5px solid var(--sb-ink); background: var(--sb-cream-deep); padding: 0 16px 0 0;
  }
  .sb-file-tab {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 14px 20px 14px 22px; background: var(--sb-paper);
    border-right: 2.5px solid var(--sb-ink);
    font-family: var(--font-jetbrains,'JetBrains Mono',monospace);
    font-size: 13px; font-weight: 600; color: var(--sb-ink);
  }
  .sb-lang-dot { width: 11px; height: 11px; border: 2px solid var(--sb-ink); border-radius: 50%; }
  .sb-file-tab.java .sb-lang-dot { background: var(--sb-java); }
  .sb-file-tab.python .sb-lang-dot { background: var(--sb-python); }
  .sb-traffic { display: inline-flex; gap: 6px; padding: 0 14px; }
  .sb-traffic span { width: 11px; height: 11px; border: 1.5px solid var(--sb-ink); border-radius: 50%; }
  .sb-traffic .r { background: #ff6b6b; } .sb-traffic .y { background: var(--sb-yellow); } .sb-traffic .g { background: var(--sb-mint); }
  .sb-editor-tools { display: inline-flex; gap: 8px; align-items: center; }
  .sb-tool {
    background: var(--sb-paper); border: 2px solid var(--sb-ink); border-radius: 8px;
    padding: 5px 9px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
    cursor: pointer; box-shadow: 2px 2px 0 var(--sb-ink);
    transition: transform 0.12s ease; display: inline-flex; align-items: center; gap: 5px; color: var(--sb-ink);
  }
  .sb-tool:hover { transform: translate(-1.5px,-1.5px); box-shadow: 3.5px 3.5px 0 var(--sb-ink); }
  .sb-tool:active { transform: translate(0.5px,0.5px); box-shadow: 1px 1px 0 var(--sb-ink); }

  .sb-editor-body {
    position: relative; background: var(--sb-paper);
    background-image: radial-gradient(circle at 1px 1px, rgba(26,22,18,0.06) 1px, transparent 0);
    background-size: 22px 22px; min-height: 460px; max-height: 580px; overflow: auto;
  }
  .sb-editor-grid { display: grid; grid-template-columns: 52px 1fr; min-height: 100%; }
  .sb-gutter {
    background: rgba(244,230,191,0.55); border-right: 1.5px dashed rgba(26,22,18,0.18);
    font-family: var(--font-jetbrains,'JetBrains Mono',monospace); font-size: 13.5px; line-height: 1.65;
    color: var(--sb-ink-faint); padding: 18px 0; text-align: right; user-select: none;
  }
  .sb-gutter span { display: block; padding-right: 14px; transition: color 0.2s ease; }
  .sb-gutter span.cur { color: var(--sb-ink); font-weight: 700; }
  .sb-code-wrap { position: relative; }
  .sb-code-wrap textarea, .sb-code-wrap pre {
    margin: 0; padding: 18px 22px; border: 0;
    font-family: var(--font-jetbrains,'JetBrains Mono',monospace);
    font-size: 13.5px; line-height: 1.65; tab-size: 4; -moz-tab-size: 4;
    white-space: pre; word-wrap: normal; overflow-wrap: normal;
  }
  .sb-code-wrap pre { position: relative; pointer-events: none; color: var(--sb-ink); background: transparent; overflow: visible; }
  .sb-code-wrap textarea {
    position: absolute; inset: 0; width: 100%; height: 100%;
    background: transparent; color: transparent;
    caret-color: var(--sb-algo-deep); resize: none; outline: none; overflow: hidden; z-index: 2;
  }
  .sb-code-wrap textarea::selection { background: rgba(109,58,252,0.22); }
  .tok-keyword { color: var(--tok-keyword); font-weight: 700; }
  .tok-string  { color: var(--tok-string); }
  .tok-comment { color: var(--tok-comment); font-style: italic; }
  .tok-number  { color: var(--tok-number); font-weight: 600; }
  .tok-fn      { color: var(--tok-fn); font-weight: 600; }
  .tok-type    { color: var(--tok-type); font-weight: 600; }
  .tok-builtin { color: var(--tok-fn); font-weight: 600; }

  .sb-run-strip {
    display: flex; align-items: center; justify-content: space-between;
    border-top: 2.5px solid var(--sb-ink); background: var(--sb-cream-deep);
    padding: 14px 18px; gap: 12px; flex-wrap: wrap;
  }
  .sb-run-meta { font-family: var(--font-jetbrains,'JetBrains Mono',monospace); font-size: 11.5px; color: var(--sb-ink-soft); font-weight: 600; display: inline-flex; align-items: center; gap: 12px; }
  .sb-run-meta .sb-dot { width: 8px; height: 8px; background: var(--sb-mint); border: 1.5px solid var(--sb-ink); border-radius: 50%; }
  .sb-run-btn {
    background: var(--sb-ink); color: var(--sb-paper);
    border: 2.5px solid var(--sb-ink); border-radius: 11px;
    padding: 11px 22px; font-family: 'DM Sans', sans-serif;
    font-weight: 700; font-size: 15px; cursor: pointer;
    box-shadow: var(--sb-shadow); transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.2s ease;
    display: inline-flex; align-items: center; gap: 9px;
  }
  .sb-run-btn:hover { transform: translate(-2px,-2px); box-shadow: 8px 8px 0 var(--sb-ink); background: var(--sb-algo-deep); }
  .sb-run-btn:active { transform: translate(1px,1px); box-shadow: 1px 1px 0 var(--sb-ink); }
  .sb-run-btn:disabled { background: var(--sb-ink-faint); border-color: var(--sb-ink-faint); cursor: wait; box-shadow: var(--sb-shadow-sm); transform: none; }
  .sb-play { width: 22px; height: 22px; background: var(--sb-mint); border: 2px solid var(--sb-paper); border-radius: 50%; display: grid; place-items: center; font-size: 9px; }

  .sb-console-head { display: flex; align-items: center; justify-content: space-between; border-bottom: 2.5px solid var(--sb-ink); background: var(--sb-cream-deep); padding: 0; padding-right: 14px; }
  .sb-console-title { display: inline-flex; align-items: center; gap: 10px; padding: 14px 20px; background: var(--sb-paper); border-right: 2.5px solid var(--sb-ink); font-family: var(--font-jetbrains,'JetBrains Mono',monospace); font-size: 13px; font-weight: 600; }
  .sb-terminal-icon { width: 18px; height: 18px; background: var(--sb-ink); color: var(--sb-mint); border-radius: 4px; display: grid; place-items: center; font-size: 11px; font-weight: 700; font-family: var(--font-jetbrains,'JetBrains Mono',monospace); }
  .sb-console-status { font-family: var(--font-jetbrains,'JetBrains Mono',monospace); font-size: 11.5px; font-weight: 600; color: var(--sb-ink-soft); display: inline-flex; align-items: center; gap: 8px; transition: color 0.2s ease; }
  .sb-console-status .sb-pulse { width: 9px; height: 9px; border-radius: 50%; border: 1.5px solid var(--sb-ink); background: var(--sb-ink-faint); transition: background 0.2s ease; }
  .sb-console-status.idle .sb-pulse { background: var(--sb-ink-faint); }
  .sb-console-status.running .sb-pulse { background: var(--sb-yellow); animation: sb-blink 0.8s ease-in-out infinite; }
  .sb-console-status.success .sb-pulse { background: var(--sb-mint); }
  .sb-console-status.error .sb-pulse { background: #ff6b6b; }
  @keyframes sb-blink { 50% { opacity: 0.3; } }

  .sb-console-body {
    background: var(--sb-ink); color: var(--sb-paper);
    padding: 22px 24px; font-family: var(--font-jetbrains,'JetBrains Mono',monospace);
    font-size: 13.5px; line-height: 1.65;
    min-height: 460px; max-height: 580px; overflow: auto; position: relative;
    background-image: radial-gradient(circle at 1px 1px, rgba(255,245,220,0.04) 1px, transparent 0);
    background-size: 22px 22px;
  }
  .sb-console-body::-webkit-scrollbar { width: 10px; height: 10px; }
  .sb-console-body::-webkit-scrollbar-track { background: transparent; }
  .sb-console-body::-webkit-scrollbar-thumb { background: rgba(255,245,220,0.18); border-radius: 5px; }

  .sb-console-line { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 2px; animation: sb-line-in 0.2s ease both; }
  @keyframes sb-line-in { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }
  .sb-console-line .sb-lno { color: rgba(255,245,220,0.32); min-width: 22px; text-align: right; user-select: none; flex-shrink: 0; }
  .sb-console-line .sb-content { flex: 1; white-space: pre-wrap; word-break: break-word; }
  .sb-console-line.system .sb-content { color: var(--sb-yellow); font-style: italic; }
  .sb-console-line.error .sb-content  { color: #ff8a8a; }
  .sb-console-line.success .sb-content { color: var(--sb-mint); }
  .sb-console-line.muted .sb-content  { color: rgba(255,245,220,0.5); font-style: italic; }
  .sb-console-prompt { color: var(--sb-mint); user-select: none; }

  .sb-empty-state { color: rgba(255,245,220,0.5); font-style: italic; text-align: center; padding: 60px 20px 0; }
  .sb-empty-state .sb-big { font-family: var(--font-bricolage,'Bricolage Grotesque',serif); font-style: normal; font-size: 38px; color: var(--sb-paper); margin-bottom: 12px; letter-spacing: -0.02em; }
  .sb-empty-state .sb-small { font-family: var(--font-jetbrains,'JetBrains Mono',monospace); font-size: 12px; color: rgba(255,245,220,0.45); letter-spacing: 0.06em; }
  .sb-empty-state kbd { background: rgba(255,245,220,0.12); border: 1px solid rgba(255,245,220,0.3); border-radius: 4px; padding: 2px 7px; font-family: var(--font-jetbrains,'JetBrains Mono',monospace); font-size: 11px; color: var(--sb-paper); }

  .sb-console-foot {
    border-top: 2.5px solid var(--sb-ink); background: var(--sb-cream-deep);
    padding: 10px 18px; display: flex; justify-content: space-between; align-items: center;
    font-family: var(--font-jetbrains,'JetBrains Mono',monospace); font-size: 11px; font-weight: 600;
    color: var(--sb-ink-soft); flex-wrap: wrap; gap: 8px;
  }
  .sb-stats-pills { display: inline-flex; gap: 6px; }
  .sb-stats-pill { background: var(--sb-paper); border: 1.5px solid var(--sb-ink); border-radius: 999px; padding: 3px 10px; color: var(--sb-ink); letter-spacing: 0.04em; }
  .sb-panel-sticker {
    position: absolute; top: -12px; right: 22px;
    background: var(--sb-mint); color: var(--sb-ink);
    border: 2.5px solid var(--sb-ink); padding: 5px 10px; border-radius: 999px;
    font-size: 10.5px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase;
    transform: rotate(8deg); box-shadow: 2px 2px 0 var(--sb-ink); z-index: 5;
  }
  .sb-panel-sticker.sb-console { background: var(--sb-yellow); transform: rotate(-7deg); right: auto; left: 22px; }

  @media (max-width: 980px) {
    .sb-workspace { grid-template-columns: 1fr !important; gap: 36px; }
    .sb-panel.sb-editor, .sb-panel.sb-console { transform: rotate(0) !important; }
  }
  @media (max-width: 600px) {
    .sb-nav { padding: 16px 20px; }
    .sb-page-head { padding: 24px 20px 12px; }
    .sb-lang-row { padding: 8px 20px 0; }
    .sb-workspace { padding: 20px 20px 60px; }
    .sb-traffic { display: none; }
    .sb-editor-body, .sb-console-body { max-height: 420px; }
  }
`;

export function SandboxPage() {
  const [currentLang, setCurrentLang] = useState<Lang>("java");
  const [currentExample, setCurrentExample] = useState("bsearch");
  const [code, setCode] = useState(() => EXAMPLES.java.bsearch.code);
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [stats, setStats] = useState<{ time: string; mem: string; exit: string } | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copy");
  const [cursorLine, setCursorLine] = useState(1);
  const [indLeft, setIndLeft] = useState(5);
  const [indWidth, setIndWidth] = useState(0);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const consoleBodyRef = useRef<HTMLDivElement>(null);
  const javaSegRef = useRef<HTMLButtonElement>(null);
  const pythonSegRef = useRef<HTMLButtonElement>(null);
  const segContainerRef = useRef<HTMLDivElement>(null);
  const isRunningRef = useRef(false);

  const moveLangIndicator = useCallback(() => {
    const container = segContainerRef.current;
    const activeBtn = currentLang === "java" ? javaSegRef.current : pythonSegRef.current;
    if (!container || !activeBtn) return;
    const cRect = container.getBoundingClientRect();
    const bRect = activeBtn.getBoundingClientRect();
    setIndLeft(bRect.left - cRect.left);
    setIndWidth(bRect.width);
  }, [currentLang]);

  useEffect(() => { moveLangIndicator(); }, [moveLangIndicator]);
  useEffect(() => { window.addEventListener("resize", moveLangIndicator); return () => window.removeEventListener("resize", moveLangIndicator); }, [moveLangIndicator]);

  const updateCursorLine = useCallback(() => {
    if (!editorRef.current) return;
    const pos = editorRef.current.selectionStart;
    const line = editorRef.current.value.slice(0, pos).split("\n").length;
    setCursorLine(line);
  }, []);

  const handleCodeChange = useCallback((val: string) => { setCode(val); }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart, end = ta.selectionEnd;
      const newVal = ta.value.slice(0, start) + "    " + ta.value.slice(end);
      setCode(newVal);
      requestAnimationFrame(() => { if (editorRef.current) { editorRef.current.selectionStart = editorRef.current.selectionEnd = start + 4; } });
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); handleRun(); }
  }, []);  // eslint-disable-line

  const handleLangChange = (lang: Lang) => {
    setCurrentLang(lang);
    const nextKey = EXAMPLES[lang][currentExample] ? currentExample : Object.keys(EXAMPLES[lang])[0];
    setCurrentExample(nextKey);
    setCode(EXAMPLES[lang][nextKey].code);
    setConsoleLines([]); setStatus("idle"); setStats(null);
    isRunningRef.current = false;
  };

  const handleExampleSelect = (key: string) => {
    setCurrentExample(key);
    setCode(EXAMPLES[currentLang][key].code);
    setConsoleLines([]); setStatus("idle"); setStats(null);
    isRunningRef.current = false;
  };

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(code); setCopyLabel("Copied!"); setTimeout(() => setCopyLabel("Copy"), 1400); }
    catch { editorRef.current?.select(); }
  };

  const handleReset = () => {
    setCode(EXAMPLES[currentLang][currentExample].code);
    setConsoleLines([]); setStatus("idle"); setStats(null);
    isRunningRef.current = false;
  };

  const handleClear = () => { setConsoleLines([]); setStatus("idle"); setStats(null); };

  const handleRun = useCallback(async () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setStatus("running"); setConsoleLines([]); setStats(null);

    const ex = EXAMPLES[currentLang][currentExample];
    const lines = ex.output;
    const finalStats = ex.stats;

    let outIdx = 1;
    for (const ln of lines) {
      const delay = ln.type === "system" ? 220 : ln.type === "success" ? 280 : ln.type === "muted" ? 200 : 110 + Math.random() * 80;
      await new Promise<void>(r => setTimeout(r, delay));
      const lineNum = ln.type === "out" ? outIdx++ : undefined;
      setConsoleLines(prev => [...prev, { ...ln, _lineNum: lineNum } as ConsoleLine & { _lineNum?: number }]);
      if (consoleBodyRef.current) consoleBodyRef.current.scrollTop = consoleBodyRef.current.scrollHeight;
    }

    setStatus("success"); setStats(finalStats);
    isRunningRef.current = false;
  }, [currentLang, currentExample]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); handleRun(); } };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleRun]);

  const ex = EXAMPLES[currentLang][currentExample];
  const lineCount = code.split("\n").length;
  const highlightedCode = highlight(code, currentLang) + (code.endsWith("\n") ? "\n" : "");

  let outIdx = 0;
  const renderedLines = consoleLines.map((ln, i) => {
    let lno: string | number = "";
    if (ln.type === "system") lno = "·";
    else if (ln.type === "success") lno = "✓";
    else if (ln.type === "error") lno = "✗";
    else if (ln.type === "out") lno = ++outIdx;
    return (
      <div key={i} className={`sb-console-line ${ln.type}`}>
        <span className="sb-lno">{lno}</span>
        <span className="sb-content">{ln.text}</span>
      </div>
    );
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SB_CSS }} />

      <svg className="sb-deco" style={{ top: 160, left: 28, opacity: 0.55 }} width="42" height="42" viewBox="0 0 42 42">
        <path d="M21 4 L25 17 L38 21 L25 25 L21 38 L17 25 L4 21 L17 17 Z" fill="#fcc419" stroke="#1a1612" strokeWidth="2.2" strokeLinejoin="round"/>
      </svg>
      <svg className="sb-deco" style={{ top: 320, right: 50 }} width="48" height="20" viewBox="0 0 48 20">
        <path d="M2 10 Q 10 -2 18 10 T 34 10 T 46 10" fill="none" stroke="#5fb8e8" strokeWidth="3" strokeLinecap="round"/>
      </svg>
      <svg className="sb-deco" style={{ bottom: 200, left: 36 }} width="38" height="38" viewBox="0 0 38 38">
        <rect x="6" y="6" width="26" height="26" rx="6" fill="#ff8c5a" stroke="#1a1612" strokeWidth="2.2" transform="rotate(12 19 19)"/>
      </svg>

      {/* PAGE HEAD */}
      <section className="sb-page-head sb-root">
        <div className="sb-breadcrumb">
          <a>Library</a><span className="sb-sep">/</span><span className="sb-here">Sandbox</span>
        </div>
        <div>
          <h1 className="sb-page-title">The <span className="sb-squiggle">sandbox</span> 🛠️</h1>
          <p className="sb-tag-line">A scratchpad for the things you&apos;d rather <em>see</em> work than read about. Two languages, four examples each, real output.</p>
        </div>
      </section>

      {/* LANGUAGE + EXAMPLES */}
      <section className="sb-lang-row sb-root">
        <div className="sb-segmented" ref={segContainerRef}>
          <span className="sb-seg-indicator" style={{ left: indLeft, width: indWidth }} />
          <button ref={javaSegRef} className={`sb-seg${currentLang === "java" ? " sb-active" : ""}`} data-lang="java" onClick={() => handleLangChange("java")}>
            <span className="sb-icon-circle">J</span> Java
          </button>
          <button ref={pythonSegRef} className={`sb-seg${currentLang === "python" ? " sb-active" : ""}`} data-lang="python" onClick={() => handleLangChange("python")}>
            <span className="sb-icon-circle">Py</span> Python
          </button>
        </div>
        <div className="sb-examples">
          <span className="sb-examples-label">Examples ↓</span>
          {Object.entries(EXAMPLES[currentLang]).map(([key, e]) => (
            <button key={key} className={`sb-chip${key === currentExample ? " sb-active" : ""}`} onClick={() => handleExampleSelect(key)}>
              {e.label}
            </button>
          ))}
        </div>
      </section>

      {/* WORKSPACE */}
      <section className="sb-workspace sb-root">

        {/* EDITOR PANEL */}
        <div className="sb-panel sb-editor">
          <span className="sb-panel-sticker">⚡ LIVE</span>
          <div className="sb-panel-tabs">
            <div className={`sb-file-tab ${currentLang}`}>
              <span className="sb-lang-dot" />
              <span>{ex.file}</span>
            </div>
            <div className="sb-traffic"><span className="r" /><span className="y" /><span className="g" /></div>
            <div className="sb-editor-tools">
              <button className="sb-tool" onClick={handleCopy}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                <span>{copyLabel}</span>
              </button>
              <button className="sb-tool" onClick={handleReset}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
                Reset
              </button>
            </div>
          </div>

          <div className="sb-editor-body">
            <div className="sb-editor-grid">
              <div className="sb-gutter">
                {Array.from({ length: lineCount }, (_, i) => (
                  <span key={i} className={i + 1 === cursorLine ? "cur" : ""}>{i + 1}</span>
                ))}
              </div>
              <div className="sb-code-wrap">
                <pre><code dangerouslySetInnerHTML={{ __html: highlightedCode }} /></pre>
                <textarea
                  ref={editorRef}
                  value={code}
                  onChange={e => handleCodeChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onKeyUp={updateCursorLine}
                  onClick={updateCursorLine}
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                />
              </div>
            </div>
          </div>

          <div className="sb-run-strip">
            <div className="sb-run-meta">
              <span className="sb-dot" />
              <span>Ready · {ex.meta}</span>
            </div>
            <button className="sb-run-btn" onClick={handleRun} disabled={status === "running"}>
              <span className="sb-play">▶</span>
              <span>{status === "running" ? "Running…" : "Run code"}</span>
              <kbd style={{ fontFamily: "inherit", fontSize: 10, opacity: 0.7, marginLeft: 4, padding: "2px 6px", background: "rgba(255,255,255,0.12)", borderRadius: 4 }}>⌘ ↵</kbd>
            </button>
          </div>
        </div>

        {/* CONSOLE PANEL */}
        <div className="sb-panel sb-console">
          <span className="sb-panel-sticker sb-console">⌨️ TERMINAL</span>
          <div className="sb-console-head">
            <div className="sb-console-title">
              <span className="sb-terminal-icon">$</span>
              <span>output.log</span>
            </div>
            <div className={`sb-console-status ${status}`}>
              <span className="sb-pulse" />
              <span>{STATUS_LABELS[status]}</span>
            </div>
          </div>

          <div className="sb-console-body" ref={consoleBodyRef}>
            {consoleLines.length === 0 ? (
              <div className="sb-empty-state">
                <div className="sb-big">↻ Press Run</div>
                <div className="sb-small">or hit <kbd>⌘</kbd>+<kbd>↵</kbd> to execute</div>
              </div>
            ) : renderedLines}
          </div>

          <div className="sb-console-foot">
            <div className="sb-stats-pills">
              <span className="sb-stats-pill">⏱ {stats?.time ?? "—"}</span>
              <span className="sb-stats-pill">📦 {stats?.mem ?? "—"}</span>
              <span className="sb-stats-pill">↳ exit {stats?.exit ?? "—"}</span>
            </div>
            <button className="sb-tool" onClick={handleClear}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Clear
            </button>
          </div>
        </div>

      </section>
    </>
  );
}
