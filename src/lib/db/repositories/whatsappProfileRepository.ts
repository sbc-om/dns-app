import { getDatabase, generateId } from '../lmdb';

export interface WhatsAppRecipientProfile {
  id: string;
  name: string;
  userIds: string[];
  createdBy: string;
  academyId?: string;
  createdAt: string;
  updatedAt: string;
}

const DB_NAME = 'whatsappRecipientProfiles';

async function readAllProfiles(): Promise<WhatsAppRecipientProfile[]> {
  const db = getDatabase();
  try {
    const raw = db.get(DB_NAME);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WhatsAppRecipientProfile[]) : [];
  } catch (error) {
    console.error('Error reading WhatsApp recipient profiles:', error);
    return [];
  }
}

async function writeAllProfiles(profiles: WhatsAppRecipientProfile[]): Promise<void> {
  const db = getDatabase();
  db.put(DB_NAME, JSON.stringify(profiles));
}

export async function getAllWhatsAppRecipientProfiles(): Promise<WhatsAppRecipientProfile[]> {
  return readAllProfiles();
}

export async function getWhatsAppRecipientProfilesByAcademy(academyId: string): Promise<WhatsAppRecipientProfile[]> {
  const profiles = await readAllProfiles();
  return profiles.filter((p) => p.academyId === academyId);
}

export async function getWhatsAppRecipientProfilesByCreator(params: {
  creatorId: string;
  academyId?: string;
}): Promise<WhatsAppRecipientProfile[]> {
  const profiles = await readAllProfiles();
  return profiles.filter((p) => {
    if (params.academyId && p.academyId !== params.academyId) return false;
    return p.createdBy === params.creatorId;
  });
}

export async function getWhatsAppRecipientProfileById(id: string): Promise<WhatsAppRecipientProfile | null> {
  const profiles = await readAllProfiles();
  return profiles.find((p) => p.id === id) || null;
}

export async function createWhatsAppRecipientProfile(
  data: Omit<WhatsAppRecipientProfile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<WhatsAppRecipientProfile> {
  const profiles = await readAllProfiles();
  const now = new Date().toISOString();
  const profile: WhatsAppRecipientProfile = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };

  profiles.push(profile);
  await writeAllProfiles(profiles);
  return profile;
}

export async function updateWhatsAppRecipientProfile(
  id: string,
  updates: Partial<Omit<WhatsAppRecipientProfile, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<WhatsAppRecipientProfile | null> {
  const profiles = await readAllProfiles();
  const idx = profiles.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  const updated: WhatsAppRecipientProfile = {
    ...profiles[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  profiles[idx] = updated;
  await writeAllProfiles(profiles);
  return updated;
}

export async function deleteWhatsAppRecipientProfile(id: string): Promise<boolean> {
  const profiles = await readAllProfiles();
  const next = profiles.filter((p) => p.id !== id);
  if (next.length === profiles.length) return false;

  await writeAllProfiles(next);
  return true;
}
