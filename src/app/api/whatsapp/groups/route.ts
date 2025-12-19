import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth';
import {
  getAllWhatsAppGroups,
  getWhatsAppGroupsByAcademy,
  getWhatsAppGroupById,
  createWhatsAppGroup,
  updateWhatsAppGroup,
  deleteWhatsAppGroup,
} from '@/lib/db/repositories/whatsappGroupRepository';
import { getUsersByIds } from '@/lib/db/repositories/userRepository';
import { requireAcademyContext } from '@/lib/academies/academyContext';

/**
 * GET /api/whatsapp/groups
 * Get all WhatsApp groups (filtered by academy)
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    
    // Get academy context
    const ctx = await requireAcademyContext();
    
    // Only admin and coach can access
    if (currentUser.role !== 'admin' && currentUser.role !== 'coach') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Get groups filtered by academy
    const groups = await getWhatsAppGroupsByAcademy(ctx.academyId);
    
    return NextResponse.json({
      success: true,
      groups,
    });
  } catch (error) {
    console.error('Error getting WhatsApp groups:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get groups' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/whatsapp/groups
 * Create a new WhatsApp group
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    
    // Get academy context
    const ctx = await requireAcademyContext();
    
    // Only admin and coach can create groups
    if (currentUser.role !== 'admin' && currentUser.role !== 'coach') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { name, nameAr, description, descriptionAr, memberIds } = body;
    
    if (!name || !memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Name and members are required' },
        { status: 400 }
      );
    }
    
    // Extract phone numbers from member IDs
    const users = await getUsersByIds(memberIds);
    const phoneNumbers: string[] = [];
    for (const user of users) {
      if (user && user.phoneNumber) {
        phoneNumbers.push(user.phoneNumber);
      }
    }
    
    const group = await createWhatsAppGroup({
      name,
      nameAr,
      description,
      descriptionAr,
      memberIds,
      phoneNumbers,
      createdBy: currentUser.id,
      academyId: ctx.academyId,
    });
    
    return NextResponse.json({
      success: true,
      group,
      message: 'Group created successfully',
    });
  } catch (error) {
    console.error('Error creating WhatsApp group:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create group' },
      { status: 500 }
    );
  }
}
