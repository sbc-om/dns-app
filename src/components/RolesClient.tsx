'use client';

import { useState, useTransition } from 'react';
import { Role, RegisteredResource } from '@/lib/access-control/permissions';
import { CreateRoleDialog, RoleFormData } from '@/components/CreateRoleDialog';
import { RolesTable } from '@/components/RolesTable';
import { createRoleAction, deleteRoleAction } from '@/lib/actions/roleActions';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Card } from '@/components/ui/card';

export interface RolesClientProps {
  dictionary: Dictionary;
  initialRoles: Role[];
  resources: RegisteredResource[];
}

export function RolesClient({ dictionary, initialRoles, resources }: RolesClientProps) {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [isPending, startTransition] = useTransition();

  const handleCreateRole = async (data: RoleFormData) => {
    startTransition(async () => {
      const result = await createRoleAction(data);
      if (result.success && result.role) {
        setRoles((prev) => [...prev, result.role!]);
      }
    });
  };

  const handleEditRole = (role: Role) => {
    // TODO: Implement edit functionality
    console.log('Edit role:', role);
  };

  const handleDeleteRole = async (roleId: string) => {
    startTransition(async () => {
      const result = await deleteRoleAction(roleId);
      if (result.success) {
        setRoles((prev) => prev.filter((r) => r.id !== roleId));
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {dictionary.roles.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage roles and assign permissions to control access
          </p>
        </div>
        <CreateRoleDialog
          dictionary={dictionary}
          resources={resources}
          onCreateRole={handleCreateRole}
        />
      </div>

      <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur-lg dark:bg-gray-900/80">
        <RolesTable
          dictionary={dictionary}
          roles={roles}
          onEditRole={handleEditRole}
          onDeleteRole={handleDeleteRole}
        />
      </Card>
    </div>
  );
}
