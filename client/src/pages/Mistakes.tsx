/**
 * COGNIFY — Mistake Analysis (Day 4)
 * Every mistake is classified: conceptual / careless / procedural / recall /
 * interpretation — and each classification routes a different intervention.
 *
 * Style: Scholar's Atelier — ledger, marginalia, mono stats, hairline rules.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import {
  Marginalia,
  MasteryBar,
  StatCell,
} from "@/components/cognify/Primitives";
import { Button } from "@/components/ui/button";
import { mistakeAnalytics, categoryLabel, recentMistakes, mistakeTrendIcon } from "@/lib/mistakes";
import { learningPathFor } from "@/lib/adaptive";
import { topicAlias } from "@/lib/curriculum";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Flame,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const slugOf = (id: string) => topicAlias(id) ?? id;

const categoryMeta: Record<string, { icon: typeof Flame; tone: string }> = {
  conceptual: { icon: Lightbulb, tone: "#d9912f" },
  careless: { icon: Sparkles, tone: "#132b3b" },
  procedural: { icon: BookOpen, tone: "#2b9c8c" },
  recall: { icon: Flame, tone: "#d9912f" },
  interpretation: { icon: Lightbulb, tone: "#132b3b" },
};

export default function Mistakes() {
  const analytics = mistakeAnalytics();
  const mistakes = recentMistakes();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const total = mistakes.length;

  return (
    <AppShell>
      <PageHeader
        overline="Mistake Analysis"
        title="Every mistake is a lesson — none are wasted"
        subtitle="A conceptual error changes how you learn a topic; a careless one changes how you check your work. Here's what happened recently, and what changed because of it."
        actions={
          <Button
            asChild
            variant="outline"
            className="border-ink/25 bg-transparent text-ink hover:bg-ink/5"
          >
            <Link href="/adaptive">
              Adaptive Lab <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />

      <div className="px-5 py-7 sm:px-8 lg:px-10">
        {/* Stats ledger */}
        <div className="rise-in grid grid-cols-2 gap-y-6 border-b border-ink/10 pb-7 sm:grid-cols-4">
          <StatCell
            label="Classified mistakes"
            value={`${total}`}
            sub="last two weeks"
          />
          <StatCell
            label="Dominant class"
            value={categoryLabel("conceptual")}
            sub={`${analytics[0]?.percentage ?? 0}% of errors`}
          />
          <StatCell
            label="Rising clusters"
            value={`${analytics.filter((a) => a.trend === "rising").length}`}
            sub="under active intervention"
          />
          <StatCell
            label="Falling clusters"
            value={`${analytics.filter((a) => a.trend === "falling").length}`}
            sub="intervention working"
          />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          {/* ---------- Main column: category ledger ---------- */}
          <div className="min-w-0 space-y-10">
            <section>
              <Marginalia amber>Error-class ledger — share of recent mistakes</Marginalia>
              <div className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
                {analytics.map((m, i) => {
                  const meta = categoryMeta[m.category];
                  const Icon = meta.icon;
                  return (
                    <div
                      key={m.category}
                      className="rise-in grid gap-4 py-6 sm:grid-cols-[2.5rem_1fr]"
                    >
                      <div className="index-num pt-0.5">{String(i + 1).padStart(2, "0")}</div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-serif text-[17px] font-bold text-ink">{m.label}</span>
                          <span className="flex items-center gap-1 font-mono text-[14px] font-bold text-amber-dark">
                            {mistakeTrendIcon(m.trend)} {m.percentage}%
                          </span>
                          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                            {m.count} errors · {m.trendNote}
                          </span>
                        </div>
                        <p className="mt-2.5 footnote">{m.pattern}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: meta.tone }} />
                          <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink/60">
                            Intervention
                          </span>
                          <p className="footnote ml-1">{m.intervention}</p>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {m.affectedTopics.map((t) => (
                            <span
                              key={t}
                              className="border border-ink/12 px-2 py-0.5 font-mono text-[12px] text-ink/70"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Individual mistakes */}
            <section>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <Marginalia>Recent mistakes, and what they teach</Marginalia>
                <span className="font-mono text-[12px] uppercase tracking-wider text-muted-foreground">
                  each quietly shapes what Cognify suggests next
                </span>
              </div>
              <div className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
                {mistakes.map((m) => {
                  const open = expandedId === m.id;
                  const pathResult = learningPathFor(m.topicId);
                  return (
                    <div key={m.id} className="py-5">
                      <button
                        onClick={() => setExpandedId(open ? null : m.id)}
                        className="w-full text-left"
                        aria-expanded={open}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0 flex flex-wrap items-center gap-2">
                            <span className="border-l-2 px-1.5 py-0.5 font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-amber-dark" style={{ borderLeftColor: categoryMeta[m.category]?.tone }}>
                              {m.category}
                            </span>
                            <span className="font-serif text-[15px] font-bold leading-snug text-ink">
                              {m.topicTitle}
                            </span>
                          </div>
                          {open ? (
                            <ChevronUp className="h-4 w-4 shrink-0 text-ink/40" />
                          ) : (
                            <ChevronDown className="h-4 w-4 shrink-0 text-ink/40" />
                          )}
                        </div>
                        <p className="mt-2 font-mono text-[14px] leading-relaxed text-ink/70">
                          Q: {m.question}
                        </p>
                      </button>
                      {open && (
                        <div className="rise-in mt-4 space-y-3 border-l border-ink/10 pl-4">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="border border-ink/10 bg-ivory p-3">
                              <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-amber-dark">
                                Your answer
                              </div>
                              <div className="mt-1 font-mono text-[12px] text-ink/80">{m.studentAnswer}</div>
                            </div>
                            <div className="border border-teal/40 bg-ivory p-3">
                              <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-teal">
                                Correct
                              </div>
                              <div className="mt-1 font-mono text-[12px] text-ink/80">{m.correctAnswer}</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" />
                            <p className="footnote">
                              <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-ink/50">
                                Likely cause ·{" "}
                              </span>
                              {m.likelyCause}
                            </p>
                          </div>
                          <ul className="space-y-1">
                            {m.actions.map((a, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="mt-1.5 h-1 w-1 shrink-0 bg-teal" />
                                <span className="footnote">{a}</span>
                              </li>
                            ))}
                          </ul>
                          {pathResult && pathResult.stages.length > 0 && (
                            <Link
                              href={`/topic/${slugOf(m.topicId)}`}
                              className="inline-flex items-center gap-1.5 border-b border-teal/50 pb-0.5 font-mono text-[14px] uppercase tracking-wider text-teal transition-colors hover:border-teal"
                            >
                              View learning path →
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* ---------- Rail ---------- */}
          <div className="space-y-10">
            <section className="border border-ink/12 bg-card">
              <div className="border-b border-ink/10 px-5 py-4">
                <Marginalia className="[&::before]:hidden">Why classification matters</Marginalia>
              </div>
              <div className="divide-y divide-ink/8 px-5">
                {[
                  {
                    cls: "Conceptual",
                    note: "The model of the idea is wrong. Cognify inserts worked examples and diagrams before any new test.",
                  },
                  {
                    cls: "Careless",
                    note: "Method right, execution wrong. Cognify adds deliberate check-steps to timed practice.",
                  },
                  {
                    cls: "Procedural",
                    note: "A step drops mid-method. Checklist-based solved examples are inserted.",
                  },
                  {
                    cls: "Recall",
                    note: "Knowledge stored, retrieval weak. The spaced-revision interval is tightened.",
                  },
                  {
                    cls: "Interpretation",
                    note: "Only works in familiar wording. Reworded variants are added to each revision.",
                  },
                ].map((r) => (
                  <div key={r.cls} className="py-3.5">
                    <div className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink/60">{r.cls}</div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-ink/80">{r.note}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-ink/12 bg-card p-5">
              <Marginalia className="[&::before]:hidden">How sure is this</Marginalia>
              <p className="mt-2 text-[13.5px] text-ink/60">
                A few readings are only partly certain — they influence what's suggested next, but never override your own sessions.
              </p>
              <div className="mt-4 space-y-3">
                {analytics.slice(0, 3).map((m) => (
                  <div key={m.category}>
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono text-[12px] uppercase tracking-wider text-ink/60">
                        {m.label} cluster
                      </span>
                      <span className="font-mono text-[12px] text-teal-dark">~{70 + Math.round(m.percentage / 4)}% certain</span>
                    </div>
                    <MasteryBar value={70 + m.percentage / 4} className="mt-1.5" />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <Marginalia>Looking closer at this week</Marginalia>
              <div className="mt-4 grid grid-cols-2 gap-px border border-ink/12 bg-ink/10">
                <div className="bg-card p-4">
                  <div className="font-display text-3xl font-bold text-amber-dark">
                    {mistakes.filter((m) => m.confidence === "low").length}
                  </div>
                  <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                    made with low confidence
                  </div>
                </div>
                <div className="bg-card p-4">
                  <div className="font-display text-3xl font-bold text-teal-dark">
                    {mistakes.filter((m) => m.confidence === "high").length}
                  </div>
                  <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                    overconfident errors
                  </div>
                </div>
              </div>
              <Link
                href="/confidence"
                className="mt-4 inline-flex items-center gap-1.5 border-b border-teal/50 pb-0.5 font-mono text-[14px] uppercase tracking-wider text-teal transition-colors hover:border-teal"
              >
                Check your confidence habits →
              </Link>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
