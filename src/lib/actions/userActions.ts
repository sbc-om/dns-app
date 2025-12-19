'use server';

import { revalidatePath } from 'next/cache';
import {
  createUser,
  updateUser,
  deleteUser,
  type CreateUserInput,
  type UpdateUserInput,
} from '@/lib/db/repositories/userRepository';
import { requireRole } from '@/lib/auth/auth';
import { ROLES, type UserRole } from '@/config/roles';
import { requireAcademyContext } from '@/lib/academies/academyContext';
import {
  addUserToAcademy,
  getAcademyMembership,
  getUserAcademyIds,
  removeUserFromAcademy,
  type AcademyMemberRole,
} from '@/lib/db/repositories/academyMembershipRepository';
import { findAcademyById } from '@/lib/db/repositories/academyRepository';

function mapUserRoleToAcademyMemberRole(role: UserRole): AcademyMemberRole {
  switch (role) {
    case ROLES.MANAGER:
      return 'manager';
    case ROLES.COACH:
      return 'coach';
    case ROLES.PARENT:
      return 'parent';
    case ROLES.KID:
      return 'kid';
    default:
      // Admin is not an academy member role.
      return 'coach';
  }
}

async function ensureValidAcademyId(academyId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const academy = await findAcademyById(academyId);
  if (!academy || !academy.isActive) {
    return { ok: false, error: 'Invalid academy' };
  }
  return { ok: true };
}

async function setSingleAcademyMembership(params: {
  userId: string;
  academyId: string;
  role: AcademyMemberRole;
  createdBy: string;
}) {
  const existingIds = await getUserAcademyIds(params.userId);
  await Promise.all(
    existingIds
      .filter((id) => id !== params.academyId)
      .map((id) => removeUserFromAcademy(id, params.userId))
  );
  await addUserToAcademy({
    academyId: params.academyId,
    userId: params.userId,
    role: params.role,
    createdBy: params.createdBy,
  });
}

export async function createUserAction(
  input: CreateUserInput,
  options?: {
    locale?: string;
    academyId?: string;
  }
) {
  try {
    const locale = options?.locale ?? 'en';
    await requireRole([ROLES.ADMIN, ROLES.MANAGER], locale);
    const ctx = await requireAcademyContext(locale);

    // Prevent privilege escalation by managers
    if (ctx.user.role === ROLES.MANAGER && (input.role === ROLES.ADMIN || input.role === ROLES.MANAGER)) {
      return { success: false as const, error: 'Not authorized to create this role' };
    }

    const requestedAcademyId = options?.academyId;
    const academyId = ctx.user.role === ROLES.ADMIN ? (requestedAcademyId || ctx.academyId) : ctx.academyId;
    const academyCheck = await ensureValidAcademyId(academyId);
    if (!academyCheck.ok) {
      return { success: false as const, error: academyCheck.error };
    }

    const user = await createUser(input);

    // Attach new users to the current academy (single membership model).
    if (user.role !== ROLES.ADMIN) {
      await setSingleAcademyMembership({
        userId: user.id,
        academyId,
        role: mapUserRoleToAcademyMemberRole(user.role),
        createdBy: ctx.user.id,
      });
    }

    revalidatePath('/[locale]/dashboard/users', 'page');
    return { success: true, user };
  } catch (error) {
    console.error('Create user error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create user' };
  }
}

export async function updateUserAction(
  id: string,
  input: UpdateUserInput,
  options?: {
    locale?: string;
    academyId?: string;
  }
) {
  try {
    const locale = options?.locale ?? 'en';
    await requireRole([ROLES.ADMIN, ROLES.MANAGER], locale);
    const ctx = await requireAcademyContext(locale);

    if (ctx.user.role === ROLES.MANAGER) {
      const membership = await getAcademyMembership(ctx.academyId, id);
      if (!membership) {
        return { success: false as const, error: 'Not authorized' };
      }
      if (input.role === ROLES.ADMIN || input.role === ROLES.MANAGER) {
        return { success: false as const, error: 'Not authorized to set this role' };
      }
    }

    const user = await updateUser(id, input);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Keep academy membership in sync (single membership model).
    if (user.role !== ROLES.ADMIN) {
      const requestedAcademyId = options?.academyId;
      const academyId = ctx.user.role === ROLES.ADMIN ? (requestedAcademyId || (await getUserAcademyIds(user.id))[0] || ctx.academyId) : ctx.academyId;
      const academyCheck = await ensureValidAcademyId(academyId);
      if (!academyCheck.ok) {
        return { success: false as const, error: academyCheck.error };
      }

      await setSingleAcademyMembership({
        userId: user.id,
        academyId,
        role: mapUserRoleToAcademyMemberRole(user.role),
        createdBy: ctx.user.id,
      });
    }

    revalidatePath('/[locale]/dashboard/users', 'page');
    return { success: true, user };
  } catch (error) {
    console.error('Update user error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update user' };
  }
}

export async function deleteUserAction(id: string, options?: { locale?: string }) {
  try {
    const locale = options?.locale ?? 'en';
    await requireRole([ROLES.ADMIN, ROLES.MANAGER], locale);
    const ctx = await requireAcademyContext(locale);

    if (ctx.user.role === ROLES.MANAGER) {
      const membership = await getAcademyMembership(ctx.academyId, id);
      if (!membership) {
        return { success: false as const, error: 'Not authorized' };
      }
    }

    const success = await deleteUser(id);
    if (!success) {
      return { success: false, error: 'User not found' };
    }

    // Clean up academy memberships.
    const academyIds = await getUserAcademyIds(id);
    await Promise.all(academyIds.map((academyId) => removeUserFromAcademy(academyId, id)));

    revalidatePath('/[locale]/dashboard/users', 'page');
    return { success: true };
  } catch (error) {
    console.error('Delete user error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete user' };
  }
}

export async function updateOwnProfileAction(input: {
  fullName?: string;
  phoneNumber?: string;
  profilePicture?: string;
}) {
  try {
    // Import here to avoid circular dependency
    const { getCurrentUser } = await import('@/lib/auth/auth');
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' };
    }
    
    // Users can only update their own profile
    const user = await updateUser(currentUser.id, {
      fullName: input.fullName,
      phoneNumber: input.phoneNumber,
      profilePicture: input.profilePicture,
    });
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // Revalidate all dashboard pages to update profile picture everywhere
    revalidatePath('/', 'layout');
    revalidatePath('/dashboard', 'layout');
    revalidatePath('/dashboard/profile');
    
    return { success: true, user };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update profile' };
  }
}

export async function updateUserProfilePictureAction(userId: string, profilePicture: string) {
  'use server';
  
  try {
    const { getCurrentUser } = await import('@/lib/auth/auth');
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' };
    }
    
    // Only admin can update other users' profile pictures
    if (currentUser.role !== 'admin') {
      return { success: false, error: 'Not authorized' };
    }
    
    const user = await updateUser(userId, { profilePicture });
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    revalidatePath(`/dashboard/kids/${userId}`);
    revalidatePath('/dashboard/users');
    
    return { success: true, user };
  } catch (error) {
    console.error('Update profile picture error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update profile picture' };
  }
}

export async function getCoachesAction() {
  try {
    const { getCoaches } = await import('@/lib/db/repositories/userRepository');
    const coaches = await getCoaches();
    return { success: true, coaches };
  } catch (error) {
    console.error('Get coaches error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch coaches' };
  }
}
