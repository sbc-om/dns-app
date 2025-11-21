'use server';

import { revalidatePath } from 'next/cache';
import {
  createPlayerCard,
  getPlayerCardById,
  getPlayerCardsByUserId,
  updatePlayerCard,
  deletePlayerCard,
  type CreatePlayerCardInput,
} from '@/lib/db/repositories/playerCardRepository';
import { getCurrentUser, requireAuth, requireAdmin } from '@/lib/auth/auth';

export async function createPlayerCardAction(input: Omit<CreatePlayerCardInput, 'createdBy'>) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'coach')) {
      return { success: false, error: 'Not authorized' };
    }

    const card = await createPlayerCard({
      ...input,
      createdBy: currentUser.id,
    });

    revalidatePath('/dashboard/kids');
    revalidatePath(`/dashboard/kids/${input.userId}`);
    
    return { success: true, card };
  } catch (error) {
    console.error('Create player card error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create player card' };
  }
}

export async function getPlayerCardAction(id: string) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    const card = await getPlayerCardById(id);
    
    if (!card) {
      return { success: false, error: 'Card not found' };
    }

    return { success: true, card };
  } catch (error) {
    console.error('Get player card error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get player card' };
  }
}

export async function getPlayerCardsByUserAction(userId: string) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    const cards = await getPlayerCardsByUserId(userId);
    
    return { success: true, cards };
  } catch (error) {
    console.error('Get player cards error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get player cards' };
  }
}

export async function updatePlayerCardAction(id: string, updates: Partial<CreatePlayerCardInput>) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'coach')) {
      return { success: false, error: 'Not authorized' };
    }

    const card = await updatePlayerCard(id, updates);
    
    if (!card) {
      return { success: false, error: 'Card not found' };
    }

    revalidatePath('/dashboard/kids');
    revalidatePath(`/dashboard/kids/${card.userId}`);
    
    return { success: true, card };
  } catch (error) {
    console.error('Update player card error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update player card' };
  }
}

export async function deletePlayerCardAction(id: string) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'coach')) {
      return { success: false, error: 'Not authorized' };
    }

    const success = await deletePlayerCard(id);
    
    if (!success) {
      return { success: false, error: 'Card not found' };
    }

    revalidatePath('/dashboard/kids');
    
    return { success: true };
  } catch (error) {
    console.error('Delete player card error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete player card' };
  }
}
