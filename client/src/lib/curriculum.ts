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

import { TOPIC_ALIASES } from "./resourceDiscovery";

/** Accepts either a runtime topic id or a stable alias slug */
export function findTopicByIdOrAlias(topicId: string): {
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
} | null {
  if (!topicId) return null;
  const direct = findTopic(topicId);
  if (direct) return direct;
  // fall back to stable aliases from the discovery service
  const realId = TOPIC_ALIASES[topicId] ?? topicId;
  return findTopic(realId);
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
