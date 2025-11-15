'use client';

import { useState } from 'react';
import { User } from '@/lib/db/repositories/userRepository';
import { Role } from '@/lib/access-control/permissions';
import { Dictionary } from '@/lib/i18n/getDictionary';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { deleteUserAction } from '@/lib/actions/userActions';
import { Badge } from '@/components/ui/badge';
import { EditUserDialog } from '@/components/EditUserDialog';

export interface UsersTableProps {
  users: User[];
  roles: Role[];
  dictionary: Dictionary;
  onUsersChange: (users: User[]) => void;
}

export function UsersTable({ users, roles, dictionary, onUsersChange }: UsersTableProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (userId: string) => {
    if (!confirm(dictionary.users.confirmDelete)) {
      return;
    }

    setIsDeleting(userId);
    const result = await deleteUserAction(userId);
    setIsDeleting(null);

    if (result.success) {
      onUsersChange(users.filter((u) => u.id !== userId));
    } else {
      alert(result.error || 'Failed to delete user');
    }
  };

  const getRoleNames = (groupIds: string[]) => {
    return groupIds
      .map((id) => roles.find((r) => r.id === id)?.name)
      .filter(Boolean)
      .join(', ') || '-';
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-2xl shadow-xl border-0">
        <div className="max-w-md mx-auto">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">{dictionary.users.noUsers}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border-0 shadow-xl overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b-2 border-purple-200 dark:border-purple-800">
              <TableHead className="font-bold text-gray-700 dark:text-gray-300">{dictionary.users.name}</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-300">{dictionary.common.email}</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-300">{dictionary.common.username}</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-300">{dictionary.users.role}</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-300">{dictionary.users.status}</TableHead>
              <TableHead className="text-right font-bold text-gray-700 dark:text-gray-300">{dictionary.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <TableRow 
                key={user.id}
                className="hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors border-b border-gray-100 dark:border-gray-800"
              >
                <TableCell className="font-semibold text-gray-900 dark:text-gray-100">{user.fullName || '-'}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">{user.email}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">{user.username}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">{getRoleNames(user.groupIds)}</TableCell>
                <TableCell>
                  <Badge 
                    variant={user.isActive ? 'default' : 'secondary'}
                    className={user.isActive 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                  >
                    {user.isActive ? dictionary.users.active : dictionary.users.inactive}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingUser(user)}
                    className="hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 rounded-lg"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(user.id)}
                    disabled={isDeleting === user.id}
                    className="hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open: boolean) => !open && setEditingUser(null)}
          dictionary={dictionary}
          roles={roles}
          onUserUpdated={(updatedUser: User) => {
            onUsersChange(
              users.map((u) => (u.id === updatedUser.id ? updatedUser : u))
            );
            setEditingUser(null);
          }}
        />
      )}
    </>
  );
}
