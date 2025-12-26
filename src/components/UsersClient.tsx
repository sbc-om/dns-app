'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Dictionary } from '@/lib/i18n/getDictionary';
import type { User } from '@/lib/db/repositories/userRepository';
import { Button } from '@/components/ui/button';
import { Plus, Shield, Sparkles } from 'lucide-react';
import { UsersTable } from '@/components/UsersTable';
import { CreateUserDialog } from '@/components/CreateUserDialog';
import Link from 'next/link';
import type { Locale } from '@/config/i18n';

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

  const filterLabel = locale === 'ar' ? 'تصفية حسب الدور' : 'Filter by Role';

  const allRoleOptions = [
    {
      key: 'all',
      label: locale === 'ar' ? 'الكل' : 'All',
      count: users.length,
      accentClass: 'border-neutral-400 text-neutral-700 dark:text-neutral-200',
    },
    {
      key: 'admin',
      label: locale === 'ar' ? 'مشرف' : 'Admin',
      count: users.filter((u) => u.role === 'admin').length,
      accentClass: 'border-violet-500 text-violet-700 dark:text-violet-400',
    },
    {
      key: 'manager',
      label: locale === 'ar' ? 'مدير أكاديمية' : 'Manager',
      count: users.filter((u) => u.role === 'manager').length,
      accentClass: 'border-emerald-500 text-emerald-700 dark:text-emerald-400',
    },
    {
      key: 'coach',
      label: locale === 'ar' ? 'مدرب' : 'Coach',
      count: users.filter((u) => u.role === 'coach').length,
      accentClass: 'border-blue-500 text-blue-700 dark:text-blue-400',
    },
    {
      key: 'parent',
      label: locale === 'ar' ? 'ولي أمر' : 'Parent',
      count: users.filter((u) => u.role === 'parent').length,
      accentClass: 'border-sky-500 text-sky-700 dark:text-sky-400',
    },
    {
      key: 'kid',
      label: locale === 'ar' ? 'لاعب' : 'Player',
      count: users.filter((u) => u.role === 'kid').length,
      accentClass: 'border-red-500 text-red-700 dark:text-red-400',
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
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
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
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {currentUserRole === 'manager' ? (
            <div className="flex rounded-2xl overflow-hidden border-2 border-[#DDDDDD] dark:border-[#000000] bg-white dark:bg-[#262626] shadow-lg">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button 
                  onClick={() => setIsCreatePlayerDialogOpen(true)}
                  className="h-12 w-full rounded-none bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:opacity-90 border-0 shadow-none font-semibold"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {locale === 'ar' ? 'إضافة لاعب' : 'Add Player'}
                </Button>
              </motion.div>
              <div className="w-px bg-[#DDDDDD] dark:bg-[#000000]" />
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button 
                  onClick={() => setIsCreateCoachDialogOpen(true)}
                  variant="ghost"
                  className="h-12 w-full rounded-none bg-transparent hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-[#262626] dark:text-white border-0 shadow-none font-semibold"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {locale === 'ar' ? 'إضافة مدرب' : 'Add Coach'}
                </Button>
              </motion.div>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => setIsCreatePlayerDialogOpen(true)}
                className="h-12 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:opacity-90 border-2 border-transparent shadow-lg shadow-purple-500/30"
              >
                <Plus className="mr-2 h-4 w-4" />
                {dictionary.users.createUser}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Role Filter */}
      <div className="bg-white dark:bg-[#262626] border-2 border-[#DDDDDD] dark:border-[#000000] rounded-2xl p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-10 w-10 rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-base font-bold text-[#262626] dark:text-white">{filterLabel}</span>
          </div>

          <div className="flex flex-wrap gap-2 flex-1">
            {roleOptions.map((opt) => {
              const active = selectedRole === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setSelectedRole(opt.key)}
                  className={
                    "px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border-2 " +
                    (active
                      ? `bg-gradient-to-br from-white to-gray-50 dark:from-[#1a1a1a] dark:to-[#0a0a0a] ${opt.accentClass} shadow-lg`
                      : "bg-white dark:bg-[#262626] text-gray-700 dark:text-gray-300 border-[#DDDDDD] dark:border-[#000000] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]")
                  }
                  type="button"
                >
                  <span className="flex items-center gap-2">
                    {opt.label}
                    <span
                      className={
                        "px-2 py-0.5 rounded-full text-xs font-bold border " +
                        (active
                          ? "bg-transparent border-current text-current"
                          : "bg-gray-100 dark:bg-[#1a1a1a] border-[#DDDDDD] dark:border-[#000000] text-gray-700 dark:text-gray-300")
                      }
                    >
                      {opt.count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

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
