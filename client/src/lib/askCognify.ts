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
}

/** Quick-pick questions shown above the input */
export function quickPicks(ctx: AskContext): string[] {
  return [
    `Why did you recommend this resource?`,
    `What is my Learning DNA telling me here?`,
    `Am I spending the right amount of time on this?`,
    `What should I do after this video?`,
    ctx.confusingCount > 0
      ? `Help me with my confusing marks (${ctx.confusingCount})`
      : `What should I watch for in this video?`,
  ].slice(0, 4);
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
    return `You have marked ${ctx.confusingCount} confusing segment${ctx.confusingCount > 1 ? "s" : ""}. Open the “Replay” tab to review them — revisiting your own confusion points is the highest-yield revision step Cognify schedules, and each mark feeds your mistake-profile analysis.`;
  }

  if (q.includes("watch") || q.includes("look for") || q.includes("focus") || q.includes("tip")) {
    return `Focus on the step transitions, not the conclusions — your mistake profile shows procedural and careless errors outweigh conceptual gaps. When the narration derives a formula or proves a claim, slow to 0.75x and mark anything you would have to re-read. Those marks become your revision list.`;
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
