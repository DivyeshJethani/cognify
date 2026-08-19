/**
 * COGNIFY — "Ask Cognify" contextual interaction (mock)
 *
 * Rule-based contextual assistant for the lecture player. Answers are drawn
 * from the current resource's metadata (whyRecommended, dnaDimension, format,
 * topic state) and the student's Learning DNA profile, so every answer is
 * tied to the session — never generic filler.
 *
 * Future backend: this becomes a POST /api/ask with sessionId + resourceContext
 * and an LLM answer grounded in curriculum data.
 */
import { discoveryMeta } from "./resourceDiscovery";
import type { LearningResource } from "./types";

export type AskActionId =
  | "explain-current"
  | "simplify"
  | "elaborate"
  | "give-example"
  | "quiz-me"
  | "what-s-next"
  | "connect-dna"
  | "summarise";

export interface AskAction {
  id: AskActionId;
  label: string;
  sublabel: string;
  prompt: string;
}

/** Eight guided actions — the buttons a future LLM would ground on. */
export const ASK_ACTIONS: AskAction[] = [
  {
    id: "explain-current",
    label: "Explain this part",
    sublabel: "What is happening right now?",
    prompt: "Explain the segment I am at right now.",
  },
  {
    id: "simplify",
    label: "Simplify",
    sublabel: "Say it more plainly",
    prompt: "Explain this more simply, as if to a younger student.",
  },
  {
    id: "elaborate",
    label: "Go deeper",
    sublabel: "More detail, same idea",
    prompt: "Explain this part in more depth — I want the full picture.",
  },
  {
    id: "give-example",
    label: "Give an example",
    sublabel: "Anchor it concretely",
    prompt: "Give me a concrete worked example of this idea.",
  },
  {
    id: "quiz-me",
    label: "Quiz me",
    sublabel: "Check my grasp",
    prompt: "Ask me one question to test whether I understand this.",
  },
  {
    id: "what-s-next",
    label: "What's next",
    sublabel: "Next step after this",
    prompt: "What should I do immediately after this resource?",
  },
  {
    id: "connect-dna",
    label: "My DNA says…",
    sublabel: "Relate it to my profile",
    prompt: "Connect this segment to my Learning DNA profile.",
  },
  {
    id: "summarise",
    label: "Summarise",
    sublabel: "The whole segment, briefly",
    prompt: "Summarise what I have covered so far.",
  },
];

export interface AskMessage {
  role: "user" | "cognify";
  text: string;
}

export interface AskContext {
  resource: LearningResource;
  elapsedSec: number;
  totalSec: number;
  speed: number;
  confusingCount: number;
  transcriptText: string;
  /** Confusing segments marked by the student — drives contextual questions */
  confusingMarks?: { sec: number; note: string }[];
}

/** Quick-pick questions shown above the input */
export function quickPicks(ctx: AskContext): string[] {
  return [
    `Why did you recommend this resource?`,
    `What is my Learning DNA telling me here?`,
    `Am I spending the right amount of time on this?`,
    `What should I do after this video?`,
    ctx.confusingCount > 0
      ? `Summarise my confusing marks (${ctx.confusingCount})`
      : `What should I watch for in this video?`,
    ctx.confusingMarks && ctx.confusingMarks.length > 0
      ? `Which marked segment matters most?`
      : undefined,
  ].filter((q): q is string => !!q)
  .slice(0, 4);
}

