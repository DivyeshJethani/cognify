/**
 * COGNIFY — Mock Service Data
 * Implements the shapes from lib/types.ts. This data stands in for the
 * NestJS backend until the API layer is connected. Do not invent new
 * backend functionality — every field here maps to an existing capability
 * (mastery, weak-topic detection, Learning DNA, spaced retention, etc.).
 */
import type {
  ActivityItem,
  Board,
  CreditsBalance,
  Goal,
  LearningDNA,
  StudentProfile,
  Subject,
  TodayPathItem,
  Topic,
  TopicState,
} from "./types";

/* ---------- Curriculum ---------- */

type TopicInput = {
  title: string;
  objectives: string[];
  mastery: number;
  lastStudied: string | null;
  revisionDueInDays: number | null;
  action: TodayPathItem["action"] | null;
  reason: string | null;
  minutes: number;
  resources: { type: "lesson" | "practice" | "video" | "revision"; label: string; durationMinutes: number }[];
  /** Optional stable id override — used for non-Latin topic titles that the
   *  auto-slugger would otherwise reduce to empty strings */
  topicId?: string;
};

const mkChapter = (
  index: number,
  title: string,
  topics: TopicInput[]
) => ({
  id: `ch-${title.toLowerCase().replace(/\s+/g, "-")}`,
  index,
  title,
  topics: topics.map((t, i) => mkTopic(t, i, (t as { topicId?: string }).topicId ?? (t as { topicId?: string }).topicId)),
});

function mkTopic(

  base: {
    title: string;
    objectives: string[];
    mastery: number;
    lastStudied: string | null;
    revisionDueInDays: number | null;
    action: TodayPathItem["action"] | null;
    reason: string | null;
    minutes: number;
    resources: { type: "lesson" | "practice" | "video" | "revision"; label: string; durationMinutes: number }[];
  },
  index: number,
  overrideId?: string
) {
  let state: TopicState = "new";
  if (base.mastery >= 90) state = "mastered";
  else if (base.mastery >= 70) state = "proficient";
  else if (base.mastery >= 45) state = "developing";
  else if (base.mastery > 0) state = "weak";

  let revisionStatus: Topic["revisionStatus"] = "not-started";
  if (base.revisionDueInDays === null) revisionStatus = "not-started";
  else if (base.revisionDueInDays <= 0) revisionStatus = "overdue";
  else if (base.revisionDueInDays <= 3) revisionStatus = "due";
  else revisionStatus = "on-track";

  return {
    id: overrideId ?? `t-${index}-${base.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 28)}`,
    title: base.title,
    objectives: base.objectives.map((text, i) => ({ id: `lo-${i}`, text })),
    mastery: base.mastery,
    state,
    lastStudied: base.lastStudied,
    revisionDueInDays: base.revisionDueInDays,
    revisionStatus,
    recommendedAction: base.action,
    actionReason: base.reason,
    resources: base.resources.map((r, i) => ({ id: `res-${i}`, ...r })),
    estimatedMinutes: base.minutes,
  };
}

