import { getDatabase, generateId } from '../lmdb';

export interface WhatsAppGroup {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  memberIds: string[]; // User IDs
  phoneNumbers: string[]; // Extracted phone numbers from members
  createdBy: string;
  academyId?: string;
  createdAt: string;
  updatedAt: string;
}

const DB_NAME = 'whatsappGroups';

/**
 * Get all WhatsApp groups
 */
export async function getAllWhatsAppGroups(): Promise<WhatsAppGroup[]> {
  const db = getDatabase();
  try {
    const data = db.get(DB_NAME);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting WhatsApp groups:', error);
    return [];
  }
}

/**
 * Get WhatsApp groups by academy
 */
export async function getWhatsAppGroupsByAcademy(academyId: string): Promise<WhatsAppGroup[]> {
  const groups = await getAllWhatsAppGroups();
  return groups.filter(g => g.academyId === academyId);
}

/**
 * Get WhatsApp group by ID
 */
export async function getWhatsAppGroupById(id: string): Promise<WhatsAppGroup | null> {
  const groups = await getAllWhatsAppGroups();
  return groups.find(g => g.id === id) || null;
}

/**
 * Create WhatsApp group
 */
export async function createWhatsAppGroup(
  data: Omit<WhatsAppGroup, 'id' | 'createdAt' | 'updatedAt'>
): Promise<WhatsAppGroup> {
  const db = getDatabase();
  const groups = await getAllWhatsAppGroups();
  
  const newGroup: WhatsAppGroup = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  groups.push(newGroup);
  db.put(DB_NAME, JSON.stringify(groups));
  
  return newGroup;
}

/**
 * Update WhatsApp group
 */
export async function updateWhatsAppGroup(
  id: string,
  data: Partial<Omit<WhatsAppGroup, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<WhatsAppGroup | null> {
  const db = getDatabase();
  const groups = await getAllWhatsAppGroups();
  const index = groups.findIndex(g => g.id === id);
  
  if (index === -1) return null;
  
  const updatedGroup: WhatsAppGroup = {
    ...groups[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  groups[index] = updatedGroup;
  db.put(DB_NAME, JSON.stringify(groups));
  
  return updatedGroup;
}

/**
 * Delete WhatsApp group
 */
export async function deleteWhatsAppGroup(id: string): Promise<boolean> {
  const db = getDatabase();
  const groups = await getAllWhatsAppGroups();
  const filtered = groups.filter(g => g.id !== id);
  
  if (filtered.length === groups.length) return false;
  
  db.put(DB_NAME, JSON.stringify(filtered));
  return true;
}

/**
 * Get groups created by user
 */
export async function getWhatsAppGroupsByCreator(creatorId: string): Promise<WhatsAppGroup[]> {
  const groups = await getAllWhatsAppGroups();
  return groups.filter(g => g.createdBy === creatorId);
}

/**
 * Add members to group
 */
export async function addMembersToWhatsAppGroup(
  groupId: string,
  memberIds: string[],
  phoneNumbers: string[]
): Promise<WhatsAppGroup | null> {
  const db = getDatabase();
  const groups = await getAllWhatsAppGroups();
  const index = groups.findIndex(g => g.id === groupId);
  
  if (index === -1) return null;
  
  const group = groups[index];
  const uniqueMemberIds = Array.from(new Set([...group.memberIds, ...memberIds]));
  const uniquePhoneNumbers = Array.from(new Set([...group.phoneNumbers, ...phoneNumbers]));
  
  const updatedGroup: WhatsAppGroup = {
    ...group,
    memberIds: uniqueMemberIds,
    phoneNumbers: uniquePhoneNumbers,
    updatedAt: new Date().toISOString(),
  };
  
  groups[index] = updatedGroup;
  db.put(DB_NAME, JSON.stringify(groups));
  
  return updatedGroup;
}

/**
 * Remove members from group
 */
export async function removeMembersFromWhatsAppGroup(
  groupId: string,
  memberIds: string[]
): Promise<WhatsAppGroup | null> {
  const db = getDatabase();
  const groups = await getAllWhatsAppGroups();
  const index = groups.findIndex(g => g.id === groupId);
  
  if (index === -1) return null;
  
  const group = groups[index];
  const updatedMemberIds = group.memberIds.filter(id => !memberIds.includes(id));
  
  const updatedGroup: WhatsAppGroup = {
    ...group,
    memberIds: updatedMemberIds,
    updatedAt: new Date().toISOString(),
  };
  
  groups[index] = updatedGroup;
  db.put(DB_NAME, JSON.stringify(groups));
  
  return updatedGroup;
}
