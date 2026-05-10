import "@/components/marketing/landing.css";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="mkt-root">{children}</div>;
}
