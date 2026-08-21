/**
 * COGNIFY — Teach Cognify (Day 9)
 * Simple standalone feature: Learn it → Teach it → Understand it.
 * One topic at a time. No analytics. A human next step at the end.
 * Style: Scholar's Atelier — ivory ground, ink text, teal accents,
 * Manrope headings, generous whitespace.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { teachBackPrompts, analyseTeachBack } from "@/lib/teachBack";
import { topicAlias } from "@/lib/curriculum";
import { ArrowRight, BookOpen, Lightbulb, RotateCcw, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

const slugOf = (id: string) => topicAlias(id) ?? id;

const subjectNames: Record<string, string> = {
  MATH: "Mathematics",
  SCI: "Science",
  SST: "Social Science",
  ENG: "English",
  HIN: "Hindi",
  SKT: "Sanskrit",
};

/** The single next step Cognify recommends after the teach-back. */
type NextStep = { label: string; note: string };

function recommendNext(coverage: number, evidence: number): NextStep {
  if (evidence >= 85) return { label: "Move to practice", note: "You taught it cleanly — now lock it in with a few practice questions." };
  if (coverage >= 70) return { label: "Close one gap", note: "Almost there. Revisit the one idea Cognify flagged, then teach again." };
  if (coverage >= 40) return { label: "Relearn, then retry", note: "Some of the idea is missing. Read the topic once, then explain it again." };
  return { label: "Teach a peer", note: "This one is tangled — explaining it aloud to a classmate often untangles it faster." };
}

const STEPS = [
  { n: 1, label: "Pick a topic" },
  { n: 2, label: "Learn it" },
  { n: 3, label: "Teach it" },
];

