import type { Course, Flashcard, Summary } from "@/types";

const ALGO_ID = "course_algo";
const OS_ID = "course_os";
const DB_ID = "course_db";
const NET_ID = "course_net";

export const SEED_COURSES: Course[] = [
  {
    id: ALGO_ID,
    name: "Algorithms",
    code: "CS 161",
    color: "#7c3aed",
    emoji: "⚙️",
    description: "Asymptotic analysis, divide-and-conquer, dynamic programming, graphs.",
    createdAt: "2026-01-12T15:30:00.000Z",
    lastStudiedAt: "2026-05-06T09:14:00.000Z",
  },
  {
    id: OS_ID,
    name: "Operating Systems",
    code: "CS 162",
    color: "#0ea5e9",
    emoji: "🖥️",
    description: "Processes, threads, scheduling, memory, file systems, concurrency.",
    createdAt: "2026-01-15T17:00:00.000Z",
    lastStudiedAt: "2026-05-04T20:02:00.000Z",
  },
  {
    id: DB_ID,
    name: "Databases",
    code: "CS 186",
    color: "#10b981",
    emoji: "🗃️",
    description: "Relational model, SQL, indexing, query optimization, transactions.",
    createdAt: "2026-02-02T13:45:00.000Z",
    lastStudiedAt: "2026-05-07T11:30:00.000Z",
  },
  {
    id: NET_ID,
    name: "Computer Networks",
    code: "CS 168",
    color: "#f59e0b",
    emoji: "🌐",
    description: "Layered architecture, TCP/IP, routing, congestion control, DNS.",
    createdAt: "2026-02-10T10:15:00.000Z",
  },
];

