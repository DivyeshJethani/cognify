/**
 * COGNIFY — Study Groups (Day 4)
 * Peer-teach network: discussions, teach requests (needHelp), students who
 * can teach (canTeach), and peer matching from the adaptive loop.
 *
 * Style: Scholar's Atelier — ledger, marginalia, mono stats, hairline rules.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import {
  Marginalia,
  StatCell,
} from "@/components/cognify/Primitives";
import { Button } from "@/components/ui/button";
import { myGroup, findPeer, groupActivityNote } from "@/lib/studyGroups";
import { ArrowRight, BookOpen, HelpCircle, Lightbulb, MessageSquare, Users } from "lucide-react";
import { useState } from "react";
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
  const requests = [...group.needHelp, ...group.canTeach.filter((r) => r.kind === "need-help")];
  const teachOffers = group.canTeach.filter((r) => r.kind === "can-teach");
  const [matched, setMatched] = useState<Record<string, string | null>>({});

  function handleFindPeer(request: { id: string; topicTitle: string; subjectCode: string }) {
    const peers = findPeer(request.topicTitle);
    const peer = peers[0];
    setMatched((m) => ({ ...m, [request.id]: peer?.name ?? null }));
    if (peer) {
      toast.success("Peer found", {
        description: `${peer.name} (${peer.strength}, mastery ${peer.mastery}%) — a teach session is queued in your timetable.`,
      });
    } else {
      toast.info("No peer cleared this yet", {
        description: "The request has been flagged for a guided review instead.",
      });
    }
  }

  return (
    <AppShell>
      <PageHeader
        overline="Study Groups"
        title="Your peer-teach network"
        subtitle={`A ${group.board} study group of ${group.memberCount}, matched to your Learning DNA. Weak concepts are routed to students who have cleared them; concepts you teach earn you credits and evidence.`}
      />

      <div className="px-5 py-7 sm:px-8 lg:px-10">
        {/* Stats ledger */}
        <div className="rise-in grid grid-cols-2 gap-y-6 border-b border-ink/10 pb-7 sm:grid-cols-4">
          <StatCell
            label="Group members"
            value={`${group.memberCount}`}
            sub={group.board}
          />
          <StatCell
            label="Open teach requests"
            value={`${requests.length}`}
            sub="gaps the network can fill"
          />
            <StatCell
            label="You can teach"
            value={`${group.canTeach.filter((r) => r.kind === "can-teach").length}`}
            sub="concepts you've cleared"
          />
          <StatCell
            label="Active discussions"
            value={`${group.discussions.length}`}
            sub="this week"
          />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          {/* ---------- Main column ---------- */}
          <div className="min-w-0 space-y-10">
            {/* Teach requests */}
            <section>
              <Marginalia amber>
                Teach requests — gaps seeking a teacher
              </Marginalia>
              <div className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
                {requests.map((r) => (
                  <div key={r.id} className="rise-in grid gap-4 py-6 sm:grid-cols-[2.5rem_1fr]">
                    <div className="index-num pt-0.5">
                      <HelpCircle className="h-4 w-4 text-amber" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-ink/50">
                          {subjectNames[r.subjectCode] ?? r.subjectCode}
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                          asked {r.when} by {r.author}
                        </span>
                      </div>
                      <h3 className="mt-1.5 font-serif text-[17px] font-bold text-ink">{r.topicTitle}</h3>
                      <p className="mt-2 footnote">{r.detail}</p>
                      {matched[r.id] === undefined ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3 h-8 border-ink/25 bg-transparent px-3 text-[11px] uppercase tracking-wider text-ink/80 hover:bg-ink/5"
                          onClick={() => handleFindPeer(r)}
                        >
                          <Users className="mr-1.5 h-3.5 w-3.5" /> Find a peer who cleared this
                        </Button>
                      ) : matched[r.id] ? (
                        <div className="mt-3 flex items-center gap-2 font-mono text-[11px] text-teal-dark">
                          <BookOpen className="h-3.5 w-3.5" />
                          {matched[r.id]} has cleared this topic · teach session queued
                        </div>
                      ) : (
                        <div className="mt-3 font-mono text-[11px] text-muted-foreground">
                          No peer has cleared this yet — it has been flagged for a guided review.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {requests.length === 0 && (
                  <p className="py-6 footnote">No open teach requests right now.</p>
                )}
              </div>
            </section>

            {/* Discussions */}
            <section>
              <Marginalia>Discussions — this week</Marginalia>
              <div className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
                {group.discussions.map((d) => (
                  <div key={d.id} className="rise-in grid gap-4 py-5 sm:grid-cols-[2.5rem_1fr]">
                    <div className="index-num pt-0.5">
                      <MessageSquare className="h-4 w-4 text-teal" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center border border-teal font-mono text-[10px] font-medium text-teal">
                          {d.initials}
                        </span>
                        <span className="font-serif text-[15px] font-bold text-ink">{d.author}</span>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                          {d.when}
                        </span>
                        {d.topicTitle && (
                          <span className="font-mono text-[9px] uppercase tracking-wider text-teal">
                            {d.topicTitle}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 footnote">{d.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* You can teach */}
            <section>
              <Marginalia>Concepts you can teach — earn credits by clearing gaps</Marginalia>
              <div className="mt-5 grid gap-px border border-ink/12 bg-ink/10 sm:grid-cols-2">
                {teachOffers.map((c) => (
                  <div key={c.id} className="bg-card p-5">
                    <span className="font-mono text-[9px] font-medium uppercase tracking-wider text-ink/50">
                      {subjectNames[c.subjectCode] ?? c.subjectCode}
                    </span>
                    <div className="mt-1 font-serif text-[15px] font-bold leading-snug text-ink">
                      {c.topicTitle}
                    </div>
                    <div className="mt-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-teal">
                      <Lightbulb className="h-3 w-3" /> You can teach this
                    </div>
                  </div>
                ))}
                {teachOffers.length === 0 && (
                  <p className="bg-card p-5 footnote">No teach offers listed yet — clear a concept to post one.</p>
                )}
              </div>
            </section>
          </div>

          {/* ---------- Rail ---------- */}
          <div className="space-y-10">
            <section className="border border-ink/12 bg-card p-5">
              <Marginalia className="[&::before]:hidden">Group activity</Marginalia>
              <p className="mt-2 footnote">{groupActivityNote()}</p>
              <div className="mt-4 flex items-center gap-2 border-t border-ink/10 pt-3">
                <Users className="h-4 w-4 text-teal" />
                <span className="font-mono text-[11px] text-muted-foreground">
                  {group.memberCount} members · {group.board} board
                </span>
              </div>
            </section>

            <section className="border border-ink/12 bg-card">
              <div className="border-b border-ink/10 px-5 py-4">
                <Marginalia className="[&::before]:hidden">How matching works</Marginalia>
              </div>
              <div className="divide-y divide-ink/8 px-5">
                <div className="py-3.5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/60">
                    Gap → mastery map
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink/80">
                    A teach request is matched against members whose DNA records cleared that
                    topic at 75%+ with evidence — not self-reported confidence.
                  </p>
                </div>
                <div className="py-3.5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/60">
                    Teaching is evidence
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink/80">
                    Teaching a peer counts as a teach-back session — it strengthens your own
                    mastery record and earns credits.
                  </p>
                </div>
                <div className="py-3.5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/60">
                    Guardrails
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink/80">
                    Sessions are structured around concepts, not chat. Every match lands in your
                    timetable as a timed block.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <Marginalia>Quick links</Marginalia>
              <ul className="mt-4 space-y-3">
                {[
                  { href: "/teach", label: "Teach Cognify", detail: "teach a concept to the engine" },
                  { href: "/adaptive", label: "Adaptive Lab", detail: "how your gaps are detected" },
                  { href: "/timetable", label: "Your timetable", detail: "teach sessions appear here" },
                ].map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="group flex items-baseline justify-between border-b border-ink/10 pb-2"
                    >
                      <span className="font-serif text-[14px] font-bold text-ink">{l.label}</span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-teal opacity-0 transition-opacity group-hover:opacity-100">
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
