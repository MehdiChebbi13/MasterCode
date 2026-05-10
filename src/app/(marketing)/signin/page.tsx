"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SignInForm } from "@/components/marketing/SignInForm";
import { LogoMark } from "@/components/marketing/landing/LogoMark";

function SignInPageInner() {
  const params = useSearchParams();
  const mode = params.get("mode") === "login" ? "login" : "signup";
  const isLogin = mode === "login";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Link
        href="/"
        className="mkt-logo"
        style={{ marginBottom: 24, textDecoration: "none" }}
      >
        <LogoMark />
      </Link>

      <div
        className="mkt-modal"
        style={{ position: "relative", maxWidth: 440, width: "100%" }}
      >
        <span className="mkt-modal-sticker">
          {isLogin ? "↻ HOWDY" : "✦ FREE FOREVER"}
        </span>
        <div className="mkt-modal-body">
          <div className="mkt-modal-icon">🧠</div>
          <h2>
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

      <Link
        href="/"
        style={{
          marginTop: 24,
          fontSize: 13,
          color: "var(--ink-soft)",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        ← Back to home
      </Link>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInPageInner />
    </Suspense>
  );
}
