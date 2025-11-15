import { registerResource } from '../db/repositories/resourceRepository';
import { ResourceType, PermissionAction, RegisteredResource } from './permissions';

export interface ResourceRegistration {
  key: string;
  type: ResourceType;
  displayNameKey: string;
  defaultActions: PermissionAction[];
  parentKey?: string;
}

/**
 * Register a resource in the access control system
 * This should be called when a module/feature is initialized
 */
export async function registerAccessResource(
  registration: ResourceRegistration
): Promise<RegisteredResource> {
  return await registerResource(registration);
}

/**
 * Register multiple resources at once
 */
export async function registerAccessResources(
  registrations: ResourceRegistration[]
): Promise<RegisteredResource[]> {
  const results: RegisteredResource[] = [];
  
  for (const registration of registrations) {
    const resource = await registerAccessResource(registration);
    results.push(resource);
  }
  
  return results;
}

/**
 * Built-in resources that should be registered on app initialization
 */
export const BUILT_IN_RESOURCES: ResourceRegistration[] = [
  {
    key: 'dashboard',
    type: 'page',
    displayNameKey: 'resources.dashboard',
    defaultActions: ['read'],
  },
  {
    key: 'dashboard.schedules',
    type: 'module',
    displayNameKey: 'nav.schedules',
    defaultActions: ['read', 'write', 'manage'],
    parentKey: 'dashboard',
  },
  {
    key: 'dashboard.appointments',
    type: 'module',
    displayNameKey: 'nav.appointments',
    defaultActions: ['read', 'write', 'manage'],
    parentKey: 'dashboard',
  },
  {
    key: 'dashboard.users',
    type: 'module',
    displayNameKey: 'resources.users',
    defaultActions: ['read', 'write', 'manage'],
    parentKey: 'dashboard',
  },
  {
    key: 'dashboard.roles',
    type: 'module',
    displayNameKey: 'resources.roles',
    defaultActions: ['read', 'write', 'manage'],
    parentKey: 'dashboard',
  },
  {
    key: 'dashboard.resources',
    type: 'module',
    displayNameKey: 'resources.resources',
    defaultActions: ['read', 'write', 'manage'],
    parentKey: 'dashboard',
  },
  {
    key: 'dashboard.permissions',
    type: 'module',
    displayNameKey: 'resources.permissions',
    defaultActions: ['read', 'write', 'manage'],
    parentKey: 'dashboard',
  },
];

/**
 * Initialize built-in resources
 * Should be called on application startup
 */
export async function initializeBuiltInResources(): Promise<void> {
  await registerAccessResources(BUILT_IN_RESOURCES);
}
