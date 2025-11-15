import { getDatabase, generateId } from '../lmdb';
import { RegisteredResource, ResourceType, PermissionAction } from '../../access-control/permissions';

const RESOURCES_PREFIX = 'resources:';
const RESOURCES_BY_KEY_PREFIX = 'resources_by_key:';

export interface CreateResourceInput {
  key: string;
  type: ResourceType;
  displayNameKey: string;
  defaultActions: PermissionAction[];
  parentKey?: string;
}

/**
 * Register a resource in the system
 */
export async function registerResource(input: CreateResourceInput): Promise<RegisteredResource> {
  const db = getDatabase();
  
  const existing = await findResourceByKey(input.key);
  if (existing) {
    return existing;
  }

  const id = generateId();
  const now = new Date().toISOString();

  const resource: RegisteredResource = {
    key: input.key,
    type: input.type,
    displayNameKey: input.displayNameKey,
    defaultActions: input.defaultActions,
    parentKey: input.parentKey,
    createdAt: now,
  };

  await db.put(`${RESOURCES_PREFIX}${id}`, resource);
  await db.put(`${RESOURCES_BY_KEY_PREFIX}${input.key}`, id);

  return resource;
}

/**
 * Find resource by key
 */
export async function findResourceByKey(key: string): Promise<RegisteredResource | null> {
  const db = getDatabase();
  const resourceId = await db.get(`${RESOURCES_BY_KEY_PREFIX}${key}`);
  
  if (!resourceId) {
    return null;
  }

  const resource = await db.get(`${RESOURCES_PREFIX}${resourceId}`);
  return resource || null;
}

/**
 * List all registered resources
 */
export async function listResources(): Promise<RegisteredResource[]> {
  const db = getDatabase();
  const resources: RegisteredResource[] = [];

  for await (const { key, value } of db.getRange({
    start: RESOURCES_PREFIX,
    end: `${RESOURCES_PREFIX}\xFF`,
  })) {
    const keyStr = String(key);
    if (keyStr.startsWith(RESOURCES_PREFIX)) {
      resources.push(value as RegisteredResource);
    }
  }

  return resources;
}

/**
 * Delete resource by key
 */
export async function deleteResource(key: string): Promise<boolean> {
  const db = getDatabase();
  const resourceId = await db.get(`${RESOURCES_BY_KEY_PREFIX}${key}`);

  if (!resourceId) {
    return false;
  }

  await db.remove(`${RESOURCES_PREFIX}${resourceId}`);
  await db.remove(`${RESOURCES_BY_KEY_PREFIX}${key}`);

  return true;
}