const MATH = {
  id: "math",
  name: "Mathematics",
  code: "MATH",
  color: "teal" as const,
  chapters: [
    mkChapter(1, "Real Numbers", [
      {
        title: "Euclid's Division Lemma & HCF",
        objectives: [
          "Apply Euclid's division algorithm to find HCF of two integers",
          "Distinguish between lemmas, theorems and algorithms",
        ],
        mastery: 84,
        lastStudied: "2026-08-17",
        revisionDueInDays: 6,
        action: "practice",
        reason:
          "You solved 7 of 10 algorithm questions correctly, but repeated an error with remainders. A short drill consolidates this before new content stacks on top.",
        minutes: 20,
        resources: [
          { type: "practice", label: "HCF algorithm drill", durationMinutes: 15 },
          { type: "lesson", label: "Worked example set", durationMinutes: 10 },
        ],
      },
      {
        title: "Irrational Numbers & Proofs",
        objectives: [
          "Prove √2 and √3 are irrational using contradiction",
          "Identify rational vs irrational expressions",
        ],
        mastery: 38,
        lastStudied: "2026-08-14",
        revisionDueInDays: -2,
        action: "revise",
        reason:
          "Mistake analysis shows your proofs break at the 'assume rational' step — a conceptual pattern, not carelessness. Revision is overdue by 2 days.",
        minutes: 25,
        resources: [
          { type: "revision", label: "Contradiction proof walkthrough", durationMinutes: 20 },
          { type: "video", label: "Why √2 cannot be a fraction", durationMinutes: 8 },
        ],
      },
      {
        title: "Fundamental Theorem of Arithmetic",
        objectives: [
          "Express composite numbers as prime factor products",
          "Use prime factorisation for HCF and LCM",
        ],
        mastery: 61,
        lastStudied: "2026-08-16",
        revisionDueInDays: 4,
        action: null,
        reason: null,
        minutes: 20,
        resources: [
          { type: "lesson", label: "Prime factorisation notes", durationMinutes: 12 },
          { type: "practice", label: "HCF/LCM problem set", durationMinutes: 15 },
        ],
      },
    ]),
    mkChapter(2, "Polynomials", [
      {
        title: "Zeros of a Polynomial",
        objectives: [
          "Relate zeros to the graph of a polynomial",
          "Count zeros from geometric representation",
        ],
        mastery: 92,
        lastStudied: "2026-08-10",
        revisionDueInDays: 12,
        action: null,
        reason: null,
        minutes: 15,
        resources: [
          { type: "revision", label: "Spaced review: zeros", durationMinutes: 10 },
          { type: "practice", label: "Graph interpretation set", durationMinutes: 12 },
        ],
      },
      {
        title: "Relationship between Zeros & Coefficients",
        objectives: [
          "Apply sum-and-product formulas for quadratic zeros",
          "Form a quadratic from given zeros",
        ],
        mastery: 27,
        lastStudied: "2026-08-15",
        revisionDueInDays: 1,
        action: "revise",
        reason:
          "This is your weakest tracked topic (27%). Confidence calibration shows you overestimate here — targeted revision before Friday's test is advised.",
        minutes: 30,
        resources: [
          { type: "revision", label: "Zero-coefficient relationship revision", durationMinutes: 20 },
          { type: "practice", label: "Mixed problem set", durationMinutes: 15 },
        ],
      },
      {
        title: "Division Algorithm for Polynomials",
        objectives: [
          "Divide polynomials and verify dividend = divisor × quotient + remainder",
        ],
        mastery: 0,
        lastStudied: null,
        revisionDueInDays: null,
        action: "learn",
        reason:
          "Prerequisite 'Zeros of a Polynomial' is now proficient. This is the natural next topic in the sequence, scheduled for tomorrow.",
        minutes: 35,
        resources: [
          { type: "lesson", label: "Polynomial long division", durationMinutes: 25 },
          { type: "video", label: "Visual division walkthrough", durationMinutes: 10 },
        ],
      },
    ]),
    mkChapter(3, "Pair of Linear Equations", [
      {
        title: "Graphical Method",
        objectives: [
          "Represent equations graphically and find intersection points",
          "Classify consistent, inconsistent and dependent pairs",
        ],
        mastery: 73,
        lastStudied: "2026-08-13",
        revisionDueInDays: 8,
        action: null,
        reason: null,
        minutes: 20,
        resources: [
          { type: "lesson", label: "Graphical solutions notes", durationMinutes: 12 },
          { type: "practice", label: "Plotting exercise", durationMinutes: 15 },
        ],
      },
      {
        title: "Substitution & Elimination Methods",
        objectives: [
          "Solve pairs using substitution",
          "Solve pairs using elimination",
        ],
        mastery: 55,
        lastStudied: "2026-08-16",
        revisionDueInDays: 5,
        action: "practice",
        reason:
          "Your elimination steps are correct but sign errors appear in 3 of your last 8 attempts — a careless-error pattern best fixed with timed practice.",
        minutes: 20,
        resources: [
          { type: "practice", label: "Timed elimination drill", durationMinutes: 15 },
          { type: "lesson", label: "Sign-error checklist", durationMinutes: 8 },
        ],
      },
      {
        title: "Cross-Multiplication & Word Problems",
        objectives: [
          "Apply cross-multiplication method",
          "Convert real-world situations into linear equations",
        ],
        mastery: 0,
        lastStudied: null,
        revisionDueInDays: null,
        action: null,
        reason: null,
        minutes: 30,
        resources: [
          { type: "lesson", label: "Cross-multiplication theory", durationMinutes: 20 },
          { type: "practice", label: "Word problem set", durationMinutes: 20 },
        ],
      },
    ]),
    mkChapter(4, "Quadratic Equations", [
      {
        title: "Standard Form & Factorisation",
        objectives: [
          "Identify quadratic equations in standard form",
          "Solve by factorisation",
        ],
        mastery: 66,
        lastStudied: "2026-08-12",
        revisionDueInDays: 9,
        action: null,
        reason: null,
        minutes: 20,
        resources: [
          { type: "lesson", label: "Factorisation methods", durationMinutes: 15 },
          { type: "practice", label: "Splitting the middle term", durationMinutes: 15 },
        ],
      },
      {
        title: "Completing the Square",
        objectives: ["Convert ax² + bx + c into completed-square form", "Solve using the method"],
        mastery: 19,
        lastStudied: "2026-08-15",
        revisionDueInDays: 3,
        action: "revise",
        reason:
          "Struggle analysis: you attempted this twice and paused for 4+ minutes each time. A guided re-attempt with worked examples is recommended.",
        minutes: 30,
        resources: [
          { type: "revision", label: "Guided completing-the-square", durationMinutes: 25 },
          { type: "video", label: "Geometric intuition", durationMinutes: 9 },
        ],
      },
      {
        title: "Nature of Roots & Discriminant",
        objectives: [
          "Use the discriminant to predict root nature",
          "Relate discriminant sign to graph intersections",
        ],
        mastery: 0,
        lastStudied: null,
        revisionDueInDays: null,
        action: null,
        reason: null,
        minutes: 25,
        resources: [
          { type: "lesson", label: "Discriminant notes", durationMinutes: 18 },
          { type: "practice", label: "Root nature exercises", durationMinutes: 15 },
        ],
      },
    ]),
  ],
} satisfies Subject;

