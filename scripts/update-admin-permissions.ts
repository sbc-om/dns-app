import { listResources } from '../src/lib/db/repositories/resourceRepository';
import { createPermission } from '../src/lib/db/repositories/permissionRepository';
import { listRoles, updateRole } from '../src/lib/db/repositories/roleRepository';

async function main() {
  console.log('Updating admin role permissions...\n');

  try {
    // Get all resources
    const resources = await listResources();
    console.log(`Found ${resources.length} resources`);

    // Get admin role
    const roles = await listRoles();
    const adminRole = roles.find((r: any) => r.name === 'admin');
    
    if (!adminRole) {
      console.error('Admin role not found!');
      console.error('Available roles:', roles.map((r: any) => r.name));
      process.exit(1);
    }

    console.log(`Found admin role: ${adminRole.name}`);

    // Create permissions for all resources and actions
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

    // Update admin role with all permissions
    await updateRole(adminRole.id, {
      name: adminRole.name,
      description: adminRole.description,
      permissionIds,
    });

    console.log(`✓ Admin role updated with ${permissionIds.length} permissions`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to update admin permissions:', error);
    process.exit(1);
  }
}

main();
