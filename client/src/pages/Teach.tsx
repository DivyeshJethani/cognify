/**
 * COGNIFY — Teach Cognify (Day 4)
 * The Feynman protocol as a product: pick a prompt, teach it in writing,
 * Cognify analyses coverage vs key points and returns the missing idea.
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
import { Textarea } from "@/components/ui/textarea";
import { teachBackPrompts, analyseTeachBack } from "@/lib/teachBack";
import { topicAlias } from "@/lib/curriculum";
import { ArrowRight, BookOpen, Check, Lightbulb, Sparkles } from "lucide-react";
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
        title="If you can teach it, you own it"
        subtitle="Choose one prompt. Explain the concept in your own words — as if teaching a classmate who missed the lesson. Cognify reads your explanation against the key points and returns the idea you missed. This is the strongest mastery signal the engine accepts."
      />

      <div className="px-5 py-7 sm:px-8 lg:px-10">
        {/* Stats ledger */}
        <div className="rise-in grid grid-cols-2 gap-y-6 border-b border-ink/10 pb-7 sm:grid-cols-4">
          <StatCell
            label="Teach-back prompts"
            value={`${prompts.length}`}
            sub="curriculum-tied, rotating"
          />
          <StatCell
            label="Best signal for"
            value="Mastery"
            sub="DNA weight: highest"
          />
          <StatCell
            label="Feedback returns"
            value="Coverage · Clarity"
            sub="plus the missing idea"
          />
          <StatCell
            label="Evidence written"
            value="DNA"
            sub="mastery dimension"
          />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          {/* ---------- Main column ---------- */}
          <div className="min-w-0 space-y-10">
            {/* Prompt picker */}
            <section>
              <Marginalia amber>Choose your prompt — one concept at a time</Marginalia>
              <div className="mt-5 grid gap-px border border-ink/12 bg-ink/10 sm:grid-cols-2">
                {prompts.map((p) => {
                  const active = p.topicId === selectedId;
                  return (
                    <button
                      key={p.topicId}
                      onClick={() => {
                        setSelectedId(p.topicId);
                        setSubmitted(false);
                      }}
                      className={
                        "text-left transition-colors " +
                        (active ? "bg-ivory" : "bg-card hover:bg-ink/[0.03]")
                      }
                    >
                      <div className="flex items-baseline justify-between gap-3 px-5 pt-4">
                        <span className="font-mono text-[9px] font-medium uppercase tracking-wider text-ink/50">
                          {subjectNames[p.subjectCode] ?? p.subjectCode} · {p.chapterTitle}
                        </span>
                        {active && (
                          <span className="font-mono text-[9px] uppercase tracking-wider text-teal">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="px-5 pb-4 pt-1.5 font-serif text-[15px] font-bold leading-snug text-ink">
                        {p.topicTitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Teaching stage */}
            <section className="border border-ink/12 bg-card">
              <div className="border-b border-ink/10 px-5 py-4">
                <div className="flex items-center justify-between">
                  <Marginalia className="[&::before]:hidden">
                    Your explanation — {prompt?.topicTitle}
                  </Marginalia>
                  {submitted && (
                    <button
                      onClick={handleReset}
                      className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink/50 transition-colors hover:text-ink"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              <div className="px-5 py-5">
                <p className="border-l-2 border-amber pl-3 font-serif text-[15px] font-medium italic leading-relaxed text-ink/80">
                  “{prompt?.prompt}”
                </p>
                {!submitted ? (
                  <>
                    <Textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Write your explanation here — no notes, no textbook. Your own words, as if to a classmate…"
                      className="mt-5 min-h-[180px] resize-y border-ink/20 bg-ivory font-mono text-[13px] leading-relaxed focus-visible:ring-teal/40"
                    />
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {text.trim().split(/\s+/).filter(Boolean).length} words
                      </span>
                      <Button
                        onClick={handleSubmit}
                        disabled={!text.trim()}
                        className="border border-ink bg-ink px-5 text-[11px] uppercase tracking-wider text-ivory hover:bg-ink/90 disabled:opacity-40"
                      >
                        <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Submit to Cognify
                      </Button>
                    </div>
                  </>
                ) : analysis ? (
                  <div className="rise-in mt-5 space-y-5">
                    <div className="grid gap-4 sm:grid-cols-3">
                      {[
                        { label: "Coverage", value: analysis.coverage },
                        { label: "Clarity", value: analysis.clarity },
                        { label: "Evidence", value: analysis.evidence },
                      ].map((r) => (
                        <div key={r.label}>
                          <div className="flex items-baseline justify-between">
                            <span className="font-mono text-[10px] uppercase tracking-wider text-ink/60">
                              {r.label}
                            </span>
                            <span className="font-mono text-[11px] text-teal-dark">{r.value}%</span>
                          </div>
                          <MasteryBar value={r.value} className="mt-1.5" />
                        </div>
                      ))}
                    </div>
                    <div className="border border-ink/10 bg-ivory p-4">
                      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/60">
                        <BookOpen className="h-3.5 w-3.5 text-teal" /> Cognify's verdict
                      </div>
                      <p className="mt-2 text-[13.5px] font-medium leading-relaxed text-ink">
                        {analysis.verdict}
                      </p>
                    </div>
                    <div className="border border-amber/40 bg-amber/5 p-4">
                      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-dark">
                        <Lightbulb className="h-3.5 w-3.5" /> The idea you missed
                      </div>
                      <p className="mt-2 text-[13.5px] font-medium leading-relaxed text-ink">
                        {analysis.missingIdea}
                      </p>
                      <p className="mt-2 footnote">
                        Return to the topic, close this gap, then teach again — a second pass is
                        how mastery is confirmed.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-teal">
                        <Check className="mr-1 inline h-3 w-3" />
                        Reading written to Learning DNA · evidence {analysis.evidence}%
                      </span>
                      <Link
                        href={`/topic/${slugOf(prompt!.topicId)}`}
                        className="border-b border-teal/50 pb-0.5 font-mono text-[11px] uppercase tracking-wider text-teal transition-colors hover:border-teal"
                      >
                        Revisit the concept →
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            {/* Key points */}
            <section>
              <Marginalia>What a strong explanation contains — {prompt?.topicTitle}</Marginalia>
              <ol className="mt-4 space-y-0">
                {prompt?.keyPoints.map((kp, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-[1.5rem_1fr] gap-4 border-l border-ink/10 pb-4 pl-4"
                  >
                    <div className="relative">
                      <div className="absolute -left-[1.5625rem] top-1.5 h-2 w-2 border border-teal bg-ivory" />
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <span className="footnote">{kp}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-2 footnote text-ink/50">
                These are shown after submission so you can self-compare — the real check is
                retrieval, not recognition.
              </p>
            </section>
          </div>

          {/* ---------- Rail ---------- */}
          <div className="space-y-10">
            <section className="border border-ink/12 bg-card">
              <div className="border-b border-ink/10 px-5 py-4">
                <Marginalia className="[&::before]:hidden">Why teach-back</Marginalia>
              </div>
              <div className="divide-y divide-ink/8 px-5">
                {[
                  {
                    t: "Retrieval under load",
                    n: "Generating the idea from memory, in your own structure, is the hardest — and most diagnostic — form of practice.",
                  },
                  {
                    t: "Gaps become visible",
                    n: "When you teach, missing links surface instantly. Cognify reads them as your specific revision targets.",
                  },
                  {
                    t: "DNA weight: highest",
                    n: "A clean teach-back counts as stronger mastery evidence than a multiple-choice pass.",
                  },
                ].map((r) => (
                  <div key={r.t} className="py-3.5">
                    <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/60">
                      {r.t}
                    </div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-ink/80">{r.n}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <Marginalia>Stuck on the missing idea?</Marginalia>
              <p className="mt-3 footnote">
                Teach it to a peer instead — the study-group network matches gaps to students who
                can teach them, and your teaching earns credits.
              </p>
              <Link
                href="/community"
                className="mt-4 inline-flex items-center gap-1.5 border-b border-teal/50 pb-0.5 font-mono text-[11px] uppercase tracking-wider text-teal transition-colors hover:border-teal"
              >
                Open study groups <ArrowRight className="h-3 w-3" />
              </Link>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
