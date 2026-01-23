'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dictionary } from '@/lib/i18n/getDictionary';
import type { User } from '@/lib/db/repositories/userRepository';
import { Button } from '@/components/ui/button';
import { Plus, Search, Shield, UserPlus } from 'lucide-react';
import { UsersTable } from '@/components/UsersTable';
import { CreateUserDialog } from '@/components/CreateUserDialog';
import type { Locale } from '@/config/i18n';
import { Input } from '@/components/ui/input';
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
  initialTotal: number;
  initialPageSize: number;
  locale: Locale;
  currentUserRole: string;
}

export function UsersClient({
  dictionary,
  initialUsers,
  initialTotal,
  initialPageSize,
  locale,
  currentUserRole,
}: UsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [totalUsers, setTotalUsers] = useState<number>(initialTotal);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [page, setPage] = useState<number>(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCreatePlayerDialogOpen, setIsCreatePlayerDialogOpen] = useState(false);
  const [isCreateCoachDialogOpen, setIsCreateCoachDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [parents, setParents] = useState<User[]>([]);
  const [isLoadingParents, setIsLoadingParents] = useState(false);

  const didInitialLoad = useRef(false);

  const allRoleOptions = [
    {
      key: 'all',
      label: dictionary.users.allRoles,
    },
    {
      key: 'admin',
      label: dictionary.users.roles.admin,
    },
    {
      key: 'manager',
      label: dictionary.users.roles.manager,
    },
    {
      key: 'coach',
      label: dictionary.users.roles.coach,
    },
    {
      key: 'parent',
      label: dictionary.users.roles.parent,
    },
    {
      key: 'player',
      label: dictionary.users.roles.player,
    },
  ] as const;

  // Filter role options based on current user role
  const roleOptions = currentUserRole === 'manager'
    ? allRoleOptions.filter(opt => opt.key !== 'admin' && opt.key !== 'manager')
    : allRoleOptions;

  const handleUsersChange = (nextUsersFromTable: User[]) => {
    if (nextUsersFromTable.length < users.length) {
      const removed = users.length - nextUsersFromTable.length;
      setTotalUsers((prev) => Math.max(0, prev - removed));
    }
    setUsers(nextUsersFromTable);
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    if (selectedRole !== 'all') {
      params.set('role', selectedRole);
    }
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    }

    try {
      const response = await fetch(`/api/users?${params.toString()}`, {
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
        setTotalUsers(data.total ?? 0);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        setErrorMessage(error?.message || 'Failed to fetch users');
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, selectedRole, debouncedSearch]);

  const fetchParents = useCallback(async () => {
    if (isLoadingParents) return;
    setIsLoadingParents(true);
    try {
      const params = new URLSearchParams();
      params.set('role', 'parent');
      const response = await fetch(`/api/users?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch parents');
      }
      const data = await response.json();
      if (data.success) {
        setParents(data.users || []);
      }
    } catch {
      // Silent fail; the dialog can still create a parent manually.
    } finally {
      setIsLoadingParents(false);
    }
  }, [isLoadingParents]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!didInitialLoad.current) return;
    setPage(1);
  }, [selectedRole, debouncedSearch, pageSize]);

  useEffect(() => {
    if (!didInitialLoad.current) {
      didInitialLoad.current = true;
      return;
    }
    fetchUsers();
  }, [page, pageSize, selectedRole, debouncedSearch, fetchUsers]);

  useEffect(() => {
    if (isCreatePlayerDialogOpen || isCreateCoachDialogOpen) {
      fetchParents();
    }
  }, [isCreatePlayerDialogOpen, isCreateCoachDialogOpen, fetchParents]);

  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="relative">
            <div className="relative">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                <Shield className="h-8 w-8 text-purple-600" />
                {dictionary.users.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{dictionary.users.userList}</p>
            </div>
          </div>

          {/* Mobile-first toolbar: role filter + add user in the same row */}
          <div className="w-full sm:w-auto">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-background/70 backdrop-blur-xl shadow-lg">
              <div className="relative p-2">
                <div className="flex h-12 w-full items-stretch overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-lg shadow-black/10 dark:shadow-black/40">
                  <div className="flex-1 min-w-0 h-full">
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger
                        className="h-full w-full rounded-none border-0 bg-transparent px-4 py-0 text-foreground hover:bg-accent"
                      >
                        <div className="flex h-full w-full items-center gap-2 min-w-0">
                          <Shield className="h-4 w-4 text-foreground shrink-0" />
                          <SelectValue placeholder={dictionary.users.filterByRole} className="leading-none" />
                        </div>
                      </SelectTrigger>
                      <SelectContent align="start" className="rounded-xl border border-border bg-popover text-popover-foreground">
                        {roleOptions.map((opt) => (
                          <SelectItem key={opt.key} value={opt.key}>
                            <span className="flex w-full items-center justify-between gap-3">
                              <span className="font-semibold">{opt.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-px bg-border" />

                  <div className="shrink-0">
                    {currentUserRole === 'manager' ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="h-full rounded-none border-0 bg-transparent px-4 text-foreground hover:bg-accent">
                            <UserPlus className="h-4 w-4 mr-2" />
                            <span className="font-semibold">{dictionary.common.add}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border border-border bg-popover text-popover-foreground">
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
                        className="h-full rounded-none border-0 bg-transparent px-4 text-foreground hover:bg-accent"
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
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={dictionary.users.searchPlaceholder}
            className="h-12 pl-11 rounded-2xl border-2 border-border bg-background/70 backdrop-blur-xl"
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground">{dictionary.common.rowsPerPage}</span>
          <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="h-11 w-[110px] rounded-xl border border-border bg-background/70">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl border border-border bg-popover text-popover-foreground">
              {[10, 25, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <UsersTable
          key={`${selectedRole}-${page}-${pageSize}-${debouncedSearch}`}
          users={users}
          dictionary={dictionary}
          onUsersChange={handleUsersChange}
          locale={locale}
          isLoading={isLoading}
          parents={parents}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {dictionary.common.page} {page} {dictionary.common.of} {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-10 rounded-xl"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1 || isLoading}
          >
            {dictionary.common.previous}
          </Button>
          <Button
            variant="outline"
            className="h-10 rounded-xl"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages || isLoading}
          >
            {dictionary.common.next}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <CreateUserDialog
        open={isCreatePlayerDialogOpen}
        onOpenChange={setIsCreatePlayerDialogOpen}
        dictionary={dictionary}
        locale={locale}
        parents={parents}
        onUserCreated={(newUser: User) => {
          setPage(1);
          setSearchInput('');
          setDebouncedSearch('');
          setTimeout(() => {
            fetchUsers();
            fetchParents();
          }, 0);
        }}
        fixedRole={currentUserRole === 'manager' ? 'player' : undefined}
      />
      <CreateUserDialog
        open={isCreateCoachDialogOpen}
        onOpenChange={setIsCreateCoachDialogOpen}
        dictionary={dictionary}
        locale={locale}
        parents={parents}
        onUserCreated={(newUser: User) => {
          setPage(1);
          setSearchInput('');
          setDebouncedSearch('');
          setTimeout(() => {
            fetchUsers();
            fetchParents();
          }, 0);
        }}
        fixedRole={currentUserRole === 'manager' ? 'coach' : undefined}
      />
    </div>
  );
}
