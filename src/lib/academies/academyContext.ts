import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentUser, requireAuth, type AuthUser } from '@/lib/auth/auth';
import {
  DEFAULT_ACADEMY_ID,
  ensureDefaultAcademyExists,
  getActiveAcademies,
  findAcademyById,
} from '@/lib/db/repositories/academyRepository';
import {
  getUserAcademyIds,
  getUserAcademyRoles,
  getUserRoleInAcademy,
  addUserToAcademy,
  type AcademyMemberRole,
} from '@/lib/db/repositories/academyMembershipRepository';

export const ACADEMY_COOKIE_NAME = 'academy-id';

export interface AcademyContext {
  user: AuthUser;
  academyId: string;
  academyRole: AcademyMemberRole | 'global_admin';
}

export async function getSelectedAcademyIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const val = cookieStore.get(ACADEMY_COOKIE_NAME)?.value;
  return val || null;
}

export async function setSelectedAcademyIdCookie(academyId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACADEMY_COOKIE_NAME, academyId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

async function ensureLegacyUserMembership(user: AuthUser, academyId: string) {
  if (user.role === 'admin') return;

  const existingRole = await getUserRoleInAcademy(user.id, academyId);
  if (existingRole) return;

  const role: AcademyMemberRole =
    user.role === 'manager'
      ? 'manager'
      : user.role === 'parent'
        ? 'parent'
        : user.role === 'player'
          ? 'player'
          : 'coach';

  await addUserToAcademy({
    academyId,
    userId: user.id,
    role,
    createdBy: 'system',
  });
}

async function pickDefaultAcademyIdForUser(user: AuthUser): Promise<{ academyId: string; role: AcademyContext['academyRole'] }> {
  await ensureDefaultAcademyExists('system');

  if (user.role === 'admin') {
    const academies = await getActiveAcademies();
    const academyId = academies[0]?.id || DEFAULT_ACADEMY_ID;
    return { academyId, role: 'global_admin' };
  }

  // Managers should default to an academy where they are an academy manager.
  if (user.role === 'manager') {
    const rolesByAcademy = await getUserAcademyRoles(user.id);
    const managerAcademyIds = Object.entries(rolesByAcademy)
      .filter(([, r]) => r === 'manager')
      .map(([id]) => id)
      .sort();
    const fallbackAcademyIds = Object.keys(rolesByAcademy).sort();
    // Deterministic selection: a manager is locked to the first academy where they are the manager.
    // If data is inconsistent, fall back to the first membership academy.
    const academyId = managerAcademyIds[0] || fallbackAcademyIds[0] || DEFAULT_ACADEMY_ID;
    await ensureLegacyUserMembership(user, academyId);
    const role = (await getUserRoleInAcademy(user.id, academyId)) || 'coach';
    return { academyId, role };
  }

  const academyIds = await getUserAcademyIds(user.id);
  const academyId = academyIds[0] || DEFAULT_ACADEMY_ID;
  await ensureLegacyUserMembership(user, academyId);
  const role = (await getUserRoleInAcademy(user.id, academyId)) || 'coach';
  return { academyId, role };
}

/**
 * Resolve the current academy context for the current user.
 *
 * - Global admin can switch between academies.
 * - Non-admin users must be members of the selected academy.
 */
export async function requireAcademyContext(locale: string = 'en'): Promise<AcademyContext> {
  const user = await requireAuth(locale);

  // Keep admin flows database-minimal: do not auto-seed a default academy.
  // Non-admin users still require an academy to function correctly.
  if (user.role !== 'admin') {
    await ensureDefaultAcademyExists('system');
  }

  const selected = await getSelectedAcademyIdFromCookie();

  // Managers are locked to exactly one academy. They must not be able to switch academies via cookies.
  if (user.role === 'manager') {
    const picked = await pickDefaultAcademyIdForUser(user);
    const academy = await findAcademyById(picked.academyId);
    if (!academy || !academy.isActive) {
      redirect(`/${locale}/dashboard/forbidden`);
    }

    // Ensure membership exists and confirm role.
    await ensureLegacyUserMembership(user, picked.academyId);
    const rolesByAcademy = await getUserAcademyRoles(user.id);
    if (rolesByAcademy[picked.academyId] !== 'manager') {
      redirect(`/${locale}/dashboard/forbidden`);
    }

    return { user, academyId: picked.academyId, academyRole: 'manager' };
  }

  if (user.role === 'admin') {
    // If an academy is selected and exists, honor it; otherwise operate without creating one.
    if (selected) {
      const academy = await findAcademyById(selected);
      if (academy && academy.isActive) {
        return { user, academyId: selected, academyRole: 'global_admin' };
      }
    }

    return { user, academyId: DEFAULT_ACADEMY_ID, academyRole: 'global_admin' };
  }

  if (!selected) {
    const picked = await pickDefaultAcademyIdForUser(user);
    return { user, academyId: picked.academyId, academyRole: picked.role };
  }

  // Validate academy exists (if not, fall back)
  const academy = await findAcademyById(selected);
  if (!academy || !academy.isActive) {
    const picked = await pickDefaultAcademyIdForUser(user);
    return { user, academyId: picked.academyId, academyRole: picked.role };
  }

  // Backward compatibility: ensure the user has a membership record for the selected academy
  await ensureLegacyUserMembership(user, selected);

  const role = await getUserRoleInAcademy(user.id, selected);
  if (!role) {
    redirect(`/${locale}/dashboard/forbidden`);
  }

  return { user, academyId: selected, academyRole: role };
}

export async function getAcademyContextIfAuthenticated(): Promise<AcademyContext | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  // Keep admin flows database-minimal: do not auto-seed a default academy.
  if (user.role !== 'admin') {
    await ensureDefaultAcademyExists('system');
  }
  const selected = await getSelectedAcademyIdFromCookie();

  // Managers are locked to exactly one academy. They must not be able to switch academies via cookies.
  if (user.role === 'manager') {
    const picked = await pickDefaultAcademyIdForUser(user);
    const academy = await findAcademyById(picked.academyId);
    if (!academy || !academy.isActive) {
      return null;
    }

    await ensureLegacyUserMembership(user, picked.academyId);
    const rolesByAcademy = await getUserAcademyRoles(user.id);
    if (rolesByAcademy[picked.academyId] !== 'manager') {
      return null;
    }

    return { user, academyId: picked.academyId, academyRole: 'manager' };
  }

  if (user.role === 'admin') {
    if (selected) {
      const academy = await findAcademyById(selected);
      if (academy && academy.isActive) {
        return { user, academyId: selected, academyRole: 'global_admin' };
      }
    }

    return { user, academyId: DEFAULT_ACADEMY_ID, academyRole: 'global_admin' };
  }

  if (!selected) {
    const picked = await pickDefaultAcademyIdForUser(user);
    return { user, academyId: picked.academyId, academyRole: picked.role };
  }

  const academy = await findAcademyById(selected);
  if (!academy || !academy.isActive) {
    const picked = await pickDefaultAcademyIdForUser(user);
    return { user, academyId: picked.academyId, academyRole: picked.role };
  }

  await ensureLegacyUserMembership(user, selected);

  const role = await getUserRoleInAcademy(user.id, selected);
  if (!role) {
    return null;
  }

  return { user, academyId: selected, academyRole: role };
}

export function isAcademyAdmin(ctx: AcademyContext): boolean {
  return ctx.user.role === 'admin' || ctx.academyRole === 'manager';
}
