/**
 * COGNIFY — Teach Cognify (Day 10 rework)
 *
 * Five-step hero flow: 1 Choose a topic → 2 Learn it first → 3 Teach it
 * (write or record) → 4 Cognify's analysis → 5 Your next step.
 * Analysis verdicts stay human-readable — no DNA scores on screen.
 * Style: Scholar's Atelier — ivory ground, deep ink text, teal accents,
 * Manrope headings, generous whitespace.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyseTeachBack, teachBackPrompts } from "@/lib/teachBack";
import { INVENTORY_EXPORT, classifyType } from "@/lib/resourceDiscovery";
import { topicAlias } from "@/lib/curriculum";
import { cn } from "@/lib/utils";
import { ArrowRight, BookOpen, Check, ChevronDown, Lightbulb, Mic, PencilLine, RefreshCw, RotateCcw, Users, Video } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearch } from "wouter";
import { toast } from "sonner";

const slugOf = (id: string) => topicAlias(id) ?? id;

const SUBJECT_NAMES: Record<string, string> = {
  MATH: "Mathematics",
  SCI: "Science",
  SST: "Social Science",
  ENG: "English",
  HIN: "Hindi",
  SKT: "Sanskrit",
};

type MediaKind = "video" | "audio";
interface Teaching {
  kind: "text" | "media";
  text?: string;
  mediaKind?: MediaKind;
  blobUrl?: string;
  durationSec?: number;
}

const STEPS = [
  { n: 1, label: "Choose" },
  { n: 2, label: "Learn" },
  { n: 3, label: "Teach" },
  { n: 4, label: "Analysis" },
];

/** Human next step after Cognify's analysis. */
function recommendNextStep(coverage: number): { label: string; note: string; peer: boolean } {
  if (coverage >= 80)
    return {
      label: "You can teach this to a classmate",
      note: "Your explanation covered the idea well. The fastest way to lock it in is to teach it to someone in your study group.",
      peer: true,
    };
  if (coverage >= 55)
    return {
      label: "Close one gap, then try again",
      note: "Almost there — revisit the one idea Cognify flagged, then teach it once more.",
      peer: false,
    };
  return {
    label: "Learn it once more",
    note: "Some of the idea is missing. Read the topic again, then come back and teach.",
    peer: false,
  };
}