export const SEED_FLASHCARDS: Flashcard[] = [
  {
    id: "fc_algo_1",
    courseId: ALGO_ID,
    front: "What is the worst-case time complexity of quicksort?",
    back: "O(n²) — when partitions are extremely unbalanced (e.g. already-sorted input with naive pivot choice). Randomized or median-of-three pivots make this vanishingly rare.",
    tags: ["sorting", "complexity"],
    reviewHistory: [{ reviewedAt: "2026-05-01T18:00:00.000Z", difficulty: 3 }],
  },
  {
    id: "fc_algo_2",
    courseId: ALGO_ID,
    front: "Define the Master Theorem.",
    back: "For T(n) = aT(n/b) + f(n) with a ≥ 1, b > 1: compare f(n) to n^(log_b a). Three cases govern whether the recursion or the combine step dominates.",
    tags: ["recurrences", "analysis"],
    reviewHistory: [],
  },
  {
    id: "fc_algo_3",
    courseId: ALGO_ID,
    front: "When does dynamic programming apply?",
    back: "When a problem has overlapping subproblems and optimal substructure. Memoize subproblem solutions to avoid recomputation.",
    tags: ["dp"],
    reviewHistory: [],
  },
  {
    id: "fc_algo_4",
    courseId: ALGO_ID,
    front: "Difference between BFS and DFS traversal order?",
    back: "BFS uses a FIFO queue and explores by distance from source (shortest path in unweighted graphs). DFS uses a stack/recursion and explores depth-first (useful for topological sort, cycle detection).",
    tags: ["graphs"],
    reviewHistory: [{ reviewedAt: "2026-05-05T22:00:00.000Z", difficulty: 2 }],
  },
  {
    id: "fc_algo_5",
    courseId: ALGO_ID,
    front: "What does Dijkstra's algorithm assume about edge weights?",
    back: "Non-negative edge weights. With negative edges use Bellman-Ford instead.",
    tags: ["graphs", "shortest-path"],
    reviewHistory: [],
  },
  {
    id: "fc_algo_6",
    courseId: ALGO_ID,
    front: "Greedy vs DP — when is greedy correct?",
    back: "When the problem exhibits the greedy-choice property: a locally optimal choice leads to a globally optimal solution. Proof typically by exchange argument.",
    tags: ["greedy", "dp"],
    reviewHistory: [],
  },

  {
    id: "fc_os_1",
    courseId: OS_ID,
    front: "Process vs thread — what's shared?",
    back: "Threads share address space, file descriptors, and signal handlers within a process. Processes are isolated; threads aren't.",
    tags: ["processes", "threads"],
    reviewHistory: [],
  },
  {
    id: "fc_os_2",
    courseId: OS_ID,
    front: "Define a race condition.",
    back: "A bug where the result depends on non-deterministic interleaving of operations on shared state. Fix with mutual exclusion (locks, atomics, message passing).",
    tags: ["concurrency"],
    reviewHistory: [{ reviewedAt: "2026-05-03T14:00:00.000Z", difficulty: 4 }],
  },
  {
    id: "fc_os_3",
    courseId: OS_ID,
    front: "Why do we use page tables?",
    back: "To translate virtual addresses to physical, allow non-contiguous physical allocation, enforce protection/isolation, and enable demand paging.",
    tags: ["memory", "paging"],
    reviewHistory: [],
  },
  {
    id: "fc_os_4",
    courseId: OS_ID,
    front: "What is a context switch?",
    back: "Saving the CPU state (registers, PC, stack pointer) of the running thread and restoring another's. Costly enough that schedulers minimize unnecessary switches.",
    tags: ["scheduling"],
    reviewHistory: [],
  },
  {
    id: "fc_os_5",
    courseId: OS_ID,
    front: "Spinlock vs mutex?",
    back: "Spinlocks busy-wait (cheap if hold time is short, terrible if long). Mutexes block the thread (involves the scheduler, higher fixed cost). Use spinlocks in kernels with short critical sections; mutexes for general user-space code.",
    tags: ["concurrency", "locks"],
    reviewHistory: [],
  },
  {
    id: "fc_os_6",
    courseId: OS_ID,
    front: "What does fork() return?",
    back: "Twice: the child sees 0, the parent sees the child's PID. -1 on failure (only the parent sees this).",
    tags: ["unix"],
    reviewHistory: [],
  },

  {
    id: "fc_db_1",
    courseId: DB_ID,
    front: "What are the ACID properties?",
    back: "Atomicity, Consistency, Isolation, Durability. The classical correctness guarantees for transactions.",
    tags: ["transactions"],
    reviewHistory: [{ reviewedAt: "2026-05-07T11:30:00.000Z", difficulty: 1 }],
  },
  {
    id: "fc_db_2",
    courseId: DB_ID,
    front: "B+ tree vs hash index — when do you pick which?",
    back: "B+ tree supports range queries and ordered scans; hash is faster for equality-only lookups but useless for ranges. Most general-purpose primary indexes are B+ trees.",
    tags: ["indexing"],
    reviewHistory: [],
  },
  {
    id: "fc_db_3",
    courseId: DB_ID,
    front: "What does a query planner do?",
    back: "Translates a SQL query into a physical plan: choose join order, join algorithms (hash/merge/nested loop), index vs scan. Uses statistics to estimate cost.",
    tags: ["query-optimization"],
    reviewHistory: [],
  },
  {
    id: "fc_db_4",
    courseId: DB_ID,
    front: "Define normal forms 1NF, 2NF, 3NF briefly.",
    back: "1NF: atomic values. 2NF: 1NF + every non-key attribute fully depends on the whole primary key. 3NF: 2NF + no transitive dependencies (non-key → non-key).",
    tags: ["normalization"],
    reviewHistory: [],
  },
  {
    id: "fc_db_5",
    courseId: DB_ID,
    front: "What is write-ahead logging (WAL)?",
    back: "Before applying a change to data pages, write the log record to durable storage. Guarantees durability + enables crash recovery via redo/undo.",
    tags: ["recovery"],
    reviewHistory: [],
  },

  {
    id: "fc_net_1",
    courseId: NET_ID,
    front: "OSI layers, top to bottom?",
    back: "Application, Presentation, Session, Transport, Network, Data Link, Physical. The internet stack collapses Application/Presentation/Session into one.",
    tags: ["architecture"],
    reviewHistory: [],
  },
  {
    id: "fc_net_2",
    courseId: NET_ID,
    front: "TCP vs UDP — pick three differences.",
    back: "(1) TCP is connection-oriented; UDP is not. (2) TCP guarantees in-order, reliable delivery; UDP doesn't. (3) TCP has flow + congestion control; UDP is fire-and-forget.",
    tags: ["transport"],
    reviewHistory: [],
  },
  {
    id: "fc_net_3",
    courseId: NET_ID,
    front: "What is the purpose of TCP's three-way handshake?",
    back: "Establish initial sequence numbers in both directions and confirm both endpoints can send AND receive. SYN → SYN-ACK → ACK.",
    tags: ["tcp"],
    reviewHistory: [],
  },
  {
    id: "fc_net_4",
    courseId: NET_ID,
    front: "Why does TCP need congestion control?",
    back: "Without it, senders would push data faster than the bottleneck link can drain, causing queue buildup, loss, and collapse. Algorithms like Reno/CUBIC/BBR adapt sending rate.",
    tags: ["tcp", "congestion"],
    reviewHistory: [],
  },
  {
    id: "fc_net_5",
    courseId: NET_ID,
    front: "How does DNS resolution work, briefly?",
    back: "Resolver asks a recursive server, which queries the root, then the TLD nameserver, then the authoritative server for the domain. Results are cached at each layer.",
    tags: ["dns"],
    reviewHistory: [],
  },
];

