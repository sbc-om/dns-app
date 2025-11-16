'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { RegisteredResource } from '@/lib/access-control/permissions';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';

export interface ResourcesTableProps {
  resources: RegisteredResource[];
  dictionary: Dictionary;
}

export function ResourcesTable({ resources, dictionary }: ResourcesTableProps) {
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      page: dictionary.resources.page,
      module: dictionary.resources.module,
      entity: dictionary.resources.entity,
    };
    return labels[type] || type;
  };

  const columns: ColumnDef<RegisteredResource>[] = [
    {
      accessorKey: 'key',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-purple-100 dark:hover:bg-purple-900/30"
          >
            {dictionary.resources.resourceKey}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div className="font-semibold text-gray-900 dark:text-gray-100">{row.getValue('key')}</div>;
      },
    },
    {
      accessorKey: 'type',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-purple-100 dark:hover:bg-purple-900/30"
          >
            {dictionary.resources.resourceType}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        return <Badge variant="outline">{getTypeLabel(type)}</Badge>;
      },
    },
    {
      accessorKey: 'defaultActions',
      header: dictionary.resources.defaultActions,
      cell: ({ row }) => {
        const actions = row.getValue('defaultActions') as string[];
        return (
          <div className="flex gap-1 flex-wrap">
            {actions.map((action) => (
              <Badge key={action} variant="secondary" className="text-xs">
                {dictionary.permissions[action as keyof typeof dictionary.permissions] || action}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-purple-100 dark:hover:bg-purple-900/30"
          >
            {dictionary.resources.registered}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt') as string;
        return (
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            {new Date(createdAt).toLocaleDateString()}
          </div>
        );
      },
    },
  ];

  if (resources.length === 0) {
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">{dictionary.resources.noResources}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-0 shadow-xl overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur p-6">
      <DataTable
        columns={columns}
        data={resources}
        searchKey="key"
        searchPlaceholder={`${dictionary.common.search} ${dictionary.resources.resourceKey.toLowerCase()}...`}
      />
    </div>
  );
}
