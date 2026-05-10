"use client";

export function FinalCTA({
  onOpen,
}: {
  onOpen: (mode: "signup" | "login") => void;
}) {
  return (
    <section className="mkt-final-cta">
      <span className="mkt-float-sticker fs1">📚 IT&apos;S FREE</span>
      <span className="mkt-float-sticker fs2">🚀 30 SEC</span>
      <span className="mkt-float-sticker fs3">✨ 4.9★</span>
      <div className="mkt-final-cta-card">
        <h2>
          Ready to make CS <span className="em">click</span>?
        </h2>
        <p>
          Sign in once. Add your courses. Start studying in under a minute. Your
          future self — the one taking the final — will thank you.
        </p>
        <div className="mkt-final-cta-buttons">
          <button
            type="button"
            className="mkt-btn mkt-btn-primary mkt-btn-lg"
            onClick={() => onOpen("signup")}
          >
            Get started free
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
            onClick={() => onOpen("login")}
          >
            Already have an account?
          </button>
        </div>
        <div className="mkt-final-cta-trust">
          No credit card · Free forever for students · 2,400+ already in
        </div>
      </div>
    </section>
  );
}
