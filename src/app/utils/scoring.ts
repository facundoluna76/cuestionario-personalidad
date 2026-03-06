import { questions } from "../data/questionsList";
import { subscales } from "../data/questions";

export interface SubscaleResult {
  code: string;
  name: string;
  score: number;
  maxScore: number;
  descriptionLow: string;
  descriptionHigh: string;
}

export function calculateResults(
  answers: Record<number, string>
): SubscaleResult[] {
  const scoreMap: Record<string, number> = {};
  const countMap: Record<string, number> = {};

  // Initialize
  subscales.forEach((s) => {
    scoreMap[s.code] = 0;
    countMap[s.code] = 0;
  });

  // Calculate scores
  questions.forEach((q) => {
    const answer = answers[q.id] as "A" | "B" | "C" | undefined;
    if (answer && q.scores[answer] !== undefined) {
      scoreMap[q.subscale] += q.scores[answer];
      countMap[q.subscale]++;
    }
  });

  // Build results
  return subscales.map((s) => ({
    code: s.code,
    name: s.name,
    score: scoreMap[s.code] || 0,
    maxScore: countMap[s.code] * 2, // max is 2 per question
    descriptionLow: s.descriptionLow,
    descriptionHigh: s.descriptionHigh,
  }));
}
