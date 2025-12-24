'use server';

import { revalidatePath } from 'next/cache';
import { requireAcademyContext, isAcademyAdmin } from '@/lib/academies/academyContext';
import type { GroupTrainingDays } from '@/lib/trainingDays/trainingDaysTypes';
import {
  listTrainingDaysByAcademy,
  upsertTrainingDays,
} from '@/lib/db/repositories/trainingDaysRepository';

export async function getTrainingDaysForAcademyAction(params: {
  locale: string;
}): Promise<{ success: true; trainingDays: GroupTrainingDays[] } | { success: false; error: string }> {
  try {
    const ctx = await requireAcademyContext(params.locale);
    if (!isAcademyAdmin(ctx) && ctx.user.role !== 'admin' && ctx.user.role !== 'coach') {
      return { success: false, error: 'Unauthorized' };
    }

    const trainingDays = await listTrainingDaysByAcademy(ctx.academyId);
    return { success: true, trainingDays };
  } catch (error) {
    console.error('Get training days error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to load training days' };
  }
}

export async function setTrainingDaysForGroupAction(params: {
  locale: string;
  groupKey: string;
  days: number[];
}): Promise<{ success: true; record: GroupTrainingDays } | { success: false; error: string }> {
  try {
    const ctx = await requireAcademyContext(params.locale);
    if (!isAcademyAdmin(ctx) && ctx.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    if (!params.groupKey.trim()) {
      return { success: false, error: 'Group is required' };
    }

    const record = await upsertTrainingDays({
      academyId: ctx.academyId,
      groupKey: params.groupKey.trim(),
      days: params.days,
      updatedBy: ctx.user.id,
    });

    revalidatePath(`/${params.locale}/dashboard/training-days`);
    revalidatePath(`/${params.locale}/dashboard`);

    return { success: true, record };
  } catch (error) {
    console.error('Set training days error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to save training days' };
  }
}
