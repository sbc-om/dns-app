import 'server-only';

import { getDatabase } from '../lmdb';
import type { GroupTrainingDays } from '@/lib/trainingDays/trainingDaysTypes';

const TRAINING_DAYS_PREFIX = 'training_days:'; // training_days:{academyId}:{groupKey}

function keyFor(academyId: string, groupKey: string) {
  return `${TRAINING_DAYS_PREFIX}${academyId}:${groupKey}`;
}

export async function getTrainingDays(params: {
  academyId: string;
  groupKey: string;
}): Promise<GroupTrainingDays | null> {
  const db = getDatabase();
  const value = (await db.get(keyFor(params.academyId, params.groupKey))) as GroupTrainingDays | undefined;
  return value || null;
}

export async function upsertTrainingDays(params: {
  academyId: string;
  groupKey: string;
  days: number[];
  updatedBy: string;
}): Promise<GroupTrainingDays> {
  const db = getDatabase();
  const now = new Date().toISOString();

  const normalizedDays = Array.from(new Set(params.days))
    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
    .sort((a, b) => a - b);

  const record: GroupTrainingDays = {
    academyId: params.academyId,
    groupKey: params.groupKey,
    days: normalizedDays,
    updatedAt: now,
    updatedBy: params.updatedBy,
  };

  await db.put(keyFor(params.academyId, params.groupKey), record);
  return record;
}

export async function listTrainingDaysByAcademy(academyId: string): Promise<GroupTrainingDays[]> {
  const db = getDatabase();
  const list: GroupTrainingDays[] = [];

  for await (const { key, value } of db.getRange({
    start: `${TRAINING_DAYS_PREFIX}${academyId}:`,
    end: `${TRAINING_DAYS_PREFIX}${academyId}:\xFF`,
  })) {
    const keyStr = String(key);
    if (keyStr.startsWith(`${TRAINING_DAYS_PREFIX}${academyId}:`) && value) {
      list.push(value as GroupTrainingDays);
    }
  }

  return list.sort((a, b) => a.groupKey.localeCompare(b.groupKey));
}
