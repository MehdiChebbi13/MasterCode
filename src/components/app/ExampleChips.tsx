"use client";

export type OutputLineType = "system" | "out" | "success" | "error" | "muted";

export interface ConsoleLine {
  type: OutputLineType;
  text: string;
}

export interface Example {
  label: string;
  file: string;
  meta: string;
  code: string;
  output: ConsoleLine[];
  stats: { time: string; mem: string; exit: string };
}

export const EXAMPLES: Record<"java" | "python", Record<string, Example>> = {
  java: {
    hello: {
      label: "👋 Hello",
      file: "Hello.java",
      meta: "Hello.main()",
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
      label: "🔍 Binary search",
      file: "BinarySearch.java",
      meta: "BinarySearch.main()",
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
      label: "🪜 Merge sort",
      file: "MergeSort.java",
      meta: "MergeSort.main()",
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
      label: "🐰 Fibonacci",
      file: "Fib.java",
      meta: "Fib.main()",
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
      label: "👋 Hello",
      file: "hello.py",
      meta: "hello.py · main",
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
      label: "🔍 Binary search",
      file: "binary_search.py",
      meta: "binary_search.py · main",
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
      label: "🪜 Merge sort",
      file: "merge_sort.py",
      meta: "merge_sort.py · main",
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
      label: "🐰 Fibonacci",
      file: "fib.py",
      meta: "fib.py · main",
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

export function ExampleChips({
  language,
  currentKey,
  onSelect,
}: {
  language: "java" | "python";
  currentKey: string;
  onSelect: (key: string) => void;
}) {
  const exs = EXAMPLES[language];
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <span
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--ink-soft)",
          marginRight: 4,
        }}
      >
        Examples ↓
      </span>
      {Object.entries(exs).map(([key, ex]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          style={{
            background: key === currentKey ? "var(--ds-yellow)" : "var(--paper)",
            border: "2px solid var(--ink)",
            borderRadius: 999,
            padding: "7px 13px",
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            transition: "transform 0.12s ease, background 0.18s ease",
            boxShadow: "2px 2px 0 var(--ink)",
            color: "var(--ink)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translate(-1.5px, -1.5px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "3.5px 3.5px 0 var(--ink)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = "none";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "2px 2px 0 var(--ink)";
          }}
        >
          {ex.label}
        </button>
      ))}
    </div>
  );
}
