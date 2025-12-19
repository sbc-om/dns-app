import { getDatabase, generateId } from '../lmdb';
import { DEFAULT_ACADEMY_ID } from './academyRepository';

import {
  calculateCategoryScores,
  calculateNaScore,
  type DnaAssessmentTests,
} from '@/lib/player/dnaScoring';

export type { DnaAssessmentTests };

export interface DnaAssessmentSession {
  id: string;
  academyId: string;
  playerId: string;

  sessionDate: string; // YYYY-MM-DD
  enteredBy: string; // technician/admin user id

  tests: DnaAssessmentTests;
  naScore: number; // 0-100

  notes?: string;

  isLocked: boolean;
  lockedAt: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateDnaAssessmentInput {
  academyId?: string;
  playerId: string;
  sessionDate: string; // YYYY-MM-DD
  enteredBy: string;
  tests: DnaAssessmentTests;
  notes?: string;
}

export interface UpdateDnaAssessmentInput {
  sessionDate?: string;
  tests?: Partial<DnaAssessmentTests>;
  notes?: string;
}

const SESSION_PREFIX = 'dna_assessment:';
const BY_PLAYER_PREFIX = 'dna_assessments_by_player:'; // dna_assessments_by_player:{academyId}:{playerId}:{sessionId} => sessionId

function sessionKey(id: string) {
  return `${SESSION_PREFIX}${id}`;
}

function byPlayerKey(academyId: string, playerId: string, sessionId: string) {
  return `${BY_PLAYER_PREFIX}${academyId}:${playerId}:${sessionId}`;
}

export { calculateCategoryScores, calculateNaScore };

export async function createDnaAssessmentSession(input: CreateDnaAssessmentInput): Promise<DnaAssessmentSession> {
  const db = getDatabase();
  const id = generateId();
  const now = new Date().toISOString();

  const academyId = input.academyId || DEFAULT_ACADEMY_ID;
  const naScore = calculateNaScore(input.tests);

  const session: DnaAssessmentSession = {
    id,
    academyId,
    playerId: input.playerId,
    sessionDate: input.sessionDate,
    enteredBy: input.enteredBy,
    tests: input.tests,
    naScore,
    notes: input.notes,
    isLocked: true,
    lockedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  await db.put(sessionKey(id), session);
  await db.put(byPlayerKey(academyId, input.playerId, id), id);

  return session;
}

export async function getDnaAssessmentSessionById(id: string): Promise<DnaAssessmentSession | null> {
  const db = getDatabase();
  return (await db.get(sessionKey(id))) || null;
}

export async function getDnaAssessmentSessionsByPlayerId(params: {
  academyId: string;
  playerId: string;
}): Promise<DnaAssessmentSession[]> {
  const db = getDatabase();
  const results: DnaAssessmentSession[] = [];

  const start = `${BY_PLAYER_PREFIX}${params.academyId}:${params.playerId}:`;
  const end = `${start}\xFF`;

  for await (const { value } of db.getRange({ start, end })) {
    const id = value as string;
    const session = await getDnaAssessmentSessionById(id);
    if (session) results.push(session);
  }

  results.sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));
  return results;
}

export async function getLatestDnaAssessmentSession(params: {
  academyId: string;
  playerId: string;
}): Promise<DnaAssessmentSession | null> {
  const sessions = await getDnaAssessmentSessionsByPlayerId(params);
  return sessions.length > 0 ? sessions[0] : null;
}

export async function updateDnaAssessmentSession(
  id: string,
  input: UpdateDnaAssessmentInput
): Promise<DnaAssessmentSession | null> {
  const db = getDatabase();
  const current = await getDnaAssessmentSessionById(id);
  if (!current) return null;

  if (current.isLocked) {
    throw new Error('Assessment session is locked');
  }

  const nextTests: DnaAssessmentTests = {
    ...current.tests,
    ...(input.tests || {}),
  };

  const updated: DnaAssessmentSession = {
    ...current,
    sessionDate: input.sessionDate ?? current.sessionDate,
    tests: nextTests,
    naScore: calculateNaScore(nextTests),
    notes: input.notes ?? current.notes,
    updatedAt: new Date().toISOString(),
  };

  await db.put(sessionKey(id), updated);
  return updated;
}

export async function unlockDnaAssessmentSession(id: string): Promise<DnaAssessmentSession | null> {
  const db = getDatabase();
  const current = await getDnaAssessmentSessionById(id);
  if (!current) return null;
  if (!current.isLocked) return current;

  const updated: DnaAssessmentSession = {
    ...current,
    isLocked: false,
    updatedAt: new Date().toISOString(),
  };

  await db.put(sessionKey(id), updated);
  return updated;
}

export async function lockDnaAssessmentSession(id: string): Promise<DnaAssessmentSession | null> {
  const db = getDatabase();
  const current = await getDnaAssessmentSessionById(id);
  if (!current) return null;
  if (current.isLocked) return current;

  const updated: DnaAssessmentSession = {
    ...current,
    isLocked: true,
    lockedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.put(sessionKey(id), updated);
  return updated;
}

export async function deleteDnaAssessmentSession(id: string): Promise<boolean> {
  const db = getDatabase();
  const current = await getDnaAssessmentSessionById(id);
  if (!current) return false;

  await db.remove(sessionKey(id));
  await db.remove(byPlayerKey(current.academyId, current.playerId, id));
  return true;
}