const SCIENCE = {
  id: "science",
  name: "Science",
  code: "SCI",
  color: "green" as const,
  chapters: [
    mkChapter(1, "Chemical Reactions & Equations", [
      {
        title: "Writing & Balancing Equations",
        objectives: [
          "Write skeletal and balanced chemical equations",
          "Apply the law of conservation of mass",
        ],
        mastery: 88,
        lastStudied: "2026-08-16",
        revisionDueInDays: 10,
        action: null,
        reason: null,
        minutes: 15,
        resources: [
          { type: "revision", label: "Balancing rapid review", durationMinutes: 10 },
          { type: "practice", label: "Equation balancing set", durationMinutes: 12 },
        ],
      },
      {
        title: "Types of Reactions",
        objectives: [
          "Classify combination, decomposition, displacement and double displacement reactions",
          "Identify exothermic and endothermic processes",
        ],
        mastery: 41,
        lastStudied: "2026-08-14",
        revisionDueInDays: 2,
        action: "practice",
        reason:
          "You confuse displacement with double displacement in 4 of your last 10 classifications. A classification drill targets exactly this gap.",
        minutes: 20,
        resources: [
          { type: "practice", label: "Reaction classification drill", durationMinutes: 15 },
          { type: "lesson", label: "Comparison table notes", durationMinutes: 10 },
        ],
      },
      {
        title: "Oxidation, Reduction & Corrosion",
        objectives: [
          "Define oxidation and reduction in terms of oxygen/hydrogen transfer",
          "Explain rancidity and corrosion with examples",
        ],
        mastery: 0,
        lastStudied: null,
        revisionDueInDays: null,
        action: "learn",
        reason:
          "Next topic in your curriculum sequence. Your peak focus hour (18:00–20:00) makes this evening a good slot for new content.",
        minutes: 30,
        resources: [
          { type: "lesson", label: "Redox fundamentals", durationMinutes: 20 },
          { type: "video", label: "Corrosion in the real world", durationMinutes: 8 },
        ],
      },
    ]),
    mkChapter(2, "Acids, Bases & Salts", [
      {
        title: "Properties of Acids & Bases",
        objectives: [
          "Describe acid/base behaviour with indicators",
          "Explain reactions with metals, carbonates and oxides",
        ],
        mastery: 76,
        lastStudied: "2026-08-15",
        revisionDueInDays: 7,
        action: null,
        reason: null,
        minutes: 15,
        resources: [
          { type: "lesson", label: "Indicator chart notes", durationMinutes: 10 },
          { type: "practice", label: "Reaction prediction set", durationMinutes: 12 },
        ],
      },
      {
        title: "pH Scale & Strength",
        objectives: [
          "Interpret pH values and relate them to H⁺ concentration",
          "Distinguish strong and weak acids/bases",
        ],
        mastery: 52,
        lastStudied: "2026-08-13",
        revisionDueInDays: 4,
        action: "practice",
        reason:
          "Mastery is plateauing at ~52%. Practice with pH-logarithm conversions typically breaks this plateau.",
        minutes: 20,
        resources: [
          { type: "practice", label: "pH calculation set", durationMinutes: 15 },
          { type: "lesson", label: "Logarithm refresher", durationMinutes: 8 },
        ],
      },
    ]),
    mkChapter(3, "Life Processes", [
      {
        title: "Nutrition in Plants",
        objectives: [
          "Explain photosynthesis with its equation and conditions",
          "Describe the opening and closing of stomata",
        ],
        mastery: 95,
        lastStudied: "2026-08-09",
        revisionDueInDays: 14,
        action: null,
        reason: null,
        minutes: 10,
        resources: [
          { type: "revision", label: "Spaced review: photosynthesis", durationMinutes: 10 },
        ],
      },
      {
        title: "Nutrition in Humans",
        objectives: [
          "Trace the pathway of food through the alimentary canal",
          "Explain the role of enzymes at each stage",
        ],
        mastery: 33,
        lastStudied: "2026-08-15",
        revisionDueInDays: 1,
        action: "revise",
        reason:
          "Attention analysis shows your focus dips midway through long passages. This topic is due for revision and pairs well with diagram-based resources, your strongest format.",
        minutes: 25,
        resources: [
          { type: "revision", label: "Alimentary canal diagram revision", durationMinutes: 20 },
          { type: "video", label: "Digestion animation", durationMinutes: 7 },
        ],
      },
      {
        title: "Transportation & Excretion",
        objectives: [
          "Describe double circulation in humans",
          "Explain excretion in plants and humans",
        ],
        mastery: 0,
        lastStudied: null,
        revisionDueInDays: null,
        action: null,
        reason: null,
        minutes: 30,
        resources: [
          { type: "lesson", label: "Circulation notes", durationMinutes: 20 },
          { type: "video", label: "Heart walkthrough", durationMinutes: 10 },
        ],
      },
    ]),
  ],
} satisfies Subject;

