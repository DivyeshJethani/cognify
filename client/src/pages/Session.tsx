/**
 * COGNIFY — Learning Session (briefing view)
 * Style: Scholar's Atelier. The session page frames what the student is about
 * to learn — objective, current progress on the topic, estimated time, the
 * next activity after this — and opens the lecture player. Feels like an
 * instrument briefing sheet, not a video website.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import {
  ActionChip,
  Hairline,
  Marginalia,
  MasteryBar,
} from "@/components/cognify/Primitives";
import { discoverResources, getTranscript } from "@/lib/resourceDiscovery";
import { findTopicByIdOrAlias } from "@/lib/curriculum";
import { useLocation, useRoute } from "wouter";
import { ArrowRight, BookOpen, ChevronLeft, Clock, Target, Timer } from "lucide-react";
import { startSession } from "@/lib/playerEvents";

export default function Session() {
  const [match, params] = useRoute("/session/:resourceId");
  const [, navigate] = useLocation();
  const resourceId = match ? params.resourceId : "";

  // Resolve the topic from the query hint passed by the Resource Explorer
  const queryTopic = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("topic")
    : null;

  const resolved = queryTopic ? findTopicByIdOrAlias(queryTopic) : null;

  const topicId = resolved?.topic.id ?? "";
  const discovery = discoverResources(topicId, { formats: undefined, difficulty: undefined });
  const resource = discovery?.resources.find((r) => r.id === resourceId) ?? null;
  const transcript = getTranscript(resourceId ?? "");
  const minutes = transcript.length > 0
    ? Math.ceil(transcript[transcript.length - 1].endSec / 60)
    : (resource?.durationMinutes ?? 20);

  const objective = resolved?.topic.objectives[0]?.text ?? null;
  const nextTopic = resolved
    ? resolved.chapter.topics.find(
        (t, i) => resolved.chapter.topics[i - 1]?.id === resolved.topic.id
      ) ?? null
    : null;

  const beginSession = () => {
    const sessionId = startSession(resourceId);
    navigate(`/player/${resourceId}?sessionId=${sessionId}&topic=${topicId}`);
  };

  if (!resource || !resolved) {
    return (
      <AppShell>
        <PageHeader
          overline="Learning Session"
          title="Session not found"
          subtitle="Open this route from the Resource Explorer with a valid resource."
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        overline="Learning Session — briefing"
        title={resource.title}
        subtitle={`${resolved.subject.name} · Chapter ${String(resolved.chapter.index).padStart(2, "0")} ${resolved.chapter.title} · ${resource.sourceLabel}`}
        actions={
          <button
            onClick={() => navigate(`/resources/${queryTopic ?? ""}`)}
            className="flex items-center gap-1.5 border border-ink/15 bg-card px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink/70 transition-colors hover:border-teal hover:text-teal"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back to resources
          </button>
        }
      />

      <div className="flex flex-col gap-8 px-5 py-7 sm:px-8 lg:flex-row lg:px-10">
        {/* Main briefing */}
        <section className="min-w-0 flex-1">
          {/* Objective */}
          <div className="border border-ink/10 bg-card p-6">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-teal" />
              <Marginalia className="[&::before]:hidden">Current objective</Marginalia>
            </div>
            <p className="mt-3 font-serif text-lg leading-relaxed text-ink">
              {objective ?? resolved.topic.objectives[0]?.text ?? `Master: ${resolved.topic.title}`}
            </p>
            <p className="mt-3 footnote">
              Cognify observes your attempts during this session. Every interaction — play, pause,
              rewind, speed change — becomes learning data that refines your next recommendation.
            </p>
          </div>

          {/* Session stats grid */}
          <div className="mt-6 grid grid-cols-2 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-4">
            <div className="bg-card p-5">
              <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Topic mastery</div>
              <div className="mt-1 font-mono text-xl font-medium text-ink">{resolved.topic.mastery}%</div>
              <MasteryBar value={resolved.topic.mastery} className="mt-2" />
            </div>
            <div className="bg-card p-5">
              <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Estimated time</div>
              <div className="mt-1 flex items-center gap-1.5 font-mono text-xl font-medium text-ink">
                <Timer className="h-4 w-4 text-teal" /> {minutes} min
              </div>
              <div className="mt-2 font-mono text-[10px] text-muted-foreground">
                {transcript.length} transcript segments
              </div>
            </div>
            <div className="bg-card p-5">
              <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Format</div>
              <div className="mt-1">
                <ActionChip action={resource.format} />
              </div>
              <div className="mt-2 font-mono text-[10px] text-muted-foreground">{resource.difficulty} difficulty</div>
            </div>
            <div className="bg-card p-5">
              <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Session id</div>
              <div className="mt-1 break-all font-mono text-[11px] font-medium leading-tight text-ink">
                sess·live
              </div>
              <div className="mt-2 font-mono text-[10px] text-muted-foreground">
                Analytics: ON
              </div>
            </div>
          </div>

          {/* Transcript preview */}
          {transcript.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-teal" />
                <Marginalia className="[&::before]:hidden">Transcript preview — first segment</Marginalia>
              </div>
              <Hairline className="mt-3" />
              <blockquote className="mt-4 border-l-2 border-teal/40 pl-4">
                <p className="font-serif text-[14px] italic leading-relaxed text-dark-text/80">
                  “{transcript[0].text}”
                </p>
                <footer className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  00:00 – {formatTime(transcript[0].endSec)}
                </footer>
              </blockquote>
            </div>
          )}

          {/* What happens next */}
          <div className="mt-6 border border-dashed border-ink/25 bg-ivory-deep/50 p-5">
            <div className="marginalia [&::before]:hidden">After this session</div>
            <p className="mt-2 text-[13px] leading-relaxed text-dark-text/80">
              {nextTopic
                ? `Sequence suggests "${nextTopic.title}" as your next topic once this one reaches proficiency. Practice set follows automatically when you complete the video.`
                : "A timed practice set follows automatically when you complete the video — mastery evidence updates your topic file immediately."}
            </p>
          </div>
        </section>

        {/* Begin column */}
        <aside className="w-full shrink-0 lg:w-80">
          <div className="sticky top-6 border border-ink bg-ink p-6 text-ivory">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-teal">
              {resolved.subject.code} · {resolved.topic.title}
            </div>
            <div className="mt-3 font-serif text-xl font-bold leading-snug">
              {resource.title}
            </div>
            <div className="mt-2 flex items-center gap-3 font-mono text-[11px] text-ivory/60">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {minutes} min</span>
              <span>{resource.sourceLabel}</span>
            </div>

            <Hairline className="!bg-ivory/15 my-5" />

            <button
              onClick={beginSession}
              className="group flex w-full items-center justify-between border border-teal bg-teal px-5 py-3.5 font-mono text-[12px] uppercase tracking-[0.14em] text-white transition-all duration-150 hover:bg-teal-dark active:scale-[0.98]"
            >
              <span>Begin session</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>

            <p className="mt-4 font-mono text-[10px] leading-relaxed text-ivory/50">
              Transcript, notes, replay marks and “Ask Cognify” are available inside the player.
              Playback events are logged for your analytics file.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
