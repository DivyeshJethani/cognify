/**
 * COGNIFY — Today
 * Day-9 simplification: a small "What should I do now?" hub.
 * No analytics, no stats ledger — at most three simple actions.
 * Style: Scholar's Atelier (ivory ground, deep ink text, teal accents,
 * Manrope headings, generous whitespace).
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import { getStudyContext, onContextChange } from "@/lib/studyContext";
import { useApp } from "@/contexts/AppContext";
import { todaySequence } from "@/lib/journeyData";
import { continuationItems } from "@/lib/journeyData";
import { topicAlias } from "@/lib/curriculum";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { BookOpen, Lightbulb, PenLine } from "lucide-react";

const SUBJECT_ID_TO_NAME: Record<string, string> = {
  math: "Mathematics",
  science: "Science",
  social: "Social Science",
  english: "English",
  hindi: "Hindi",
  sanskrit: "Sanskrit",
};

const SUBJECT_ID_TO_CODE: Record<string, string> = {
  math: "MATH",
  science: "SCI",
  social: "SST",
  english: "ENG",
  hindi: "HIN",
  sanskrit: "SKT",
};

const ACTION_META: Record<string, { label: string; verb: string; icon: typeof BookOpen }> = {
  learn: { label: "Learn", verb: "Learn", icon: BookOpen },
  practice: { label: "Practice", verb: "Practice", icon: PenLine },
  revise: { label: "Revise", verb: "Revise", icon: BookOpen },
  "teach-back": { label: "Teach Cognify", verb: "Teach", icon: Lightbulb },
};

const slugOf = (id: string) => topicAlias(id) ?? id;

const subjectNameForCode = (code: string): string => {
  const id = Object.keys(SUBJECT_ID_TO_CODE).find((k) => SUBJECT_ID_TO_CODE[k] === code);
  return id ? (SUBJECT_ID_TO_NAME[id] ?? code) : code;
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default function Today() {
  const { profile } = useApp();

  // Stay synced with sidebar context changes (board / class / subject focus)
  const [, rerender] = useState(0);
  useEffect(() => onContextChange(() => rerender((n) => n + 1)), []);
  const ctx = getStudyContext();

  const focusName = ctx.subjectFocus ? SUBJECT_ID_TO_NAME[ctx.subjectFocus] ?? "" : "";
  const focusCode = ctx.subjectFocus ? SUBJECT_ID_TO_CODE[ctx.subjectFocus] ?? "" : "";
  const subjectFocus = focusCode || null;

  const items = todaySequence()
    .items.filter((it) => (subjectFocus ? it.subjectCode === subjectFocus : true))
    .slice(0, 3);

  return (
    <AppShell>
      <PageHeader
        overline="Today"
        title={`Good ${greeting()}, ${profile.name.split(" ")[0]}.`}
        subtitle={
          subjectFocus
            ? `You are focused on ${subjectFocus} — only ${subjectFocus.toLowerCase()} appears here.`
            : "Here is what you should do right now."
        }
      />

      <div className="mx-auto max-w-2xl px-5 py-8 sm:px-8">
        {/* The one thing — then up to two more */}
        {items.length > 0 && (
          <section className="rise-in">
            {items.map((it, i) => {
              const meta = ACTION_META[it.kind] ?? { label: "Continue", verb: "Continue", icon: BookOpen };
              const Icon = meta.icon;
              const isPrimary = i === 0;
              return (
                <div
                  key={`${it.kind}-${it.topicId}-${it.number}`}
                  className={cn(
                    "group border p-6 transition-colors duration-150",
                    isPrimary
                      ? "border-teal/40 bg-teal/[0.04]"
                      : "border-ink/12 bg-card",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-display text-sm font-bold uppercase tracking-[0.08em] text-teal">
                      {it.kind === "teach-back" ? "Teach Cognify" : meta.label}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-wider text-ink/45">
                      {subjectNameForCode(it.subjectCode)}
                    </span>
                    <span className="font-mono text-xs text-ink/40">· {it.minutes} min</span>
                  </div>
                  <h3 className={cn(
                    "mt-2 font-display font-bold text-ink",
                    isPrimary ? "text-[24px] leading-snug" : "text-[20px] leading-snug",
                  )}>
                    {it.topicTitle}
                  </h3>
                  {isPrimary && (
                    <p className="mt-1.5 text-[15px] leading-relaxed text-ink/70">{it.reason}</p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {it.kind === "teach-back" ? (
                      <Link
                        href="/teach"
                        className="inline-flex items-center gap-2 bg-teal px-5 py-2.5 font-display text-[14px] font-bold text-white transition-transform duration-150 active:scale-[0.97]"
                      >
                        <Icon className="h-4 w-4" /> Teach
                      </Link>
                    ) : (
                      <Link
                        href={`/topic/${slugOf(it.topicId)}`}
                        className="inline-flex items-center gap-2 bg-teal px-5 py-2.5 font-display text-[14px] font-bold text-white transition-transform duration-150 active:scale-[0.97]"
                      >
                        <Icon className="h-4 w-4" /> {meta.verb}
                      </Link>
                    )}
                    {!isPrimary && (
                      <Link
                        href={`/topic/${slugOf(it.topicId)}`}
                        className="border-b border-teal/50 pb-0.5 font-mono text-[13px] uppercase tracking-wider text-teal transition-colors hover:border-teal"
                      >
                        Open →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {items.length === 0 && (
          <div className="rise-in border border-ink/12 bg-card p-8 text-center">
            <p className="font-display text-lg font-bold text-ink">Nothing specific for {subjectFocus ?? "today"}.</p>
            <p className="mt-2 text-[15px] text-ink/65">
              Open the <Link href="/curriculum" className="border-b border-teal/50 text-teal">Curriculum Explorer</Link> and pick a chapter to learn.
            </p>
          </div>
        )}

        {/* Quiet links to the other two core features */}
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/teach" className="group flex items-center gap-2 font-display text-[15px] font-bold text-ink/60 transition-colors hover:text-teal">
            <Lightbulb className="h-4 w-4" /> Teach Cognify
          </Link>
          <Link href="/community" className="group flex items-center gap-2 font-display text-[15px] font-bold text-ink/60 transition-colors hover:text-teal">
            Study groups
          </Link>
          <Link href="/continue" className="font-mono text-[12px] uppercase tracking-wider text-ink/40 transition-colors hover:text-teal">
            Continue learning →
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
