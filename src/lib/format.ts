const RELATIVE_THRESHOLDS: { ms: number; div: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { ms: 60_000, div: 1_000, unit: "second" },
  { ms: 3_600_000, div: 60_000, unit: "minute" },
  { ms: 86_400_000, div: 3_600_000, unit: "hour" },
  { ms: 604_800_000, div: 86_400_000, unit: "day" },
  { ms: 2_592_000_000, div: 604_800_000, unit: "week" },
  { ms: 31_536_000_000, div: 2_592_000_000, unit: "month" },
  { ms: Infinity, div: 31_536_000_000, unit: "year" },
];

const rtf = typeof Intl !== "undefined" ? new Intl.RelativeTimeFormat("en", { numeric: "auto" }) : null;

export function formatRelativeTime(iso: string | undefined, now: Date = new Date()): string {
  if (!iso) return "Never";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Unknown";
  const diff = then - now.getTime();
  const abs = Math.abs(diff);
  if (abs < 30_000) return "Just now";
  for (const { ms, div, unit } of RELATIVE_THRESHOLDS) {
    if (abs < ms) {
      const value = Math.round(diff / div);
      return rtf ? rtf.format(value, unit) : `${Math.abs(value)} ${unit}${Math.abs(value) === 1 ? "" : "s"} ${value < 0 ? "ago" : "from now"}`;
    }
  }
  return iso;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : plural ?? `${singular}s`}`;
}