export default function Teach() {
  const prompts = teachBackPrompts();
  const [selectedId, setSelectedId] = useState<string>(prompts[0]?.topicId ?? "");
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const prompt = useMemo(
    () => prompts.find((p) => p.topicId === selectedId),
    [selectedId]
  );
  const analysis = useMemo(
    () => (submitted && prompt ? analyseTeachBack(prompt.topicId, text) : null),
    [submitted, prompt, text]
  );
  const nextStep = analysis ? recommendNext(analysis.coverage, analysis.evidence) : null;

  function handleSubmit() {
    if (!text.trim()) return;
    setSubmitted(true);
  }

  function handleReset() {
    setText("");
    setSubmitted(false);
  }

  return (
    <AppShell>
      <PageHeader
        overline="Teach Cognify"
        title="Learn it. Teach it. Understand it."
        subtitle="Teaching is the fastest way to find out what you actually know. Pick a topic, learn it once, then explain it here in your own words — as if a classmate missed the lesson."
      />

      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        {/* Learn → Teach → Understand indicator */}
        <nav className="rise-in flex items-center gap-2">
          {STEPS.map((s, i) => (
            <span key={s.n} className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center border font-mono text-[12px] ${
                  submitted
                    ? i < 2
                      ? "border-teal bg-teal/10 font-bold text-teal"
                      : "border-ink/25 text-ink/40"
                    : "border-ink/25 text-ink/40"
                }`}
              >
                {s.n}
              </span>
              <span className={`font-display text-[13px] font-bold uppercase tracking-[0.06em] ${submitted && i < 2 ? "text-teal" : "text-ink/50"}`}>
                {s.label}
              </span>
              {i < 2 && <ArrowRight className="h-3.5 w-3.5 text-ink/25" />}
            </span>
          ))}
        </nav>

        {/* Step 1 — pick a topic */}
        {!submitted && (
          <section className="rise-in mt-8">
            <p className="font-display text-[17px] font-bold text-ink">Which topic will you teach?</p>
            <div className="mt-4 grid gap-px border border-ink/12 bg-ink/10 sm:grid-cols-2">
              {prompts.map((p) => {
                const active = p.topicId === selectedId;
                return (
                  <button
                    key={p.topicId}
                    onClick={() => setSelectedId(p.topicId)}
                    className={"text-left transition-colors " + (active ? "bg-ivory" : "bg-card hover:bg-ink/[0.03]")}
                  >
                    <div className="flex items-baseline justify-between gap-3 px-4 pt-3">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-ink/45">
                        {subjectNames[p.subjectCode] ?? p.subjectCode}
                      </span>
                      {active && <span className="font-mono text-[10px] uppercase tracking-wider text-teal">Chosen</span>}
                    </div>
                    <div className="px-4 pb-3 pt-1 font-display text-[15px] font-bold leading-snug text-ink">
                      {p.topicTitle}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[13px] text-ink/55">
              These come from topics you have not mastered yet — teaching them helps most.
            </p>
          </section>
        )}

        {/* Step 2 — learn it (skipped after submission) */}
        {!submitted && prompt && (
          <section className="rise-in mt-8 border border-ink/12 bg-card">
            <div className="border-b border-ink/10 px-5 py-3.5">
              <span className="font-display text-[13px] font-bold uppercase tracking-[0.06em] text-ink/60">
                Step 2 — Learn it first
              </span>
            </div>
            <div className="px-5 py-4">
              <p className="text-[14.5px] leading-relaxed text-ink/75">
                Before you teach, spend a few minutes with the topic itself — one resource and one
                quick read is enough. Don't teach from memory you haven't made yet.
              </p>
              <div className="mt-3.5 flex flex-wrap items-center gap-4">
                <Link
                  href={`/topic/${slugOf(prompt.topicId)}`}
                  className="inline-flex items-center gap-2 border-b border-teal/50 pb-0.5 font-mono text-[13px] uppercase tracking-wider text-teal transition-colors hover:border-teal"
                >
                  <BookOpen className="h-3.5 w-3.5" /> Open the topic →
                </Link>
                <span className="font-mono text-[12px] text-ink/50">One good resource is enough.</span>
              </div>
            </div>
          </section>
        )}

        {/* Step 3 — teach it */}
        <section className="mt-8 border border-teal/40 bg-teal/[0.03]">
          <div className="border-b border-ink/10 px-5 py-3.5">
            <span className="font-display text-[13px] font-bold uppercase tracking-[0.06em] text-ink/60">
              Step 3 — Teach it, in your own words
            </span>
          </div>
          <div className="px-5 py-5">
            <p className="border-l-2 border-amber pl-3 font-display text-[15px] font-semibold italic leading-relaxed text-ink/85">
              “{prompt?.prompt}”
            </p>
            {!submitted ? (
              <>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write your explanation here — no notes, no textbook. As if to a classmate…"
                  className="mt-4 min-h-[160px] resize-y border-ink/20 bg-ivory text-[14.5px] leading-relaxed focus-visible:ring-teal/40"
                />
                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-ink/45">
                    {text.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                  <Button
                    onClick={handleSubmit}
                    disabled={!text.trim()}
                    className="border border-ink bg-ink px-5 text-[13px] uppercase tracking-wider text-ivory hover:bg-ink/90 disabled:opacity-40"
                  >
                    <Lightbulb className="mr-1.5 h-3.5 w-3.5" /> Submit to Cognify
                  </Button>
                </div>
              </>
            ) : analysis && nextStep ? (
              <div className="rise-in mt-4 space-y-4">
                {/* Simple verdict */}
                <div className="border border-ink/10 bg-ivory p-4">
                  <span className="font-display text-[13px] font-bold uppercase tracking-[0.06em] text-ink/60">
                    What Cognify understood from your explanation
                  </span>
                  <p className="mt-2 text-[14.5px] font-medium leading-relaxed text-ink">
                    {analysis.verdict}
                  </p>
                </div>

                {/* The idea you missed — if any */}
                {analysis.missingIdea && (
                  <div className="border border-amber/40 bg-amber/5 p-4">
                    <div className="flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-[0.06em] text-amber-dark">
                      <Lightbulb className="h-3.5 w-3.5" /> The idea you missed
                    </div>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-ink">
                      {analysis.missingIdea}
                    </p>
                  </div>
                )}

                {/* One next step */}
                <div className="flex items-start gap-3 border border-teal/30 bg-teal/5 p-4">
                  <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                  <div>
                    <span className="font-display text-[13px] font-bold uppercase tracking-[0.06em] text-teal">
                      Your next step: {nextStep.label}
                    </span>
                    <p className="mt-1 text-[14px] leading-relaxed text-ink/80">{nextStep.note}</p>
                  </div>
                </div>

                {/* Quiet recovery paths */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink/10 pt-4">
                  <Link
                    href={`/topic/${slugOf(prompt!.topicId)}`}
                    className="border-b border-teal/50 pb-0.5 font-mono text-[13px] uppercase tracking-wider text-teal transition-colors hover:border-teal"
                  >
                    Revisit the concept →
                  </Link>
                  <Link
                    href="/community"
                    className="flex items-center gap-1.5 font-mono text-[13px] uppercase tracking-wider text-ink/50 transition-colors hover:text-teal"
                  >
                    <Users className="h-3 w-3" /> Teach a peer
                  </Link>
                  <button
                    onClick={handleReset}
                    className="font-mono text-[13px] uppercase tracking-wider text-ink/40 transition-colors hover:text-ink"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* Footnote, honest and short */}
        <p className="mt-6 text-center text-[12px] text-ink/45">
          No perfect score exists. The point is to find out what you don't know yet — so you can.
        </p>
      </div>
    </AppShell>
  );
}
