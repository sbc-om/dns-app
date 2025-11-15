export type ResourceType = 'page' | 'module' | 'entity' | 'action';

export type PermissionAction = 'read' | 'write' | 'manage' | 'delete' | 'create';

export interface Permission {
  id: string;
  resourceKey: string;
  resourceType: ResourceType;
  action: PermissionAction;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissionIds: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface RegisteredResource {
  key: string;
  type: ResourceType;
  displayNameKey: string;
  defaultActions: PermissionAction[];
  parentKey?: string;
  createdAt: string;
}

export interface UserPermissions {
  userId: string;
  directPermissions: Permission[];
  rolePermissions: Permission[];
  allPermissions: Permission[];
}
