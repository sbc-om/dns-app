import { getDatabase, generateId } from '../lmdb';
import type { PlayerStageKey, PlayerAssessmentStatus } from '@/lib/player/stageSystem';
import type { PlayerBadgeId } from '@/lib/player/badges';

export type PlayerStageHistoryEntry = {
  stage: PlayerStageKey;
  startedAt: string;
  endedAt?: string;
  approvedBy?: string;
  entryNaScore?: number;
  exitNaScore?: number;
  notes?: string;
};

export type PlayerBadgeGrant = {
  badgeId: PlayerBadgeId;
  grantedAt: string;
  grantedBy: string;
  notes?: string;
};

export type PlayerXpEventType = 'first_assessment' | 'reassessment' | 'badge_granted' | 'stage_upgrade';

export type PlayerXpEvent = {
  id: string;
  type: PlayerXpEventType;
  points: number;
  createdAt: string;
  createdBy?: string;
  meta?: Record<string, unknown>;
};

export interface PlayerProfile {
  id: string;
  academyId: string;
  userId: string;

  currentStage: PlayerStageKey;
  stageStartDate: string;
  stageEntryNaScore?: number;
  stageHistory: PlayerStageHistoryEntry[];

  assessmentStatus: PlayerAssessmentStatus;
  lastAssessmentAt?: string;

  identityKey?: string;

  xpTotal: number;
  xpEvents: PlayerXpEvent[];

  badges: PlayerBadgeGrant[];

  createdAt: string;
  updatedAt: string;
}

const PROFILE_PREFIX = 'player_profile:'; // player_profile:{academyId}:{userId}

function profileKey(academyId: string, userId: string) {
  return `${PROFILE_PREFIX}${academyId}:${userId}`;
}

export async function getPlayerProfile(academyId: string, userId: string): Promise<PlayerProfile | null> {
  const db = getDatabase();
  const existing = await db.get(profileKey(academyId, userId));
  return (existing as PlayerProfile) || null;
}

export async function putPlayerProfile(profile: PlayerProfile): Promise<PlayerProfile> {
  const db = getDatabase();
  await db.put(profileKey(profile.academyId, profile.userId), profile);
  return profile;
}

export async function createDefaultPlayerProfile(params: {
  academyId: string;
  userId: string;
  nowIso?: string;
}): Promise<PlayerProfile> {
  const now = params.nowIso ?? new Date().toISOString();

  const profile: PlayerProfile = {
    id: generateId(),
    academyId: params.academyId,
    userId: params.userId,

    currentStage: 'explorer',
    stageStartDate: now,
    stageEntryNaScore: undefined,
    stageHistory: [
      {
        stage: 'explorer',
        startedAt: now,
      },
    ],

    assessmentStatus: 'new',
    lastAssessmentAt: undefined,

    identityKey: undefined,

    xpTotal: 0,
    xpEvents: [],

    badges: [],

    createdAt: now,
    updatedAt: now,
  };

  return putPlayerProfile(profile);
}

export async function ensurePlayerProfile(params: {
  academyId: string;
  userId: string;
}): Promise<PlayerProfile> {
  const existing = await getPlayerProfile(params.academyId, params.userId);
  if (existing) return existing;
  return createDefaultPlayerProfile({ academyId: params.academyId, userId: params.userId });
}

export async function updatePlayerProfile(
  academyId: string,
  userId: string,
  updates: Partial<Omit<PlayerProfile, 'id' | 'academyId' | 'userId' | 'createdAt'>>
): Promise<PlayerProfile> {
  const current = await ensurePlayerProfile({ academyId, userId });
  const updated: PlayerProfile = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return putPlayerProfile(updated);
}

export async function appendXpEvent(params: {
  academyId: string;
  userId: string;
  event: Omit<PlayerXpEvent, 'id' | 'createdAt'> & { id?: string; createdAt?: string };
  maxEvents?: number;
}): Promise<PlayerProfile> {
  const current = await ensurePlayerProfile({ academyId: params.academyId, userId: params.userId });
  const createdAt = params.event.createdAt ?? new Date().toISOString();
  const id = params.event.id ?? generateId();
  const nextEvent: PlayerXpEvent = { ...params.event, id, createdAt };

  const max = params.maxEvents ?? 100;
  const nextEvents = [nextEvent, ...current.xpEvents].slice(0, max);

  const nextTotal = current.xpTotal + nextEvent.points;

  return putPlayerProfile({
    ...current,
    xpTotal: nextTotal,
    xpEvents: nextEvents,
    updatedAt: new Date().toISOString(),
  });
}

export async function grantBadge(params: {
  academyId: string;
  userId: string;
  badgeId: PlayerBadgeId;
  grantedBy: string;
  notes?: string;
}): Promise<PlayerProfile> {
  const current = await ensurePlayerProfile({ academyId: params.academyId, userId: params.userId });
  const already = current.badges.some((b) => b.badgeId === params.badgeId);
  if (already) return current;

  const nextBadges: PlayerBadgeGrant[] = [
    {
      badgeId: params.badgeId,
      grantedAt: new Date().toISOString(),
      grantedBy: params.grantedBy,
      notes: params.notes,
    },
    ...current.badges,
  ];

  const updated = await putPlayerProfile({
    ...current,
    badges: nextBadges,
    updatedAt: new Date().toISOString(),
  });

  return updated;
}