const SOCIAL = {
  id: "social",
  name: "Social Science",
  code: "SST",
  color: "amber" as const,
  chapters: [
    mkChapter(1, "The Rise of Nationalism in Europe", [
      {
        title: "The French Revolution & the Idea of the Nation",
        objectives: [
          "Analyse the role of the French Revolution in fostering nationalism",
          "Explain the impact of Napoleon's Civil Code of 1804",
        ],
        mastery: 70,
        lastStudied: "2026-08-16",
        revisionDueInDays: 9,
        action: null,
        reason: null,
        minutes: 20,
        resources: [
          { type: "lesson", label: "Timeline notes", durationMinutes: 15 },
          { type: "practice", label: "Source analysis set", durationMinutes: 15 },
        ],
      },
      {
        title: "Making of Nationalism in Italy & Germany",
        objectives: [
          "Compare unification processes in Italy and Germany",
          "Evaluate the role of key figures: Cavour, Garibaldi, Bismarck",
        ],
        mastery: 22,
        lastStudied: "2026-08-14",
        revisionDueInDays: -1,
        action: "revise",
        reason:
          "Your notes on this topic are flagged 'incomplete' by the revision scheduler, and the unit test performance here was 58%. Revision overdue.",
        minutes: 30,
        resources: [
          { type: "revision", label: "Comparison-table revision", durationMinutes: 25 },
          { type: "lesson", label: "Key figures summary", durationMinutes: 10 },
        ],
      },
      {
        title: "Nationalism & Imperialism",
        objectives: [
          "Explain how the Balkans became a flashpoint",
          "Link imperialism to the outbreak of the First World War",
        ],
        mastery: 0,
        lastStudied: null,
        revisionDueInDays: null,
        action: null,
        reason: null,
        minutes: 25,
        resources: [
          { type: "lesson", label: "Balkans notes", durationMinutes: 18 },
          { type: "video", label: "Map walkthrough: Europe 1914", durationMinutes: 9 },
        ],
      },
    ]),
    mkChapter(2, "Nationalism in India", [
      {
        title: "The First World War & Non-Cooperation",
        objectives: [
          "Assess the impact of the war on India's economy and society",
          "Explain the Khilafat and Non-Cooperation movements",
        ],
        mastery: 58,
        lastStudied: "2026-08-15",
        revisionDueInDays: 6,
        action: "practice",
        reason:
          "You recall facts well but struggle to 'assess' and 'evaluate' in answers. A short-answer practice set targets this exam skill.",
        minutes: 20,
        resources: [
          { type: "practice", label: "Long-answer writing set", durationMinutes: 20 },
        ],
      },
      {
        title: "Civil Disobedience & Sense of Collective Belonging",
        objectives: [
          "Describe the Salt March and its significance",
          "Explain how folklore, flags and icons created collective identity",
        ],
        mastery: 0,
        lastStudied: null,
        revisionDueInDays: null,
        action: "learn",
        reason:
          "Next topic in sequence, scheduled after the current revision backlog clears. Estimated 3 sessions to reach proficiency.",
        minutes: 30,
        resources: [
          { type: "lesson", label: "Salt March notes", durationMinutes: 22 },
          { type: "video", label: "Dandi March documentary excerpt", durationMinutes: 12 },
        ],
      },
    ]),
  ],
} satisfies Subject;

