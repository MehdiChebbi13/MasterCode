"use client";

import { LogoMark } from "./LogoMark";

export function MarketingNav({
  onOpen,
}: {
  onOpen: (mode: "signup" | "login") => void;
}) {
  return (
    <header className="mkt-nav">
      <a href="#top" className="mkt-logo">
        <LogoMark />
      </a>
      <nav className="mkt-nav-links">
        <a href="#features">Features</a>
        <a href="#how">How it works</a>
        <a href="#testimonials">Students</a>
        <a href="#free">Pricing</a>
      </nav>
      <div className="mkt-nav-actions">
        <button
          type="button"
          className="mkt-nav-link-btn"
          onClick={() => onOpen("login")}
        >
          Sign in
        </button>
        <button
          type="button"
          className="mkt-btn mkt-btn-primary"
          onClick={() => onOpen("signup")}
        >
          Get started — free
        </button>
      </div>
    </header>
  );
}
