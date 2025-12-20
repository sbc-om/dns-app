'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import type { Dictionary } from '@/lib/i18n/getDictionary';
import type { RolePermission } from '@/lib/db/repositories/rolePermissionRepository';
import { ROLES, type UserRole } from '@/config/roles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { updateRolePermissionsAction } from '@/lib/actions/rolePermissionActions';
import { CheckCircle2, Save, Shield, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export interface RolesPermissionsClientProps {
  dictionary: Dictionary;
  initialRolePermissions: RolePermission[];
}

export function RolesPermissionsClient({ dictionary, initialRolePermissions }: RolesPermissionsClientProps) {
  type PermissionKey = keyof RolePermission['permissions'];
  type PermissionGroup = 'core' | 'management' | 'communication';

  const roleOrder: UserRole[] = [ROLES.ADMIN, ROLES.MANAGER, ROLES.COACH, ROLES.PARENT, ROLES.KID];

  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(initialRolePermissions);
  const [baselineRolePermissions, setBaselineRolePermissions] = useState<RolePermission[]>(initialRolePermissions);
  const [activeRole, setActiveRole] = useState<UserRole>(roleOrder[0]);
  const [isSaving, setIsSaving] = useState<UserRole | null>(null);
  const [savedRole, setSavedRole] = useState<UserRole | null>(null);
  const [query, setQuery] = useState('');

  const permissionsCatalog = useMemo(() => {
    const items: Array<{ key: PermissionKey; group: PermissionGroup }> = [
      // Core
      { key: 'canAccessDashboard', group: 'core' },
      { key: 'canViewReports', group: 'core' },
      { key: 'canViewProfile', group: 'core' },
      { key: 'canEditProfile', group: 'core' },
      { key: 'canAccessSettings', group: 'core' },

      // Management
      { key: 'canManageUsers', group: 'management' },
      { key: 'canManageRoles', group: 'management' },
      { key: 'canManageAcademies', group: 'management' },
      { key: 'canManageAppointments', group: 'management' },
      { key: 'canManageSchedules', group: 'management' },
      { key: 'canManageCourses', group: 'management' },
      { key: 'canViewPayments', group: 'management' },
      { key: 'canManageNotifications', group: 'management' },
      { key: 'canManageBackups', group: 'management' },

      // Communication
      { key: 'canAccessMessages', group: 'communication' },
      { key: 'canCreateGroup', group: 'communication' },
      { key: 'canSendPushNotifications', group: 'communication' },
      { key: 'canSendWhatsApp', group: 'communication' },
    ];

    const groupOrder: PermissionGroup[] = ['core', 'management', 'communication'];
    const grouped: Record<PermissionGroup, Array<{ key: PermissionKey; group: PermissionGroup }>> = {
      core: [],
      management: [],
      communication: [],
    };

    for (const item of items) grouped[item.group].push(item);

    return groupOrder.map((g) => ({
      group: g,
      items: grouped[g],
    }));
  }, []);

  const roleLabel = (role: UserRole): string => {
    const rolesDict = dictionary.users?.roles as Record<string, string> | undefined;
    return rolesDict?.[role] || role.toUpperCase();
  };

  const permissionTitle = (key: PermissionKey): string => {
    const labels = dictionary.roles?.permissionLabels as
      | Record<string, { title?: string; description?: string }>
      | undefined;
    return labels?.[key]?.title || key;
  };

  const permissionDescription = (key: PermissionKey): string | undefined => {
    const labels = dictionary.roles?.permissionLabels as
      | Record<string, { title?: string; description?: string }>
      | undefined;
    return labels?.[key]?.description;
  };

  const groupTitle = (group: PermissionGroup): string => {
    const g = dictionary.roles?.permissionsEditor?.groups as Record<string, string> | undefined;
    return g?.[group] || group;
  };

  const baselineByRole = useMemo(() => {
    const map = new Map<UserRole, RolePermission>();
    for (const rp of baselineRolePermissions) {
      map.set(rp.role, rp);
    }
    return map;
  }, [baselineRolePermissions]);

  const isRoleDirty = (role: UserRole): boolean => {
    const current = rolePermissions.find((rp) => rp.role === role);
    const baseline = baselineByRole.get(role);
    if (!current || !baseline) return false;

    const keys = Object.keys(current.permissions) as PermissionKey[];
    for (const k of keys) {
      if ((current.permissions[k] ?? false) !== (baseline.permissions[k] ?? false)) return true;
    }
    return false;
  };

  const countEnabled = (role: UserRole): { enabled: number; total: number } => {
    const rp = rolePermissions.find((x) => x.role === role);
    if (!rp) return { enabled: 0, total: 0 };
    const keys = Object.keys(rp.permissions) as PermissionKey[];
    const enabled = keys.reduce((acc, k) => acc + ((rp.permissions[k] ?? false) ? 1 : 0), 0);
    return { enabled, total: keys.length };
  };

  const handlePermissionChange = (role: UserRole, permission: PermissionKey, value: boolean) => {
    setRolePermissions((prev) =>
      prev.map((rp) =>
        rp.role === role
          ? {
              ...rp,
              permissions: {
                ...rp.permissions,
                [permission]: value,
              },
            }
          : rp
      )
    );
  };

  const handleSave = async (role: UserRole) => {
    setIsSaving(role);
    setSavedRole(null);

    const rolePermission = rolePermissions.find((rp) => rp.role === role);
    if (!rolePermission) {
      setIsSaving(null);
      return;
    }

    const result = await updateRolePermissionsAction(role, rolePermission.permissions);
    setIsSaving(null);

    if (result.success) {
      const updated = result.rolePermission;
      if (updated) {
        setRolePermissions((prev) => prev.map((rp) => (rp.role === role ? updated : rp)));
        setBaselineRolePermissions((prev) => prev.map((rp) => (rp.role === role ? updated : rp)));
      }
      setSavedRole(role);
      toast.success(
        dictionary.roles?.permissionsEditor?.saveSuccess || 'Permissions saved successfully'
      );
      setTimeout(() => setSavedRole(null), 2500);
    } else {
      toast.error(result.error || dictionary.roles?.permissionsEditor?.saveError || 'Failed to save permissions');
    }
  };

  const resetRole = (role: UserRole) => {
    const baseline = baselineByRole.get(role);
    if (!baseline) return;
    setRolePermissions((prev) =>
      prev.map((rp) => (rp.role === role ? { ...rp, permissions: { ...baseline.permissions } } : rp))
    );
  };

  const setManyForRole = (role: UserRole, keys: PermissionKey[], value: boolean) => {
    setRolePermissions((prev) =>
      prev.map((rp) => {
        if (rp.role !== role) return rp;
        const next = { ...rp.permissions };
        for (const k of keys) next[k] = value;
        return { ...rp, permissions: next };
      })
    );
  };

  const activeRolePermission = rolePermissions.find((rp) => rp.role === activeRole) || null;
  const lastUpdatedLabel = dictionary.roles?.permissionsEditor?.lastUpdated || 'Last updated';
  const saveLabel = dictionary.roles?.permissionsEditor?.save || dictionary.common?.save || 'Save';
  const savingLabel = dictionary.roles?.permissionsEditor?.saving || dictionary.common?.loading || 'Saving...';
  const savedLabel = dictionary.roles?.permissionsEditor?.saved || 'Saved';
  const permissionColLabel = dictionary.roles?.permissionsEditor?.permissionColumn || 'Permission';
  const enabledColLabel = dictionary.roles?.permissionsEditor?.enabledColumn || 'Enabled';
  const subtitle = dictionary.roles?.permissionsEditor?.subtitle || 'Manage permissions for each role';

  const activeDirty = isRoleDirty(activeRole);
  const isSavingThis = isSaving === activeRole;
  const isSavedThis = savedRole === activeRole;
  const activeCounts = countEnabled(activeRole);
  const resetLabel = dictionary.roles?.permissionsEditor?.reset || 'Reset';
  const enableAllLabel = dictionary.roles?.permissionsEditor?.enableAll || 'Enable all';
  const disableAllLabel = dictionary.roles?.permissionsEditor?.disableAll || 'Disable all';
  const searchPlaceholder = dictionary.roles?.permissionsEditor?.searchPlaceholder || 'Search permissions...';
  const noResultsLabel = dictionary.roles?.permissionsEditor?.noResults || 'No results.';
  const noRoleDataLabel = dictionary.roles?.permissionsEditor?.noRoleData || 'No role data.';

  const q = query.trim().toLowerCase();
  const filteredCatalog = !q
    ? permissionsCatalog
    : permissionsCatalog
        .map((group) => {
          const items = group.items.filter((item) => {
            const title = permissionTitle(item.key).toLowerCase();
            const desc = (permissionDescription(item.key) || '').toLowerCase();
            return title.includes(q) || desc.includes(q) || item.key.toLowerCase().includes(q);
          });
          return { ...group, items };
        })
        .filter((g) => g.items.length > 0);

  const filteredKeys: PermissionKey[] = [];
  for (const g of filteredCatalog) {
    for (const item of g.items) filteredKeys.push(item.key);
  }

  const shellCard =
    'rounded-3xl border border-white/10 bg-white/6 backdrop-blur-xl shadow-[0_30px_90px_-50px_rgba(0,0,0,0.7)] overflow-hidden';
  const shellCardHeader = 'border-b border-white/10 bg-white/5';
  const softText = 'text-white/70';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 240, damping: 22 }}
      className="relative space-y-6"
    >
      {/* Local glow accents */}
      <div className="pointer-events-none absolute -inset-x-10 -top-10 -z-10 h-56 bg-[radial-gradient(circle_at_30%_30%,rgba(249,115,22,0.18),transparent_60%),radial-gradient(circle_at_70%_30%,rgba(168,85,247,0.16),transparent_55%)] blur-2xl" />

      {/* Hero header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <motion.div
              className="relative h-11 w-11 rounded-2xl border border-white/15 bg-white/8 backdrop-blur-xl flex items-center justify-center"
              animate={{ rotate: [0, -3, 3, -3, 0] }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-orange-500/20 via-fuchsia-500/15 to-blue-500/15" />
              <Shield className="relative h-5 w-5 text-white" />
            </motion.div>

            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
                <span className="bg-linear-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                  {dictionary.roles?.title || dictionary.nav.roles}
                </span>
              </h1>
              <p className={`mt-1 text-sm ${softText}`}>{subtitle}</p>
            </div>
          </div>

          <div className="mt-3">
            <Badge variant="outline" className="border-white/15 bg-white/5 text-white/80">
              {roleLabel(activeRole)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Roles list */}
        <Card className={`${shellCard} lg:col-span-4 xl:col-span-3`}>
          <CardHeader className={`${shellCardHeader} pb-4`}>
            <CardTitle className="text-base sm:text-lg font-bold text-white">
              {dictionary.roles?.title || dictionary.nav.roles}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <OverlayScrollbarsComponent
              className="w-full"
              options={{
                scrollbars: { theme: 'os-theme-dark', visibility: 'auto', autoHide: 'move', autoHideDelay: 800 },
                overflow: { x: 'scroll', y: 'hidden' },
              }}
              defer
            >
              <div className="flex lg:flex-col gap-2 pb-1">
                {roleOrder.map((role, index) => {
                  const active = role === activeRole;
                  const { enabled, total } = countEnabled(role);
                  const dirty = isRoleDirty(role);
                  return (
                    <motion.button
                      key={role}
                      type="button"
                      onClick={() => setActiveRole(role)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={
                        'shrink-0 lg:w-full text-left rounded-2xl border px-4 py-3 transition-colors ' +
                        (active
                          ? 'border-white/25 bg-white/10'
                          : 'border-white/10 bg-white/6 hover:bg-white/10')
                      }
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {dirty && <span className="h-2 w-2 rounded-full bg-orange-400" />}
                            <div className="font-bold text-white truncate">{roleLabel(role)}</div>
                          </div>
                          <div className={`mt-1 text-xs ${softText}`}>
                            {enabled}/{total} {dictionary.roles?.permissions || 'Permissions'}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </OverlayScrollbarsComponent>
          </CardContent>
        </Card>

        {/* Permissions editor */}
        <Card className={`${shellCard} lg:col-span-8 xl:col-span-9`}>
          <CardHeader className={`${shellCardHeader} pb-4`}>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <CardTitle className="text-base sm:text-lg font-bold text-white">
                    {dictionary.roles?.permissions || 'Permissions'}
                  </CardTitle>
                  <div className={`mt-1 text-sm ${softText}`}>{roleLabel(activeRole)}</div>
                </div>
                {activeRolePermission && (
                  <div className={`text-xs ${softText}`}>
                    {lastUpdatedLabel}: {new Date(activeRolePermission.updatedAt).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:max-w-[560px]">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="h-11 bg-white/5 text-white placeholder:text-white/40 border border-white/10 focus-visible:ring-0 focus-visible:border-white/20"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 border-white/15 bg-white/5 text-white hover:bg-white/10"
                      onClick={() => setManyForRole(activeRole, filteredKeys, true)}
                      disabled={filteredKeys.length === 0}
                    >
                      {enableAllLabel}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 border-white/15 bg-white/5 text-white hover:bg-white/10"
                      onClick={() => setManyForRole(activeRole, filteredKeys, false)}
                      disabled={filteredKeys.length === 0}
                    >
                      {disableAllLabel}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-semibold border-white/15 bg-white/5 text-white">
                      {activeCounts.enabled}/{activeCounts.total}
                    </Badge>
                    {isSavedThis && (
                      <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold">
                        <CheckCircle2 className="h-4 w-4" />
                        {savedLabel}
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 border-white/15 bg-white/5 text-white hover:bg-white/10"
                    onClick={() => resetRole(activeRole)}
                    disabled={!activeDirty || isSavingThis}
                  >
                    <RotateCcw className="me-2 h-4 w-4" />
                    {resetLabel}
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="grid grid-cols-12 bg-white/5 border-b border-white/10">
              <div className="col-span-9 px-4 py-3 font-bold text-white/90 border-r border-white/10">
                {permissionColLabel}
              </div>
              <div className="col-span-3 px-4 py-3 font-bold text-white/90 text-right">
                {enabledColLabel}
              </div>
            </div>

            <OverlayScrollbarsComponent
              className="max-h-[560px]"
              options={{
                scrollbars: { theme: 'os-theme-dark', visibility: 'auto', autoHide: 'move', autoHideDelay: 800 },
                overflow: { x: 'hidden', y: 'scroll' },
              }}
              defer
            >
              <div>
                {activeRolePermission ? (
                  filteredCatalog.length === 0 ? (
                    <div className={`p-6 text-sm ${softText}`}>{noResultsLabel}</div>
                  ) : (
                    filteredCatalog.map((group) => (
                      <div key={group.group}>
                        <div className="px-4 py-2 text-xs font-bold tracking-widest text-white/60 border-b border-white/10 bg-white/4">
                          {groupTitle(group.group)}
                        </div>
                        {group.items.map((item) => (
                          <div
                            key={item.key}
                            className="grid grid-cols-12 border-b border-white/10 hover:bg-white/5"
                          >
                            <div className="col-span-9 px-4 py-3 border-r border-white/10">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-white">
                                    {permissionTitle(item.key)}
                                  </div>
                                  {permissionDescription(item.key) && (
                                    <div className={`mt-1 text-xs ${softText}`}>
                                      {permissionDescription(item.key)}
                                    </div>
                                  )}
                                </div>
                                <Badge
                                  variant="outline"
                                  className="hidden lg:inline-flex shrink-0 font-mono text-[10px] border-white/15 bg-white/5 text-white/70"
                                >
                                  {item.key}
                                </Badge>
                              </div>
                            </div>
                            <div className="col-span-3 px-4 py-3 flex items-center justify-end">
                              <Switch
                                checked={activeRolePermission.permissions[item.key] ?? false}
                                onCheckedChange={(checked: boolean) =>
                                  handlePermissionChange(activeRole, item.key, checked)
                                }
                                className="data-[state=checked]:bg-white data-[state=unchecked]:bg-white/20"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  )
                ) : (
                  <div className={`p-6 text-sm ${softText}`}>{noRoleDataLabel}</div>
                )}
              </div>
            </OverlayScrollbarsComponent>

            <div className="border-t border-white/10 bg-white/5 p-4">
              <div className="flex justify-end">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="button"
                    onClick={() => handleSave(activeRole)}
                    disabled={isSavingThis || !activeDirty}
                    className="h-11 rounded-2xl bg-linear-to-r from-orange-500 to-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20 hover:from-orange-400 hover:to-fuchsia-500"
                  >
                    <Save className="me-2 h-4 w-4" />
                    {isSavingThis ? savingLabel : saveLabel}
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
