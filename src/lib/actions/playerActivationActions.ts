'use server';

import { revalidatePath } from 'next/cache';
import { requireAcademyContext, isAcademyAdmin } from '@/lib/academies/academyContext';
import { findUserById, updateUser } from '@/lib/db/repositories/userRepository';
import { getAcademyMembership, addUserToAcademy } from '@/lib/db/repositories/academyMembershipRepository';
import {
  createOrRotatePlayerActivation,
  getPlayerActivationByToken,
  listPlayerActivationsByAcademy,
  updatePlayerActivationByToken,
  type PlayerActivation,
} from '@/lib/db/repositories/playerActivationRepository';
import { ensurePlayerProfile } from '@/lib/db/repositories/playerProfileRepository';

function isExpired(activation: PlayerActivation): boolean {
  if (!activation.expiresAt) return false;
  const t = new Date(activation.expiresAt).getTime();
  return Number.isFinite(t) && Date.now() > t;
}

export async function createPlayerActivationLinkAction(params: {
  locale: string;
  playerId: string;
}): Promise<{ success: true; token: string; url: string; activation: PlayerActivation } | { success: false; error: string }> {
  try {
    const ctx = await requireAcademyContext(params.locale);
    if (!isAcademyAdmin(ctx) && ctx.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const player = await findUserById(params.playerId);
    if (!player || player.role !== 'player') {
      return { success: false, error: 'Invalid player' };
    }

    // Prevent cross-academy leaks: player must belong to current academy.
    const membership = await getAcademyMembership(ctx.academyId, player.id);
    if (!membership) {
      return { success: false, error: 'Player is not part of this academy' };
    }

    const activation = await createOrRotatePlayerActivation({
      academyId: ctx.academyId,
      playerId: player.id,
      playerDisplayName: player.fullName || player.username,
      parentName: player.parentContactName,
      parentEmail: player.parentContactEmail,
      parentPhone: player.parentContactPhone,
      // Optional: expire in 30 days
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    });

    const url = `/${params.locale}/activate/${activation.token}`;

    revalidatePath(`/${params.locale}/dashboard/activations`);
    return { success: true, token: activation.token, url, activation };
  } catch (error) {
    console.error('Create activation link error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create activation link' };
  }
}

export async function listAcademyActivationsAction(params: {
  locale: string;
}): Promise<{ success: true; activations: PlayerActivation[] } | { success: false; error: string }> {
  try {
    const ctx = await requireAcademyContext(params.locale);
    if (!isAcademyAdmin(ctx) && ctx.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const activations = await listPlayerActivationsByAcademy(ctx.academyId);
    return { success: true, activations };
  } catch (error) {
    console.error('List activations error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to load activations' };
  }
}

/**
 * Parent flow: confirm details.
 * This is intentionally token-based and does NOT require an authenticated parent user account.
 */
export async function confirmActivationByTokenAction(params: {
  locale: string;
  token: string;
  parentName: string;
  parentEmail: string;
  parentPhone?: string;
  accepted: boolean;
}): Promise<{ success: true; activation: PlayerActivation } | { success: false; error: string }> {
  try {
    const activation = await getPlayerActivationByToken(params.token);
    if (!activation) return { success: false, error: 'Invalid activation link' };
    if (isExpired(activation)) {
      await updatePlayerActivationByToken(params.token, { status: 'expired' });
      return { success: false, error: 'Activation link expired' };
    }

    if (!params.accepted) {
      const updated = await updatePlayerActivationByToken(params.token, {
        status: 'declined',
        declinedAt: new Date().toISOString(),
      });
      if (!updated) return { success: false, error: 'Activation not found' };
      return { success: true, activation: updated };
    }

    // Only allow confirmation from a pending state.
    if (!['pending', 'confirmed'].includes(activation.status)) {
      return { success: false, error: 'Activation is not available' };
    }

    const updated = await updatePlayerActivationByToken(params.token, {
      status: 'confirmed',
      confirmedAt: activation.confirmedAt ?? new Date().toISOString(),
      parentName: params.parentName,
      parentEmail: params.parentEmail,
      parentPhone: params.parentPhone,
    });

    if (!updated) return { success: false, error: 'Activation not found' };

    // Persist parent contact to the player record.
    await updateUser(updated.playerId, {
      parentContactName: params.parentName,
      parentContactEmail: params.parentEmail,
      parentContactPhone: params.parentPhone,
    });

    return { success: true, activation: updated };
  } catch (error) {
    console.error('Confirm activation error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to confirm activation' };
  }
}

/**
 * Parent flow: complete payment.
 * Currently modeled as an instant success (placeholder for real payment gateway integration).
 */
export async function completePaymentByTokenAction(params: {
  locale: string;
  token: string;
}): Promise<{ success: true; activation: PlayerActivation } | { success: false; error: string }> {
  try {
    const activation = await getPlayerActivationByToken(params.token);
    if (!activation) return { success: false, error: 'Invalid activation link' };
    if (isExpired(activation)) {
      await updatePlayerActivationByToken(params.token, { status: 'expired' });
      return { success: false, error: 'Activation link expired' };
    }

    if (!['confirmed', 'pending', 'paid', 'activated'].includes(activation.status)) {
      return { success: false, error: 'Activation is not available' };
    }

    const now = new Date().toISOString();

    const paid = await updatePlayerActivationByToken(params.token, {
      status: 'paid',
      paidAt: activation.paidAt ?? now,
    });
    if (!paid) return { success: false, error: 'Activation not found' };

    // Ensure membership (defensive; phase 1 should have created it already).
    const membership = await getAcademyMembership(paid.academyId, paid.playerId);
    if (!membership) {
      await addUserToAcademy({
        academyId: paid.academyId,
        userId: paid.playerId,
        role: 'player',
        createdBy: 'system',
      });
    }

    // Activate player account for DNA.
    await updateUser(paid.playerId, {
      dnaActivationStatus: 'active_awaiting_assessment',
      dnaActivatedAt: now,
    });

    // Create the default player profile only after activation.
    await ensurePlayerProfile({ academyId: paid.academyId, userId: paid.playerId });

    const activated = await updatePlayerActivationByToken(params.token, {
      status: 'activated',
      activatedAt: now,
    });

    if (!activated) return { success: false, error: 'Activation not found' };

    revalidatePath(`/${params.locale}/dashboard`);
    revalidatePath(`/${params.locale}/dashboard/activations`);
    revalidatePath(`/${params.locale}/dashboard/players/${paid.playerId}`);

    return { success: true, activation: activated };
  } catch (error) {
    console.error('Complete payment error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to complete payment' };
  }
}
