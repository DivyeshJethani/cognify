/**
 * COGNIFY — Recommendation rails (mock)
 *
 * The recommendation engine's public surface. Each rail is a named,
 * explainable collection of resources or topics the student will see on
 * the Command Center, library and topic pages. Every entry carries its
 * reason — the student never sees a ranking without provenance.
 *
 * Future backend: GET /api/recommendations?rails=... with the student's
 * progress, DNA and curriculum state.
 *
 * Style: Scholar's Atelier — rails are annotated like observations in a
 * laboratory journal: each with a number, a reason, and a date.
 */
import type { LearningResource, Topic } from "./types";
import {
  discoverAll,
  discoverResources,
  topicIndexes,
  type TopicIndexMeta,
} from "./resourceDiscovery";
import { allTopics } from "./curriculum";
import { continueLearning, progressFor } from "./savedResources";

export interface Rail {
  id: string;
  title: string;
  reason: string;
  items: RailItem[];
}

export interface RailItem {
  kind: "resource" | "topic";
  resource?: LearningResource;
  topicMeta?: TopicIndexMeta;
  topicTitle?: string;
  title: string;
  context: string;
  relevance: number;
  /** The reason this specific item appears on this rail */
  why: string;
}

/** All named rails available on the Command Center and library pages */
export const RAIL_DEFINITIONS = [
  {
    id: "recommended",
    title: "Recommended for you",
    reason: "Ranked against your Learning DNA — format, difficulty and mistake profile",
  },
  {
    id: "struggled",
    title: "Struggled with this topic",
    reason: "Topics whose attempt history shows unresolved weak spots",
  },
  {
    id: "revision",
    title: "Quick revision",
    reason: "Short resources that revisit already-seen ideas before they decay",
  },
  {
    id: "conceptual",
    title: "Conceptual repair",
    reason: "Targets your conceptual-error dimension (46% of your mistakes)",
  },
  {
    id: "continue",
    title: "Continue learning",
    reason: "Resources you started but did not finish",
  },
  {
    id: "another-explanation",
    title: "Another explanation",
    reason: "The same idea in a different format — for when the first pass did not stick",
  },
  {
    id: "before-test",
    title: "Before your next assessment",
    reason: "The highest-yield topics given the exam schedule",
  },
] as const;

/** The command-center rails, in display order */
export function buildRails(): Rail[] {
  const all = discoverAll();
  const continued = continueLearning();

  const continuedItems: RailItem[] = continued
    .map((p) => {
      const r = all.find((res) => res.id === p.resourceId);
      if (!r) return null;
      return {
        kind: "resource" as const,
        resource: r,
        title: r.title,
        context: `${r.sourceLabel} · ${Math.round(p.fraction * 100)}% watched`,
        relevance: Math.round(70 + p.fraction * 25),
        why: `You stopped at ${formatProgress(p.fraction)} on ${timeAgo(p.updatedAt)} — evidence says finishing a started pass beats opening a fresh one.`,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const struggled = topicIndexes()
    .filter((t) => t.masteryPercent > 0 && t.masteryPercent < 55)
    .slice(0, 4)
    .map(
      (t: TopicIndexMeta): RailItem => ({
        kind: "topic" as const,
        topicMeta: t,
        topicTitle: t.topicTitle,
        title: t.topicTitle,
        context: `${t.subjectName} · ${t.chapterTitle}`,
        relevance: 90 - t.masteryPercent,
        why: `Your file shows ${t.masteryPercent}% on this topic with conceptual gaps — attempt history marks it unresolved.`,
      })
    );

  const revision = all
    .filter((r) => r.resourceType === "quick-revision" || r.resourceType === "revision-notes")
    .slice(0, 4)
    .map(
      (r: LearningResource): RailItem => ({
        kind: "resource" as const,
        resource: r,
        title: r.title,
        context: `${r.sourceLabel} · ${r.durationMinutes} min`,
        relevance: r.relevance,
        why: `A short ${r.resourceType === "quick-revision" ? "verbal recap" : "written recap"} — spaced retention works best right as recall begins to soften.`,
      })
    );

  const conceptual = all
    .filter(
      (r) =>
        r.resourceType === "concept-explanation" ||
        r.format === "explanation" ||
        r.difficulty === "foundational"
    )
    .slice(0, 4)
    .map(
      (r: LearningResource): RailItem => ({
        kind: "resource" as const,
        resource: r,
        title: r.title,
        context: `${r.sourceLabel} · ${r.difficulty}`,
        relevance: r.relevance,
        why: `Your mistake profile attributes 46% of errors to conceptual gaps — explanations at this level rebuild the idea rather than rehearse it.`,
      })
    );

  const recommended = all.slice(0, 5).map(
    (r: LearningResource): RailItem => ({
      kind: "resource" as const,
      resource: r,
      title: r.title,
      context: `${r.sourceLabel} · ${r.resourceType}`,
      relevance: r.relevance,
      why: r.whyRecommended,
    })
  );

  const beforeTest: RailItem[] = all
    .filter((r) => r.difficulty === "stretch")
    .slice(0, 3)
    .map(
      (r: LearningResource): RailItem => ({
        kind: "resource" as const,
        resource: r,
        title: r.title,
        context: `${r.sourceLabel} · ${r.difficulty}`,
        relevance: r.relevance,
        why: `Stretch-level material — this is what separates band scores in the board exam.`,
      })
    );

  return [
    { id: "recommended", title: "Recommended for you", reason: "Ranked against your Learning DNA — format, difficulty and mistake profile", items: recommended },
    { id: "struggled", title: "Struggled with this topic", reason: "Topics whose attempt history shows unresolved weak spots", items: struggled },
    { id: "revision", title: "Quick revision", reason: "Short resources that revisit already-seen ideas before they decay", items: revision },
    { id: "conceptual", title: "Conceptual repair", reason: "Targets your conceptual-error dimension (46% of your mistakes)", items: conceptual },
    { id: "continue", title: "Continue learning", reason: "Resources you started but did not finish", items: continuedItems },
    { id: "before-test", title: "Before your next assessment", reason: "The highest-yield topics given the exam schedule", items: beforeTest },
  ];
}

/**
 * "Explore another explanation" — same topic, different format.
 * Used by the player's related strip and the topic page's alternative block.
 */
export function anotherExplanation(topicId: string, currentResourceId?: string): RailItem[] {
  const found = allTopics().find((t) => t.topic.id === topicId);
  const current = currentResourceId
    ? discoverAll().find((r) => r.id === currentResourceId)
    : undefined;
  const currentType = current?.resourceType;

  const candidates = (discoverResources(topicId)?.resources ?? [])
    .filter((r) => r.id !== currentResourceId && r.resourceType !== currentType)
    .slice(0, 3);

  if (!found) return [];
  const ctx = `${found.subject.name} · ${found.chapter.title}`;

  return candidates.map(
    (r: LearningResource): RailItem => ({
      kind: "resource" as const,
      resource: r,
      title: r.title,
      context: `${r.sourceLabel} · ${r.resourceType}`,
      relevance: r.relevance,
      why: `The same idea in a ${r.resourceType.replace("-", " ")} — if the first pass did not stick, the second format usually finds the missing hinge.`,
    })
  );
}

function formatProgress(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  const hr = Math.floor(min / 60);
  return `${hr} hour${hr === 1 ? "" : "s"} ago`;
}
