"use client";

import { useEffect } from "react";
import { SignInForm } from "./SignInForm";

type Mode = "signup" | "login";

export function SignInModal({
  open,
  mode,
  onClose,
}: {
  open: boolean;
  mode: Mode;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const isLogin = mode === "login";

  return (
    <div
      className="mkt-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mkt-modal" role="dialog" aria-modal="true" aria-labelledby="mkt-modal-title">
        <span className="mkt-modal-sticker">
          {isLogin ? "↻ HOWDY" : "✦ FREE FOREVER"}
        </span>
        <button
          type="button"
          className="mkt-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="mkt-modal-body">
          <div className="mkt-modal-icon">🧠</div>
          <h2 id="mkt-modal-title">
            {isLogin ? (
              <>
                Welcome <span className="em">back</span>.
              </>
            ) : (
              <>
                Make CS <span className="em">click</span>.
              </>
            )}
          </h2>
          <p className="mkt-modal-sub">
            {isLogin
              ? "Sign back into your study hub. We've kept your streak warm."
              : "Pick how you want to sign in. We'll set up your study hub in 30 seconds — promise."}
          </p>

          <SignInForm mode={mode} />

          <div className="mkt-modal-foot">
            By continuing you agree to our <a>Terms</a> and{" "}
            <a>Privacy Policy</a>. Free forever for students.
          </div>
        </div>
      </div>
    </div>
  );
}
