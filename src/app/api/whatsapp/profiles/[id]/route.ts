import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth';
import {
  deleteWhatsAppRecipientProfile,
  getWhatsAppRecipientProfileById,
  updateWhatsAppRecipientProfile,
} from '@/lib/db/repositories/whatsappProfileRepository';

function canManageProfile(params: { currentUser: { id: string; role: string }; ownerId: string }) {
  return params.currentUser.role === 'admin' || params.currentUser.id === params.ownerId;
}

/**
 * GET /api/whatsapp/profiles/[id]
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const { id } = await params;

    // Only admin and coach can access
    if (currentUser.role !== 'admin' && currentUser.role !== 'coach') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const profile = await getWhatsAppRecipientProfileById(id);
    if (!profile) {
      return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Error getting WhatsApp recipient profile:', error);
    return NextResponse.json({ success: false, message: 'Failed to get profile' }, { status: 500 });
  }
}

/**
 * PUT /api/whatsapp/profiles/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const { id } = await params;

    // Only admin and coach can update
    if (currentUser.role !== 'admin' && currentUser.role !== 'coach') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const existing = await getWhatsAppRecipientProfileById(id);
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });
    }

    if (!canManageProfile({ currentUser, ownerId: existing.createdBy })) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : undefined;
    const userIds = Array.isArray(body?.userIds) ? (body.userIds as string[]) : undefined;

    if (name !== undefined && !name) {
      return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });
    }
    if (userIds !== undefined && userIds.length === 0) {
      return NextResponse.json({ success: false, message: 'userIds must not be empty' }, { status: 400 });
    }

    const profile = await updateWhatsAppRecipientProfile(id, {
      name: name ?? existing.name,
      userIds: userIds ?? existing.userIds,
    });

    return NextResponse.json({ success: true, profile, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating WhatsApp recipient profile:', error);
    return NextResponse.json({ success: false, message: 'Failed to update profile' }, { status: 500 });
  }
}

/**
 * DELETE /api/whatsapp/profiles/[id]
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const { id } = await params;

    // Only admin and coach can delete
    if (currentUser.role !== 'admin' && currentUser.role !== 'coach') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const existing = await getWhatsAppRecipientProfileById(id);
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });
    }

    if (!canManageProfile({ currentUser, ownerId: existing.createdBy })) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const success = await deleteWhatsAppRecipientProfile(id);
    if (!success) {
      return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting WhatsApp recipient profile:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete profile' }, { status: 500 });
  }
}
