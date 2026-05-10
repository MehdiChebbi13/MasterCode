"use client";

import { useState } from "react";

type Mode = "signup" | "login";
type Status =
  | { kind: "idle" }
  | { kind: "provider"; provider: string }
  | { kind: "magic-link"; email: string };

export function SignInForm({ mode = "signup" }: { mode?: Mode }) {
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const handleProvider = (provider: string) => {
    setStatus({ kind: "provider", provider });
  };

  const handleSubmitEmail = () => {
    const v = email.trim();
    if (!v.includes("@")) {
      setInvalid(true);
      setTimeout(() => setInvalid(false), 1500);
      return;
    }
    setStatus({ kind: "magic-link", email: v });
  };

  if (status.kind !== "idle") {
    const isProvider = status.kind === "provider";
    return (
      <div className="mkt-modal-success">
        <div className="mkt-big-emoji">{isProvider ? "🎉" : "📬"}</div>
        <h3>
          {isProvider ? `Connecting to ${status.provider}…` : "Check your inbox"}
        </h3>
        <p>
          {isProvider ? (
            <>In a real app, you&apos;d be redirected to {status.provider} now.</>
          ) : (
            <>
              We sent a sign-in link to <strong>{status.email}</strong>
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        className="mkt-auth-btn github"
        onClick={() => handleProvider("GitHub")}
      >
        <span className="mkt-auth-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.04 1.78 2.72 1.27 3.39.97.1-.75.4-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.05.78 2.12v3.14c0 .31.21.66.79.55C20.21 21.39 23.5 17.08 23.5 12c0-6.35-5.15-11.5-11.5-11.5z" />
          </svg>
        </span>
        Continue with GitHub
        <span className="mkt-arrow">→</span>
      </button>

      <button
        type="button"
        className="mkt-auth-btn google"
        onClick={() => handleProvider("Google")}
      >
        <span className="mkt-auth-icon">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23 12.27c0-.86-.08-1.67-.22-2.45H12v4.62h6.18c-.27 1.43-1.07 2.65-2.29 3.46v2.88h3.7c2.16-2 3.41-4.93 3.41-8.51z" />
            <path fill="#34A853" d="M12 23.5c3.1 0 5.7-1.03 7.59-2.78l-3.7-2.88c-1.03.69-2.34 1.1-3.89 1.1-2.99 0-5.52-2.02-6.43-4.74H1.74v2.97A11.5 11.5 0 0 0 12 23.5z" />
            <path fill="#FBBC05" d="M5.57 14.2A6.91 6.91 0 0 1 5.2 12c0-.76.13-1.5.37-2.2V6.83H1.74A11.5 11.5 0 0 0 .5 12c0 1.86.45 3.62 1.24 5.17l3.83-2.97z" />
            <path fill="#EA4335" d="M12 5.06c1.69 0 3.2.58 4.39 1.72l3.29-3.29C17.69 1.58 15.09.5 12 .5A11.5 11.5 0 0 0 1.74 6.83l3.83 2.97C6.48 7.08 9.01 5.06 12 5.06z" />
          </svg>
        </span>
        Continue with Google
        <span className="mkt-arrow">→</span>
      </button>

      <button
        type="button"
        className="mkt-auth-btn email"
        onClick={() => setEmailOpen((o) => !o)}
        aria-expanded={emailOpen}
      >
        <span className="mkt-auth-icon">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </span>
        Continue with email
        <span className="mkt-arrow">→</span>
      </button>

      <div className={`mkt-email-form${emailOpen ? " open" : ""}`}>
        <div className="mkt-auth-divider">Magic link</div>
        <input
          type="email"
          className={`mkt-email-input${invalid ? " invalid" : ""}`}
          placeholder="you@university.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmitEmail()}
          autoFocus
        />
        <button
          type="button"
          className="mkt-submit-btn"
          onClick={handleSubmitEmail}
        >
          ✦ {mode === "login" ? "Send sign-in link" : "Send me a magic link"}
        </button>
      </div>
    </>
  );
}
