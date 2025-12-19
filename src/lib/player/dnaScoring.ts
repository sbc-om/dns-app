export type DnaAssessmentTests = {
  speed: number; // seconds (lower is better)
  agility: number; // seconds (lower is better)
  balance: number; // seconds (higher is better)
  power: number; // cm (higher is better)
  reaction: number; // ms (lower is better)
  coordination: number; // reps (higher is better)
  flexibility: number; // cm (higher is better)
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function scoreLowerBetter(value: number, best: number, worst: number): number {
  if (!Number.isFinite(value)) return 0;
  const v = clamp(value, best, worst);
  return ((worst - v) / (worst - best)) * 100;
}

function scoreHigherBetter(value: number, worst: number, best: number): number {
  if (!Number.isFinite(value)) return 0;
  const v = clamp(value, worst, best);
  return ((v - worst) / (best - worst)) * 100;
}

export function calculateCategoryScores(
  tests: DnaAssessmentTests
): Record<keyof DnaAssessmentTests, number> {
  return {
    speed: scoreLowerBetter(tests.speed, 3.0, 8.0),
    agility: scoreLowerBetter(tests.agility, 10.0, 25.0),
    balance: scoreHigherBetter(tests.balance, 0.0, 60.0),
    power: scoreHigherBetter(tests.power, 0.0, 250.0),
    reaction: scoreLowerBetter(tests.reaction, 150.0, 600.0),
    coordination: scoreHigherBetter(tests.coordination, 0.0, 60.0),
    flexibility: scoreHigherBetter(tests.flexibility, 0.0, 40.0),
  };
}

export function calculateNaScore(tests: DnaAssessmentTests): number {
  // Heuristic normalization for MVP. Values outside expected ranges are clamped.
  const scores = calculateCategoryScores(tests);
  const values = Object.values(scores);
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  return Math.round(clamp(avg, 0, 100));
}
