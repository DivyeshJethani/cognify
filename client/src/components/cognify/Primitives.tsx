/**
 * COGNIFY — Shared primitives
 * Style: Scholar's Atelier. Small-caps marginalia labels, hairline rules,
 * hairline-framed mastery bars, state badges in teal/amber/green/ink.
 * Minimal radii, no glow, no glass.
 */
import { cn } from "@/lib/utils";
import type { TopicState } from "@/lib/types";

export const LOGO_URL = "/manus-storage/cognify-logo-mark_070389eb.png";

/* ---------- Marginalia section label ---------- */
export function Marginalia({
  children,
  amber = false,
  className,
}: {
  children: React.ReactNode;
  amber?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("marginalia", amber && "marginalia-amber", className)}>
      {children}
    </span>
  );
}

/* ---------- Hairline ---------- */
export function Hairline({ className }: { className?: string }) {
  return <div className={cn("hairline", className)} />;
}

/* ---------- Mastery bar (hairline track) ---------- */
export function MasteryBar({
  value,
  className,
  trackClassName,
  animate = true,
}: {
  value: number;
  className?: string;
  trackClassName?: string;
  animate?: boolean;
}) {
  return (
    <div className={cn("h-1.5 w-full border border-ink/15 bg-ivory-deep", trackClassName)}>
      <div
        className={cn("h-full bg-teal transition-[width] duration-700", animate && "rise-in")}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/* ---------- Topic state → colour & label ---------- */
export function stateColor(state: TopicState): string {
  switch (state) {
    case "mastered":
      return "#1f9d8b";
    case "proficient":
      return "#1f9d8b";
    case "developing":
      return "#7fa894";
    case "weak":
      return "#e9a23b";
    case "learning":
      return "#102a43";
    case "new":
      return "#8b949e";
  }
}

export function stateLabel(state: TopicState): string {
  switch (state) {
    case "mastered":
      return "Mastered";
    case "proficient":
      return "Proficient";
    case "developing":
      return "Developing";
    case "weak":
      return "Weak";
    case "learning":
      return "In progress";
    case "new":
      return "Not started";
  }
}

export function StateBadge({ state }: { state: TopicState }) {
  const color = stateColor(state);
  return (
    <span
      className="inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]"
      style={{ borderColor: color, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {stateLabel(state)}
    </span>
  );
}

/* ---------- Revision chip ---------- */
export function RevisionChip({ dueInDays, status }: { dueInDays: number | null; status: string }) {
  if (status === "not-started")
    return (
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        Not scheduled
      </span>
    );
  if (status === "overdue")
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-wider text-amber-dark">
        <span className="h-1.5 w-1.5 rounded-full bg-amber" />
        Overdue {dueInDays !== null && dueInDays < 0 ? `${Math.abs(dueInDays)}d` : ""}
      </span>
    );
  if (status === "due")
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-wider text-amber-dark">
        <span className="h-1.5 w-1.5 rounded-full bg-amber" />
        Due {dueInDays === 0 ? "today" : `in ${dueInDays}d`}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-green-mid">
      <span className="h-1.5 w-1.5 rounded-full bg-green-mid" />
      On track · {dueInDays}d
    </span>
  );
}

/* ---------- Recommendation action label ---------- */
const actionMeta: Record<string, { label: string; color: string }> = {
  learn: { label: "Learn", color: "#102a43" },
  practice: { label: "Practice", color: "#1f9d8b" },
  revise: { label: "Revise", color: "#e9a23b" },
  "teach-back": { label: "Teach back", color: "#7fa894" },
  stretch: { label: "Stretch", color: "#102a43" },
};

export function ActionChip({ action }: { action: string }) {
  const meta = actionMeta[action] ?? { label: action, color: "#8b949e" };
  return (
    <span
      className="border-l-2 px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em]"
      style={{ borderLeftColor: meta.color, color: meta.color }}
    >
      {meta.label}
    </span>
  );
}

/* ---------- Stat cell ---------- */
export function StatCell({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn("border-l border-ink/10 pl-4", className)}>
      <div className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-serif text-2xl font-bold text-ink">{value}</div>
      {sub && <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
