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

/* ---------- Learning session ---------- */
export interface LearningSession {
  id: string;
  resourceId: string;
  topicId: string;
  objective: string;
  estimatedMinutes: number;
  nextActivity: string;
  startedAt: string;
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

/* ---------- Credits ---------- */
export interface CreditsBalance {
  balance: number;
  earnedThisWeek: number;
  spentThisWeek: number;
}
