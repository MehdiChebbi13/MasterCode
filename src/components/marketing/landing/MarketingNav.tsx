import Link from "next/link";
import { LogoMark } from "./LogoMark";

export function MarketingNav() {
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
        <Link href="/sign-in" className="mkt-nav-link-btn">
          Sign in
        </Link>
        <Link href="/sign-up" className="mkt-btn mkt-btn-primary">
          Get started — free
        </Link>
      </div>
    </header>
  );
}
