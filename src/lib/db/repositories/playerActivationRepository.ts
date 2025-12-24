import { getDatabase, generateId } from '../lmdb';

export type PlayerActivationStatus =
  | 'pending'
  | 'confirmed'
  | 'paid'
  | 'activated'
  | 'declined'
  | 'expired';

export interface PlayerActivation {
  id: string;
  academyId: string;
  playerId: string;
  token: string;
  status: PlayerActivationStatus;

  playerDisplayName?: string;

  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;

  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  paidAt?: string;
  activatedAt?: string;
  declinedAt?: string;
  expiresAt?: string;
}

const ACTIVATION_PREFIX = 'player_activation:'; // player_activation:{academyId}:{playerId}
const ACTIVATION_BY_TOKEN_PREFIX = 'player_activation_by_token:'; // player_activation_by_token:{token} => { academyId, playerId }

function activationKey(academyId: string, playerId: string) {
  return `${ACTIVATION_PREFIX}${academyId}:${playerId}`;
}

function activationTokenKey(token: string) {
  return `${ACTIVATION_BY_TOKEN_PREFIX}${token}`;
}

function randomToken(): string {
  // generateId() is already random-ish; add entropy and trim.
  return `${generateId()}${generateId()}`.replace(/-/g, '').slice(0, 48);
}

export async function getPlayerActivation(params: {
  academyId: string;
  playerId: string;
}): Promise<PlayerActivation | null> {
  const db = getDatabase();
  const existing = (await db.get(activationKey(params.academyId, params.playerId))) as PlayerActivation | undefined;
  return existing || null;
}

export async function getPlayerActivationByToken(token: string): Promise<PlayerActivation | null> {
  const db = getDatabase();
  const mapping = (await db.get(activationTokenKey(token))) as { academyId: string; playerId: string } | undefined;
  if (!mapping) return null;
  return getPlayerActivation({ academyId: mapping.academyId, playerId: mapping.playerId });
}

export async function createOrRotatePlayerActivation(params: {
  academyId: string;
  playerId: string;
  playerDisplayName?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  expiresAt?: string;
}): Promise<PlayerActivation> {
  const db = getDatabase();
  const now = new Date().toISOString();

  const existing = await getPlayerActivation({ academyId: params.academyId, playerId: params.playerId });

  // If existing is already activated, keep it (do not rotate).
  if (existing && (existing.status === 'activated' || existing.status === 'paid')) {
    return existing;
  }

  // Remove previous token mapping if any.
  if (existing?.token) {
    await db.remove(activationTokenKey(existing.token));
  }

  const token = randomToken();

  const activation: PlayerActivation = {
    id: existing?.id || generateId(),
    academyId: params.academyId,
    playerId: params.playerId,
    token,
    status: 'pending',

    playerDisplayName: params.playerDisplayName ?? existing?.playerDisplayName,

    parentName: params.parentName ?? existing?.parentName,
    parentEmail: params.parentEmail ?? existing?.parentEmail,
    parentPhone: params.parentPhone ?? existing?.parentPhone,

    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    expiresAt: params.expiresAt ?? existing?.expiresAt,
  };

  await db.put(activationKey(params.academyId, params.playerId), activation);
  await db.put(activationTokenKey(token), { academyId: params.academyId, playerId: params.playerId });

  return activation;
}

export async function updatePlayerActivationByToken(
  token: string,
  updates: Partial<Omit<PlayerActivation, 'id' | 'academyId' | 'playerId' | 'token' | 'createdAt'>>
): Promise<PlayerActivation | null> {
  const existing = await getPlayerActivationByToken(token);
  if (!existing) return null;

  const next: PlayerActivation = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const db = getDatabase();
  await db.put(activationKey(existing.academyId, existing.playerId), next);
  return next;
}

export async function listPlayerActivationsByAcademy(academyId: string): Promise<PlayerActivation[]> {
  const db = getDatabase();
  const list: PlayerActivation[] = [];

  for await (const { key, value } of db.getRange({
    start: `${ACTIVATION_PREFIX}${academyId}:`,
    end: `${ACTIVATION_PREFIX}${academyId}:\xFF`,
  })) {
    const keyStr = String(key);
    if (keyStr.startsWith(`${ACTIVATION_PREFIX}${academyId}:`) && value) {
      list.push(value as PlayerActivation);
    }
  }

  return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
