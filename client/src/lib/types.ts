/**
 * COGNIFY — Domain Model
 * Style note: this is the shared vocabulary between the frontend and the
 * future NestJS backend (topic mastery, Learning DNA, mistake classification,
 * spaced retention, etc.). Mock services implement these shapes.
 */

/* ---------- Curriculum ---------- */
export interface Board {
  id: string;
  name: string;
  classes: Classroom[];
}

export interface Classroom {
  id: string;
  name: string; // e.g. "Class 10"
  subjects: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  code: string; // e.g. "MATH", "SCI"
  color: "teal" | "amber" | "ink" | "green";
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  index: number; // book-style numbering
  title: string;
  topics: Topic[];
}

export interface LearningObjective {
  id: string;
  text: string;
}

export type TopicState =
  | "new"
  | "learning"
  | "developing"
  | "proficient"
  | "weak"
  | "mastered";

export type RecommendedAction =
  | "learn"
  | "practice"
  | "revise"
  | "teach-back"
  | "stretch";

export interface Topic {
  id: string;
  title: string;
  objectives: LearningObjective[];
  /** Mastery 0–100 */
  mastery: number;
  state: TopicState;
  /** ISO date */
  lastStudied: string | null;
  /** Days until next spaced revision; null if not due */
  revisionDueInDays: number | null;
  revisionStatus: "not-started" | "on-track" | "due" | "overdue";
  recommendedAction: RecommendedAction | null;
  actionReason: string | null;
  resources: TopicResource[];
  /** Estimated study minutes */
  estimatedMinutes: number;
}

export interface TopicResource {
  id: string;
  type: "lesson" | "practice" | "video" | "revision";
  label: string;
  durationMinutes: number;
}

/* ---------- Resource Discovery ---------- */

/** Where the resource was found — future backend enumerates actual sources */
export type ResourceSource =
  | "youtube"
  | "ncert"
  | "cbse"
  | "edu-website"
  | "cognify-original";

/** How the resource teaches — used for DNA-aware ranking */
export type ResourceFormat =
  | "lecture"
  | "revision"
  | "explanation"
  | "example"
  | "practice"
  | "diagram";

export type Difficulty = "foundational" | "core" | "advanced" | "stretch";

/** The ten COGNIFY resource types — each renders with its own layout */
export type ResourceType =
  | "video-lecture"
  | "article"
  | "ncert-textbook"
  | "diagram"
  | "animation-visual"
  | "revision-notes"
  | "solved-example"
  | "practice-set"
  | "quick-revision"
  | "concept-explanation";

export interface LearningResource {
  id: string;
  title: string;
  source: ResourceSource;
  sourceLabel: string; // human display, e.g. "YouTube · Khan Academy" or "NCERT Exemplar"
  url: string; // null-safe: demo links only
  durationMinutes: number;
  format: ResourceFormat;
  topicId: string;
  topicTitle: string;
  chapterId: string;
  subjectCode: string;
  difficulty: Difficulty;
  /** 0–100 how strongly this resource matches the topic + student's DNA */
  relevance: number;
  /** The COGNIFY-specific reason this resource was surfaced */
  whyRecommended: string;
  /** DNA dimension this resource serves, e.g. "Teaching format" */
  dnaDimension: string | null;
  thumbnail?: string;
  /** One of the ten COGNIFY resource types */
  resourceType: ResourceType;
  /** Short description of contents */
  description: string;
  /** Recommendation rail this resource leads with, null when not leading */
  rail?: string;
  /** Free-web-resources flag (YouTube/NCERT/OER discovery) */
  isFreeWeb?: boolean;
}

export interface ResourceDiscoveryResult {
  topicId: string;
  resources: LearningResource[];
  /** Filters applied in this query */
  appliedFilters: ResourceFormat[];
  /** Backend note: real API would compute this from DNA + mastery */
  rankingNote: string;
}

/* ---------- Transcript & replay ---------- */
export interface TranscriptSegment {
  startSec: number;
  endSec: number;
  text: string;
  confusing?: boolean; // marked by student during playback
}

export interface ConfusingMark {
  startSec: number;
  note: string;
}

/* ---------- Player analytics events ---------- */
/** Events the player emits — the future backend aggregates these per session */
export type PlayerEventType =
  | "PLAY"
  | "PAUSE"
  | "REWIND"
  | "FAST_FORWARD"
  | "SKIP"
  | "SPEED_CHANGE"
  | "COMPLETE"
  | "DROP_OFF";

