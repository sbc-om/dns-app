'use server';

import { revalidatePath } from 'next/cache';
import {
  getAdminSettings,
  updateAdminSettings,
  type UpdateAdminSettingsInput,
} from '../db/repositories/adminSettingsRepository';
import { getCurrentUser } from '../auth/auth';

// Get admin settings (accessible to all authenticated users for payment page)
export async function getAdminSettingsAction() {
  const user = await getCurrentUser();
  
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }
  
  try {
    const settings = await getAdminSettings();
    return { success: true, settings };
  } catch (error) {
    console.error('Error getting admin settings:', error);
    return { success: false, error: 'Failed to get settings' };
  }
}

// Update admin settings (admin only)
export async function updateAdminSettingsAction(input: UpdateAdminSettingsInput) {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }
  
  try {
    const settings = await updateAdminSettings(input);
    revalidatePath('/[locale]/dashboard/settings');
    return { success: true, settings };
  } catch (error) {
    console.error('Error updating admin settings:', error);
    return { success: false, error: 'Failed to update settings' };
  }
}
