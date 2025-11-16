'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Role } from '@/lib/access-control/permissions';
import { Button } from '@/components/ui/button';
import { Dictionary } from '@/lib/i18n/getDictionary';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/ui/data-table';

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
    if (confirm(dictionary.roles.confirmDelete || 'Are you sure you want to delete this role?')) {
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

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-purple-100 dark:hover:bg-purple-900/30"
          >
            {dictionary.roles.roleName}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div className="font-semibold text-gray-900 dark:text-gray-100">{row.getValue('name')}</div>;
      },
    },
    {
      accessorKey: 'description',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-purple-100 dark:hover:bg-purple-900/30"
          >
            {dictionary.roles.description}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const description = row.getValue('description') as string;
        return <div className="text-gray-700 dark:text-gray-300">{description || '-'}</div>;
      },
    },
    {
      accessorKey: 'permissionIds',
      header: dictionary.roles.permissions,
      cell: ({ row }) => {
        const permissionIds = row.getValue('permissionIds') as string[];
        return (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {permissionIds.length} {dictionary.roles.permissions.toLowerCase()}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">{dictionary.common.actions}</div>,
      cell: ({ row }) => {
        const role = row.original;

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{dictionary.common.actions}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onEditRole(role)}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {dictionary.common.edit}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(role.id)}
                  disabled={deletingId === role.id}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {dictionary.common.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  if (roles.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-2xl shadow-xl border-0">
        <div className="max-w-md mx-auto">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-8 w-8 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">{dictionary.roles.noRoles}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-0 shadow-xl overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur p-6">
      <DataTable
        columns={columns}
        data={roles}
        searchKey="name"
        searchPlaceholder={`${dictionary.common.search} ${dictionary.roles.roleName.toLowerCase()}...`}
      />
    </div>
  );
}