export const SEED_SUMMARIES: Summary[] = [
  {
    id: "sum_algo_1",
    courseId: ALGO_ID,
    chapter: 3,
    title: "Divide and Conquer",
    contentMarkdown: `# Divide and Conquer

A divide-and-conquer algorithm solves a problem by **breaking it into smaller instances of the same problem**, solving those recursively, and combining their results.

## The recipe

1. **Divide** the input into smaller subproblems.
2. **Conquer** each subproblem recursively (base case stops the recursion).
3. **Combine** the subproblem solutions into a solution for the whole.

## Worked example: merge sort

\`\`\`python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)
\`\`\`

The recurrence is \`T(n) = 2T(n/2) + O(n)\`, which by the Master Theorem gives **O(n log n)**.

## When does it pay off?

D&C wins when the combine step is cheap relative to the work it saves. If combining is expensive, the recursion overhead can dominate — at which point a single-pass iterative algorithm may be faster despite asymptotic equivalence.

> **Heuristic:** if you can describe a "merge two halves" step in one short paragraph, D&C is probably a good fit.`,
    createdAt: "2026-02-14T19:00:00.000Z",
    updatedAt: "2026-04-22T22:13:00.000Z",
  },
  {
    id: "sum_algo_2",
    courseId: ALGO_ID,
    chapter: 6,
    title: "Dynamic Programming",
    contentMarkdown: `# Dynamic Programming

DP applies when:

- the problem has **optimal substructure** (an optimal solution is built from optimal subproblem solutions), AND
- subproblems **overlap** (the naive recursive solution recomputes them).

Memoize, and you turn an exponential recursion into something polynomial.

## Two flavors

- **Top-down (memoized recursion):** write the natural recurrence; cache results in a dictionary keyed on inputs.
- **Bottom-up (tabulation):** identify the subproblem dependency order, fill a table iteratively.

## Worked example: longest common subsequence

For sequences \`X[0..m]\` and \`Y[0..n]\`:

\`\`\`
LCS(i, j) =
    0                              if i = 0 or j = 0
    LCS(i-1, j-1) + 1              if X[i] = Y[j]
    max(LCS(i-1, j), LCS(i, j-1))  otherwise
\`\`\`

Bottom-up runs in **O(mn)** time and space; the space can be reduced to **O(min(m, n))** with rolling rows.

## Common pitfall

Confusing optimal substructure with greediness. If a locally optimal choice forecloses globally optimal solutions, DP is necessary; if not, greedy is faster.`,
    createdAt: "2026-03-04T16:30:00.000Z",
    updatedAt: "2026-03-04T16:30:00.000Z",
  },

  {
    id: "sum_os_1",
    courseId: OS_ID,
    chapter: 4,
    title: "Threads, Concurrency, and the Cost of Sharing",
    contentMarkdown: `# Threads, Concurrency, and the Cost of Sharing

A **thread** is the unit the scheduler dispatches. Multiple threads in the same process share:

- the address space (heap, globals, code)
- file descriptors and signal handlers

What threads **don't** share is the stack and the per-thread register state — including the program counter and stack pointer.

## Why do we want threads?

1. **Latency hiding:** while one thread blocks on I/O, another runs.
2. **Parallelism:** multiple cores doing real work at once.
3. **Structuring:** event loops + workers map cleanly to thread pools.

## The cost: races

A race condition is any bug whose presence depends on the interleaving of operations on shared state. The classic example:

\`\`\`c
// Two threads each running:
counter = counter + 1;  // not atomic — read, add, write
\`\`\`

Two increments can produce a final value of 1 instead of 2 if their reads interleave before either writes.

## Mutual exclusion primitives

| Primitive   | Cost when uncontended | Behavior when contended |
|-------------|-----------------------|-------------------------|
| spinlock    | very low              | busy-wait               |
| mutex       | low                   | block + wake            |
| RW lock     | low                   | readers in parallel     |

Choose based on critical-section length: short → spinlock; long or potentially blocking → mutex.

## Heuristics

- If you find yourself reaching for "just one more lock," your invariants are probably wrong; redesign before adding.
- Lock ordering prevents deadlocks: pick a global order and never violate it.`,
    createdAt: "2026-02-20T22:00:00.000Z",
    updatedAt: "2026-04-30T18:11:00.000Z",
  },
  {
    id: "sum_os_2",
    courseId: OS_ID,
    chapter: 8,
    title: "Virtual Memory and Paging",
    contentMarkdown: `# Virtual Memory and Paging

Virtual memory gives every process the illusion of a large, contiguous address space. The OS + MMU translate virtual addresses to physical via **page tables**.

## Why the indirection is worth it

- **Isolation:** processes can't read each other's memory.
- **Sparsity:** a 64-bit address space is mostly unused; we only allocate physical frames for pages that are actually touched.
- **Demand paging:** pages can live on disk and be loaded on first access.
- **Sharing:** map the same physical frame into multiple processes (shared libraries, copy-on-write fork).

## TLB: making it fast

A page-table walk on every memory access would be ruinous. The **TLB** caches recent virtual→physical translations. A TLB miss triggers a walk; a TLB hit is essentially free.

\`\`\`
load r1, [virtual_address]
  ↓
TLB lookup
  hit  → physical address used immediately
  miss → walk page table, refill TLB, retry
\`\`\`

## Page faults

When a referenced page isn't resident:

1. CPU traps to the OS.
2. OS picks a victim frame, writes it back if dirty.
3. OS reads the requested page from disk into the frame.
4. Page table updated; instruction restarted.

The cost is dominated by the disk I/O — roughly 6 orders of magnitude slower than a TLB hit.`,
    createdAt: "2026-03-12T15:00:00.000Z",
    updatedAt: "2026-03-12T15:00:00.000Z",
  },

  {
    id: "sum_db_1",
    courseId: DB_ID,
    chapter: 5,
    title: "Indexes: B+ Trees and Hash Indexes",
    contentMarkdown: `# Indexes: B+ Trees and Hash Indexes

An **index** is an auxiliary data structure that maps a key to the location(s) where the corresponding row(s) live. Without indexes, every query is a full scan.

## B+ tree

Most general-purpose indexes are B+ trees:

- balanced, fan-out is high (often 100s) — typical depth 3–4 even for billion-row tables
- internal nodes hold separator keys; **all data lives in the leaves**
- leaves are linked in a list — supports range scans efficiently

\`\`\`
                [50]
               /    \\
          [20|35]    [70|90]
          / | \\      / | \\
        ...leaves linked left↔right...
\`\`\`

Key operations:

| op           | cost                            |
|--------------|---------------------------------|
| point lookup | O(log_F n)                      |
| range scan   | O(log_F n + k)  (k results)     |
| insert       | O(log_F n) amortized            |

## Hash index

A bucketed hash table on the key. Equality lookups are O(1) on average; **range queries are unsupported** because hashing destroys order.

## When to use which

- Default: B+ tree.
- Equality-only, very high cardinality, no range queries → hash.
- Postgres' default is B-tree (B+); MySQL InnoDB indexes are B+ trees.

## Composite indexes and prefix matching

A composite index on \`(a, b, c)\` can serve queries that filter on \`a\`, on \`(a, b)\`, or on \`(a, b, c)\` — but **not** on \`b\` alone. Order matters.`,
    createdAt: "2026-02-25T20:30:00.000Z",
    updatedAt: "2026-05-02T16:50:00.000Z",
  },
  {
    id: "sum_db_2",
    courseId: DB_ID,
    chapter: 7,
    title: "Transactions and Isolation Levels",
    contentMarkdown: `# Transactions and Isolation Levels

A **transaction** is a sequence of reads and writes treated as a single logical unit, with the ACID guarantees:

- **Atomicity:** all or nothing.
- **Consistency:** invariants hold before and after.
- **Isolation:** concurrent transactions don't see each other's intermediate state (modulo isolation level).
- **Durability:** committed changes survive crashes.

## Anomalies

Without isolation you can see:

- **Dirty reads** — reading a value another tx hasn't committed.
- **Non-repeatable reads** — a row you read changes if you read it again.
- **Phantom reads** — a query returns different rows on a re-execution because another tx inserted.
- **Lost updates** — two txs read-then-write the same row, one's write is silently overwritten.

## Standard isolation levels

| Level             | Dirty | Non-repeatable | Phantom |
|-------------------|-------|----------------|---------|
| Read Uncommitted  | yes   | yes            | yes     |
| Read Committed    | no    | yes            | yes     |
| Repeatable Read   | no    | no             | yes (ANSI; MySQL InnoDB also blocks phantoms via gap locks) |
| Serializable      | no    | no             | no      |

## Snapshot isolation

A pragmatic alternative used by Postgres, Oracle, etc.: each transaction sees a consistent snapshot from its start time. Avoids most anomalies; introduces **write skew** as a subtle replacement.`,
    createdAt: "2026-04-01T12:00:00.000Z",
    updatedAt: "2026-04-01T12:00:00.000Z",
  },

  {
    id: "sum_net_1",
    courseId: NET_ID,
    chapter: 3,
    title: "TCP: Reliable Bytes Over Unreliable Packets",
    contentMarkdown: `# TCP: Reliable Bytes Over Unreliable Packets

TCP turns IP's "best-effort, possibly-reordered, possibly-dropped datagrams" into a **reliable, in-order byte stream** between two endpoints.

## What TCP guarantees

- Bytes arrive in the order sent.
- No duplicates, no losses (modulo connection failure).
- Flow control: receiver can't be overwhelmed.
- Congestion control: senders back off when the network is loaded.

## What it doesn't

- Boundaries — TCP gives you bytes, not messages. Application protocols layer framing on top.
- Multicast — TCP is point-to-point.

## The three-way handshake

\`\`\`
client                 server
  |  ── SYN, seq=x ──>  |
  |  <— SYN-ACK,        |
  |     seq=y, ack=x+1  |
  |  ── ACK, ack=y+1 ─> |
\`\`\`

Both endpoints exchange initial sequence numbers and confirm bidirectional reachability.

## Sliding window + cumulative ACKs

The sender can have up to *window* unacknowledged bytes outstanding. The receiver acknowledges the highest contiguous byte received. Loss is detected by:

- **Timeout** — RTO expires before an ACK.
- **Three duplicate ACKs** — receiver keeps re-acking the last in-order byte while later segments arrive.

## Congestion control

Reno/CUBIC: AIMD-style — additive increase on success, multiplicative decrease on loss. BBR: model-based, tracks bottleneck bandwidth + RTT directly.`,
    createdAt: "2026-03-08T14:00:00.000Z",
    updatedAt: "2026-03-08T14:00:00.000Z",
  },
  {
    id: "sum_net_2",
    courseId: NET_ID,
    chapter: 5,
    title: "DNS: The Internet's Phone Book",
    contentMarkdown: `# DNS: The Internet's Phone Book

DNS maps **human-readable names** (\`example.com\`) to **machine-routable addresses** (\`93.184.216.34\`) — and a great deal more besides (mail exchangers, service locators, text records).

## The hierarchy

\`\`\`
.                       (root)
└── com                 (TLD)
    └── example         (authoritative for example.com)
        └── www
\`\`\`

Names are resolved **right to left**. The dot at the end of \`example.com.\` is the (usually elided) root.

## Resolution flow (recursive)

1. Stub resolver on your machine asks the configured **recursive resolver** (often your ISP, sometimes 1.1.1.1 / 8.8.8.8).
2. Recursive asks a **root nameserver** for the .com TLD server.
3. Recursive asks the **TLD server** for the authoritative server for example.com.
4. Recursive asks the **authoritative server** for the A record of www.example.com.
5. Caches at every layer; answer returned to stub.

## Records you should know

| Type   | Maps to                          |
|--------|----------------------------------|
| A      | IPv4 address                     |
| AAAA   | IPv6 address                     |
| CNAME  | Another name (alias)             |
| MX     | Mail exchanger                   |
| TXT    | Arbitrary text (SPF, verification) |
| NS     | Authoritative nameserver         |

## Caching and TTLs

Each record carries a TTL (in seconds). Resolvers cache up to that long. **Short TTLs** (60s) trade query volume for fast propagation; **long TTLs** (1 day) do the opposite. Both are valid — the choice depends on how often the underlying address might change.`,
    createdAt: "2026-04-10T18:30:00.000Z",
    updatedAt: "2026-04-10T18:30:00.000Z",
  },
];