const ENGLISH = {
  id: "english",
  name: "English",
  code: "ENG",
  color: "ink" as const,
  chapters: [
    mkChapter(1, "First Flight — Prose", [
      {
        title: "A Letter to God",
        objectives: [
          "Analyse Lencho's faith and the story's irony",
          "Interpret the writer's message about human goodness",
        ],
        mastery: 81,
        lastStudied: "2026-08-12",
        revisionDueInDays: 11,
        action: null,
        reason: null,
        minutes: 15,
        resources: [
          { type: "revision", label: "Comprehension rapid review", durationMinutes: 12 },
        ],
      },
      {
        title: "Nelson Mandela: Long Walk to Freedom",
        objectives: [
          "Summarise Mandela's views on freedom and courage",
          "Explain the meaning of 'twin obligations'",
        ],
        mastery: 44,
        lastStudied: "2026-08-15",
        revisionDueInDays: 2,
        action: "practice",
        reason:
          "Your extracts show strong comprehension but answers lose marks on structure. A focused answer-format practice is recommended.",
        minutes: 20,
        resources: [
          { type: "practice", label: "Answer-structure drills", durationMinutes: 15 },
          { type: "lesson", label: "PEEL paragraph model", durationMinutes: 10 },
        ],
      },
      {
        title: "Two Stories about Flying",
        objectives: [
          "Contrast the themes of the two stories",
          "Analyse the symbolism of flight",
        ],
        mastery: 0,
        lastStudied: null,
        revisionDueInDays: null,
        action: null,
        reason: null,
        minutes: 25,
        resources: [
          { type: "lesson", label: "Story comparison notes", durationMinutes: 20 },
        ],
      },
    ]),
  ],
} satisfies Subject;

const HINDI = {
  id: "hindi",
  name: "Hindi — Course A",
  code: "HIN",
  color: "teal" as const,
  chapters: [
    mkChapter(1, "गद्य (Gadya)", [
      {
        topicId: "t-0-maa-ki-chitthi",
        title: "माँ की चिट्ठी",
        objectives: [
          "कहानी के मुख्य विषय की व्याख्या करना",
          "पात्रों के चरित्र का विश्लेषण करना",
        ],
        mastery: 74,
        lastStudied: "2026-08-13",
        revisionDueInDays: 8,
        action: null,
        reason: null,
        minutes: 15,
        resources: [
          { type: "revision", label: "प्रश्नोत्तर अभ्यास", durationMinutes: 12 },
        ],
      },
      {
        topicId: "t-1-lhasa-ki-or",
        title: "ल्हासा की ओर",
        objectives: ["यात्रा वर्णन की विशेषताओं को समझना"],
        mastery: 30,
        lastStudied: "2026-08-14",
        revisionDueInDays: 3,
        action: "revise",
        reason:
          "Revision due: this chapter's recall rate dropped below threshold in the last spaced-retention check.",
        minutes: 20,
        resources: [
          { type: "revision", label: "सारांश पुनरावलोकन", durationMinutes: 18 },
        ],
      },
    ]),
  ],
} satisfies Subject;

