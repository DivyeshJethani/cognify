/**
 * COGNIFY — Study Groups (Day 10 rework)
 *
 * Three things a study group actually does: chat about topics, ask and
 * answer doubts, and teach each other. Everything is scoped to the
 * student's board and class. Live group chat persists to localStorage
 * (cognify.community.v1) alongside the seeded discussion threads.
 *
 * Style: Scholar's Atelier — ivory ground, ink text, teal accents.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { findPeer, myGroup } from "@/lib/studyGroups";
import { getStudyContext, onContextChange } from "@/lib/studyContext";
import { cn } from "@/lib/utils";
import { HelpCircle, Lightbulb, Send, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const CHAT_KEY = "cognify.community.v1";

interface ChatMessage {
  id: string;
  author: string;
  initials: string;
  message: string;
  when: string;
  topicTitle?: string;
  mine?: boolean;
}

const SUBJECT_NAMES: Record<string, string> = {
  MATH: "Mathematics",
  SCI: "Science",
  SST: "Social Science",
  ENG: "English",
  HIN: "Hindi",
  SKT: "Sanskrit",
};

function loadChat(): ChatMessage[] {
  try {
    const raw = JSON.parse(localStorage.getItem(CHAT_KEY) ?? "null");
    return Array.isArray(raw) ? (raw as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export default function Community() {
  const group = myGroup();
  const [, rerender] = useState(0);
  useEffect(() => onContextChange(() => rerender((n) => n + 1)), []);
  const ctx = getStudyContext();

  const requests = group.needHelp;
  const teachOffers = group.canTeach.filter((r) => r.kind === "can-teach");
  const [matched, setMatched] = useState<Record<string, boolean>>({});

  /* ---- group chat ---- */
  const [chat, setChat] = useState<ChatMessage[]>(
    () => loadChat() ?? group.discussions.map((d) => ({ ...d, mine: false }))
  );
  useEffect(() => {
    localStorage.setItem(CHAT_KEY, JSON.stringify(chat));
  }, [chat]);

  const [draft, setDraft] = useState("");
  const [doubtDraft, setDoubtDraft] = useState("");

  const [doubtOpen, setDoubtOpen] = useState<Record<string, boolean>>({});
  const [doubtReplies, setDoubtReplies] = useState<Record<string, string>>({});

  const members = useMemo(
    () => [
      { name: "You", initials: "YO", tag: "This is you" },
      { name: "Ishita R.", initials: "IR", tag: "Science" },
      { name: "Arjun V.", initials: "AV", tag: "Mathematics" },
      { name: "Meera S.", initials: "MS", tag: "Social Science" },
      { name: "Rohan K.", initials: "RK", tag: "Mathematics" },
      { name: "Ritika P.", initials: "RP", tag: "Science" },
    ],
    []
  );

  function sendChat() {
    const msg = draft.trim();
    if (!msg) return;
    setChat((c) => [
      ...c,
      { id: `m-${Date.now().toString(36)}`, author: "You", initials: "YO", message: msg, when: "now", topicTitle: undefined, mine: true },
    ]);
    setDraft("");
  }

  function handleFindPeer(request: { id: string; topicTitle: string }) {
    const peers = findPeer(request.topicTitle);
    const found = peers.length > 0;
    setMatched((m) => ({ ...m, [request.id]: found }));
    toast.success(found ? "A classmate can help" : "Nobody has cleared this yet", {
      description: found
        ? `${peers[0].name} has cleared this topic — a short teach session fits your week.`
        : "Keep working on it — when you do, you'll be the one others ask.",
    });
  }

  function answerDoubt(id: string) {
    const reply = doubtReplies[id]?.trim();
    if (!reply) return;
    setDoubtReplies((d) => ({ ...d, [id]: "" }));
    setDoubtOpen((d) => ({ ...d, [id]: true }));
    toast.success("Your answer is in the group", { description: "Classmates can see it and build on it." });
  }

  return (
    <AppShell>
      <PageHeader
        overline="Study Groups"
        title={`${ctx.boardName} · ${ctx.className}`}
        subtitle="Chat about topics, ask doubts, and teach classmates. One concept at a time."
      />

      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        {/* Group chat */}
        <section className="rise-in border border-ink/12 bg-card">
          <div className="flex items-center justify-between border-b border-ink/10 px-5 py-3.5">
            <span className="font-display text-[13px] font-bold uppercase tracking-[0.06em] text-ink/60">
              Group chat
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink/40">
              <Users className="h-3 w-3" /> {group.memberCount} members
            </span>
          </div>

          <div className="flex max-h-[380px] flex-col gap-4 overflow-y-auto px-5 py-5">
            {chat.map((m) => (
              <div key={m.id} className={cn("flex gap-3", m.mine && "flex-row-reverse")}>
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center border font-mono text-[11px]",
                    m.mine ? "border-teal bg-teal/10 text-teal" : "border-teal text-teal"
                  )}
                >
                  {m.initials}
                </span>
                <div className={cn("min-w-0 max-w-[75%]", m.mine && "text-right")}>
                  <div className="flex flex-wrap items-baseline gap-2" style={m.mine ? { justifyContent: "flex-end" } : undefined}>
                    <span className="font-display text-[13px] font-bold text-ink">{m.author}</span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-ink/35">{m.when}</span>
                  </div>
                  <p className="mt-0.5 rounded-sm border border-ink/8 bg-ivory/60 px-3 py-1.5 text-[13.5px] leading-relaxed text-ink/80">
                    {m.message}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-ink/10 px-5 py-4">
            <div className="flex items-center gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Share a study tip, ask a doubt…"
                className="border-ink/20 bg-ivory text-[14px]"
              />
              <Button onClick={sendChat} className="h-10 w-10 shrink-0 bg-teal text-white hover:bg-teal-dark" aria-label="Send">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Doubts */}
        <section className="rise-in mt-10" style={{ animationDelay: "60ms" }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-[17px] font-bold text-ink">Doubts in your class</p>
              <p className="mt-1 text-[13.5px] text-ink/60">Ask one, answer one. Someone nearby has usually already cleared it.</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Input
              value={doubtDraft}
              onChange={(e) => setDoubtDraft(e.target.value)}
              placeholder="Your doubt — e.g. why does the discriminant decide the shape of the graph?"
              className="border-ink/20 bg-ivory text-[14px]"
            />
            <Button
              onClick={() => {
                if (!doubtDraft.trim()) return;
                const req = group.needHelp[0];
                setChat((c) => [
                  ...c,
                  {
                    id: `q-${Date.now().toString(36)}`,
                    author: "You",
                    initials: "YO",
                    message: `Doubt: ${doubtDraft.trim()}`,
                    when: "now",
                    topicTitle: req?.topicTitle,
                    mine: true,
                  },
                ]);
                setDoubtDraft("");
                toast.success("Your doubt is in the group");
              }}
              className="h-10 shrink-0 bg-ink text-ivory hover:bg-ink/90"
            >
              <HelpCircle className="mr-1.5 h-4 w-4" /> Ask doubt
            </Button>
          </div>

          <div className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
            {requests.map((r) => (
              <div key={r.id} className="rise-in py-5">
                <div className="flex flex-wrap items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-amber" />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-ink/45">
                    {SUBJECT_NAMES[r.subjectCode] ?? r.subjectCode}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-ink/35">
                    {r.author} · {r.when}
                  </span>
                </div>
                <p className="mt-1.5 font-display text-[16px] font-bold leading-snug text-ink">{r.topicTitle}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-ink/65">{r.detail}</p>
                {doubtOpen[r.id] ? (
                  <p className="mt-3 rounded-sm border border-green/40 bg-green/5 px-3 py-2 text-[13px] leading-relaxed text-ink/75">
                    ✓ Answered in chat — classmates are discussing it now.
                  </p>
                ) : matched[r.id] === undefined ? (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 border-ink/25 bg-transparent px-3 text-[12.5px] uppercase tracking-wider text-ink/80 hover:bg-ink/5"
                      onClick={() => handleFindPeer(r)}
                    >
                      <Users className="mr-1.5 h-3.5 w-3.5" /> Find who cleared this
                    </Button>
                    <button
                      onClick={() => setDoubtOpen((d) => ({ ...d, [r.id]: false }))}
                      className={cn(
                        "font-mono text-[12px] uppercase tracking-wider transition-colors",
                        doubtReplies[r.id] ? "text-teal" : "text-ink/50 hover:text-ink"
                      )}
                    >
                      I know this — answer it
                    </button>
                  </div>
                ) : null}
                {doubtOpen[r.id] === false && (
                  <div className="mt-3 flex items-start gap-2">
                    <Textarea
                      value={doubtReplies[r.id] ?? ""}
                      onChange={(e) => setDoubtReplies((d) => ({ ...d, [r.id]: e.target.value }))}
                      placeholder="Your answer, in plain words…"
                      className="min-h-[60px] border-ink/20 bg-ivory text-[13.5px]"
                    />
                    <Button size="sm" onClick={() => answerDoubt(r.id)} className="h-9 shrink-0 bg-teal text-white hover:bg-teal-dark">
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
                {matched[r.id] === true && !doubtOpen[r.id] && (
                  <p className="mt-2.5 font-mono text-[12.5px] text-teal-dark">
                    ✓ A teach session with a classmate fits into your week.
                  </p>
                )}
              </div>
            ))}
            {requests.length === 0 && <p className="py-6 text-[13.5px] text-ink/55">Nothing open right now.</p>}
          </div>
        </section>

        {/* Peer teaching */}
        <section className="rise-in mt-10" style={{ animationDelay: "120ms" }}>
          <p className="font-display text-[17px] font-bold text-ink">Peer teaching</p>
          <p className="mt-1 text-[13.5px] text-ink/60">Offer to teach a topic you've cleared — it builds your mastery faster than any recap.</p>

          <div className="mt-4 grid gap-px border border-ink/12 bg-ink/10 sm:grid-cols-2">
            {teachOffers.map((c) => (
              <div key={c.id} className="bg-card p-4">
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink/45">
                  {SUBJECT_NAMES[c.subjectCode] ?? c.subjectCode}
                </span>
                <div className="mt-1 font-display text-[15px] font-bold leading-snug text-ink">{c.topicTitle}</div>
                <div className="mt-2 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-teal">
                  <Lightbulb className="h-3 w-3" /> You can teach this
                </div>
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-ink/25 bg-transparent px-3 text-[12px] uppercase tracking-wider text-ink/80 hover:border-teal hover:text-teal"
                    onClick={() =>
                      toast.success("Offer sent to the group", {
                        description: `Classmates asking about “${c.topicTitle}” will see you can help.`,
                      })
                    }
                  >
                    Offer to teach
                  </Button>
                </div>
              </div>
            ))}
            {teachOffers.length === 0 && (
              <p className="bg-card p-5 text-[13.5px] text-ink/55">Nothing listed yet — clear a concept to offer it.</p>
            )}
          </div>
        </section>

        {/* Members */}
        <section className="rise-in mt-10" style={{ animationDelay: "180ms" }}>
          <p className="font-display text-[17px] font-bold text-ink">Who's in this group</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {members.map((m) => (
              <span
                key={m.name}
                className={cn(
                  "flex items-center gap-2 border px-3 py-1.5",
                  m.name === "You" ? "border-teal/50 bg-teal/5" : "border-ink/12 bg-card"
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center border border-teal/60 font-mono text-[10px] text-teal">
                  {m.initials}
                </span>
                <span className="font-display text-[13px] font-bold text-ink">{m.name}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink/40">{m.tag}</span>
              </span>
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
