'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Dictionary } from '@/lib/i18n/getDictionary';
import type { User } from '@/lib/db/repositories/userRepository';
import { Button } from '@/components/ui/button';
import { Plus, Shield, Sparkles, UserPlus } from 'lucide-react';
import { UsersTable } from '@/components/UsersTable';
import { CreateUserDialog } from '@/components/CreateUserDialog';
import type { Locale } from '@/config/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface UsersClientProps {
  dictionary: Dictionary;
  initialUsers: User[];
  locale: Locale;
  currentUserRole: string;
}

export function UsersClient({ dictionary, initialUsers, locale, currentUserRole }: UsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isCreatePlayerDialogOpen, setIsCreatePlayerDialogOpen] = useState(false);
  const [isCreateCoachDialogOpen, setIsCreateCoachDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const allRoleOptions = [
    {
      key: 'all',
      label: dictionary.users.allRoles,
      count: users.length,
    },
    {
      key: 'admin',
      label: dictionary.users.roles.admin,
      count: users.filter((u) => u.role === 'admin').length,
    },
    {
      key: 'manager',
      label: dictionary.users.roles.manager,
      count: users.filter((u) => u.role === 'manager').length,
    },
    {
      key: 'coach',
      label: dictionary.users.roles.coach,
      count: users.filter((u) => u.role === 'coach').length,
    },
    {
      key: 'parent',
      label: dictionary.users.roles.parent,
      count: users.filter((u) => u.role === 'parent').length,
    },
    {
      key: 'kid',
      label: dictionary.users.roles.kid,
      count: users.filter((u) => u.role === 'kid').length,
    },
  ] as const;

  // Filter role options based on current user role
  const roleOptions = currentUserRole === 'manager'
    ? allRoleOptions.filter(opt => opt.key !== 'admin' && opt.key !== 'manager')
    : allRoleOptions;

  const handleUsersChange = (nextUsersFromTable: User[]) => {
    setUsers((prev) => {
      // When not filtered, the table operates on the full dataset.
      if (selectedRole === 'all') {
        return nextUsersFromTable;
      }

      // When role-filtered, the table only sees the visible subset.
      // Merge updates into the full list instead of replacing it.
      const prevVisible = prev.filter((u) => u.role === selectedRole);
      const prevVisibleIds = new Set(prevVisible.map((u) => u.id));
      const nextVisibleIds = new Set(nextUsersFromTable.map((u) => u.id));
      const nextById = new Map(nextUsersFromTable.map((u) => [u.id, u] as const));

      const merged: User[] = [];

      for (const u of prev) {
        if (prevVisibleIds.has(u.id)) {
          // Deleted from visible subset
          if (!nextVisibleIds.has(u.id)) {
            continue;
          }
          // Updated in visible subset
          merged.push(nextById.get(u.id) ?? u);
          continue;
        }
        merged.push(u);
      }

      // Safety: if the subset contains new IDs not in prev, append them.
      const prevIds = new Set(prev.map((u) => u.id));
      for (const u of nextUsersFromTable) {
        if (!prevIds.has(u.id)) {
          merged.push(u);
        }
      }

      return merged;
    });
  };

  // Filter users by role
  const filteredUsers = selectedRole === 'all' 
    ? users 
    : users.filter(user => user.role === selectedRole);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Animated Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="relative">
            <motion.div
              className="absolute -inset-4 bg-linear-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl blur-xl"
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <div className="relative">
              <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </motion.div>
                {dictionary.users.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{dictionary.users.userList}</p>
            </div>
          </div>

          {/* Mobile-first toolbar: role filter + add user in the same row */}
          <div className="w-full sm:w-auto">
            <div className="relative overflow-hidden rounded-2xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-white/80 dark:bg-[#262626]/80 backdrop-blur-xl shadow-lg">
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-blue-600/8 via-purple-600/8 to-pink-600/8"
                animate={{ opacity: [0.35, 0.6, 0.35] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative p-2">
                <div className="flex h-12 w-full items-stretch overflow-hidden rounded-xl border-2 border-black/60 bg-[#0b0b0f] text-white shadow-lg shadow-black/30">
                  <div className="flex-1 min-w-0 h-full">
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger
                        className="h-full! w-full rounded-none border-0 bg-transparent px-4 py-0! text-white hover:bg-[#14141a]"
                      >
                        <div className="flex h-full w-full items-center gap-2 min-w-0">
                          <Shield className="h-4 w-4 text-white/90 shrink-0" />
                          <SelectValue placeholder={dictionary.users.filterByRole} className="leading-none" />
                        </div>
                      </SelectTrigger>
                      <SelectContent align="start" className="rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000]">
                        {roleOptions.map((opt) => (
                          <SelectItem key={opt.key} value={opt.key}>
                            <span className="flex w-full items-center justify-between gap-3">
                              <span className="font-semibold">{opt.label}</span>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full border border-border bg-muted/60">
                                {opt.count}
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-px bg-white/10" />

                  <div className="shrink-0">
                    {currentUserRole === 'manager' ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="h-full rounded-none border-0 bg-transparent px-4 text-white hover:bg-[#14141a]">
                            <UserPlus className="h-4 w-4 mr-2" />
                            <span className="font-semibold">{dictionary.common.add}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000]">
                          <DropdownMenuItem onClick={() => setIsCreatePlayerDialogOpen(true)} className="cursor-pointer">
                            <Plus className="mr-2 h-4 w-4" />
                            {dictionary.users.addPlayer}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setIsCreateCoachDialogOpen(true)} className="cursor-pointer">
                            <Plus className="mr-2 h-4 w-4" />
                            {dictionary.users.addCoach}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button
                        onClick={() => setIsCreatePlayerDialogOpen(true)}
                        className="h-full rounded-none border-0 bg-transparent px-4 text-white hover:bg-[#14141a]"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        <span className="font-semibold">{dictionary.users.createUser}</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <UsersTable
          key={selectedRole}
          users={filteredUsers}
          dictionary={dictionary}
          onUsersChange={handleUsersChange}
          locale={locale}
        />
      </motion.div>

      <CreateUserDialog
        open={isCreatePlayerDialogOpen}
        onOpenChange={setIsCreatePlayerDialogOpen}
        dictionary={dictionary}
        locale={locale}
        parents={users.filter(u => u.role === 'parent')}
        onUserCreated={(newUser: User) => {
          setUsers((prev) => [...prev, newUser]);
        }}
        fixedRole={currentUserRole === 'manager' ? 'kid' : undefined}
      />
      <CreateUserDialog
        open={isCreateCoachDialogOpen}
        onOpenChange={setIsCreateCoachDialogOpen}
        dictionary={dictionary}
        locale={locale}
        parents={users.filter(u => u.role === 'parent')}
        onUserCreated={(newUser: User) => {
          setUsers((prev) => [...prev, newUser]);
        }}
        fixedRole={currentUserRole === 'manager' ? 'coach' : undefined}
      />
    </motion.div>
  );
}