const SANSKRIT = {
  id: "sanskrit",
  name: "Sanskrit",
  code: "SKT",
  color: "green" as const,
  chapters: [
    mkChapter(1, "गद्यखण्डः", [
      {
        topicId: "t-0-achha-vakt-mein-bhale-kaam",
        title: "अच्छा वक्त में भले काम",
        objectives: ["कथावस्तु का वर्णन करना"],
        mastery: 60,
        lastStudied: "2026-08-11",
        revisionDueInDays: 7,
        action: null,
        reason: null,
        minutes: 15,
        resources: [{ type: "revision", label: "शब्दार्थ पुनरावलोकन", durationMinutes: 12 }],
      },
    ]),
  ],
} satisfies Subject;

export const boards: Board[] = [
  {
    id: "cbse",
    name: "CBSE",
    classes: [
      {
        id: "cbse-10",
        name: "Class 10",
        subjects: [MATH, SCIENCE, SOCIAL, ENGLISH, HINDI, SANSKRIT],
      },
      {
        id: "cbse-9",
        name: "Class 9",
        subjects: [MATH, SCIENCE, SOCIAL, ENGLISH, HINDI],
      },
      {
        id: "cbse-8",
        name: "Class 8",
        subjects: [MATH, SCIENCE, SOCIAL, ENGLISH, HINDI],
      },
    ],
  },
  {
    id: "icse",
    name: "ICSE",
    classes: [
      {
        id: "icse-10",
        name: "Class 10",
        subjects: [MATH, SCIENCE, SOCIAL, ENGLISH, HINDI],
      },
      {
        id: "icse-9",
        name: "Class 9",
        subjects: [MATH, SCIENCE, SOCIAL, ENGLISH, HINDI],
      },
    ],
  },
  {
    id: "up-board",
    name: "UP Board",
    classes: [
      {
        id: "up-10",
        name: "Class 10",
        subjects: [MATH, SCIENCE, SOCIAL, ENGLISH, HINDI],
      },
    ],
  },
];

/* ---------- Derived curriculum helpers ---------- */

export function findSubject(boardId: string, classId: string, subjectId: string) {
  const board = boards.find((b) => b.id === boardId);
  const cls = board?.classes.find((c) => c.id === classId);
  return cls?.subjects.find((s) => s.id === subjectId) ?? null;
}

export function allTopics(subject: Subject) {
  return subject.chapters.flatMap((ch) =>
    ch.topics.map((t) => ({ chapter: ch, topic: t }))
  );
}

/* ---------- Learning DNA ---------- */

export const learningDNA: LearningDNA = {
  profileStrength: 72,
  peakFocusHour: "18:00–20:00",
  avgSessionMinutes: 34,
  mistakeProfile: {
    conceptual: 46,
    careless: 31,
    procedural: 23,
  },
  topFormat: "visual-diagram",
  formatExperimentResults: [
    { format: "visual-diagram", success: 83 },
    { format: "worked-example", success: 74 },
    { format: "analogy", success: 68 },
    { format: "step-by-step", success: 61 },
    { format: "verbal-explanation", success: 52 },
  ],
  insights: [
    {
      id: "i1",
      dimension: "Teaching format",
      finding: "You retain 31% more from diagram-based lessons than verbal ones",
      confidence: 88,
      implication:
        "COGNIFY has begun favouring visual-diagram resources in your recommendations.",
    },
    {
      id: "i2",
      dimension: "Mistake classification",
      finding: "46% of your errors are conceptual, concentrated in proofs and algebra",
      confidence: 81,
      implication:
        "Weak-topic detection flags 'Relationship between Zeros & Coefficients' for revision.",
    },
    {
      id: "i3",
      dimension: "Confidence calibration",
      finding: "You overestimate mastery on weak topics by ~35 percentage points",
      confidence: 76,
      implication:
        "Recommendations for those topics now require an evidence check before marking complete.",
    },
    {
      id: "i4",
      dimension: "Attention",
      finding: "Focus dips after ~22 minutes on text-heavy material",
      confidence: 69,
      implication:
        "Sessions are being chunked into 20-minute blocks with active breaks.",
    },
  ],
};

/* ---------- Goals ---------- */

