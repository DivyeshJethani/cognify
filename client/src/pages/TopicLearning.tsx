/**
 * COGNIFY — Topic Learning page (/topic/:topicId)
 * The full dossier for one topic: what it is, how strong the student is,
 * what to learn first, another explanation if the first pass fails, and the
 * DNA note. Scholar's Atelier — marginalia, ledger, hairlines, observation.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import {
  ActionChip,
  Hairline,
  Marginalia,
  MasteryBar,
} from "@/components/cognify/Primitives";
import { anotherExplanation, buildRails } from "@/lib/recommendations";
import { discoverResources } from "@/lib/resourceDiscovery";
import { findTopicByIdOrAlias } from "@/lib/curriculum";
import type { LearningResource } from "@/lib/types";
import { Clock, FlaskConical, Lightbulb, SearchX, Sparkles } from "lucide-react";
import { useLocation, useRoute } from "wouter";

const DIFFICULTY_COLORS: Record<string, string> = {
  foundational: "#7fa894",
  core: "#1f9d8b",
  advanced: "#102a43",
  stretch: "#c9862a",
};

function sourceGlyph(source: LearningResource["source"]): string {
  switch (source) {
    case "youtube":
      return "▶";
    case "ncert":
      return "NC";
    case "cbse":
      return "CB";
    case "edu-website":
      return "W";
    case "cognify-original":
      return "◎";
    default:
      return "?";
  }
}

export default function TopicLearning() {
  const [match, params] = useRoute("/topic/:topicId");
  const topicId = match ? params.topicId : "";
  const [, navigate] = useLocation();
  const resolved = findTopicByIdOrAlias(topicId);

  if (!resolved) {
    return (
      <AppShell>
        <PageHeader
          overline="Topic Dossier"
          title="Topic not found"
          subtitle="Select a topic from the Curriculum Explorer to open its dossier."
        />
      </AppShell>
    );
  }

  const { subject, chapter, topic } = resolved;
  const discovery = discoverResources(topicId);
  const resources = discovery?.resources ?? [];
  const alts = anotherExplanation(topicId);
  const rails = buildRails();
  const dnaRail = rails.find((r) => r.id === "recommended")?.items ?? [];

  const firstRecommended = resources[0];
  const dnaItems = dnaRail.filter((d) => d.resource?.topicId === topicId).slice(0, 2);

  return (
    <AppShell>
      <PageHeader
        overline="Topic Dossier"
        title={topic.title}
        subtitle={`${subject.name} · Chapter ${String(chapter.index).padStart(2, "0")} — ${chapter.title} · ${resources.length} resources available · ${topic.estimatedMinutes} minutes expected`}
        actions={
          <button
            onClick={() => navigate("/curriculum")}
            className="border border-ink/15 bg-card px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink/70 transition-colors hover:border-teal hover:text-teal"
          >
            ← Curriculum Explorer
          </button>
        }
      />

      <div className="flex flex-col gap-8 px-5 py-7 sm:px-8 lg:flex-row lg:px-10">
        {/* Main ledger */}
        <section className="min-w-0 flex-1">
          {/* Dossier summary */}
          <div className="border border-ink/10 bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="marginalia [&::before]:hidden">The dossier</div>
                <p className="mt-3 text-[14px] leading-relaxed text-dark-text/75">
                  {topic.actionReason ??
                    `A topic in ${chapter.title}. Your mastery sits at ${topic.mastery}%, so the recommended first pass below is calibrated to ${topic.mastery < 50 ? "rebuild the idea from the ground up" : "tighten the gaps around the core"} — not to rehearse what you already know.`}
                </p>
              </div>
              <div className="w-full shrink-0 sm:w-56">
                <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                  Mastery — {topic.mastery}%
                </div>
                <MasteryBar value={topic.mastery} className="mt-2" />
                <div className="mt-3 grid grid-cols-2 gap-px bg-ink/10">
                  <div className="bg-ivory p-2.5">
                    <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Est. time</div>
                    <div className="mt-0.5 font-mono text-sm font-medium text-ink">{topic.estimatedMinutes} min</div>
                  </div>
                  <div className="bg-ivory p-2.5">
                    <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Status</div>
                    <div className="mt-0.5 font-mono text-sm font-medium text-ink">{topic.mastery < 50 ? "In progress" : topic.mastery < 85 ? "Strengthening" : "Mastered"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended first pass */}
          {resources.length > 0 && (
            <div className="mt-7">
              <div className="marginalia">Recommended first pass</div>
              <ul className="mt-3 divide-y divide-ink/8 border-y border-ink/10">
                {resources.slice(0, 5).map((r, i) => (
                  <li key={r.id}>
                    <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-4">
                      <span className="index-num">{String(i + 1).padStart(2, "0")}</span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="flex h-5 w-5 items-center justify-center border font-mono text-[8px] font-bold"
                            style={{ borderColor: DIFFICULTY_COLORS[r.difficulty], color: DIFFICULTY_COLORS[r.difficulty] }}
                            title={r.sourceLabel}
                          >
                            {sourceGlyph(r.source)}
                          </span>
                          <span className="font-mono text-[10px] text-ink/55">{r.sourceLabel}</span>
                          <ActionChip action={r.format === "practice" ? "practice" : r.format === "revision" ? "revise" : "learn"} />
                          <span
                            className="border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                            style={{ borderColor: DIFFICULTY_COLORS[r.difficulty], color: DIFFICULTY_COLORS[r.difficulty] }}
                          >
                            {r.difficulty}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3" /> {r.durationMinutes} min
                          </span>
                          {i === 0 && (
                            <span className="flex items-center gap-1 border border-amber/40 bg-amber/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-amber-dark">
                              <Sparkles className="h-3 w-3" /> best first pick
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5 font-serif text-[15px] font-bold leading-snug text-ink">
                          {r.title}
                        </div>
                        <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-dark-text/70">
                          <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.1em] text-teal-dark">
                            Why —{" "}
                          </span>
                          {r.whyRecommended}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/session/${r.id}?topic=${topicId}`)}
                        className="h-9 whitespace-nowrap border border-ink bg-ink px-4 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ivory transition-all duration-150 hover:bg-teal hover:border-teal active:scale-[0.97]"
                      >
                        {i === 0 ? "Begin here" : "Begin session"}
                      </button>
                    </div>
                    <Hairline className="-mb-1" />
                  </li>
                ))}
              </ul>
              {resources.length > 5 && (
                <button
                  onClick={() => navigate(`/resources/${topicId}`)}
                  className="mt-3 h-9 border border-ink/25 bg-card px-4 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink/70 transition-all duration-150 hover:border-teal hover:text-teal active:scale-[0.97]"
                >
                  Show all {resources.length} resources →
                </button>
              )}
            </div>
          )}

          {/* Another explanation — appears after the first pass fails to stick */}
          {alts.length > 0 && (
            <div className="mt-8">
              <div className="marginalia">Another explanation</div>
              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-dark-text/70">
                If the first pass above did not hold, do not repeat it — meet the idea in a
                different format. These surface after a session registers a replay or an
                “I need another explanation” reflection.
              </p>
              <ul className="mt-3 divide-y divide-ink/8 border-y border-ink/10">
                {alts.map((a, i) => (
                  <li key={a.title + i}>
                    <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-3.5">
                      <FlaskConical className="h-4 w-4 shrink-0 text-teal" />
                      <div className="min-w-0">
                        <div className="font-serif text-[15px] font-bold leading-snug text-ink">
                          {a.title}
                        </div>
                        <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {a.context}
                        </div>
                      </div>
                      <button
                        onClick={() => a.resource && navigate(`/session/${a.resource.id}?topic=${topicId}`)}
                        className="h-9 whitespace-nowrap border border-teal/60 bg-transparent px-4 font-mono text-[10.5px] uppercase tracking-[0.12em] text-teal transition-all duration-150 hover:bg-teal hover:text-white active:scale-[0.97]"
                      >
                        Try this one
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resources.length === 0 && (
            <div className="mt-10 flex flex-col items-center gap-3 border border-dashed border-ink/20 py-14 text-center">
              <SearchX className="h-6 w-6 text-ink/30" />
              <div className="font-serif text-lg font-bold text-ink">No resources indexed yet</div>
              <p className="footnote max-w-md">
                This topic awaits its first resource pass from the discovery pipeline.
              </p>
            </div>
          )}
        </section>

        {/* Margin */}
        <aside className="w-full shrink-0 space-y-6 lg:w-80">
          <div className="border border-ink bg-ink p-5 text-ivory">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-teal">DNA note</div>
            <p className="mt-2 font-serif text-[15px] leading-relaxed">
              {dnaItems[0]?.why ??
                `Your profile suggests a ${firstRecommended?.resourceType.replace("-", " ") ?? "guided lecture"}-first approach for this topic — ${topic.mastery < 50 ? "the idea needs building, not polishing" : "the gaps are specific, not systemic"}.`}
            </p>
          </div>

          <div className="border border-ink/10 bg-card p-5">
            <Marginalia>Working sequence</Marginalia>
            <ol className="mt-3 space-y-2.5">
              <li className="flex gap-2.5 text-[13px] leading-relaxed text-dark-text/75">
                <span className="index-num">01</span>
                <span>Begin the recommended first pass above.</span>
              </li>
              <li className="flex gap-2.5 text-[13px] leading-relaxed text-dark-text/75">
                <span className="index-num">02</span>
                <span>Note any segment that resists — the replay list forms from it.</span>
              </li>
              <li className="flex gap-2.5 text-[13px] leading-relaxed text-dark-text/75">
                <span className="index-num">03</span>
                <span>If the idea still slips, take “another explanation” below.</span>
              </li>
              <li className="flex gap-2.5 text-[13px] leading-relaxed text-dark-text/75">
                <span className="index-num">04</span>
                <span>Closer the session with one retrieval sentence in your notes.</span>
              </li>
            </ol>
          </div>

          <div className="border border-ink/10 bg-card p-5">
            <Marginalia>What a pass builds</Marginalia>
            <div className="mt-3 space-y-2">
              {["Playback behaviour (speed, rewinds)", "Confusing-segment marks", "Notes with timestamps", "Completion signal"].map((item, i) => (
                <div key={item} className="flex items-center gap-2 border-b border-dotted border-ink/15 pb-1.5 last:border-0">
                  <Lightbulb className="h-3 w-3 shrink-0 text-teal" />
                  <span className="text-[12.5px] text-dark-text/75">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
