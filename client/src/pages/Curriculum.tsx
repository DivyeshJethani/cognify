/**
 * COGNIFY — Curriculum Explorer
 * Style: a real book index — nested outline navigation with numbered chapters,
 * hairline rules, marginalia labels; topic rows carry mastery, state, revision
 * status and recommended action. Detail panel opens as a ledger drawer.
 */
import { useEffect, useMemo, useState } from "react";
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
import { topicAlias } from "@/lib/curriculum";
import { cn } from "@/lib/utils";
import { BookOpen, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import type { Subject, Topic } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const subjectNames: Record<string, string> = {
  MATH: "Mathematics",
  SCI: "Science",
  SST: "Social Science",
  ENG: "English",
  HIN: "Hindi",
  SKT: "Sanskrit",
};

type ViewMode = "outline" | "mastery" | "revision";

export default function Curriculum() {
  const [boardId, setBoardId] = useState("cbse");
  const [classId, setClassId] = useState("cbse-10");
  const [subjectId, setSubjectId] = useState("math");
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [topicDetail, setTopicDetail] = useState<Topic | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("outline");
  const [, navigate] = useLocation();

  const board = boards.find((b) => b.id === boardId)!;
  const cls = board.classes.find((c) => c.id === classId)!;
  const subject = findSubject(boardId, classId, subjectId);

  // Keep selected chapter valid when switching subjects
  useEffect(() => {
    if (subject && !subject.chapters.find((c) => c.id === activeChapter)) {
      setActiveChapter(subject.chapters[0]?.id ?? null);
    }
  }, [subjectId, classId, boardId]);

  const chapter = subject?.chapters.find((c) => c.id === activeChapter);
  const allTopicEntries = useMemo(
    () =>
      subject
        ? subject.chapters.flatMap((ch) => ch.topics.map((t) => ({ chapter: ch, topic: t })))
        : [],
    [subject]
  );

  const weakOrDeveloping = allTopicEntries.filter(
    (e) => e.topic.state === "weak" || e.topic.state === "developing"
  );
  const dueForRevision = allTopicEntries.filter(
    (e) => e.topic.revisionStatus === "due" || e.topic.revisionStatus === "overdue"
  );

  if (!subject) {
    return (
      <AppShell>
        <PageHeader overline="Curriculum Explorer" title="Subject not found" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        overline="Curriculum Explorer"
        title={`${subject.name} · ${board.name} ${cls.name}`}
        subtitle={`Board → Class → Subject → Chapter → Topic → learning objectives — ${subject.chapters.length} chapters, ${allTopicEntries.length} topics mapped`}
      />

      {/* Selector strip */}
      <div className="flex flex-wrap items-center gap-3 border-b border-ink/10 px-5 py-4 sm:px-8 lg:px-10">
        <Select value={boardId} onValueChange={(v) => {
          setBoardId(v);
          const nb = boards.find((b) => b.id === v)!;
          setClassId(nb.classes[0].id);
        }}>
          <SelectTrigger className="h-9 w-36 border-ink/20 bg-card text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {boards.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={classId} onValueChange={(v) => {
          setClassId(v);
          const nb = boards.find((b) => b.id === boardId)!;
          const nc = nb.classes.find((c) => c.id === v)!;
          setSubjectId(nc.subjects[0].id);
        }}>
          <SelectTrigger className="h-9 w-32 border-ink/20 bg-card text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {board.classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={subjectId} onValueChange={setSubjectId}>
          <SelectTrigger className="h-9 w-48 border-ink/20 bg-card text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {cls.subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-1 border border-ink/12 bg-card">
          {(
            [
              ["outline", "Book index"],
              ["mastery", "Mastery view"],
              ["revision", "Revision due"],
            ] as [ViewMode, string][]
          ).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
                viewMode === mode ? "bg-ink text-ivory" : "text-muted-foreground hover:text-ink"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-8 px-5 py-7 sm:px-8 lg:flex-row lg:px-10">
        {/* Index column */}
        <aside className="w-full shrink-0 lg:w-72">
          <div className="marginalia [&::before]:hidden">Contents — {subject.name}</div>
          <nav className="mt-4 divide-y divide-ink/8 border-y border-ink/10">
            {subject.chapters.map((ch) => {
              const active = activeChapter === ch.id;
              const mastery = Math.round(
                ch.topics.reduce((n, t) => n + t.mastery, 0) / ch.topics.length
              );
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChapter(ch.id)}
                  className={cn(
                    "group flex w-full items-baseline gap-3 py-3 text-left transition-colors",
                    active ? "bg-teal/5" : "hover:bg-ivory-deep/60"
                  )}
                >
                  <span className={cn("font-mono text-xs", active ? "text-teal-dark" : "index-num")}>
                    {String(ch.index).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate font-serif text-[14px] font-bold", active ? "text-ink" : "text-ink/75")}>
                      {ch.title}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {ch.topics.length} topics · {mastery}% chapter mastery
                    </span>
                  </span>
                  <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform", active && "translate-x-0.5 text-teal")} />
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Topic ledger */}
        <section className="min-w-0 flex-1">
          {viewMode === "outline" && chapter && (
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-teal" />
                <Marginalia className="[&::before]:hidden">
                  Chapter {String(chapter.index).padStart(2, "0")} — {chapter.title}
                </Marginalia>
              </div>
              <Hairline className="mt-3" />
              <ul className="mt-1 divide-y divide-ink/8">
                {chapter.topics.map((t, i) => (
                  <TopicRow
                    key={t.id}
                    topic={t}
                    index={i}
                    subjectCode={subject.code}
                    onSelect={() => setTopicDetail(t)}
                    selected={topicDetail?.id === t.id}
                  />
                ))}
              </ul>
            </div>
          )}

          {viewMode === "mastery" && (
            <div>
              <Marginalia amber>All topics ranked by mastery — weakest first</Marginalia>
              <Hairline className="mt-3" />
              <ul className="mt-1 divide-y divide-ink/8">
                {[...allTopicEntries]
                  .sort((a, b) => a.topic.mastery - b.topic.mastery)
                  .map((e, i) => (
                    <TopicRow
                      key={e.topic.id}
                      topic={e.topic}
                      index={i}
                      subjectCode={subject.code}
                      chapterTitle={e.chapter.title}
                      onSelect={() => setTopicDetail(e.topic)}
                      selected={topicDetail?.id === e.topic.id}
                    />
                  ))}
              </ul>
            </div>
          )}

          {viewMode === "revision" && (
            <div>
              <Marginalia>Spaced-retention schedule — due & overdue</Marginalia>
              <Hairline className="mt-3" />
              {dueForRevision.length === 0 ? (
                <p className="mt-6 footnote">Nothing is due for revision right now in {subject.name}. The scheduler will flag topics here as they approach their review date.</p>
              ) : (
                <ul className="mt-1 divide-y divide-ink/8">
                  {dueForRevision.map((e, i) => (
                    <TopicRow
                      key={e.topic.id}
                      topic={e.topic}
                      index={i}
                      subjectCode={subject.code}
                      chapterTitle={e.chapter.title}
                      onSelect={() => setTopicDetail(e.topic)}
                      selected={topicDetail?.id === e.topic.id}
                    />
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Topic detail drawer */}
      {topicDetail && (
        <TopicDetail
          topic={topicDetail}
          subject={subject}
          onClose={() => setTopicDetail(null)}
          onOpenResources={(topicId) => {
            setTopicDetail(null);
            navigate(`/resources/${topicId}`);
          }}
        />
      )}
    </AppShell>
  );
}

function TopicRow({
  topic,
  index,
  subjectCode,
  chapterTitle,
  onSelect,
  selected,
}: {
  topic: Topic;
  index: number;
  subjectCode: string;
  chapterTitle?: string;
  onSelect: () => void;
  selected?: boolean;
}) {
  return (
    <li>
      <button
        onClick={onSelect}
        className={cn(
          "grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-4 text-left transition-colors",
          selected ? "bg-teal/5" : "hover:bg-ivory-deep/60"
        )}
      >
        <span className="index-num">{String(index + 1).padStart(2, "0")}</span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[9px] font-medium uppercase tracking-wider text-ink/50">
              {subjectNames[subjectCode] ?? subjectCode}
            </span>
            {chapterTitle && (
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                {chapterTitle}
              </span>
            )}
            <StateBadge state={topic.state} />
            <RevisionChip dueInDays={topic.revisionDueInDays} status={topic.revisionStatus} />
          </div>
          <div className="mt-1.5 font-serif text-[16px] font-bold text-ink">{topic.title}</div>
          <div className="mt-2.5 flex items-center gap-3">
            <MasteryBar value={topic.mastery} className="max-w-[160px]" />
            <span className="font-mono text-[11px] font-medium text-dark-text/60">{topic.mastery}%</span>
            {topic.lastStudied && (
              <span className="font-mono text-[10px] text-muted-foreground">
                last studied {formatDate(topic.lastStudied)}
              </span>
            )}
          </div>
          {topic.recommendedAction && (
            <div className="mt-2 flex items-start gap-2">
              <ActionChip action={topic.recommendedAction} />
              <span className="footnote max-w-xl">{topic.actionReason}</span>
            </div>
          )}
        </div>
        <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:block">
          {topic.estimatedMinutes} min
        </span>
      </button>
    </li>
  );
}

function TopicDetail({
  topic,
  subject,
  onClose,
  onOpenResources,
}: {
  topic: Topic;
  subject: Subject;
  onClose: () => void;
  onOpenResources: (topicId: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40" onClick={onClose}>
      <aside
        className="h-full w-full max-w-lg overflow-y-auto border-l border-ink/15 bg-ivory shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-ink/10 px-6 py-5">
          <div className="flex items-center justify-between">
            <Marginalia className="[&::before]:hidden">
              Topic dossier — {subjectNames[subject.code] ?? subject.code}
            </Marginalia>
            <button
              onClick={onClose}
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-ink"
            >
              Close
            </button>
          </div>
          <h2 className="mt-3 font-serif text-2xl font-bold text-ink">{topic.title}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StateBadge state={topic.state} />
            <RevisionChip dueInDays={topic.revisionDueInDays} status={topic.revisionStatus} />
            {topic.recommendedAction && <ActionChip action={topic.recommendedAction} />}
          </div>
        </div>

        <div className="space-y-7 px-6 py-6">
          {/* Mastery */}
          <section>
            <div className="marginalia [&::before]:hidden">Mastery — {topic.mastery}%</div>
            <MasteryBar value={topic.mastery} className="mt-3" />
            <p className="mt-3 footnote">
              {topic.state === "mastered"
                ? "This topic has crossed the mastery threshold. The spaced scheduler will still surface it for retention checks."
                : topic.state === "weak"
                  ? "Weak-topic detection has flagged this topic. Mastery is below threshold and error patterns are recurring."
                  : topic.state === "new"
                    ? "No learning data yet. Begin the first session to open your file on this topic."
                    : `Topic state: ${topic.state.toLowerCase()}. ${topic.mastery >= 45 ? "Developing steadily." : "Below proficiency — targeted work is recommended."}`}
            </p>
          </section>

          {/* Objectives */}
          <section>
            <div className="marginalia [&::before]:hidden">Learning objectives</div>
            <ol className="mt-3 space-y-2.5">
              {topic.objectives.map((o, i) => (
                <li key={o.id} className="grid grid-cols-[1.5rem_1fr] gap-3">
                  <span className="index-num pt-0.5">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[13.5px] leading-relaxed text-dark-text/85">{o.text}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Why recommended */}
          {topic.recommendedAction && topic.actionReason && (
            <section className="border border-amber/40 bg-amber/5 p-4">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-dark">
                Why Cognify recommends: {topic.recommendedAction}
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-dark-text/80">{topic.actionReason}</p>
            </section>
          )}

          {/* Resources */}
          <section>
            <div className="marginalia [&::before]:hidden">Available resources</div>
            <ul className="mt-3 divide-y divide-ink/8 border-y border-ink/10">
              {topic.resources.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-serif text-[14px] font-bold text-ink">{r.label}</div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <ActionChip action={r.type === "video" ? "learn" : r.type} />
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {r.durationMinutes} min
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    In explorer
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid gap-2">
              <button
                onClick={() => onOpenResources(topic.id)}
                className="btn-primary"
              >
                Open resource explorer
              </button>
              <a
                href={`/topic/${topicAlias(topic.id) ?? topic.id}`}
                className="block border border-ink/20 px-4 py-2.5 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink/70 transition-colors hover:border-teal hover:text-teal"
              >
                Open learning dossier →
              </a>
            </div>
          </section>

          {/* Meta */}
          <section className="grid grid-cols-2 gap-px border border-ink/10 bg-ink/10">
            <div className="bg-card p-4">
              <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Last studied</div>
              <div className="mt-1 font-mono text-[12px] font-medium text-ink">
                {topic.lastStudied ? formatDate(topic.lastStudied) : "Never"}
              </div>
            </div>
            <div className="bg-card p-4">
              <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Next revision</div>
              <div className="mt-1 font-mono text-[12px] font-medium text-ink">
                {topic.revisionDueInDays === null
                  ? "Not scheduled"
                  : topic.revisionDueInDays <= 0
                    ? "Overdue"
                    : `In ${topic.revisionDueInDays} days`}
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
