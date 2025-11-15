import { getDatabase, generateId } from '../lmdb';
import { Permission, PermissionAction, ResourceType } from '../../access-control/permissions';

const PERMISSIONS_PREFIX = 'permissions:';
const PERMISSIONS_BY_RESOURCE_PREFIX = 'permissions_by_resource:';

export interface CreatePermissionInput {
  resourceKey: string;
  resourceType: ResourceType;
  action: PermissionAction;
}

/**
 * Create a new permission
 */
export async function createPermission(input: CreatePermissionInput): Promise<Permission> {
  const db = getDatabase();
  
  // Check if permission already exists
  const existing = await findPermissionByResourceAndAction(input.resourceKey, input.action);
  if (existing) {
    return existing;
  }

  const id = generateId();
  const now = new Date().toISOString();

  const permission: Permission = {
    id,
    resourceKey: input.resourceKey,
    resourceType: input.resourceType,
    action: input.action,
    createdAt: now,
  };

  await db.put(`${PERMISSIONS_PREFIX}${id}`, permission);
  await db.put(`${PERMISSIONS_BY_RESOURCE_PREFIX}${input.resourceKey}:${input.action}`, id);

  return permission;
}

/**
 * Find permission by ID
 */
export async function findPermissionById(id: string): Promise<Permission | null> {
  const db = getDatabase();
  const permission = await db.get(`${PERMISSIONS_PREFIX}${id}`);
  return permission || null;
}

/**
 * Find permission by resource key and action
 */
export async function findPermissionByResourceAndAction(
  resourceKey: string,
  action: PermissionAction
): Promise<Permission | null> {
  const db = getDatabase();
  const permissionId = await db.get(`${PERMISSIONS_BY_RESOURCE_PREFIX}${resourceKey}:${action}`);
  
  if (!permissionId) {
    return null;
  }

  return findPermissionById(permissionId);
}

/**
 * Find all permissions for a resource
 */
export async function findPermissionsByResource(resourceKey: string): Promise<Permission[]> {
  const db = getDatabase();
  const permissions: Permission[] = [];

  for await (const { key, value } of db.getRange({
    start: `${PERMISSIONS_BY_RESOURCE_PREFIX}${resourceKey}:`,
    end: `${PERMISSIONS_BY_RESOURCE_PREFIX}${resourceKey}:\xFF`,
  })) {
    const keyStr = String(key);
    if (keyStr.startsWith(`${PERMISSIONS_BY_RESOURCE_PREFIX}${resourceKey}:`)) {
      const permission = await findPermissionById(value as string);
      if (permission) {
        permissions.push(permission);
      }
    }
  }

  return permissions;
}

/**
 * List all permissions
 */
export async function listPermissions(): Promise<Permission[]> {
  const db = getDatabase();
  const permissions: Permission[] = [];

  for await (const { key, value } of db.getRange({
    start: PERMISSIONS_PREFIX,
    end: `${PERMISSIONS_PREFIX}\xFF`,
  })) {
    const keyStr = String(key);
    if (keyStr.startsWith(PERMISSIONS_PREFIX)) {
      permissions.push(value as Permission);
    }
  }

  return permissions;
}

/**
 * Delete permission by ID
 */
export async function deletePermission(id: string): Promise<boolean> {
  const db = getDatabase();
  const permission = await findPermissionById(id);

  if (!permission) {
    return false;
  }

  await db.remove(`${PERMISSIONS_PREFIX}${id}`);
  await db.remove(`${PERMISSIONS_BY_RESOURCE_PREFIX}${permission.resourceKey}:${permission.action}`);

  return true;
}
