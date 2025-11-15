import { getDatabase, generateId } from '../lmdb';
import { Role } from '../../access-control/permissions';

const ROLES_PREFIX = 'roles:';
const ROLES_BY_NAME_PREFIX = 'roles_by_name:';

export interface CreateRoleInput {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permissionIds?: string[];
  isActive?: boolean;
}

/**
 * Create a new role
 */
export async function createRole(input: CreateRoleInput): Promise<Role> {
  const db = getDatabase();
  
  const existing = await findRoleByName(input.name);
  if (existing) {
    throw new Error('Role with this name already exists');
  }

  const id = generateId();
  const now = new Date().toISOString();

  const role: Role = {
    id,
    name: input.name,
    description: input.description,
    permissionIds: input.permissionIds || [],
    createdAt: now,
    updatedAt: now,
    isActive: true,
  };

  await db.put(`${ROLES_PREFIX}${id}`, role);
  await db.put(`${ROLES_BY_NAME_PREFIX}${input.name.toLowerCase()}`, id);

  return role;
}

/**
 * Find role by ID
 */
export async function findRoleById(id: string): Promise<Role | null> {
  const db = getDatabase();
  const role = await db.get(`${ROLES_PREFIX}${id}`);
  return role || null;
}

/**
 * Find role by name
 */
export async function findRoleByName(name: string): Promise<Role | null> {
  const db = getDatabase();
  const roleId = await db.get(`${ROLES_BY_NAME_PREFIX}${name.toLowerCase()}`);
  
  if (!roleId) {
    return null;
  }

  return findRoleById(roleId);
}

/**
 * Update role by ID
 */
export async function updateRole(id: string, input: UpdateRoleInput): Promise<Role | null> {
  const db = getDatabase();
  const role = await findRoleById(id);

  if (!role) {
    return null;
  }

  if (input.name && input.name !== role.name) {
    const existing = await findRoleByName(input.name);
    if (existing && existing.id !== id) {
      throw new Error('Role with this name already exists');
    }
    
    await db.remove(`${ROLES_BY_NAME_PREFIX}${role.name.toLowerCase()}`);
  }

  const updatedRole: Role = {
    ...role,
    name: input.name || role.name,
    description: input.description !== undefined ? input.description : role.description,
    permissionIds: input.permissionIds !== undefined ? input.permissionIds : role.permissionIds,
    isActive: input.isActive !== undefined ? input.isActive : role.isActive,
    updatedAt: new Date().toISOString(),
  };

  await db.put(`${ROLES_PREFIX}${id}`, updatedRole);
  
  if (input.name && input.name !== role.name) {
    await db.put(`${ROLES_BY_NAME_PREFIX}${updatedRole.name.toLowerCase()}`, id);
  }

  return updatedRole;
}

/**
 * Delete role by ID
 */
export async function deleteRole(id: string): Promise<boolean> {
  const db = getDatabase();
  const role = await findRoleById(id);

  if (!role) {
    return false;
  }

  await db.remove(`${ROLES_PREFIX}${id}`);
  await db.remove(`${ROLES_BY_NAME_PREFIX}${role.name.toLowerCase()}`);

  return true;
}

/**
 * List all roles
 */
export async function listRoles(): Promise<Role[]> {
  const db = getDatabase();
  const roles: Role[] = [];

  for await (const { key, value } of db.getRange({
    start: ROLES_PREFIX,
    end: `${ROLES_PREFIX}\xFF`,
  })) {
    const keyStr = String(key);
    if (keyStr.startsWith(ROLES_PREFIX)) {
      roles.push(value as Role);
    }
  }

  return roles;
}
