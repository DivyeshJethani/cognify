/**
 * COGNIFY — Subject page (/subject/:subjectId)
 * The ledger for one subject: a day-5 curriculum map. Every chapter carries
 * adaptive priority — due for revision, weak, untouched — so the subject is
 * read as a working map, not a static index. Scholar's Atelier: marginalia,
 * hairlines, index numerals, ledger rows.
 */
import { useMemo, useState } from "react";
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import {
  ActionChip,
  Hairline,
  Marginalia,
  MasteryBar,
  RevisionChip,
  StateBadge,
} from "@/components/cognify/Primitives";
import { boards, findSubject } from "@/lib/mockData";
import { subjectOverview, chapterPriority, type ChapterPriority } from "@/lib/curriculumEngine";
import { topicAlias } from "@/lib/curriculum";
import { cn } from "@/lib/utils";
import { BookOpen, CalendarClock, Flame, SearchX } from "lucide-react";
import { useLocation, useRoute } from "wouter";

type SortKey = "order" | "priority" | "mastery" | "revision";

const subjectNames: Record<string, string> = {
  MATH: "Mathematics",
  SCI: "Science",
  SST: "Social Science",
  ENG: "English",
  HIN: "Hindi",
  SKT: "Sanskrit",
};

export default function SubjectPage() {
  const [match, params] = useRoute("/subject/:subjectId");
  const subjectId = match ? params.subjectId : "";
  const [, navigate] = useLocation();
  const [sortKey, setSortKey] = useState<SortKey>("order");

  const boardId = "cbse";
  const classId = "cbse-10";
  const subject = findSubject(boardId, classId, subjectId);
  const overview = useMemo(() => (subject ? subjectOverview(subject.id) : null), [subject]);

  if (!subject) {
    return (
      <AppShell>
        <PageHeader
          overline="Subject Ledger"
          title="Subject not found"
          subtitle="Select a subject from the Curriculum Explorer to open its ledger."
          actions={
            <button
              onClick={() => navigate("/curriculum")}
              className="border border-ink/15 bg-card px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink/70 transition-colors hover:border-teal hover:text-teal"
            >
              ← Curriculum Explorer
            </button>
          }
        />
      </AppShell>
    );
  }

  const chaptersWithTopics = (overview?.chapters ?? []).map((co, i) => ({
    co,
    ch: co.chapter,
    priority: chapterPriority(co),
    mastery: co.mastery,
    weak: co.topicsNeedingAttention,
    due: co.nextRevision ? 1 : 0,
    order: i,
  })).filter(({ ch }) => subject.chapters.some((s) => s.id === ch.id));

  const PRIORITY_RANK: Record<ChapterPriority, number> = { high: 3, medium: 2, low: 1, stable: 0 };
  const sorted = [...chaptersWithTopics];
  if (sortKey === "priority") sorted.sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]);
  if (sortKey === "mastery") sorted.sort((a, b) => a.mastery - b.mastery);
  if (sortKey === "revision") sorted.sort((a, b) => b.due - a.due);

  const totalMastery = overview?.mastery ?? Math.round(subject.chapters.flatMap((c) => c.topics).reduce((n, t) => n + t.mastery, 0) / subject.chapters.flatMap((c) => c.topics).length);
  const topicsTotal = subject.chapters.reduce((n, c) => n + c.topics.length, 0);

  const sortButtons: [SortKey, string][] = [
    ["order", "Book order"],
    ["priority", "Adaptive priority"],
    ["mastery", "Mastery"],
    ["revision", "Revision due"],
  ];

  return (
    <AppShell>
      <PageHeader
        overline="Subject Ledger"
        title={`${subject.name} — ${boards.find((b) => b.id === boardId)?.name ?? "CBSE"} · Class 10`}
        subtitle={`Chapter ${String(subject.chapters.length).padStart(2, "0")} — a working map: every chapter carries its adaptive priority, mastery and revision state.`}
        actions={
          <button
            onClick={() => navigate("/curriculum")}
            className="border border-ink/15 bg-card px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink/70 transition-colors hover:border-teal hover:text-teal"
          >
            ← All subjects
          </button>
        }
      />

      <div className="flex flex-col gap-8 px-5 py-7 sm:px-8 lg:flex-row lg:px-10">
        {/* Margin — subject abstract */}
        <aside className="w-full shrink-0 space-y-6 lg:w-80">
          <div className="border border-ink bg-ink p-5 text-ivory">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-teal">Subject abstract</div>
            <div className="mt-2 flex items-center gap-2">
              {overview?.recommendedAction && (
                <span className="border border-teal/40 bg-teal/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-teal">
                  {overview.recommendedAction}
                </span>
              )}
            </div>
            <p className="mt-2 font-serif text-[15px] leading-relaxed">
              {overview?.recommendedActionReason ??
                `A ledger of ${subject.chapters.length} chapters and ${topicsTotal} topics. Work the chapters in adaptive priority, not book order — the engine reads your mastery first.`}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-px bg-teal/30">
              <div className="bg-ink p-2.5">
                <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-ink/60">Mastery</div>
                <div className="mt-0.5 font-mono text-[15px] font-medium text-ivory">{totalMastery}%</div>
              </div>
              <div className="bg-ink p-2.5">
                <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-ink/60">Topics</div>
                <div className="mt-0.5 font-mono text-[15px] font-medium text-ivory">{topicsTotal}</div>
              </div>
            </div>
          </div>

          {overview && overview.upcomingRevisions.length > 0 && (
            <div className="border border-ink/10 bg-card p-5">
              <Marginalia>Revision due — next 7 days</Marginalia>
              <ul className="mt-3 space-y-2">
                {overview.upcomingRevisions.slice(0, 5).map((title) => (
                  <li key={title} className="flex items-start gap-2 border-b border-dotted border-ink/15 pb-1.5 last:border-0">
                    <CalendarClock className="mt-0.5 h-3 w-3 shrink-0 text-amber-dark" />
                    <span className="text-[12.5px] leading-relaxed text-dark-text/75">{title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border border-ink/10 bg-card p-5">
            <Marginalia>How to read this ledger</Marginalia>
            <div className="mt-3 space-y-2">
              {[
                { icon: <Flame className="h-3 w-3 shrink-0 text-amber-dark" />, text: "Priority counts weak topics, due revisions and untouched chapters" },
                { icon: <BookOpen className="h-3 w-3 shrink-0 text-teal" />, text: "Chapter mastery is the mean of its topic mastery scores" },
                { icon: <CalendarClock className="h-3 w-3 shrink-0 text-amber-dark" />, text: "The spaced scheduler marks topics due or overdue in amber" },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-2 border-b border-dotted border-ink/15 pb-1.5 last:border-0">
                  {item.icon}
                  <span className="text-[12.5px] leading-relaxed text-dark-text/75">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Chapter ledger */}
        <section className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="marginalia [&::before]:hidden">Chapters — sorted by {sortKey === "order" ? "book order" : sortKey === "priority" ? "adaptive priority" : sortKey === "mastery" ? "mastery" : "revision due"}</div>
            <div className="flex items-center gap-1 border border-ink/12 bg-card">
              {sortButtons.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSortKey(key)}
                  className={cn(
                    "px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em] transition-colors",
                    sortKey === key ? "bg-ink text-ivory" : "text-muted-foreground hover:text-ink"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Hairline className="mt-3" />

          {sorted.length === 0 && (
            <div className="mt-10 flex flex-col items-center gap-3 border border-dashed border-ink/20 py-14 text-center">
              <SearchX className="h-6 w-6 text-ink/30" />
              <div className="font-serif text-lg font-bold text-ink">No chapters mapped yet</div>
              <p className="footnote">This subject is waiting for its chapter map from the curriculum pipeline.</p>
            </div>
          )}

          <ul className="mt-1 divide-y divide-ink/8">
            {sorted.map(({ ch, priority, mastery, weak, due }, idx) => (
              <li key={ch.id}>
                <div className="grid grid-cols-[2.5rem_1fr_auto] items-start gap-4 py-5">
                    <span className="index-num">{String(chaptersWithTopics.findIndex((c) => c.ch.id === ch.id) + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink/50">
                        Chapter {String(ch.index).padStart(2, "0")}
                      </span>
                      {(
                        <span className={cn(
                          "border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em]",
                          priority === "high"
                            ? "border-amber/40 bg-amber/5 text-amber-dark"
                            : priority === "medium"
                              ? "border-teal/40 bg-teal/5 text-teal-dark"
                              : "border-ink/25 bg-card text-ink/60"
                        )}>
                          {priority}
                        </span>
                      )}
                      {weak > 0 && (
                        <span className="border border-ink/25 bg-card px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink/60">
                          {weak} weak {weak === 1 ? "topic" : "topics"}
                        </span>
                      )}
                      {due > 0 && (
                        <span className="border border-amber/50 bg-amber/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-amber-dark">
                          {due} revision {due === 1 ? "due" : "due"}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 font-serif text-[17px] font-bold leading-snug text-ink">
                      {ch.title}
                    </div>
                    <ul className="mt-3 space-y-2">
                      {ch.topics.map((t) => (
                        <li key={t.id}>
                          <button
                            onClick={() => navigate(`/topic/${topicAlias(t.id)}`)}
                            className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 border border-transparent px-2 py-1.5 text-left transition-colors hover:border-ink/10 hover:bg-ivory-deep/60"
                          >
                            <span className="font-mono text-[9px] uppercase tracking-wider text-ink/45">
                              {ch.index}.{String(ch.topics.indexOf(t) + 1).padStart(2, "0")}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-[13px] font-medium text-dark-text/85 group-hover:text-ink">
                                {t.title}
                              </span>
                              <span className="mt-0.5 flex flex-wrap items-center gap-2">
                                <StateBadge state={t.state} />
                                <RevisionChip dueInDays={t.revisionDueInDays} status={t.revisionStatus} />
                                {t.recommendedAction && <ActionChip action={t.recommendedAction} />}
                              </span>
                            </span>
                            <span className="flex items-center gap-2 shrink-0">
                              <MasteryBar value={t.mastery} className="w-16" />
                              <span className="font-mono text-[10px] text-dark-text/60">{t.mastery}%</span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                        Chapter mastery
                      </span>
                      <MasteryBar value={mastery} className="max-w-[140px]" />
                      <span className="font-mono text-[11px] font-medium text-dark-text/60">{mastery}%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => ch.topics[0] && navigate(`/topic/${topicAlias(ch.topics[0].id)}`)}
                    className="mt-1 h-9 whitespace-nowrap border border-ink/25 bg-card px-4 font-mono text-[10px] uppercase tracking-[0.12em] text-ink/70 transition-all duration-150 hover:border-teal hover:text-teal active:scale-[0.97]"
                  >
                    Open chapter →
                  </button>
                </div>
                <Hairline className="-mb-1" />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
