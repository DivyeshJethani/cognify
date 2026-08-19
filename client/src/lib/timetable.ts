/**
 * COGNIFY — Your Learning Schedule (Day 4)
 * Personalized timetable generated from the adaptive engine.
 *
 * MOCK SERVICE. Future NestJS backend:
 *   GET  /timetable                → TimetableSession[]
 *   POST /timetable/:id/complete | skip | reschedule
 *
 * Sessions are locally mutable (localStorage) — mutations mirror what the
 * backend would persist.
 */
import type { TimetableSession } from "./types";
import { listMutations, mutate } from "./mutateStore";

const STORE_KEY = "cognify.timetable.v1";

const DEFAULT_SESSIONS: TimetableSession[] = [
  // TODAY
  {
    id: "ts-1",
    period: "today",
    date: "Tue 19 Aug",
    startTime: "16:00",
    endTime: "16:25",
    subjectCode: "MATH",
    subjectLabel: "Mathematics",
    topicId: "t-1-relationship-between-zeros-c",
    topicTitle: "Relationship between Zeros & Coefficients",
    activityType: "concept-repair",
    activityLabel: "Concept repair",
    durationMinutes: 25,
    priority: "high",
    reason: "Weak conceptual mastery (27%) — the adaptive path's first intervention. Diagram format selected from your Learning DNA.",
    status: "scheduled",
  },
  {
    id: "ts-2",
    period: "today",
    date: "Tue 19 Aug",
    startTime: "17:00",
    endTime: "17:15",
    subjectCode: "SST",
    subjectLabel: "Social Science",
    topicId: "t-0-the-first-world-war-non-coop",
    topicTitle: "The First World War & Non-Cooperation",
    activityType: "retrieval-practice",
    activityLabel: "Retrieval practice",
    durationMinutes: 10,
    priority: "high",
    reason: "Retention estimate crosses your 7-day decay line today.",
    status: "scheduled",
  },
  {
    id: "ts-3",
    period: "today",
    date: "Tue 19 Aug",
    startTime: "18:00",
    endTime: "18:15",
    subjectCode: "SCI",
    subjectLabel: "Science",
    topicId: "t-1-types-of-reactions",
    topicTitle: "Types of Reactions",
    activityType: "timed-practice",
    activityLabel: "Timed practice",
    durationMinutes: 15,
    priority: "medium",
    reason: "Conceptual error cluster (46% of recent mistakes) — classification check with reworded variants.",
    status: "scheduled",
  },
  {
    id: "ts-4",
    period: "today",
    date: "Tue 19 Aug",
    startTime: "19:00",
    endTime: "19:10",
    subjectCode: "HIN",
    subjectLabel: "Hindi — Course A",
    topicId: "t-1-lhasa-ki-or",
    topicTitle: "ल्हासा की ओर",
    activityType: "revision",
    activityLabel: "Quick revision",
    durationMinutes: 10,
    priority: "low",
    reason: "No Hindi session in 5 days — balance nudge to protect the weekly target and streak.",
    status: "scheduled",
  },
  // THIS WEEK
  {
    id: "ts-5",
    period: "week",
    date: "Wed 20 Aug",
    startTime: "17:30",
    endTime: "17:45",
    subjectCode: "MATH",
    subjectLabel: "Mathematics",
    topicId: "t-1-completing-the-square",
    topicTitle: "Completing the Square",
    activityType: "concept-repair",
    activityLabel: "Concept repair",
    durationMinutes: 15,
    priority: "high",
    reason: "Your mastery has remained below 20% for three sessions — prerequisite repair then guided walkthrough.",
    status: "scheduled",
  },
  {
    id: "ts-6",
    period: "week",
    date: "Wed 20 Aug",
    startTime: "18:30",
    endTime: "18:50",
    subjectCode: "SCI",
    subjectLabel: "Science",
    topicId: "t-1-nutrition-in-humans",
    topicTitle: "Nutrition in Humans",
    activityType: "concept-repair",
    activityLabel: "Concept repair",
    durationMinutes: 20,
    priority: "medium",
    reason: "Weak topic (33%) — digestion pathway walkthrough with a labeling diagram.",
    status: "scheduled",
  },
  {
    id: "ts-7",
    period: "week",
    date: "Thu 21 Aug",
    startTime: "17:00",
    endTime: "17:20",
    subjectCode: "MATH",
    subjectLabel: "Mathematics",
    topicId: "t-1-irrational-numbers-proofs",
    topicTitle: "Irrational Numbers & Proofs",
    activityType: "timed-practice",
    activityLabel: "Timed practice",
    durationMinutes: 20,
    priority: "high",
    reason: "Interval lapsed 2 days ago — proof-construction practice with a worked scaffold.",
    status: "scheduled",
  },
  {
    id: "ts-8",
    period: "week",
    date: "Fri 22 Aug",
    startTime: "17:30",
    endTime: "17:50",
    subjectCode: "SST",
    subjectLabel: "Social Science",
    topicId: "t-1-making-of-nationalism-in-ita",
    topicTitle: "Making of Nationalism in Italy & Germany",
    activityType: "concept-repair",
    activityLabel: "Concept repair",
    durationMinutes: 20,
    priority: "high",
    reason: "Weak topic (22%) — comparative timeline walkthrough before retrieval.",
    status: "scheduled",
  },
  {
    id: "ts-9",
    period: "week",
    date: "Sat 23 Aug",
    startTime: "10:00",
    endTime: "10:25",
    subjectCode: "MATH",
    subjectLabel: "Mathematics",
    topicId: "t-2-nature-of-roots-discriminant",
    topicTitle: "Nature of Roots & Discriminant",
    activityType: "teach-back",
    activityLabel: "Teach-back challenge",
    durationMinutes: 25,
    priority: "medium",
    reason: "New topic — the engine starts with teach-back to establish a baseline rather than a lecture.",
    status: "scheduled",
  },
  // UPCOMING
  {
    id: "ts-10",
    period: "upcoming",
    date: "Mon 25 Aug",
    startTime: "17:00",
    endTime: "17:15",
    subjectCode: "SCI",
    subjectLabel: "Science",
    topicId: "t-1-ph-scale-strength",
    topicTitle: "pH Scale & Strength",
    activityType: "revision",
    activityLabel: "Revision",
    durationMinutes: 15,
    priority: "medium",
    reason: "Interpretation-error cluster — reworded variants after the standard interval.",
    status: "scheduled",
  },
  {
    id: "ts-11",
    period: "upcoming",
    date: "Tue 26 Aug",
    startTime: "18:00",
    endTime: "18:25",
    subjectCode: "MATH",
    subjectLabel: "Mathematics",
    topicId: "t-1-substitution-elimination-met",
    topicTitle: "Substitution & Elimination Methods",
    activityType: "timed-practice",
    activityLabel: "Timed practice",
    durationMinutes: 25,
    priority: "medium",
    reason: "Careless-error pattern under time pressure — timed set with a sign-check protocol.",
    status: "scheduled",
  },
  {
    id: "ts-12",
    period: "upcoming",
    date: "Wed 27 Aug",
    startTime: "17:30",
    endTime: "17:45",
    subjectCode: "ENG",
    subjectLabel: "English",
    topicId: "t-1-nelson-mandela-long-walk-to-",
    topicTitle: "Nelson Mandela: Long Walk to Freedom",
    activityType: "revision",
    activityLabel: "Revision",
    durationMinutes: 15,
    priority: "low",
    reason: "Standard interval; theme-note consolidation before the unit review.",
    status: "scheduled",
  },
];

