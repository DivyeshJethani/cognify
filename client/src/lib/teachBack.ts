/**
 * COGNIFY — Teach Cognify (Day 4)
 * Teaching as revision and mastery verification.
 *
 * MOCK SERVICE. Future NestJS backend:
 *   GET  /teach-back/prompts                 → TeachBackPrompt[]
 *   POST /teach-back/:topicId/submit         → TeachBackAnalysis
 *
 * The teach-back analysis writes to Learning DNA (mastery evidence) and can
 * route remaining gaps to the peer-teach network (studyGroups).
 */
import type { TeachBackAnalysis, TeachBackPrompt } from "./types";

export function teachBackPrompts(): TeachBackPrompt[] {
  return [
    {
      topicId: "t-2-nature-of-roots-discriminant",
      topicTitle: "Nature of Roots & Discriminant",
      subjectCode: "MATH",
      chapterTitle: "Quadratic Equations",
      prompt: "Explain why the discriminant determines the nature of roots.",
      keyPoints: [
        "Discriminant D = b² − 4ac computed from coefficients",
        "D > 0 → two distinct real roots (the parabola crosses the x-axis twice)",
        "D = 0 → one repeated real root (the parabola just touches the axis)",
        "D < 0 → no real roots (the parabola never meets the x-axis)",
        "The relationship between the discriminant and the shape of the graph",
      ],
    },
    {
      topicId: "t-0-standard-form-factorisation",
      topicTitle: "Standard Form & Factorisation",
      subjectCode: "MATH",
      chapterTitle: "Quadratic Equations",
      prompt:
        "Explain how factorisation solves a quadratic equation — and why it only works when the roots are rational.",
      keyPoints: [
        "Standard form ax² + bx + c = 0",
        "Factorising rewrites it as (x − α)(x − β) = 0",
        "Zero-product property: each factor can independently be zero",
        "Why rational roots are required for clean integer factorisation",
      ],
    },
    {
      topicId: "t-1-types-of-reactions",
      topicTitle: "Types of Reactions",
      subjectCode: "SCI",
      chapterTitle: "Chemical Reactions & Equations",
      prompt:
        "Explain the difference between combustion and oxidation, using methane burning as your example.",
      keyPoints: [
        "Oxidation is gain of oxygen / loss of electrons — a broad process",
        "Combustion is rapid oxidation releasing heat and light",
        "CH₄ + 2O₂ → CO₂ + 2H₂O as a combustion example",
        "Every combustion is oxidation; not every oxidation is combustion",
      ],
    },
    {
      topicId: "t-0-the-first-world-war-non-coop",
      topicTitle: "The First World War & Non-Cooperation",
      subjectCode: "SST",
      chapterTitle: "Nationalism in India",
      prompt:
        "Explain how the First World War prepared the ground for the Non-Cooperation Movement in India.",
      keyPoints: [
        "Economic strain: forced recruitment, war taxes, crop failure",
        "The Rowlatt Act and its suppression of civil liberties",
        "Khilafat issue aligning with the nationalist cause",
        "Gandhi's shift from support to non-cooperation (1919–1920)",
      ],
    },
  ];
}

export function analyseTeachBack(
  topicId: string,
  _studentText: string,
): TeachBackAnalysis {
  const prompt = teachBackPrompts().find((p) => p.topicId === topicId);
  // Mock analysis — a real backend would score coverage with an LLM.
  const analyses: Record<string, Omit<TeachBackAnalysis, "evidence">> = {
    "t-2-nature-of-roots-discriminant": {
      coverage: 82,
      clarity: 74,
      missingIdea: "Relationship between the discriminant and the graph",
      verdict:
        "Your explanation is strong — the algebra is correct and the three cases are distinct. Almost there! Just one small detail about how the discriminant looks on a graph to finish this topic.",
    },
    "t-0-standard-form-factorisation": {
      coverage: 76,
      clarity: 81,
      missingIdea: "Why rational roots are required for clean factorisation",
      verdict:
        "Clear account of the method and the zero-product property. You've mastered the method! Revisit the part about when factorisation fails to finish this topic.",
    },
    "t-1-types-of-reactions": {
      coverage: 68,
      clarity: 70,
      missingIdea: "Combustion as a subset of oxidation",
      verdict:
        "Great job on the methane example! Just a quick look at how combustion and oxidation relate will clear up the final detail.",
    },
    "t-0-the-first-world-war-non-coop": {
      coverage: 85,
      clarity: 78,
      missingIdea: "The Khilafat–nationalist alignment mechanism",
      verdict:
        "A strong narrative of economic strain and the Rowlatt Act. You've got the main points down! A quick review of the Khilafat linkage will make your understanding complete.",
    },
  };
  const base = analyses[topicId] ?? {
    coverage: 75,
    clarity: 72,
    missingIdea: "One supporting idea needs strengthening",
    verdict: "Solid explanation — revisit the flagged concept to complete mastery.",
  };
  return { ...base, evidence: 66 + (base.coverage - 70) };
}

export function missingIdeaPrompt(topicId: string): string | null {
  const a = analyseTeachBack(topicId, "");
  return a.missingTopicId ?? a.missingIdea;
}