export const goals: Goal[] = [
  {
    id: "g1",
    title: "Raise Mathematics chapter 2 to 70% mastery",
    progress: 48,
    dueDate: "2026-09-05",
  },
  {
    id: "g2",
    title: "Complete all overdue revisions this week",
    progress: 60,
    dueDate: "2026-08-23",
  },
  {
    id: "g3",
    title: "14-day learning streak",
    progress: 64,
    dueDate: "2026-08-28",
  },
];

/* ---------- Activity ---------- */

export const recentActivity: ActivityItem[] = [
  { id: "a1", type: "practice", topic: "Substitution & Elimination", subject: "MATH", when: "2h ago", result: "+4% mastery" },
  { id: "a2", type: "revision", topic: "Types of Reactions", subject: "SCI", when: "5h ago", result: "+6% mastery" },
  { id: "a3", type: "learn", topic: "French Revolution & the Nation", subject: "SST", when: "Yesterday", result: "First exposure" },
  { id: "a4", type: "test", topic: "Weekly revision test", subject: "MATH", when: "Yesterday", result: "71% (+9 pts)" },
  { id: "a5", type: "learn", topic: "Nutrition in Humans", subject: "SCI", when: "2 days ago", result: "22 min session" },
  { id: "a6", type: "practice", topic: "pH Scale & Strength", subject: "SCI", when: "2 days ago", result: "+5% mastery" },
];

/* ---------- Today's Learning Path ---------- */

export const todaysPath: TodayPathItem[] = [
  {
    topicId: "t-2-relationship-between-zeros-coefficients",
    topicTitle: "Relationship between Zeros & Coefficients",
    subject: "MATH",
    action: "revise",
    minutes: 30,
    reason:
      "Your weakest tracked topic (27% mastery) and overdue for revision. A Friday test on Chapter 2 makes this the highest-impact 30 minutes available today.",
    urgency: "high",
  },
  {
    topicId: "t-1-substitution-elimination-methods",
    topicTitle: "Substitution & Elimination Methods",
    subject: "MATH",
    action: "practice",
    minutes: 20,
    reason:
      "Mastery plateaued at 55% with a recurring careless-error pattern. A timed drill directly addresses the observed sign-error habit.",
    urgency: "normal",
  },
  {
    topicId: "t-0-nutrition-in-humans",
    topicTitle: "Nutrition in Humans",
    subject: "SCI",
    action: "revise",
    minutes: 25,
    reason:
      "Due for spaced revision (1 day). Retention probability drops below 60% if this session is skipped beyond today.",
    urgency: "normal",
  },
];

/* ---------- Profile & credits ---------- */

export const studentProfile: StudentProfile = {
  id: "s-001",
  name: "Aarav Mehta",
  board: "CBSE",
  className: "Class 10",
  subjectIds: ["math", "science", "social", "english", "hindi"],
  learningGoal:
    "Master the Class 10 syllabus with depth — build genuine understanding, not exam-night recall.",
  weeklyTargetMinutes: 420,
  streakDays: 9,
  createdAt: "2026-07-14",
};

export const creditsBalance: CreditsBalance = {
  balance: 142,
  earnedThisWeek: 86,
  spentThisWeek: 30,
};

/* ---------- Weak topics / revision due (for the dashboard rail) ---------- */

export function weakTopics() {
  const weak: { subject: Subject; chapterTitle: string; topic: NonNullable<ReturnType<typeof allTopics>[number]>["topic"] }[] = [];
  for (const subject of [MATH, SCIENCE, SOCIAL, ENGLISH, HINDI]) {
    for (const ch of subject.chapters) {
      for (const t of ch.topics) {
        if (t.state === "weak" || t.state === "developing") {
          weak.push({ subject, chapterTitle: ch.title, topic: t });
        }
      }
    }
  }
  return weak.sort((a, b) => a.topic.mastery - b.topic.mastery);
}

export function revisionDue() {
  const due: { subject: Subject; chapterTitle: string; topic: NonNullable<ReturnType<typeof allTopics>[number]>["topic"] }[] = [];
  for (const subject of [MATH, SCIENCE, SOCIAL, ENGLISH, HINDI]) {
    for (const ch of subject.chapters) {
      for (const t of ch.topics) {
        if (t.revisionStatus === "due" || t.revisionStatus === "overdue") {
          due.push({ subject, chapterTitle: ch.title, topic: t });
        }
      }
    }
  }
  return due.sort((a, b) => (a.topic.revisionDueInDays ?? 99) - (b.topic.revisionDueInDays ?? 99));
}
