"use client";

import { useEffect, useMemo, useState } from "react";
import { highlight, JAVA_SNIPPET, PYTHON_SNIPPET } from "./highlight";

export function Features() {
  return (
    <section className="mkt-section" id="features">
      <span className="mkt-kicker">Three pillars · zero fluff</span>
      <h2 className="mkt-section-title">
        Everything you need to actually{" "}
        <span className="mkt-accent">remember</span> the material.
      </h2>
      <p className="mkt-section-deck">
        Stop bouncing between Quizlet, Notion, and a half-broken IDE. We bundled
        the three things you actually use into one playful, focused space.
      </p>

      <div className="mkt-features">
        <FlashcardsFeature />
        <SummariesFeature />
        <SandboxFeature />
      </div>
    </section>
  );
}

function FlashcardsFeature() {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFlipped(true), 2400);
    const t2 = setTimeout(() => setFlipped(false), 5200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <article className="mkt-feature f1">
      <span className="mkt-feature-num">01 · Flashcards</span>
      <h3>
        Cards that <em>flip</em>, swipe, and stick.
      </h3>
      <p>
        Spaced-repetition decks generated for every course. Click, swipe, or tap
        your way through — and we track which ones you actually know.
      </p>

      <div className="mkt-feature-preview">
        <div
          className={`mkt-preview-flashcard${flipped ? " flipped" : ""}`}
          onClick={() => setFlipped((f) => !f)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setFlipped((f) => !f);
            }
          }}
        >
          <div className="mkt-preview-flashcard-inner">
            <div className="mkt-preview-face front">
              <div className="lbl">
                <span className="d" /> Question
              </div>
              <div className="q">Time complexity of binary search?</div>
              <div className="mkt-preview-tap-hint">↻ tap to flip</div>
            </div>
            <div className="mkt-preview-face back">
              <div className="lbl">
                <span className="d" /> Answer
              </div>
              <div className="a">
                <strong>O(log n)</strong> — each step <strong>halves</strong>{" "}
                the search space. From <code>n</code> items, after{" "}
                <code>k</code> steps you have <code>n/2ᵏ</code> left.
              </div>
              <div className="mkt-preview-tap-hint">↻ tap to flip back</div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function SummariesFeature() {
  return (
    <article className="mkt-feature f2">
      <span className="mkt-feature-num">02 · Summaries</span>
      <h3>
        Long-form notes, <em>made readable</em>.
      </h3>
      <p>
        4-minute reads with a sticky table of contents, callouts, code blocks,
        and recall cards at the end. Like a magazine you actually finish.
      </p>

      <div className="mkt-feature-preview">
        <div className="mkt-preview-summary">
          <div className="mkt-preview-summary-meta">§ 01 · 4 min read</div>
          <h4>Asymptotic analysis, demystified.</h4>
          <p>
            An algorithm at <strong>O(n²)</strong> is describing how its work
            grows — not seconds, not lines of code, but <em>operations</em> as{" "}
            <code>n</code> scales.
          </p>
          <p>
            Two ideas: we care about behavior <strong>as n → ∞</strong>, and we
            drop constants because <code>3n² + 100n + 50</code> is just{" "}
            <code>O(n²)</code>.
          </p>
        </div>
      </div>
    </article>
  );
}

function SandboxFeature() {
  const [lang, setLang] = useState<"java" | "python">("java");

  const javaHtml = useMemo(() => highlight(JAVA_SNIPPET, "java"), []);
  const pythonHtml = useMemo(() => highlight(PYTHON_SNIPPET, "python"), []);

  return (
    <article className="mkt-feature f3">
      <span className="mkt-feature-num">03 · Sandbox</span>
      <h3>
        A code <em>scratchpad</em> that runs.
      </h3>
      <p>
        Java and Python, real syntax highlighting, real output. Tweak the
        example, hit ⌘+↵, watch it stream. Better than reading about it.
      </p>

      <div className="mkt-feature-preview mkt-preview-sandbox">
        <div className="mkt-preview-sandbox-tabs">
          <button
            type="button"
            className={`mkt-preview-tab${lang === "java" ? " active" : ""}`}
            data-l="java"
            onClick={() => setLang("java")}
          >
            <span className="ld" />
            Java
          </button>
          <button
            type="button"
            className={`mkt-preview-tab${lang === "python" ? " active" : ""}`}
            data-l="python"
            onClick={() => setLang("python")}
          >
            <span className="ld" />
            Python
          </button>
        </div>
        <div className="mkt-preview-code-body">
          <pre
            className={`mkt-preview-code${lang === "java" ? " active" : ""}`}
            data-l="java"
            dangerouslySetInnerHTML={{ __html: javaHtml }}
          />
          <pre
            className={`mkt-preview-code${lang === "python" ? " active" : ""}`}
            data-l="python"
            dangerouslySetInnerHTML={{ __html: pythonHtml }}
          />
        </div>
        <div className="mkt-preview-output">
          <span className="pmt">$</span> search(7) → index 3
          <br />
          <span className="ok">✓</span> exit 0
        </div>
      </div>
    </article>
  );
}
