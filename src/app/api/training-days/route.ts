import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

import { requireAcademyContext, isAcademyAdmin } from '@/lib/academies/academyContext';
import { listTrainingDaysByAcademy, upsertTrainingDays } from '@/lib/db/repositories/trainingDaysRepository';

export const runtime = 'nodejs';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const locale = url.searchParams.get('locale') || 'en';

    const ctx = await requireAcademyContext(locale);
    if (!isAcademyAdmin(ctx) && ctx.user.role !== 'admin' && ctx.user.role !== 'coach') {
      return jsonError('Unauthorized', 403);
    }

    const trainingDays = await listTrainingDaysByAcademy(ctx.academyId);
    return NextResponse.json({ success: true, trainingDays });
  } catch (error) {
    console.error('GET /api/training-days error:', error);
    return jsonError(error instanceof Error ? error.message : 'Failed to load training days', 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      locale?: string;
      groupKey?: string;
      days?: number[];
    };

    const locale = body.locale || 'en';
    const groupKey = (body.groupKey || '').trim();
    const days = Array.isArray(body.days) ? body.days : [];

    if (!groupKey) {
      return jsonError('Group is required', 400);
    }

    const ctx = await requireAcademyContext(locale);
    if (!isAcademyAdmin(ctx) && ctx.user.role !== 'admin') {
      return jsonError('Unauthorized', 403);
    }

    const record = await upsertTrainingDays({
      academyId: ctx.academyId,
      groupKey,
      days,
      updatedBy: ctx.user.id,
    });

    revalidatePath(`/${locale}/dashboard/training-days`);
    revalidatePath(`/${locale}/dashboard`);

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('POST /api/training-days error:', error);
    return jsonError(error instanceof Error ? error.message : 'Failed to save training days', 500);
  }
}
