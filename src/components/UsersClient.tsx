'use client';

import { useState } from 'react';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { User } from '@/lib/db/repositories/userRepository';
import { Button } from '@/components/ui/button';
import { Plus, Shield } from 'lucide-react';
import { UsersTable } from '@/components/UsersTable';
import { CreateUserDialog } from '@/components/CreateUserDialog';
import Link from 'next/link';
import { Locale } from '@/config/i18n';

export interface UsersClientProps {
  dictionary: Dictionary;
  initialUsers: User[];
  locale: Locale;
}

export function UsersClient({ dictionary, initialUsers, locale }: UsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const handleUsersChange = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
  };

  // Filter users by role
  const filteredUsers = selectedRole === 'all' 
    ? users 
    : users.filter(user => user.role === selectedRole);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#262626] dark:text-white">
            {dictionary.users.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{dictionary.users.userList}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/${locale}/dashboard/roles`}>
            <Button 
              variant="outline"
              className="border-[#F2574C] text-[#F2574C] hover:bg-[#F2574C] hover:text-white"
            >
              <Shield className="mr-2 h-4 w-4" />
              {dictionary.nav.roles}
            </Button>
          </Link>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-[#FF5F02] hover:bg-[#262626] text-white shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            {dictionary.users.createUser}
          </Button>
        </div>
      </div>

      {/* Role Filter */}
      <div className="bg-linear-to-br from-white to-gray-50 dark:from-[#262626] dark:to-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-10 w-10 rounded-full bg-linear-to-br from-[#FF5F02] to-[#ff7b33] flex items-center justify-center shadow-md">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-base font-bold text-gray-900 dark:text-white">
              {locale === 'ar' ? 'تصفية حسب الدور' : 'Filter by Role'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 flex-1">
            <button
              onClick={() => setSelectedRole('all')}
              className={`group relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-95 ${
                selectedRole === 'all'
                  ? 'bg-linear-to-r from-[#FF5F02] to-[#ff7b33] text-white shadow-lg shadow-orange-500/50'
                  : 'bg-white dark:bg-[#262626] text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-[#FF5F02] hover:text-[#FF5F02] hover:shadow-md'
              }`}
            >
              <span className="flex items-center gap-2">
                {locale === 'ar' ? 'الكل' : 'All'}
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  selectedRole === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  {users.length}
                </span>
              </span>
            </button>
            
            <button
              onClick={() => setSelectedRole('admin')}
              className={`group relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-95 ${
                selectedRole === 'admin'
                  ? 'bg-linear-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-white dark:bg-[#262626] text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-purple-600 hover:text-purple-600 hover:shadow-md'
              }`}
            >
              <span className="flex items-center gap-2">
                {locale === 'ar' ? 'مشرف' : 'Admin'}
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  selectedRole === 'admin'
                    ? 'bg-white/20 text-white'
                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                }`}>
                  {users.filter(u => u.role === 'admin').length}
                </span>
              </span>
            </button>
            
            <button
              onClick={() => setSelectedRole('coach')}
              className={`group relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-95 ${
                selectedRole === 'coach'
                  ? 'bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-white dark:bg-[#262626] text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-600 hover:text-blue-600 hover:shadow-md'
              }`}
            >
              <span className="flex items-center gap-2">
                {locale === 'ar' ? 'مدرب' : 'Coach'}
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  selectedRole === 'coach'
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                }`}>
                  {users.filter(u => u.role === 'coach').length}
                </span>
              </span>
            </button>
            
            <button
              onClick={() => setSelectedRole('parent')}
              className={`group relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-95 ${
                selectedRole === 'parent'
                  ? 'bg-linear-to-r from-[#30B2D2] to-[#1E3A8A] text-white shadow-lg shadow-cyan-500/50'
                  : 'bg-white dark:bg-[#262626] text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-[#30B2D2] hover:text-[#30B2D2] hover:shadow-md'
              }`}
            >
              <span className="flex items-center gap-2">
                {locale === 'ar' ? 'ولي أمر' : 'Parent'}
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  selectedRole === 'parent'
                    ? 'bg-white/20 text-white'
                    : 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400'
                }`}>
                  {users.filter(u => u.role === 'parent').length}
                </span>
              </span>
            </button>
            
            <button
              onClick={() => setSelectedRole('kid')}
              className={`group relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-95 ${
                selectedRole === 'kid'
                  ? 'bg-linear-to-r from-[#F2574C] to-[#E8A12D] text-white shadow-lg shadow-red-500/50'
                  : 'bg-white dark:bg-[#262626] text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-[#F2574C] hover:text-[#F2574C] hover:shadow-md'
              }`}
            >
              <span className="flex items-center gap-2">
                {locale === 'ar' ? 'طالب' : 'Student'}
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  selectedRole === 'kid'
                    ? 'bg-white/20 text-white'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {users.filter(u => u.role === 'kid').length}
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <UsersTable
        users={filteredUsers}
        dictionary={dictionary}
        onUsersChange={handleUsersChange}
        locale={locale}
      />

      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        dictionary={dictionary}
        locale={locale}
        onUserCreated={(newUser: User) => {
          setUsers([...users, newUser]);
        }}
      />
    </div>
  );
}
