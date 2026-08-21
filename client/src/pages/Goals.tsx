/**
 * COGNIFY — Stretch Goals (Day 4)
 * Goals are generated from the adaptive loop, not set by hand.
 * Progress bumps are logged (mock localStorage) and feed the DNA.
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
import { stretchGoals, bumpGoalProgress, activeGoalTitle } from "@/lib/goals";
import { ArrowRight, Award, Flag, ListChecks, Target, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusTone: Record<string, string> = {
  "on-track": "#2b9c8c",
  "at-risk": "#d9912f",
  achieved: "#2b9c8c",
  paused: "#8b949e",
};

const statusLabel: Record<string, string> = {
  "on-track": "On track",
  "at-risk": "At risk",
  achieved: "Achieved",
  paused: "Paused",
};

export default function GoalsPage() {
  const seed = stretchGoals();
  const [progress, setProgress] = useState<Record<string, number>>({});
  const goals = seed.map((g) => ({
    ...g,
    progress: progress[g.id] ?? g.progress,
  }));
  const achieved = goals.filter((g) => g.progress >= 100).length;

  function handleBump(id: string, points: number, label: string) {
    bumpGoalProgress(id, points);
    setProgress((p) => {
      const prev = p[id] ?? goals.find((g) => g.id === id)!.progress;
      const next = Math.min(100, prev + points);
      if (next >= 100 && prev < 100) {
        toast.success("Goal achieved", { description: "Well done — this marks a real step forward." });
      } else {
        toast.success(`+${points}% — ${label}`, { description: "Progress saved — you're closer." });
      }
      return { ...p, [id]: next };
    });
  }

  return (
    <AppShell>
      <PageHeader
        overline="Stretch Goals"
        title="Goals picked from what you're actually working on"
        subtitle="These aren't checkboxes you wrote yourself — each one comes from the topics you're currently tackling and what you have coming up. Make progress and it quietly disappears."
      />

      <div className="px-5 py-7 sm:px-8 lg:px-10">
        {/* Stats ledger */}
        <div className="rise-in grid grid-cols-2 gap-y-6 border-b border-ink/10 pb-7 sm:grid-cols-3">
          <StatCell
            label="Active goals"
            value={`${goals.length}`}
            sub="from your current work"
          />
          <StatCell
            label="Achieved this term"
            value={`${achieved}`}
            sub="evidence logged"
          />
          <StatCell
            label="Currently flagged"
            value={activeGoalTitle()}
            sub="the one Cognify is watching"
          />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          {/* ---------- Main column ---------- */}
          <div className="min-w-0 space-y-10">
            {goals.map((g, i) => {
              const tone = statusTone[g.status] ?? "#8b949e";
              const done = g.progress >= 100;
              return (
                <section key={g.id} className="rise-in">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <Marginalia amber={!done}>
                      Goal {String(i + 1).padStart(2, "0")} — {statusLabel[g.status] ?? g.status}
                    </Marginalia>
                    <span className="font-mono text-[12px] uppercase tracking-wider text-muted-foreground">
                      due {g.deadline}
                    </span>
                  </div>
                  <div className="mt-4 border border-ink/12 bg-card p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-serif text-2xl font-bold text-ink">{g.title}</h3>
                        <p className="mt-2 footnote">{g.whyItMatters}</p>
                      </div>
                      <span
                        className="inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[12px] font-medium uppercase tracking-[0.08em]"
                        style={{ borderColor: tone, color: tone }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
                        {statusLabel[g.status] ?? g.status}
                      </span>
                    </div>
                    <div className="mt-5 flex items-baseline justify-between">
                      <span className="font-display text-xs uppercase tracking-[0.08em] text-muted-foreground">
                        Progress
                      </span>
                      <span className="font-serif text-2xl font-bold text-ink">{g.progress}%</span>
                    </div>
                    <MasteryBar value={g.progress} className="mt-2" trackClassName="border-ink/20" />
                    {!done && (
                      <div className="mt-5">
                        <div className="font-display text-xs uppercase tracking-[0.08em] text-ink/60">
                          Suggested actions — each logs evidence
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {g.suggestedActions.map((a) => (
                            <Button
                              key={a}
                              size="sm"
                              variant="outline"
                              className="h-8 border-ink/25 bg-transparent px-3 text-[14px] uppercase tracking-wider text-ink/80 hover:bg-ink/5"
                              onClick={() =>
                                handleBump(
                                  g.id,
                                  a.includes("session") ? 18 : a.includes("test") || a.includes("check") ? 14 : 8,
                                  a
                                )
                              }
                            >
                              <ListChecks className="mr-1.5 h-3.5 w-3.5" /> {a}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    {done && (
                      <div className="mt-5 flex items-center gap-2 font-mono text-[14px] uppercase tracking-wider text-teal-dark">
                        <Award className="h-4 w-4" /> Goal achieved
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          {/* ---------- Rail ---------- */}
          <div className="space-y-10">
            <section className="border border-ink/12 bg-card">
              <div className="border-b border-ink/10 px-5 py-4">
                <Marginalia className="[&::before]:hidden">Why goals work this way</Marginalia>
              </div>
              <div className="divide-y divide-ink/8 px-5">
                <div className="flex items-start gap-3 py-4">
                  <Target className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                  <p className="footnote">
                    Goals are generated from measurable conditions — mastery below a threshold,
                    a revision backlog, a streak at risk. You cannot fail one by forgetting.
                  </p>
                </div>
                <div className="flex items-start gap-3 py-4">
                  <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                  <p className="footnote">
                    Each action bumps progress as logged evidence. Fake clicks only move the bar —
                    the engine verifies through session evidence.
                  </p>
                </div>
                <div className="flex items-start gap-3 py-4">
                  <Flag className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                  <p className="footnote">
                    At-risk goals appear in your Command Center and adapt your timetable — the
                    engine borrows time from lower-priority slots.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <Marginalia>Quick links</Marginalia>
              <ul className="mt-4 space-y-3">
                {[
                  { href: "/timetable", label: "Today's timetable", detail: "where goal time lives" },
                  { href: "/adaptive", label: "Adaptive Lab", detail: "how goals are generated" },
                  { href: "/community", label: "Study groups", detail: "teach a peer, earn evidence" },
                ].map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="group flex items-baseline justify-between border-b border-ink/10 pb-2"
                    >
                      <span className="font-serif text-[14px] font-bold text-ink">{l.label}</span>
                      <span className="font-mono text-[12px] uppercase tracking-wider text-teal opacity-0 transition-opacity group-hover:opacity-100">
                        {l.detail} <ArrowRight className="ml-1 inline h-3 w-3" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
