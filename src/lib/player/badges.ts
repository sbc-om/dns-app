export type PlayerBadgeId =
  | 'consistency_star'
  | 'focus_champion'
  | 'attendance_hero'
  | 'effort_badge'
  | 'team_spirit'
  | 'fair_play'
  | 'quick_learner'
  | 'resilience'
  | 'coach_listens'
  | 'positive_energy'
  | 'goal_setter'
  | 'supportive_teammate'
  | 'discipline'
  | 'warmup_master'
  | 'progress_pride';

export type BadgeDefinition = {
  id: PlayerBadgeId;
  nameKey: string; // i18n key
  descriptionKey: string; // i18n key
  lockedHintKey: string; // i18n key
};

export const BADGES: BadgeDefinition[] = [
  {
    id: 'consistency_star',
    nameKey: 'playerProfile.badges.consistencyStar.name',
    descriptionKey: 'playerProfile.badges.consistencyStar.description',
    lockedHintKey: 'playerProfile.badges.consistencyStar.lockedHint',
  },
  {
    id: 'focus_champion',
    nameKey: 'playerProfile.badges.focusChampion.name',
    descriptionKey: 'playerProfile.badges.focusChampion.description',
    lockedHintKey: 'playerProfile.badges.focusChampion.lockedHint',
  },
  {
    id: 'attendance_hero',
    nameKey: 'playerProfile.badges.attendanceHero.name',
    descriptionKey: 'playerProfile.badges.attendanceHero.description',
    lockedHintKey: 'playerProfile.badges.attendanceHero.lockedHint',
  },
  {
    id: 'effort_badge',
    nameKey: 'playerProfile.badges.effortBadge.name',
    descriptionKey: 'playerProfile.badges.effortBadge.description',
    lockedHintKey: 'playerProfile.badges.effortBadge.lockedHint',
  },
  {
    id: 'team_spirit',
    nameKey: 'playerProfile.badges.teamSpirit.name',
    descriptionKey: 'playerProfile.badges.teamSpirit.description',
    lockedHintKey: 'playerProfile.badges.teamSpirit.lockedHint',
  },
  {
    id: 'fair_play',
    nameKey: 'playerProfile.badges.fairPlay.name',
    descriptionKey: 'playerProfile.badges.fairPlay.description',
    lockedHintKey: 'playerProfile.badges.fairPlay.lockedHint',
  },
  {
    id: 'quick_learner',
    nameKey: 'playerProfile.badges.quickLearner.name',
    descriptionKey: 'playerProfile.badges.quickLearner.description',
    lockedHintKey: 'playerProfile.badges.quickLearner.lockedHint',
  },
  {
    id: 'resilience',
    nameKey: 'playerProfile.badges.resilience.name',
    descriptionKey: 'playerProfile.badges.resilience.description',
    lockedHintKey: 'playerProfile.badges.resilience.lockedHint',
  },
  {
    id: 'coach_listens',
    nameKey: 'playerProfile.badges.coachListens.name',
    descriptionKey: 'playerProfile.badges.coachListens.description',
    lockedHintKey: 'playerProfile.badges.coachListens.lockedHint',
  },
  {
    id: 'positive_energy',
    nameKey: 'playerProfile.badges.positiveEnergy.name',
    descriptionKey: 'playerProfile.badges.positiveEnergy.description',
    lockedHintKey: 'playerProfile.badges.positiveEnergy.lockedHint',
  },
  {
    id: 'goal_setter',
    nameKey: 'playerProfile.badges.goalSetter.name',
    descriptionKey: 'playerProfile.badges.goalSetter.description',
    lockedHintKey: 'playerProfile.badges.goalSetter.lockedHint',
  },
  {
    id: 'supportive_teammate',
    nameKey: 'playerProfile.badges.supportiveTeammate.name',
    descriptionKey: 'playerProfile.badges.supportiveTeammate.description',
    lockedHintKey: 'playerProfile.badges.supportiveTeammate.lockedHint',
  },
  {
    id: 'discipline',
    nameKey: 'playerProfile.badges.discipline.name',
    descriptionKey: 'playerProfile.badges.discipline.description',
    lockedHintKey: 'playerProfile.badges.discipline.lockedHint',
  },
  {
    id: 'warmup_master',
    nameKey: 'playerProfile.badges.warmupMaster.name',
    descriptionKey: 'playerProfile.badges.warmupMaster.description',
    lockedHintKey: 'playerProfile.badges.warmupMaster.lockedHint',
  },
  {
    id: 'progress_pride',
    nameKey: 'playerProfile.badges.progressPride.name',
    descriptionKey: 'playerProfile.badges.progressPride.description',
    lockedHintKey: 'playerProfile.badges.progressPride.lockedHint',
  },
];

export function isKnownBadgeId(value: string): value is PlayerBadgeId {
  return BADGES.some((b) => b.id === value);
}
