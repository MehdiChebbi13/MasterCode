"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Summary } from "@/types";
import { formatRelativeTime } from "@/lib/format";
import { ExplainPopover } from "./ExplainPopover";
import { DeleteSummaryConfirm } from "./DeleteSummaryConfirm";
import "./SummaryReaderStyled.css";

interface SummaryReaderStyledProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: Summary | null;
  courseName?: string;
  allSummaries?: Summary[];
  onNavigate?: (s: Summary) => void;
  onOpenFlashcards?: () => void;
}

export function SummaryReaderStyled({
  open,
  onOpenChange,
  summary,
  courseName = "Course",
  allSummaries = [],
  onNavigate,
  onOpenFlashcards,
}: SummaryReaderStyledProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [readPercent, setReadPercent] = useState(0);
  const [activeSection, setActiveSection] = useState<string>("section-0");
  const [markedState, setMarkedState] = useState<"yes" | "no" | null>(null);

  // Flip states for the mock Quick Recall cards
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const articleRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Prev / next based on chapter order
  const sorted = useMemo(
    () => [...allSummaries].sort((a, b) => a.chapter - b.chapter),
    [allSummaries],
  );
  const currentIdx = summary ? sorted.findIndex((s) => s.id === summary.id) : -1;
  const prevSummary = currentIdx > 0 ? sorted[currentIdx - 1] : null;
  const nextSummary = currentIdx !== -1 && currentIdx < sorted.length - 1 ? sorted[currentIdx + 1] : null;

  const handleNavigate = (target: Summary) => {
    if (wrapperRef.current) wrapperRef.current.scrollTop = 0;
    onNavigate?.(target);
  };

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleteOpen) onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, deleteOpen, onOpenChange]);

  // Read progress — measured on the fixed wrapper, not window
  useEffect(() => {
    if (!open) return;
    const el = wrapperRef.current;
    if (!el) return;
    const handleScroll = () => {
      const scrollable = el.scrollHeight - el.clientHeight;
      const pct = scrollable > 0 ? Math.min(100, Math.max(0, (el.scrollTop / scrollable) * 100)) : 0;
      setReadPercent(Math.round(pct));
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [open]);

  // TOC Active Section Observer
  useEffect(() => {
    if (!open || !articleRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );

    // Slight delay to ensure HTML is injected
    setTimeout(() => {
      const headings = document.querySelectorAll(".styled-markdown h2");
      headings.forEach((s) => observer.observe(s));
    }, 100);

    return () => observer.disconnect();
  }, [open, summary?.contentMarkdown]);

  const toggleFlip = (id: number) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!open || !summary) return null;

  const tags = ["summary", "notes", "review"];
  const readTime = useMemo(
    () => Math.ceil(summary.contentMarkdown.split(/\s+/).length / 200),
    [summary.contentMarkdown],
  );

  // Extract headers for TOC (assuming ## Headers are main sections)
  const sections = useMemo(() => {
    const matches = summary.contentMarkdown.match(/^##\s+(.+)$/gm) || [];
    return matches.map((m) => m.replace(/^##\s+/, ""));
  }, [summary.contentMarkdown]);

  const htmlContent = useMemo(
    () => formatMarkdown(summary.contentMarkdown),
    [summary.contentMarkdown],
  );

  return (
    <div role="dialog" aria-modal="true" className="styled-summary-wrapper" ref={wrapperRef}>
      {/* Reading progress bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${readPercent}%` }} />
      </div>

      {/* Floating decorations */}
      <svg
        className="deco"
        style={{ top: "200px", right: "32px", opacity: 0.55 }}
        width="42"
        height="42"
        viewBox="0 0 42 42"
      >
        <path
          d="M21 4 L25 17 L38 21 L25 25 L21 38 L17 25 L4 21 L17 17 Z"
          fill="#fcc419"
          stroke="#1a1612"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        className="deco"
        style={{ top: "580px", left: "24px" }}
        width="44"
        height="20"
        viewBox="0 0 48 20"
      >
        <path
          d="M2 10 Q 10 -2 18 10 T 34 10 T 46 10"
          fill="none"
          stroke="#6d3afc"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      {/* HEADER */}
      <header className="summary-nav">
        <div className="logo">
          <div className="logo-mark">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 5 L11 5 Q12 5 12 6 L12 21 Q12 20 11 20 L3 20 Z"
                stroke="#1a1612"
                strokeWidth="2.2"
                strokeLinejoin="round"
                fill="#fff"
              />
              <path
                d="M21 5 L13 5 Q12 5 12 6 L12 21 Q12 20 13 20 L21 20 Z"
                stroke="#1a1612"
                strokeWidth="2.2"
                strokeLinejoin="round"
                fill="#fff"
              />
            </svg>
          </div>
          <div className="logo-text">
            Road2 <span className="accent">FISA</span>
          </div>
        </div>
        <div className="nav-actions">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-[2.5px] border-black shadow-[3px_3px_0_black] rounded-[10px] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[5px_5px_0_black] transition-all"
            onClick={() => onOpenChange(false)}
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-[2.5px] border-black shadow-[3px_3px_0_black] rounded-[10px] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[5px_5px_0_black] transition-all"
            onClick={() => {
              onOpenChange(false);
              router.push(`/courses/${summary.courseId}/summaries/${summary.id}/edit`);
            }}
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-[2.5px] border-black text-destructive shadow-[3px_3px_0_black] rounded-[10px] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[5px_5px_0_black] transition-all"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-3.5" />
            Delete
          </Button>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div className="breadcrumb-row">
        <nav className="breadcrumb">
          <a>Library</a>
          <span className="sep">/</span>
          <a>{courseName}</a>
          <span className="sep">/</span>
          <a>Summaries</a>
          <span className="sep">/</span>
          <span className="here">{summary.title}</span>
        </nav>
      </div>

      {/* ARTICLE HEADER */}
      <header className="article-head">
        <div className="head-meta">
          <span className="section-num">
            § {String(summary.chapter).padStart(2, "0")}
          </span>
          <span className="dot">·</span>
          <span className="crumb-meta">
            <strong>{courseName}</strong> · Ch {summary.chapter}
          </span>
        </div>

        <h1 className="article-title">
          {summary.title.split(" ").slice(0, -1).join(" ")}{" "}
          <span className="accent">{summary.title.split(" ").slice(-1)}</span>
        </h1>

        {/* Placeholder for the Deck/Subtitle if you want to pull it from the summary object later */}
        <p className="article-deck">
          A friendly tour of the core concepts — what they actually mean, when
          each is the right tool, and why they matter for your upcoming exams.
        </p>

        <div className="article-meta">
          <span className="meta-item">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {readTime} min read
          </span>
          <span className="meta-item">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Updated {formatRelativeTime(summary.updatedAt)}
          </span>
          <div className="meta-tags">
            {tags.map((tag, idx) => (
              <span key={tag} className={`tag ${idx === 0 ? "lead" : ""}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ARTICLE LAYOUT */}
      <div className="article-wrap">
        {/* TOC */}
        <aside className="toc">
          <div className="toc-label">In this summary</div>
          <ol>
            {sections.map((title, idx) => (
              <li key={idx}>
                <a
                  href={`#section-${idx}`}
                  className={activeSection === `section-${idx}` ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.querySelector(`#section-${idx}`);
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {title}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#quick-recall"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .querySelector("#quick-recall")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Quick recall
              </a>
            </li>
          </ol>
          <div className="toc-foot">
            <span>
              <span className="read">{readPercent}%</span> read
            </span>
            <span>
              ~{" "}
              {Math.max(
                0,
                readTime - Math.ceil((readTime * readPercent) / 100),
              )}{" "}
              min left
            </span>
          </div>
        </aside>

        {/* ARTICLE BODY */}
        <article
          ref={articleRef}
          className="article styled-markdown"
          data-explainable="summary"
          data-summary-id={summary.id}
        >
          <div
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Quick Recall Section (Mocked matching design) */}
          <section className="section" id="quick-recall">
            <div className="recall-section">
              <div className="recall-head">
                <h2>
                  Quick <span className="em">recall</span> 🧠
                </h2>
                <span className="small">
                  Tap a card to flip · review core concepts
                </span>
              </div>
              <div className="recall-cards">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className={`recall-card ${flippedCards[num] ? "flipped" : ""}`}
                    onClick={() => toggleFlip(num)}
                  >
                    <div className="recall-card-inner">
                      <div className="recall-face front">
                        <div className="label">
                          <span className="dot"></span> Question
                        </div>
                        <div className="q">Key concept question #{num}?</div>
                        <div className="recall-flip-hint">↻ flip</div>
                      </div>
                      <div className="recall-face back">
                        <div className="label">
                          <span className="dot"></span> Answer
                        </div>
                        <div className="a">
                          This is the back of the card, revealing the crucial
                          detail you need to remember.
                        </div>
                        <div className="recall-flip-hint">↻ back</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <p className="article-meta-footer">
            Last updated {formatRelativeTime(summary.updatedAt)}
            {summary.createdAt !== summary.updatedAt &&
              ` · created ${formatRelativeTime(summary.createdAt)}`}
          </p>

          {/* Action footer */}
          <div className="article-actions">
            <div className="actions-text">
              How'd it <span className="em">land</span>?
            </div>
            <div className="actions-buttons">
              <button
                className={`action-btn no`}
                onClick={() =>
                  setMarkedState(markedState === "no" ? null : "no")
                }
              >
                <span>🔁</span> Review again
              </button>
              <button
                className={`action-btn yes ${markedState === "yes" ? "done" : ""}`}
                onClick={() =>
                  setMarkedState(markedState === "yes" ? null : "yes")
                }
              >
                <span>{markedState === "yes" ? "✓" : "✨"}</span>{" "}
                {markedState === "yes" ? "Marked as known" : "Got it!"}
              </button>
            </div>
          </div>
        </article>
      </div>

      {/* NEXT / PREV NAVIGATION */}
      <nav className="summary-nav">
        {prevSummary ? (
          <a
            className="nav-card prev"
            onClick={() => handleNavigate(prevSummary)}
            style={{ cursor: "pointer" }}
          >
            <span className="nav-label">← Previous · § {String(prevSummary.chapter).padStart(2, "0")}</span>
            <span className="nav-title">{prevSummary.title}</span>
            <span className="nav-meta">⏱ {Math.ceil(prevSummary.contentMarkdown.split(/\s+/).length / 200)} min</span>
          </a>
        ) : (
          <a className="nav-card prev disabled">
            <span className="nav-label">← Previous</span>
            <span className="nav-title">No previous summary</span>
            <span className="nav-meta">You're at the start</span>
          </a>
        )}

        {nextSummary ? (
          <a
            className="nav-card next"
            onClick={() => handleNavigate(nextSummary)}
            style={{ cursor: "pointer" }}
          >
            <span className="nav-label">Next · § {String(nextSummary.chapter).padStart(2, "0")} →</span>
            <span className="nav-title">{nextSummary.title}</span>
            <span className="nav-meta">⏱ {Math.ceil(nextSummary.contentMarkdown.split(/\s+/).length / 200)} min</span>
          </a>
        ) : (
          <a className="nav-card next disabled">
            <span className="nav-label">Next →</span>
            <span className="nav-title">No next summary</span>
            <span className="nav-meta">You're at the end</span>
          </a>
        )}
      </nav>

      {/* RELATED CTA */}
      <section className="related-cta">
        <div className="cta-card">
          <div className="cta-text">
            <h3>
              Ready to <span className="em">drill</span> these concepts?
            </h3>
            <p>
              Switch to flashcards to cement your knowledge.
            </p>
          </div>
          <button
            className="cta-btn"
            onClick={() => { onOpenChange(false); onOpenFlashcards?.(); }}
          >
            🃏 Open flashcards
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </section>

      {/* GO HOME */}
      <section className="go-home-section">
        <button
          type="button"
          className="go-home-btn"
          onClick={() => { onOpenChange(false); router.push("/dashboard"); }}
        >
          <Home className="size-4" />
          Go to dashboard
        </button>
      </section>

      <ExplainPopover
        scopeRef={articleRef}
        mode="summary"
        context={summary.contentMarkdown}
      />
      <DeleteSummaryConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        summary={summary}
        onDeleted={() => onOpenChange(false)}
      />
    </div>
  );
}

// ── Syntax highlighting (mirrors SandboxPage tokeniser) ──────────────────────
const _javaKw = new Set(["public","private","protected","static","final","void","class","interface","extends","implements","import","package","new","return","if","else","for","while","do","switch","case","break","continue","try","catch","finally","throw","throws","this","super","null","true","false","abstract","enum","instanceof"]);
const _javaTy = new Set(["int","long","short","byte","double","float","char","boolean","String","Object","Integer","Long","Boolean","Character","Double","Float","Arrays","List","Map","HashMap","ArrayList","System"]);
const _pyKw   = new Set(["def","return","if","else","elif","for","while","in","not","and","or","import","from","as","class","pass","break","continue","try","except","finally","raise","with","lambda","yield","global","nonlocal","None","True","False","is","async","await"]);
const _pyBi   = new Set(["print","len","range","int","str","float","bool","list","dict","set","tuple","enumerate","zip","map","filter","sorted","reversed","sum","min","max","abs","round","open","input","type","isinstance"]);

function _esc(s: string) { return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

function _highlight(code: string, lang: string): string {
  type Tok = { type: string; val: string };
  const toks: Tok[] = [];
  let i = 0; const len = code.length;
  while (i < len) {
    const ch = code[i], nx = code[i+1];
    if ((lang==="java" && ch==="/" && nx==="/") || (lang==="python" && ch==="#")) {
      let e = code.indexOf("\n",i); if(e===-1) e=len;
      toks.push({type:"comment",val:code.slice(i,e)}); i=e; continue;
    }
    if (lang==="java" && ch==="/" && nx==="*") {
      let e=code.indexOf("*/",i+2); if(e===-1) e=len; else e+=2;
      toks.push({type:"comment",val:code.slice(i,e)}); i=e; continue;
    }
    if (lang==="python" && (code.startsWith('"""',i)||code.startsWith("'''",i))) {
      const q=code.slice(i,i+3); let e=code.indexOf(q,i+3); if(e===-1)e=len; else e+=3;
      toks.push({type:"string",val:code.slice(i,e)}); i=e; continue;
    }
    if (ch==='"'||ch==="'") {
      let j=i+1, st=i;
      if(lang==="python"&&i>0&&/[fr]/i.test(code[i-1])&&toks.length){
        const last=toks[toks.length-1];
        if(last.type==="plain"&&/[fr]$/i.test(last.val)){last.val=last.val.slice(0,-1);st=i-1;}
      }
      while(j<len&&code[j]!==ch){if(code[j]==="\\")j+=2;else j++;}
      if(j<len)j++;
      toks.push({type:"string",val:code.slice(st,j)}); i=j; continue;
    }
    if(/[0-9]/.test(ch)){
      let k=i; while(k<len&&/[0-9.]/.test(code[k]))k++;
      toks.push({type:"number",val:code.slice(i,k)}); i=k; continue;
    }
    if(/[a-zA-Z_$]/.test(ch)){
      let j=i; while(j<len&&/[a-zA-Z0-9_$]/.test(code[j]))j++;
      const w=code.slice(i,j); let t="plain";
      if(lang==="java"){if(_javaKw.has(w))t="keyword";else if(_javaTy.has(w))t="type";else if(code[j]==="(")t="fn";}
      else{if(_pyKw.has(w))t="keyword";else if(_pyBi.has(w))t="builtin";else if(code[j]==="(")t="fn";}
      toks.push({type:t,val:w}); i=j; continue;
    }
    toks.push({type:"plain",val:ch}); i++;
  }
  return toks.map(t=>{
    const s=_esc(t.val);
    switch(t.type){
      case"keyword": return`<span class="sr-tok-kw">${s}</span>`;
      case"string":  return`<span class="sr-tok-str">${s}</span>`;
      case"comment": return`<span class="sr-tok-cmt">${s}</span>`;
      case"number":  return`<span class="sr-tok-num">${s}</span>`;
      case"fn":      return`<span class="sr-tok-fn">${s}</span>`;
      case"type":    return`<span class="sr-tok-ty">${s}</span>`;
      case"builtin": return`<span class="sr-tok-fn">${s}</span>`;
      default:       return s;
    }
  }).join("");
}

function _buildCodePanel(lang: string | undefined, code: string): string {
  const l = (lang || "code").toLowerCase();
  const dotCls = l==="java" ? "sr-dot-java" : l==="python" ? "sr-dot-py" : "sr-dot-generic";
  const lines = code.split("\n");
  const gutter = lines.map((_,i)=>`<span>${i+1}</span>`).join("");
  const highlighted = (l==="java"||l==="python") ? _highlight(code, l) : _esc(code);
  return (
    `<div class="sr-code-panel">` +
      `<div class="sr-code-header">` +
        `<div class="sr-code-tab"><span class="sr-lang-dot ${dotCls}"></span><span>${_esc(l)}</span></div>` +
        `<div class="sr-traffic"><span class="r"></span><span class="y"></span><span class="g"></span></div>` +
      `</div>` +
      `<div class="sr-code-body">` +
        `<div class="sr-code-grid">` +
          `<div class="sr-gutter">${gutter}</div>` +
          `<pre class="sr-pre"><code>${highlighted}</code></pre>` +
        `</div>` +
      `</div>` +
    `</div>`
  );
}

// ── Markdown formatter ────────────────────────────────────────────────────────
function formatMarkdown(md: string): string {
  // 1. Protect fenced code blocks from paragraph processing
  const blocks: string[] = [];
  let safe = md.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = blocks.length;
    blocks.push(_buildCodePanel(lang, code.trimEnd()));
    return `\n\nSR_CODE_BLOCK_${idx}\n\n`;
  });

  // 2. Protect highlight blocks (==text==)
  const highlights: string[] = [];
  safe = safe.replace(/^==(.+)==\s*$/gm, (_, text) => {
    const idx = highlights.length;
    highlights.push(`<div class="sr-highlight">${text}</div>`);
    return `\n\nSR_HIGHLIGHT_${idx}\n\n`;
  });

  // 2.5. Protect dividers (--- / *** / ___ lines)
  const dividers: string[] = [];
  safe = safe.replace(/^[-*_]{3,}\s*$/gm, () => {
    const idx = dividers.length;
    dividers.push('<hr class="sr-divider" />');
    return `\n\nSR_DIVIDER_${idx}\n\n`;
  });

  // 2.6. Protect table blocks
  const tables: string[] = [];
  safe = preprocessTables(safe, tables);

  // 3. Group consecutive list items into <ul>/<ol> and protect them.
  const lists: string[] = [];
  safe = preprocessLists(safe, lists);

  // 4. All other markdown transforms
  let h2Count = 0;
  let html = safe
    .replace(/^##\s+(.+)$/gm, (_, title) => {
      const idx = h2Count++;
      return `<h2 id="section-${idx}"><span class="num">${String(idx+1).padStart(2,"0")}</span>${title}</h2>`;
    })
    .replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^#\s+(.+)$/gm,   "<h1>$1</h1>")
    .replace(/^>\s+(.+)$/gm, '<div class="pullquote"><div class="body">$1</div></div>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g,     "<em>$1</em>")
    .replace(/`([^`]+)`/g,     "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n+/g, "</p><p>")
    .replace(/\n/g, "<br />");

  html = `<p>${html}</p>`;

  // 5. Restore protected blocks (they must sit outside <p> tags)
  const restore = (token: string, replacement: string) => {
    html = html
      .replace(`<p>${token}</p>`, replacement)
      .replace(token, replacement);
  };
  blocks.forEach((b, i) => restore(`SR_CODE_BLOCK_${i}`, b));
  highlights.forEach((b, i) => restore(`SR_HIGHLIGHT_${i}`, b));
  dividers.forEach((b, i) => restore(`SR_DIVIDER_${i}`, b));
  tables.forEach((b, i) => restore(`SR_TABLE_${i}`, b));
  lists.forEach((b, i) => restore(`SR_LIST_${i}`, b));

  return html;
}

function preprocessTables(input: string, tables: string[]): string {
  const lines = input.split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    if (/^\|/.test(lines[i])) {
      const tableLines: string[] = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      const idx = tables.length;
      tables.push(buildTableHtml(tableLines));
      out.push("", `SR_TABLE_${idx}`, "");
      continue;
    }
    out.push(lines[i]);
    i++;
  }
  return out.join("\n");
}

function buildTableHtml(lines: string[]): string {
  const rows: string[][] = [];
  for (const line of lines) {
    const segs = line.replace(/^\||\|$/g, "").split("|");
    if (segs.length > 0 && segs.every((s) => /^\s*:?-+:?\s*$/.test(s))) continue;
    const cells = line.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    rows.push(cells);
  }
  if (!rows.length) return "";
  const headerHtml = `<thead><tr>${rows[0].map((h) => `<th>${h || "&nbsp;"}</th>`).join("")}</tr></thead>`;
  const bodyHtml = rows.slice(1).length
    ? `<tbody>${rows
        .slice(1)
        .map((r) => `<tr>${r.map((c) => `<td>${c || "&nbsp;"}</td>`).join("")}</tr>`)
        .join("")}</tbody>`
    : "";
  return `<div class="sr-table-wrap"><table class="sr-table">${headerHtml}${bodyHtml}</table></div>`;
}

function preprocessLists(input: string, lists: string[]): string {
  const lines = input.split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const bullet = lines[i].match(/^[-*+]\s+(.*)$/);
    if (bullet) {
      const items: string[] = [bullet[1]];
      i++;
      while (i < lines.length) {
        const m = lines[i].match(/^[-*+]\s+(.*)$/);
        if (!m) break;
        items.push(m[1]);
        i++;
      }
      const idx = lists.length;
      lists.push(`<ul>${items.map((it) => `<li>${it}</li>`).join("")}</ul>`);
      out.push("", `SR_LIST_${idx}`, "");
      continue;
    }
    const num = lines[i].match(/^\d+\.\s+(.*)$/);
    if (num) {
      const items: string[] = [num[1]];
      i++;
      while (i < lines.length) {
        const m = lines[i].match(/^\d+\.\s+(.*)$/);
        if (!m) break;
        items.push(m[1]);
        i++;
      }
      const idx = lists.length;
      lists.push(`<ol>${items.map((it) => `<li>${it}</li>`).join("")}</ol>`);
      out.push("", `SR_LIST_${idx}`, "");
      continue;
    }
    out.push(lines[i]);
    i++;
  }
  return out.join("\n");
}
