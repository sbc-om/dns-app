'use client';

import { useState } from 'react';
import { Role } from '@/lib/access-control/permissions';
import { Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dictionary } from '@/lib/i18n/getDictionary';

export interface RolesTableProps {
  dictionary: Dictionary;
  roles: Role[];
  onEditRole: (role: Role) => void;
  onDeleteRole: (roleId: string) => Promise<void>;
}

export function RolesTable({
  dictionary,
  roles,
  onEditRole,
  onDeleteRole,
}: RolesTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (roleId: string) => {
    if (confirm('Are you sure you want to delete this role?')) {
      setDeletingId(roleId);
      try {
        await onDeleteRole(roleId);
      } catch (error) {
        console.error('Error deleting role:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (roles.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {dictionary.roles.noRoles}
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{dictionary.roles.roleName}</TableHead>
            <TableHead>{dictionary.roles.description}</TableHead>
            <TableHead>{dictionary.roles.permissions}</TableHead>
            <TableHead className="w-[100px]">{dictionary.common.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">{role.name}</TableCell>
              <TableCell>{role.description || '-'}</TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {role.permissionIds.length} {dictionary.roles.permissions.toLowerCase()}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditRole(role)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(role.id)}
                    disabled={deletingId === role.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