export default function Teach() {
  const prompts = teachBackPrompts();
  const search = useSearch();
  const [selectedId, setSelectedId] = useState<string>(() => {
    const q = new URLSearchParams(search).get("topic");
    return q && prompts.some((p) => p.topicId === q) ? q : prompts[0]?.topicId ?? "";
  });
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);
  const [teaching, setTeaching] = useState<Teaching>({ kind: "text", text: "" });
  const [submitted, setSubmitted] = useState(false);

  const prompt = useMemo(() => prompts.find((p) => p.topicId === selectedId), [selectedId, prompts]);
  const analysis = useMemo(
    () =>
      submitted && prompt && (teaching.kind === "text" ? teaching.text : "[voice teaching]")
        ? analyseTeachBack(prompt.topicId, teaching.kind === "text" ? teaching.text ?? "" : "")
        : null,
    [submitted, prompt, teaching]
  );
  const nextStep = analysis ? recommendNextStep(analysis.coverage) : null;

  const resources = useMemo(() => {
    if (!prompt) return [];
    const alias = topicAlias(prompt.topicId) ?? prompt.topicId;
    const raw = INVENTORY_EXPORT[alias] ?? [];
    return raw
      .filter((r) => {
        const t = classifyType(r);
        return t === "video-lecture" || t === "concept-explanation";
      })
      .slice(0, 3)
      .map((r) => ({
        id: r.id,
        title: r.title,
        format: r.format,
        source: r.sourceLabel,
        duration: r.durationMinutes ? `${Math.round(r.durationMinutes)} min` : "",
      }));
  }, [prompt]);

  /* ---------- voice/video capture ---------- */
  const mediaRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAt = useRef(0);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (mediaRef.current) mediaRef.current.srcObject = null;
  }, []);

  useEffect(() => () => stopStream(), [stopStream]);

  async function startRecording(kind: MediaKind) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        kind === "video" ? { video: true, audio: true } : { audio: true }
      );
      streamRef.current = stream;
      if (mediaRef.current) {
        mediaRef.current.srcObject = stream;
        mediaRef.current.play().catch(() => {});
      }
      startedAt.current = Date.now();
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: kind === "video" ? "video/webm" : "audio/webm" });
        setTeaching({ kind: "media", mediaKind: kind, blobUrl: URL.createObjectURL(blob), durationSec: Math.round((Date.now() - startedAt.current) / 1000) });
      };
      recorderRef.current = rec;
      rec.start();
    } catch {
      toast.error("Couldn't access your microphone or camera — try writing instead.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    stopStream();
    recorderRef.current = null;
  }

  /* ---------- flow actions ---------- */
  function submitTeaching() {
    if (teaching.kind === "text" && !teaching.text?.trim()) return;
    setSubmitted(true);
    setStage(4);
  }

  function resetFlow() {
    stopStream();
    setTeaching({ kind: "text", text: "" });
    setSubmitted(false);
    setStage(1);
  }

  return (
    <AppShell>
      <PageHeader
        overline="Teach Cognify"
        title="The best way to learn is to teach."
        subtitle="Choose a topic, learn it once, then explain it back — in words or in your own voice. Cognify listens, then shows you the one thing to do next."
      />

      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        {/* Step indicator */}
        <nav className="rise-in flex items-center gap-2">
          {STEPS.map((s, i) => (
            <span key={s.n} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center border font-mono text-[12px]",
                  stage >= s.n
                    ? "border-teal bg-teal/10 font-bold text-teal"
                    : "border-ink/25 text-ink/40"
                )}
              >
                {stage > s.n ? <Check className="h-3 w-3" /> : s.n}
              </span>
              <span className={cn("font-display text-[13px] font-bold uppercase tracking-[0.06em]", stage >= s.n ? "text-teal" : "text-ink/50")}>
                {s.label}
              </span>
              {i < 3 && <ArrowRight className="h-3.5 w-3.5 text-ink/25" />}
            </span>
          ))}
        </nav>

        {/* STEP 1 — choose a topic */}
        {stage === 1 && (
          <section className="rise-in mt-8">
            <p className="font-display text-[17px] font-bold text-ink">Which topic will you teach?</p>
            <p className="mt-1 text-[14px] text-ink/60">Topics you are ready to teach — Cognify picked them from what you have been learning.</p>
            <div className="mt-4 grid gap-px border border-ink/12 bg-ink/10 sm:grid-cols-2">
              {prompts.map((p) => {
                const active = p.topicId === selectedId;
                return (
                  <button
                    key={p.topicId}
                    onClick={() => setSelectedId(p.topicId)}
                    className={cn("text-left transition-colors", active ? "bg-ivory" : "bg-card hover:bg-ink/[0.03]")}
                  >
                    <div className="flex items-baseline justify-between gap-3 px-4 pt-3">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-ink/45">
                        {SUBJECT_NAMES[p.subjectCode] ?? p.subjectCode} · {p.chapterTitle}
                      </span>
                      {active && <span className="font-mono text-[10px] uppercase tracking-wider text-teal">Chosen</span>}
                    </div>
                    <div className="px-4 pb-3 pt-1 font-display text-[15px] font-bold leading-snug text-ink">{p.topicTitle}</div>
                  </button>
                );
              })}
            </div>
            <div className="mt-4">
              <Button onClick={() => setStage(2)} className="h-11 bg-teal px-6 text-[14px] text-white hover:bg-teal-dark">
                Continue to learning <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </section>
        )}

        {/* STEP 2 — learn it first */}
        {stage === 2 && prompt && (
          <section className="rise-in mt-8">
            <p className="font-display text-[17px] font-bold text-ink">Learn it once before you teach it.</p>
            <p className="mt-1 text-[14px] text-ink/60">Two or three good resources are enough — don't binge. Then explain it in your own words.</p>
            <div className="mt-4 space-y-2">
              {resources.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 border border-ink/12 bg-card px-4 py-3">
                  <div>
                    <p className="font-display text-[15px] font-bold text-ink">{r.title}</p>
                    <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-ink/45">
                      {r.format} · {r.duration} · {r.source}
                    </p>
                  </div>
                  <Link href={`/session/${slugOf(prompt.topicId)}`} className="border-b border-teal/50 pb-0.5 font-mono text-[12px] uppercase tracking-wider text-teal hover:border-teal">
                    Open →
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <Button onClick={() => setStage(3)} className="h-11 bg-teal px-6 text-[14px] text-white hover:bg-teal-dark">
                I've learned it — now teach <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              <Link href={`/topic/${slugOf(prompt.topicId)}`} className="flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-wider text-ink/50 hover:text-teal">
                <BookOpen className="h-3.5 w-3.5" /> Full topic page
              </Link>
            </div>
          </section>
        )}

        {/* STEP 3 — teach it: write or record */}
        {stage === 3 && prompt && (
          <section className="rise-in mt-8">
            <p className="font-display text-[17px] font-bold text-ink">Teach it back, in your own words.</p>
            <blockquote className="mt-3 border-l-2 border-amber pl-3 font-display text-[15px] font-semibold italic leading-relaxed text-ink/85">
              “{prompt.prompt}”
            </blockquote>

            {teaching.kind !== "text" && teaching.blobUrl ? (
              /* recorded teaching preview */
              <div className="mt-5 border border-ink/12 bg-card p-5">
                <p className="font-display text-[13px] font-bold uppercase tracking-[0.06em] text-ink/60">
                  Your {teaching.mediaKind === "video" ? "video" : "voice"} teaching
                </p>
                {teaching.mediaKind === "video" ? (
                  <video src={teaching.blobUrl} controls className="mt-3 w-full max-h-[320px] rounded-sm bg-ink/90" />
                ) : (
                  <audio src={teaching.blobUrl} controls className="mt-3 w-full" />
                )}
                <p className="mt-2 font-mono text-[12px] text-ink/50">
                  {teaching.durationSec ?? 0}s recorded · watch or listen before you send it.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button onClick={submitTeaching} className="h-11 bg-teal px-6 text-[14px] text-white hover:bg-teal-dark">
                    <Lightbulb className="mr-1.5 h-4 w-4" /> Send to Cognify
                  </Button>
                  <Button variant="outline" onClick={() => setTeaching({ kind: "text", text: "" })} className="h-11 border-ink/25 bg-transparent text-ink hover:bg-ink/5">
                    Discard & start over
                  </Button>
                </div>
              </div>
            ) : (
              /* write or record controls */
              <div className="mt-5 space-y-4">
                <Textarea
                  value={teaching.text ?? ""}
                  onChange={(e) => setTeaching({ kind: "text", text: e.target.value })}
                  placeholder="Write your explanation — no notes, no textbook. As if a classmate missed the lesson."
                  className="min-h-[150px] resize-y border-ink/20 bg-ivory text-[14.5px] leading-relaxed focus-visible:ring-teal/40"
                />
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => startRecording("audio")}
                    className="flex items-center gap-1.5 border border-ink/20 bg-transparent px-3.5 py-2 font-display text-[13px] font-bold text-ink transition-colors hover:border-teal hover:text-teal"
                  >
                    <Mic className="h-4 w-4" /> Record voice
                  </button>
                  <button
                    onClick={() => startRecording("video")}
                    className="flex items-center gap-1.5 border border-ink/20 bg-transparent px-3.5 py-2 font-display text-[13px] font-bold text-ink transition-colors hover:border-teal hover:text-teal"
                  >
                    <Video className="h-4 w-4" /> Record video
                  </button>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-ink/40">
                    {(teaching.text ?? "").trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                  <span className="ml-auto">
                    <Button onClick={submitTeaching} disabled={!teaching.text?.trim()} className="h-11 bg-teal px-6 text-[14px] text-white hover:bg-teal-dark disabled:opacity-40">
                      <Lightbulb className="mr-1.5 h-4 w-4" /> Send to Cognify
                    </Button>
                  </span>
                </div>
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-4">
              <button onClick={stopStream} className="font-mono text-[12px] uppercase tracking-wider text-ink/40 hover:text-ink">
                Cancel recording
              </button>
              <button onClick={resetFlow} className="font-mono text-[12px] uppercase tracking-wider text-ink/40 hover:text-ink">
                Change topic
              </button>
            </div>
            <video ref={mediaRef} className="hidden" />
          </section>
        )}

        {/* STEP 4 — Cognify's analysis */}
        {stage === 4 && prompt && analysis && nextStep && (
          <section className="rise-in mt-8 space-y-4">
            <div className="border border-ink/10 bg-ivory p-5">
              <span className="font-display text-[13px] font-bold uppercase tracking-[0.06em] text-ink/60">
                What Cognify understood from your teaching
              </span>
              <p className="mt-2.5 text-[15px] leading-relaxed text-ink">{analysis.verdict}</p>
            </div>

            {analysis.missingIdea && (
              <div className="border border-amber/40 bg-amber/5 p-5">
                <div className="flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-[0.06em] text-amber-dark">
                  <Lightbulb className="h-3.5 w-3.5" /> The idea you missed
                </div>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink">{analysis.missingIdea}</p>
              </div>
            )}

            <div className="flex items-start gap-3 border border-teal/30 bg-teal/5 p-5">
              <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
              <div>
                <span className="font-display text-[13px] font-bold uppercase tracking-[0.06em] text-teal">
                  Your next step: {nextStep.label}
                </span>
                <p className="mt-1 text-[14px] leading-relaxed text-ink/80">{nextStep.note}</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {nextStep.peer ? (
                    <Button asChild className="h-10 bg-teal px-5 text-[13.5px] text-white hover:bg-teal-dark">
                      <Link href="/community">
                        <Users className="mr-1.5 h-4 w-4" /> Teach a classmate
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="h-10 border-ink/25 bg-transparent text-ink hover:bg-ink/5">
                      <Link href={`/topic/${slugOf(prompt.topicId)}`}>
                        <BookOpen className="mr-1.5 h-4 w-4" /> Revisit the concept
                      </Link>
                    </Button>
                  )}
                  <Button onClick={resetFlow} variant="outline" className="h-10 border-ink/25 bg-transparent text-ink hover:bg-ink/5">
                    <RefreshCw className="mr-1.5 h-4 w-4" /> Teach another topic
                  </Button>
                </div>
              </div>
            </div>

            <details className="border-t border-ink/10 pt-3">
              <summary className="flex cursor-pointer items-center gap-1.5 font-mono text-[12px] uppercase tracking-wider text-ink/45 hover:text-ink">
                <ChevronDown className="h-3 w-3" /> See what I checked
              </summary>
              <ul className="mt-2 space-y-1 pl-4">
                {(prompt.keyPoints ?? []).map((kp, i) => (
                  <li key={i} className="text-[13px] leading-relaxed text-ink/60">· {kp}</li>
                ))}
              </ul>
            </details>
          </section>
        )}

        <p className="mt-8 text-center text-[12px] text-ink/45">
          No perfect score exists. The point is to find out what you don't know yet — so you can.
        </p>
      </div>
    </AppShell>
  );
}
