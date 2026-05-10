"use client";

export function Hero({
  onOpen,
}: {
  onOpen: (mode: "signup" | "login") => void;
}) {
  return (
    <section className="mkt-hero">
      <div>
        <span className="mkt-hero-badge">
          <span className="mkt-pulse" /> Now in beta · join 2,400+ CS majors
        </span>
        <h1>
          Make CS <span className="mkt-accent">click</span>
        </h1>
        <p className="mkt-hero-sub">
          Flashcards, summaries, and a code sandbox in one place. Built for the
          way CS majors <em>actually</em> study — late, distracted, and three
          days before the final.
        </p>
        <div className="mkt-hero-cta">
          <button
            type="button"
            className="mkt-btn mkt-btn-primary mkt-btn-lg"
            onClick={() => onOpen("signup")}
          >
            Get started — it&apos;s free
            <svg
              width="16"
              height="16"
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
          <button
            type="button"
            className="mkt-btn mkt-btn-yellow mkt-btn-lg"
            onClick={() => {
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            ✨ See how it works
          </button>
        </div>
        <div className="mkt-hero-meta">
          <span className="mkt-hero-meta-item">
            <span className="mkt-check">✓</span>No credit card
          </span>
          <span className="mkt-hero-meta-item">
            <span className="mkt-check">✓</span>Free forever for students
          </span>
          <span className="mkt-hero-meta-item">
            <span className="mkt-check">✓</span>30-second sign-up
          </span>
        </div>
      </div>

      <div className="mkt-hero-visual">
        <span className="mkt-float-sticker s1">🔥 ON A ROLL</span>
        <span className="mkt-float-sticker s2">✦ NEW DECK</span>
        <span className="mkt-float-sticker s3">⚡ 6 CARDS</span>
        <div className="mkt-stack">
          <StackCard
            cls="c1"
            icon="⚡"
            code="CS · 161"
            title="Algorithms"
            desc="Asymptotic analysis, divide-and-conquer, dynamic programming."
            progress={65}
            color="var(--algo-deep)"
          />
          <StackCard
            cls="c2"
            icon="🗂️"
            code="CS · 186"
            title="Databases"
            desc="Relational model, SQL, indexing, query optimization."
            progress={78}
            color="var(--db-deep)"
          />
          <StackCard
            cls="c3"
            icon="🌐"
            code="CS · 168"
            title="Computer Networks"
            desc="Layered architecture, TCP/IP, routing, congestion control."
            progress={8}
            color="var(--net-deep)"
          />
        </div>
      </div>
    </section>
  );
}

function StackCard({
  cls,
  icon,
  code,
  title,
  desc,
  progress,
  color,
}: {
  cls: string;
  icon: string;
  code: string;
  title: string;
  desc: string;
  progress: number;
  color: string;
}) {
  return (
    <div className={`mkt-stack-card ${cls}`}>
      <div className="mkt-mini-icon">{icon}</div>
      <span className="mkt-mini-code">{code}</span>
      <div className="mkt-mini-title">{title}</div>
      <p className="mkt-mini-desc">{desc}</p>
      <div className="mkt-mini-foot">
        <div
          className="mkt-mini-progress"
          style={
            {
              "--w": `${progress}%`,
              "--c": color,
            } as React.CSSProperties
          }
        />
        <span>{progress}%</span>
      </div>
    </div>
  );
}
