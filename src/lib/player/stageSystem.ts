export type PlayerStageKey = 'explorer' | 'foundation' | 'active_player' | 'competitor' | 'champion';

export type OrganizationType = 'academy' | 'school';
export type TrainingIntensity = 'high' | 'low';

export type PlayerAssessmentStatus =
  | 'new'
  | 'first_assessment_completed'
  | 'reassessment'
  | 'stage_evaluation'
  | 'due_for_reassessment'
  | 'ready_for_stage_upgrade';

export type StageDefinition = {
  key: PlayerStageKey;
  translationKey: string; // e.g. "playerProfile.stages.explorer"
};

export const STAGES: StageDefinition[] = [
  { key: 'explorer', translationKey: 'playerProfile.stages.explorer' },
  { key: 'foundation', translationKey: 'playerProfile.stages.foundation' },
  { key: 'active_player', translationKey: 'playerProfile.stages.activePlayer' },
  { key: 'competitor', translationKey: 'playerProfile.stages.competitor' },
  { key: 'champion', translationKey: 'playerProfile.stages.champion' },
];

export function getNextStage(current: PlayerStageKey): PlayerStageKey | null {
  const idx = STAGES.findIndex((s) => s.key === current);
  if (idx < 0 || idx >= STAGES.length - 1) return null;
  return STAGES[idx + 1].key;
}

export function getStageIndex(stage: PlayerStageKey): number {
  const idx = STAGES.findIndex((s) => s.key === stage);
  return idx >= 0 ? idx : 0;
}

export function getRequiredDaysForStage(_stage: PlayerStageKey, organizationType: OrganizationType): number {
  // MVP: Requirement is based on organization type (academy vs school).
  // Doc uses the same time requirement for all stage transitions.
  return organizationType === 'school' ? 365 : 90;
}

export function getRequiredAttendanceRateForTransition(fromStage: PlayerStageKey): number {
  switch (fromStage) {
    case 'explorer':
      return 0.5;
    case 'foundation':
      return 0.6;
    case 'active_player':
      return 0.7;
    case 'competitor':
      return 0.75;
    case 'champion':
      return 1;
    default:
      return 0.5;
  }
}

export function clamp01(value: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function daysBetween(startIso: string, endIso: string): number {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const diffMs = end.getTime() - start.getTime();
  if (!Number.isFinite(diffMs)) return 0;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export type StageEvaluationInput = {
  currentStage: PlayerStageKey;
  stageStartDate: string;
  organizationType: OrganizationType;
  stageEntryNaScore?: number;
  currentNaScore?: number;
  attendanceRate?: number; // 0..1
  nowIso?: string;
};

export type StageEvaluation = {
  timeInStageDays: number;
  requiredDays: number;
  attendanceRate: number;
  requiredAttendanceRate: number;
  naImprovementPct: number; // 0..1 (e.g. 0.12 means +12%)
  requiredNaImprovementPct: number;
  timeProgress: number; // 0..1
  attendanceProgress: number; // 0..1
  naProgress: number; // 0..1
  overallProgress: number; // 0..1
  readyForStageUpgrade: boolean;
  nextStage: PlayerStageKey | null;
};

export function evaluateStage(input: StageEvaluationInput): StageEvaluation {
  const nowIso = input.nowIso ?? new Date().toISOString();
  const timeInStageDays = daysBetween(input.stageStartDate, nowIso);
  const requiredDays = getRequiredDaysForStage(input.currentStage, input.organizationType);

  const attendanceRate = clamp01(input.attendanceRate ?? 0);
  const requiredAttendanceRate = getRequiredAttendanceRateForTransition(input.currentStage);

  const requiredNaImprovementPct = 0.1;
  const entry = input.stageEntryNaScore;
  const current = input.currentNaScore;
  const naImprovementPct =
    entry !== undefined && current !== undefined && entry > 0
      ? Math.max(0, (current - entry) / entry)
      : 0;

  const timeProgress = clamp01(requiredDays > 0 ? timeInStageDays / requiredDays : 0);
  const attendanceProgress = clamp01(
    requiredAttendanceRate > 0 ? attendanceRate / requiredAttendanceRate : 0
  );
  const naProgress = clamp01(requiredNaImprovementPct > 0 ? naImprovementPct / requiredNaImprovementPct : 0);

  const overallProgress = clamp01((timeProgress + attendanceProgress + naProgress) / 3);

  const readyForStageUpgrade =
    timeInStageDays >= requiredDays &&
    attendanceRate >= requiredAttendanceRate &&
    naImprovementPct >= requiredNaImprovementPct &&
    getNextStage(input.currentStage) !== null;

  return {
    timeInStageDays,
    requiredDays,
    attendanceRate,
    requiredAttendanceRate,
    naImprovementPct,
    requiredNaImprovementPct,
    timeProgress,
    attendanceProgress,
    naProgress,
    overallProgress,
    readyForStageUpgrade,
    nextStage: getNextStage(input.currentStage),
  };
}
