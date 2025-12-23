import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth';
import { requireAcademyContext } from '@/lib/academies/academyContext';
import {
  createWhatsAppRecipientProfile,
  getWhatsAppRecipientProfilesByAcademy,
} from '@/lib/db/repositories/whatsappProfileRepository';

/**
 * GET /api/whatsapp/profiles
 * Get WhatsApp recipient profiles (filtered by academy)
 */
export async function GET() {
  try {
    const currentUser = await requireAuth();
    const ctx = await requireAcademyContext();

    // Only admin and coach can access
    if (currentUser.role !== 'admin' && currentUser.role !== 'coach') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const profiles = await getWhatsAppRecipientProfilesByAcademy(ctx.academyId);

    return NextResponse.json({ success: true, profiles });
  } catch (error) {
    console.error('Error getting WhatsApp recipient profiles:', error);
    return NextResponse.json({ success: false, message: 'Failed to get profiles' }, { status: 500 });
  }
}

/**
 * POST /api/whatsapp/profiles
 * Create a WhatsApp recipient profile
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    const ctx = await requireAcademyContext();

    // Only admin and coach can create
    if (currentUser.role !== 'admin' && currentUser.role !== 'coach') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const userIds = Array.isArray(body?.userIds) ? (body.userIds as string[]) : [];

    if (!name || userIds.length === 0) {
      return NextResponse.json({ success: false, message: 'Name and userIds are required' }, { status: 400 });
    }

    const profile = await createWhatsAppRecipientProfile({
      name,
      userIds,
      createdBy: currentUser.id,
      academyId: ctx.academyId,
    });

    return NextResponse.json({ success: true, profile, message: 'Profile created successfully' });
  } catch (error) {
    console.error('Error creating WhatsApp recipient profile:', error);
    return NextResponse.json({ success: false, message: 'Failed to create profile' }, { status: 500 });
  }
}
