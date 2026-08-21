/**
 * COGNIFY — Study Groups (Day 9)
 * Simple peer-learning view, scoped by your board, class and curriculum.
 * No analytics, no stats ledger — just: who needs help, who can teach,
 * what classmates are discussing.
 * Style: Scholar's Atelier — ivory ground, ink text, teal accents.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import { Button } from "@/components/ui/button";
import { myGroup, findPeer } from "@/lib/studyGroups";
import { getStudyContext, onContextChange } from "@/lib/studyContext";
import { HelpCircle, Lightbulb, MessageSquare, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const subjectNames: Record<string, string> = {
  MATH: "Mathematics",
  SCI: "Science",
  SST: "Social Science",
  ENG: "English",
  HIN: "Hindi",
  SKT: "Sanskrit",
};

export default function Community() {
  const group = myGroup();

  // Scoped to the student's real board and class from onboarding.
  const [, rerender] = useState(0);
  useEffect(() => onContextChange(() => rerender((n) => n + 1)), []);
  const ctx = getStudyContext();

  const requests = group.needHelp;
  const teachOffers = group.canTeach.filter((r) => r.kind === "can-teach");
  const [matched, setMatched] = useState<Record<string, boolean>>({});

  function handleFindPeer(request: { id: string; topicTitle: string }) {
    const peers = findPeer(request.topicTitle);
    const found = peers.length > 0;
    setMatched((m) => ({ ...m, [request.id]: found }));
    if (found) {
      toast.success("A classmate can help", {
        description: `${peers[0].name} has cleared this topic — a short teach session fits your week.`,
      });
    } else {
      toast.info("Nobody has cleared this yet", {
        description: "Keep working on it — when you do, you'll be the one others ask.",
      });
    }
  }

  return (
    <AppShell>
      <PageHeader
        overline="Study Groups"
        title={`${ctx.boardName} · ${ctx.className} · students like you`}
        subtitle="A small group from your board and class, learning the same curriculum. When a concept trips you up, someone nearby has usually already cleared it — and teaching it back makes their own understanding stronger."
      />

      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        {/* Who needs help */}
        <section className="rise-in">
          <p className="font-display text-[17px] font-bold text-ink">Concepts classmates are stuck on</p>
          <div className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
            {requests.map((r) => (
              <div key={r.id} className="rise-in py-5">
                <div className="flex flex-wrap items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-amber" />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-ink/45">
                    {subjectNames[r.subjectCode] ?? r.subjectCode}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-ink/35">
                    {r.author} · {r.when}
                  </span>
                </div>
                <p className="mt-1.5 font-display text-[16px] font-bold leading-snug text-ink">{r.topicTitle}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-ink/65">{r.detail}</p>
                {matched[r.id] === undefined ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 h-8 border-ink/25 bg-transparent px-3 text-[13px] uppercase tracking-wider text-ink/80 hover:bg-ink/5"
                    onClick={() => handleFindPeer(r)}
                  >
                    <Users className="mr-1.5 h-3.5 w-3.5" /> Find a classmate who cleared this
                  </Button>
                ) : matched[r.id] ? (
                  <p className="mt-2.5 font-mono text-[12.5px] text-teal-dark">
                    ✓ A teach session with them fits into your week.
                  </p>
                ) : (
                  <p className="mt-2.5 font-mono text-[12.5px] text-ink/50">
                    Nobody has cleared this yet — be the first.
                  </p>
                )}
              </div>
            ))}
            {requests.length === 0 && (
              <p className="py-6 text-[13.5px] text-ink/55">Nothing open right now.</p>
            )}
          </div>
        </section>

        {/* You can teach */}
        <section className="rise-in mt-10">
          <p className="font-display text-[17px] font-bold text-ink">Concepts you could teach</p>
          <p className="mt-1 text-[13.5px] text-ink/60">
            These came up strong in your own learning — offering to explain them builds your own mastery fastest.
          </p>
          <div className="mt-4 grid gap-px border border-ink/12 bg-ink/10 sm:grid-cols-2">
            {teachOffers.map((c) => (
              <div key={c.id} className="bg-card p-4">
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink/45">
                  {subjectNames[c.subjectCode] ?? c.subjectCode}
                </span>
                <div className="mt-1 font-display text-[15px] font-bold leading-snug text-ink">{c.topicTitle}</div>
                <div className="mt-2 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-teal">
                  <Lightbulb className="h-3 w-3" /> You can teach this
                </div>
              </div>
            ))}
            {teachOffers.length === 0 && (
              <p className="bg-card p-5 text-[13.5px] text-ink/55">Nothing listed yet — clear a concept to offer it.</p>
            )}
          </div>
        </section>

        {/* What classmates are saying */}
        <section className="rise-in mt-10">
          <p className="font-display text-[17px] font-bold text-ink">In the group</p>
          <div className="mt-4 space-y-4">
            {group.discussions.map((d) => (
              <div key={d.id} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-teal font-mono text-[11px] font-medium text-teal">
                  {d.initials}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-display text-[14px] font-bold text-ink">{d.author}</span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-ink/35">{d.when}</span>
                    {d.topicTitle && (
                      <span className="font-mono text-[10px] uppercase tracking-wider text-teal">{d.topicTitle}</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[13.5px] leading-relaxed text-ink/70">{d.message}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-10 text-center text-[12px] text-ink/45">
          Discussions stay on-topic. One concept at a time — that's how studying together actually helps.
        </p>
      </div>
    </AppShell>
  );
}
