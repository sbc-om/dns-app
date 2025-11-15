import { initializeBuiltInResources } from '../access-control/accessRegistry';
import { createUser } from '../db/repositories/userRepository';
import { createRole } from '../db/repositories/roleRepository';
import { createPermission } from '../db/repositories/permissionRepository';
import { listResources } from '../db/repositories/resourceRepository';

/**
 * Initialize the database with default data
 * This should be run on first application startup
 */
export async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // Register built-in resources
    await initializeBuiltInResources();
    console.log('✓ Built-in resources registered');

    // Create default admin role with full permissions
    const resources = await listResources();
    const permissionIds: string[] = [];

    for (const resource of resources) {
      for (const action of resource.defaultActions) {
        const permission = await createPermission({
          resourceKey: resource.key,
          resourceType: resource.type,
          action,
        });
        permissionIds.push(permission.id);
      }
    }

    const adminRole = await createRole({
      name: 'Administrator',
      description: 'Full system access',
      permissionIds,
    });
    console.log('✓ Admin role created');

    // Create default admin user
    const adminUser = await createUser({
      email: 'admin@example.com',
      username: 'admin',
      password: 'admin123',
      fullName: 'System Administrator',
      groupIds: [adminRole.id],
    });
    console.log('✓ Admin user created');

    console.log('\nDatabase initialized successfully!');
    console.log('\nDefault admin credentials:');
    console.log('  Email: admin@example.com');
    console.log('  Password: admin123');
    console.log('\n⚠️  Please change the default password after first login!\n');

    return { success: true };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, error };
  }
}

/**
 * Check if database is initialized
 */
export async function isDatabaseInitialized(): Promise<boolean> {
  try {
    const resources = await listResources();
    return resources.length > 0;
  } catch {
    return false;
  }
}
