/**
 * COGNIFY — Curriculum Helpers
 *
 * Small lookup layer over the mock curriculum. Extracted from mockData so
 * downstream modules (resource discovery, player, session views) can resolve
 * board → class → subject → chapter → topic without re-importing the whole
 * dataset. When the backend ships, this becomes the API client's resolver.
 */
import { boards } from "./mockData";
import type { Chapter, Subject, Topic } from "./types";

export function findSubject(
  boardId: string,
  classId: string,
  subjectId: string
): Subject | null {
  const board = boards.find((b) => b.id === boardId);
  const cls = board?.classes.find((c) => c.id === classId);
  return cls?.subjects.find((s) => s.id === subjectId) ?? null;
}

/** Stable alias slugs — duplicated here (vs resourceDiscovery) so that
 *  curriculum lookups never create a circular import at load time. Both
 *  copies are kept identical by hand; the resolution logic lives in one
 *  place per module. */
/* Stable alias slugs → generated runtime topic ids (mkTopic rule:
   t-{index}-{title lowercase, non-alnum → "-", slice 0..28}).
   KEPT IDENTICAL to TOPIC_ALIASES in resourceDiscovery.ts — single source
   of truth lives there; this copy only exists to avoid a circular import. */
const CANONICAL_TOPIC_SLUGS: Record<string, string> = {
  "t-0-euclid-s-division-lemma-hcf": "t-0-euclid-s-division-lemma",
  "t-1-irrational-numbers-proofs": "t-1-irrational-numbers-proofs",
  "t-2-fundamental-theorem-of-arithmetic": "t-2-fundamental-theorem-of-arit",
  "t-3-zeros-of-a-polynomial": "t-0-zeros-of-a-polynomial",
  "t-4-relationship-between-zeros-coefficients": "t-1-relationship-between-zeros-c",
  "t-5-division-algorithm-for-polynomials": "t-2-division-algorithm-for-polyn",
  "t-6-graphical-method": "t-0-graphical-method",
  "t-7-substitution-elimination-methods": "t-1-substitution-elimination-met",
  "t-8-cross-multiplication-word-problems": "t-2-cross-multiplication-word-pr",
  "t-9-standard-form-factorisation": "t-0-standard-form-factorisation",
  "t-10-completing-the-square": "t-1-completing-the-square",
  "t-11-nature-of-roots-discriminant": "t-2-nature-of-roots-discriminant",
  "t-0-writing-balancing-equations": "t-0-writing-balancing-equations",
  "t-1-types-of-reactions": "t-1-types-of-reactions",
  "t-2-oxidation-reduction-corrosion": "t-2-oxidation-reduction-corrosio",
  "t-3-properties-of-acids-bases": "t-0-properties-of-acids-bases",
  "t-4-ph-scale-strength": "t-1-ph-scale-strength",
  "t-5-nutrition-in-plants": "t-0-nutrition-in-plants",
  "t-6-nutrition-in-humans": "t-1-nutrition-in-humans",
  "t-7-transportation-excretion": "t-2-transportation-excretion",
  "t-0-french-revolution-idea-of-nation": "t-0-the-french-revolution-the-id",
  "t-1-making-of-nationalism-italy-germany": "t-1-making-of-nationalism-in-ita",
  "t-2-nationalism-imperialism": "t-2-nationalism-imperialism",
  "t-3-first-world-war-non-cooperation": "t-0-the-first-world-war-non-coop",
  "t-4-civil-disobedience-collective-belonging": "t-1-civil-disobedience-sense-of-",
  "t-0-a-letter-to-god": "t-0-a-letter-to-god",
  "t-1-nelson-mandela": "t-1-nelson-mandela-long-walk-to-",
  "t-2-two-stories-about-flying": "t-2-two-stories-about-flying",
  "t-0-maa-ki-chitthi": "t-0-maa-ki-chitthi",
  "t-1-lhasa-ki-or": "t-1-lhasa-ki-or",
  "t-0-achha-vakt-mein-bhale-kaam": "t-0-achha-vakt-mein-bhale-kaam",
};

/** Accepts either a runtime topic id or a stable alias slug */
export function findTopicByIdOrAlias(topicId: string): {
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
} | null {
  if (!topicId) return null;
  const direct = findTopic(topicId);
  if (direct) return direct;
  // fall back to stable aliases (e.g. "t-4-relationship-between-zeros-coefficients")
  const realId = CANONICAL_TOPIC_SLUGS[topicId] ?? topicId;
  return findTopic(realId);
}

/** The canonical list of stable alias slugs for links and UIs. */
export const ALIAS_IDS: string[] = Object.keys(CANONICAL_TOPIC_SLUGS);

/** Resolve the stable alias slug for any topic identifier (or null). */
export function topicAlias(topicId: string): string | null {
  if (!topicId) return null;
  if (topicId in CANONICAL_TOPIC_SLUGS) return topicId;
  return (
    Object.entries(CANONICAL_TOPIC_SLUGS).find(([, realId]) => realId === topicId)?.[0] ?? null
  );
}

/** Full breadcrumb for a topic: board → class → subject → chapter → topic */
export function topicPath(topicId: string): {
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
} | null {
  return findTopicByIdOrAlias(topicId);
}

/** All topics flattened — for library indexes, search and discovery. */
export function allTopics(): {
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
}[] {
  const out: { subject: Subject; chapter: Chapter; topic: Topic }[] = [];
  for (const board of boards) {
    for (const cls of board.classes) {
      for (const subject of cls.subjects) {
        for (const chapter of subject.chapters) {
          for (const topic of chapter.topics) {
            out.push({ subject, chapter, topic });
          }
        }
      }
    }
  }
  return out;
}

export function findTopic(topicId: string): {
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
} | null {
  for (const board of boards) {
    for (const cls of board.classes) {
      for (const subject of cls.subjects) {
        for (const chapter of subject.chapters) {
          const topic = chapter.topics.find((t) => t.id === topicId);
          if (topic) return { subject, chapter, topic };
        }
      }
    }
  }
  return null;
}

export function findChapter(chapterId: string): {
  subject: Subject;
  chapter: Chapter;
} | null {
  for (const board of boards) {
    for (const cls of board.classes) {
      for (const subject of cls.subjects) {
        const chapter = subject.chapters.find((c) => c.id === chapterId);
        if (chapter) return { subject, chapter };
      }
    }
  }
  return null;
}

/** Pretty subject name from code, e.g. MATH → Mathematics */
export function subjectName(code: string): string {
  for (const board of boards) {
    for (const cls of board.classes) {
      const subject = cls.subjects.find((s) => s.code === code);
      if (subject) return subject.name;
    }
  }
  return code;
}