export interface PlayerEvent {
  type: PlayerEventType;
  atSec: number; // where in the video
  sessionId: string;
  resourceId: string;
  payload?: Record<string, string | number>; // e.g. { speed: 1.5 }
}

/** Wider interaction vocabulary the frontend records (future analytics) */
export type LearningInteractionType =
  | "PLAY"
  | "PAUSE"
  | "SEEK"
  | "REWIND"
  | "SPEED_CHANGE"
  | "COMPLETE"
  | "DROP_OFF"
  | "MARK_CONFUSING"
  | "ASK_QUESTION"
  | "TAKE_NOTE"
  | "SAVE_RESOURCE"
  | "SWITCH_RESOURCE"
  | "RETRY_EXPLANATION";

/* ---------- Learning session ---------- */
export interface LearningSession {
  id: string;
  resourceId: string;
  topicId: string;
  objective: string;
  estimatedMinutes: number;
  nextActivity: string;
  startedAt: string;
  finished?: boolean;
}

/* ---------- Learning DNA ---------- */
export type LearningFormat =
  | "visual-diagram"
  | "worked-example"
  | "analogy"
  | "step-by-step"
  | "verbal-explanation";

export interface DNAInsight {
  id: string;
  dimension: string; // e.g. "Teaching format", "Attention", "Resilience"
  finding: string;
  confidence: number; // 0–100 evidence strength
  implication: string;
}

export interface LearningDNA {
  profileStrength: number; // 0–100 completeness
  insights: DNAInsight[];
  peakFocusHour: string; // e.g. "18:00–20:00"
  avgSessionMinutes: number;
  mistakeProfile: {
    conceptual: number;
    careless: number;
    procedural: number;
  };
  topFormat: LearningFormat;
  formatExperimentResults: { format: LearningFormat; success: number }[];
}

/* ---------- Goals & streak ---------- */
export interface Goal {
  id: string;
  title: string;
  progress: number; // 0–100
  dueDate: string;
}

export interface ActivityItem {
  id: string;
  type: "learn" | "practice" | "revision" | "test";
  topic: string;
  subject: string;
  when: string; // relative, e.g. "2h ago"
  result: string; // e.g. "+12% mastery"
}

export interface TodayPathItem {
  topicId: string;
  topicTitle: string;
  subject: string;
  action: RecommendedAction;
  minutes: number;
  reason: string;
  urgency: "high" | "normal" | "low";
}

/* ---------- Student ---------- */
export interface StudentProfile {
  id: string;
  name: string;
  board: string;
  className: string;
  subjectIds: string[];
  learningGoal: string;
  weeklyTargetMinutes: number;
  streakDays: number;
  createdAt: string;
}

/* ---------- Saved resources ---------- */
export interface SavedResource {
  resourceId: string;
  savedAt: string; // ISO
  note?: string; // optional student note attached at save
}

/* ---------- Progress (continue learning) ---------- */
export interface ResourceProgress {
  resourceId: string;
  /** fraction watched/attempted 0–1 */
  fraction: number;
  lastAtSec?: number;
  updatedAt: string;
}

/* ---------- Search ---------- */
export type SearchResultKind = "topic" | "resource" | "lecture" | "note" | "practice";

export interface SearchResult {
  kind: SearchResultKind;
  id: string;
  title: string;
  context: string; // subject · chapter · topic
  href: string; // navigation target
  relevance: number; // 0–100
}

/* ---------- Notes with timeline attachment ---------- */
export interface TimelineNote {
  id: string;
  resourceId: string;
  atSec: number; // attached to lecture timeline
  text: string;
  importance: "normal" | "highlight";
  confusing?: boolean;
  createdAt: string;
}

/* ---------- Topic learning page ---------- */
export interface TopicLearningView {
  topic: Topic;
  subject: Subject;
  chapter: Chapter;
  mastery: number;
  lastStudied: string | null;
  revisionStatus: "not-started" | "on-track" | "due" | "overdue";
  recommendedFormat: LearningFormat;
  recommendedFormatReason: string;
  previousActivity: string;
  relatedTopicIds: string[];
  dnaInsight: { finding: string; confidence: number };
}

/* ---------- Ask Cognify actions ---------- */
export type AskActionId =
  | "explain-differently"
  | "example"
  | "hint"
  | "test-me"
  | "diagram"
  | "why-important"
  | "another-explanation"
  | "teach-back";

export interface AskAction {
  id: AskActionId;
  label: string;
  detail: string;
}

/* ---------- Credits ---------- */
export interface CreditsBalance {
  balance: number;
  earnedThisWeek: number;
  spentThisWeek: number;
}