/** Answer a student question contextually */
export function answer(ctx: AskContext, question: string): string {
  const q = question.trim().toLowerCase();
  const r = ctx.resource;
  const progress = ctx.totalSec > 0 ? Math.round((ctx.elapsedSec / ctx.totalSec) * 100) : 0;

  if (q.includes("why") && (q.includes("recommend") || q.includes("choose"))) {
    return `${r.whyRecommended} Evidence strength: ${r.relevance}/100. It was surfaced from NCERT official material, CBSE-aligned public sources and COGNIFY's own engine — ranked against your Learning DNA, not pulled randomly.`;
  }

  if (q.includes("dna") || q.includes("learning style") || q.includes("format")) {
    const dnaNote = r.dnaDimension
      ? ` This resource specifically serves your “${r.dnaDimension}” dimension.`
      : "";
    return `Your DNA profile: top format is visual-diagram, attention ceiling is about ${discoveryMeta.attentionNote.split("—")[0].replace("Attention analysis shows your focus dips midway through long passages", "22 minutes on text-heavy material")}, and ${discoveryMeta.confidenceNote}. The resource format here is ${r.format}${dnaNote}. When you pause, rewind or mark confusing sections, that data refines this profile further.`;
  }

  if (q.includes("time") || q.includes("long") || q.includes("how long")) {
    const budget = Math.round(ctx.totalSec / 60);
    return `This resource runs about ${budget} minutes at ${ctx.speed}x speed. Your session estimate was ${r.durationMinutes} minutes, and you are at ${progress}% — ${formatRemaining(ctx, budget)} remaining. If you hit your attention ceiling, pause and finish the rest in a second sitting; spaced retention prefers two focused passes over one exhausted one.`;
  }

  if (q.includes("after") || q.includes("next") || q.includes("then")) {
    return `After this session, evidence of mastery updates your topic file and the spaced scheduler reschedules revision. Expect a timed practice set next — application problems are what convert viewing into marks. Your dashboard will reflect the updated mastery once the session closes.`;
  }

  if (q.includes("confus") || q.includes("mark") || q.includes("replay")) {
    if (ctx.confusingCount === 0)
      return `You have no confusing marks yet. While playing, press “Mark confusing” at any moment — the segment is added to your replay list and noted in your analytics file. I will summarise them at the end of the session.`;
    const marks = ctx.confusingMarks ?? [];
    if (marks.length > 0) {
      const worst = marks.reduce((a, b) => (b.sec > a.sec ? b : a));
      return `You have marked ${ctx.confusingCount} confusing segment${ctx.confusingCount > 1 ? "s" : ""}. The latest mark sits at ${formatTime(worst.sec)} — “${worst.note}”. Open the “Replay” tab to review them; revisiting your own confusion points is the highest-yield revision step Cognify schedules, and each mark feeds your mistake-profile analysis.`;
    }
    return `You have marked ${ctx.confusingCount} confusing segment${ctx.confusingCount > 1 ? "s" : ""}. Open the “Replay” tab to review them — revisiting your own confusion points is the highest-yield revision step Cognify schedules, and each mark feeds your mistake-profile analysis.`;
  }

  if (q.includes("watch") || q.includes("look for") || q.includes("focus") || q.includes("tip")) {
    return `Focus on the step transitions, not the conclusions — your mistake profile shows procedural and careless errors outweigh conceptual gaps. When the narration derives a formula or proves a claim, slow to 0.75x and mark anything you would have to re-read. Those marks become your revision list.`;
  }

  if (q.includes("explain current") || q.includes("segment i am at") || q.includes("right now")) {
    const seg = nearestSegment(ctx);
    return seg
      ? `Right now: “${seg.text.slice(0, 200)}${seg.text.length > 200 ? "…" : ""}” The takeaway to carry into your notes: this is the step your mistake profile says is fragile — treat it as a retrieval target, not background.`
      : `You are at ${formatTime(ctx.elapsedSec)} of ${formatTime(ctx.totalSec)} (${progress}% through). The segment here is still indexing — ask me again in a moment, or tell me what felt unclear.`;
  }

  if (q.includes("more simple") || q.includes("plainly") || q.includes("younger") || q.includes("simplif")) {
    const seg = nearestSegment(ctx);
    return seg
      ? `Simply: ${stripJargon(seg.text.slice(0, 160))}${seg.text.length > 160 ? "…" : "."} The short version: one idea, one picture in your head. If the picture won't stick, mark this segment and I will flag it for a diagram-first re-attempt.`
      : `At your current position the idea is ${r.difficulty === "foundational" ? "already the gentlest pass available" : "the hardest pass available"} — simplifying works best on the concrete step you paused at. Tell me the sentence that lost you.`;
  }

  if (q.includes("deeper") || q.includes("depth") || q.includes("full picture")) {
    return `Going deeper means the next layer of the same idea. For this topic, that layer is: how this connects to the surrounding curriculum step and why CBSE marks the transition between them. Ask Cognify for the related NCERT treatment after this video — the “NCERT / textbook” entry in your related resources is the depth layer.`;
  }

  if (q.includes("example") || q.includes("worked") || q.includes("concrete")) {
    return `A worked example for this segment: ${exampleFor(ctx)}. Note the sign discipline and the verification step — those are the two places your attempt history shows slips. Reproduce it once without looking; that reproduction is the evidence your mastery file wants.`;
  }

  if (q.includes("quiz") || q.includes("question") && q.includes("test") || q.includes("check my grasp") || q.includes("test whether")) {
    return `Here is your check: answer this before touching anything else — “${quizFor(ctx)}” Write your answer, then compare with the worked solution in this resource's transcript around this timestamp. If your answer missed the verification step, that is your known procedural error speaking, not the concept.`;
  }

  if (q.includes("my dna") || q.includes("profile") || q.includes("connect")) {
    const seg = nearestSegment(ctx);
    const segSnippet = seg ? `\u201C${seg.text.slice(0, 110)}\u2026\u201D` : "\u2026\u201D (segment still indexing)";
    return `Your DNA applied at this moment: the segment says ${segSnippet} — and your profile reads: visual-diagram format strongest, 22-minute attention ceiling, conceptual errors 46%, confidence overshoot ~35 points. Practical consequence: keep this pass under a quarter hour, re-watch diagram-first if the idea resists, and write one retrieval sentence in your notes before moving on.`;
  }

  if (q.includes("summarise") || q.includes("covered so far") || q.includes("summary")) {
    const covered = ctx.transcriptText.slice(0, 160);
    return covered
      ? `So far: ${covered}${ctx.transcriptText.length > 160 ? "…" : "."} One-sentence summary: ${oneSentence(ctx)}. If you can restate it without the text, this segment is banked.`
      : `No segment text is indexed yet at this position — hit play to advance the transcript, or jump to the next authored segment. Your summary note at the end of the resource will capture everything at once.`;
  }

  if (q.includes("speed") || q.includes("fast") || q.includes("slow")) {
    return `You are at ${ctx.speed}x. For new content like this, 1x preserves comprehension; once a section feels familiar, 1.25–1.5x is safe. Avoid 2x on proof-heavy segments — your retention data shows comprehension drop-offs above 1.5x on abstract material.`;
  }

  if (q.includes("note") || q.includes("write")) {
    return `The Notes tab is on your right. Write in your own words — the act of re-phrasing is itself retrieval practice. Notes you take during confusing segments are automatically timestamped, so revision later starts exactly where understanding slipped.`;
  }

  if (q.includes("difficult") || q.includes("hard") || q.includes("stuck")) {
    return `${r.difficulty === "stretch" || r.difficulty === "advanced" ? "This is tagged " + r.difficulty + " — struggle here is expected, not a failure signal." : "This is within your zone, so a stall is likely a single missing step, not a missing concept."} Try: mark the segment, drop to 0.75x for that section, and if it persists, ask me about the specific concept. Struggle data is exactly what your resilience profile is built from.`;
  }

  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    return `Observing your session. You are ${progress}% through “${r.title}” on ${r.topicTitle}. Ask me about the recommendation, your DNA, timing, confusing marks or what to do next.`;
  }

  return `I stay grounded in this session: the resource's recommendation reason (${r.relevance}/100 relevance, ${r.format} format, ${r.difficulty} difficulty) and your Learning DNA. Ask me why this was recommended, how your DNA applies here, how to pace the remaining ${formatRemaining(ctx, Math.round(ctx.totalSec / 60))}, or what to do with your confusing marks.`;
}

