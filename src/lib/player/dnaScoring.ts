export type DnaAssessmentTests = {
  /**
   * Assessment values stored per category.
   *
   * The app historically stored raw measurements (seconds, cm, ms, reps).
   * Newer UI can store a simple 1–10 coach score.
   *
   * Scoring functions below auto-detect the scale and normalize to 0–100.
   */
  speed: number;
  agility: number;
  balance: number;
  power: number;
  reaction: number;
  coordination: number;
  flexibility: number;
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

function isPointScale(tests: DnaAssessmentTests): boolean {
  // Treat sessions as point-based when all values are within a typical 1–10 range.
  // This keeps legacy sessions (e.g. reaction=350ms, power=180cm) using the old normalization.
  const values = Object.values(tests);
  const max = Math.max(...values);
  const min = Math.min(...values);

  // Allow slight flexibility for existing UI defaults; still requires <=10.
  return Number.isFinite(max) && Number.isFinite(min) && max <= 10 && min >= 0;
}

function scoreTenPointScale(value: number): number {
  // Normalize 1–10 to 0–100 (1 => 0, 10 => 100). Clamp just in case.
  if (!Number.isFinite(value)) return 0;
  const v = clamp(value, 1, 10);
  return ((v - 1) / 9) * 100;
}

export function calculateCategoryScores(
  tests: DnaAssessmentTests
): Record<keyof DnaAssessmentTests, number> {
  // New simplified flow: 1–10 points per test (higher is better).
  if (isPointScale(tests)) {
    return {
      speed: scoreTenPointScale(tests.speed),
      agility: scoreTenPointScale(tests.agility),
      balance: scoreTenPointScale(tests.balance),
      power: scoreTenPointScale(tests.power),
      reaction: scoreTenPointScale(tests.reaction),
      coordination: scoreTenPointScale(tests.coordination),
      flexibility: scoreTenPointScale(tests.flexibility),
    };
  }

  // Legacy flow: raw measurements with per-category normalization.
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