/* ------------------------------------------------------------------ */
/* localStorage-backed session store                                    */
/* ------------------------------------------------------------------ */

interface Mutation {
  sessionId: string;
  status: TimetableSession["status"];
  rescheduledTo?: string;
}

export function timetableSessions(): TimetableSession[] {
  const mutations = listMutations<Mutation>(STORE_KEY);
  return DEFAULT_SESSIONS.map((s) => {
    const m = mutations.find((x) => x.sessionId === s.id);
    if (!m) return s;
    return { ...s, status: m.status, rescheduledTo: m.rescheduledTo };
  });
}

export function completeSession(id: string): void {
  mutate<Mutation>(STORE_KEY, { sessionId: id, status: "completed" });
}

export function skipSession(id: string): void {
  mutate<Mutation>(STORE_KEY, { sessionId: id, status: "skipped" });
}

export function rescheduleSession(id: string, to: string): void {
  mutate<Mutation>(STORE_KEY, {
    sessionId: id,
    status: "rescheduled",
    rescheduledTo: to,
  });
}

export function startSession(id: string): void {
  mutate<Mutation>(STORE_KEY, { sessionId: id, status: "in-progress" });
}

export function sessionsByPeriod(p: TimetableSession["period"]): TimetableSession[] {
  return timetableSessions().filter((s) => s.period === p);
}

export function todaySessionCount(): number {
  return sessionsByPeriod("today").filter((s) => s.status === "scheduled").length;
}