function formatRemaining(ctx: AskContext, budgetMinutes: number): string {
  const remainingMin = Math.max(0, Math.round(budgetMinutes - ctx.elapsedSec / 60 / ctx.speed));
  return `${remainingMin} minute${remainingMin === 1 ? "" : "s"}`;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function nearestSegment(ctx: AskContext) {
  // Uses the full transcript passed in via context (built by the player)
  const segs = (ctx as AskContext & { transcript?: { startSec: number; endSec: number; text: string }[] }).transcript;
  if (!segs) return null;
  return segs.find((s) => ctx.elapsedSec >= s.startSec && ctx.elapsedSec < s.endSec) ?? null;
}

function stripJargon(t: string): string {
  return t.replace(/\b(procedural|calibration|discriminant|algorithm)\b/gi, (m) => `“${m.toLowerCase()}”`);
}

function exampleFor(ctx: AskContext): string {
  const seg = nearestSegment(ctx);
  if (!seg) return "the worked example at the current timestamp — see the transcript step sequence.";
  return `built from the current segment: “${seg.text.slice(0, 90)}…” — the example mirrors the same step order, with the verification identity carried through to the end.`;
}

function quizFor(ctx: AskContext): string {
  const seg = nearestSegment(ctx);
  if (!seg) return "restate the last formula or claim the narration made, in your own words.";
  return `in your own words: what did the narration just establish, and why does the step before it have to be true first?`;
}

function oneSentence(ctx: AskContext): string {
  const segs = (ctx as AskContext & { transcript?: { startSec: number; endSec: number; text: string }[] }).transcript;
  if (!segs) return "(segment text not yet indexed)";
  const covered = segs.filter((s) => s.endSec <= ctx.elapsedSec);
  if (covered.length === 0) return "the opening framing of this resource.";
  return covered[covered.length - 1].text.slice(0, 140);
}
