import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { LogoMark } from "@/components/marketing/landing/LogoMark";
import "@/components/marketing/landing.css";

export default function SignUpPage() {
  return (
    <div
      className="mkt-root"
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

      <SignUp
        signInUrl="/sign-in"
        fallbackRedirectUrl="/dashboard"
      />

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
