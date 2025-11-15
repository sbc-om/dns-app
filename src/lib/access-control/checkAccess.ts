import { findUserById } from '../db/repositories/userRepository';
import { findRoleById } from '../db/repositories/roleRepository';
import { findPermissionById } from '../db/repositories/permissionRepository';
import { Permission, PermissionAction, UserPermissions } from './permissions';

export interface CanUserPerformActionParams {
  userId: string;
  resourceKey: string;
  action: PermissionAction;
}

/**
 * Get all permissions for a user (direct + from roles)
 */
export async function getUserPermissions(userId: string): Promise<UserPermissions> {
  const user = await findUserById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  const directPermissions: Permission[] = [];
  const rolePermissions: Permission[] = [];
  const seenPermissionIds = new Set<string>();

  // Get direct permissions
  for (const permissionId of user.directPermissions) {
    const permission = await findPermissionById(permissionId);
    if (permission && !seenPermissionIds.has(permission.id)) {
      directPermissions.push(permission);
      seenPermissionIds.add(permission.id);
    }
  }

  // Get permissions from roles
  for (const roleId of user.groupIds) {
    const role = await findRoleById(roleId);
    if (role && role.isActive) {
      for (const permissionId of role.permissionIds) {
        const permission = await findPermissionById(permissionId);
        if (permission && !seenPermissionIds.has(permission.id)) {
          rolePermissions.push(permission);
          seenPermissionIds.add(permission.id);
        }
      }
    }
  }

  const allPermissions = [...directPermissions, ...rolePermissions];

  return {
    userId,
    directPermissions,
    rolePermissions,
    allPermissions,
  };
}

/**
 * Check if a user can perform a specific action on a resource
 * This is the main access control check function
 */
export async function canUserPerformAction(
  params: CanUserPerformActionParams
): Promise<boolean> {
  const { userId, resourceKey, action } = params;

  try {
    const userPermissions = await getUserPermissions(userId);

    // Check if user has the specific permission
    const hasPermission = userPermissions.allPermissions.some(
      (permission) =>
        permission.resourceKey === resourceKey && permission.action === action
    );

    if (hasPermission) {
      return true;
    }

    // Check for 'manage' permission which grants all actions
    const hasManagePermission = userPermissions.allPermissions.some(
      (permission) =>
        permission.resourceKey === resourceKey && permission.action === 'manage'
    );

    return hasManagePermission;
  } catch (error) {
    console.error('Error checking user permissions:', error);
    return false;
  }
}

/**
 * Check if user can perform any of the specified actions
 */
export async function canUserPerformAnyAction(
  userId: string,
  resourceKey: string,
  actions: PermissionAction[]
): Promise<boolean> {
  for (const action of actions) {
    const canPerform = await canUserPerformAction({ userId, resourceKey, action });
    if (canPerform) {
      return true;
    }
  }
  return false;
}

/**
 * Check if user can perform all of the specified actions
 */
export async function canUserPerformAllActions(
  userId: string,
  resourceKey: string,
  actions: PermissionAction[]
): Promise<boolean> {
  for (const action of actions) {
    const canPerform = await canUserPerformAction({ userId, resourceKey, action });
    if (!canPerform) {
      return false;
    }
  }
  return true;
}

/**
 * Get all resource keys the user has access to
 */
export async function getUserAccessibleResources(userId: string): Promise<string[]> {
  const userPermissions = await getUserPermissions(userId);
  const resourceKeys = new Set<string>();

  for (const permission of userPermissions.allPermissions) {
    resourceKeys.add(permission.resourceKey);
  }

  return Array.from(resourceKeys);
}
