import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth';
import {
  getWhatsAppGroupById,
  updateWhatsAppGroup,
  deleteWhatsAppGroup,
  addMembersToWhatsAppGroup,
  removeMembersFromWhatsAppGroup,
} from '@/lib/db/repositories/whatsappGroupRepository';
import { getUsersByIds } from '@/lib/db/repositories/userRepository';

/**
 * GET /api/whatsapp/groups/[id]
 * Get a specific WhatsApp group
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const { id } = await params;
    
    // Only admin and coach can access
    if (currentUser.role !== 'admin' && currentUser.role !== 'coach') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const group = await getWhatsAppGroupById(id);
    
    if (!group) {
      return NextResponse.json(
        { success: false, message: 'Group not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      group,
    });
  } catch (error) {
    console.error('Error getting WhatsApp group:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get group' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/whatsapp/groups/[id]
 * Update a WhatsApp group
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
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { name, nameAr, description, descriptionAr, memberIds } = body;
    
    // If memberIds are updated, extract new phone numbers
    let phoneNumbers: string[] | undefined;
    if (memberIds && Array.isArray(memberIds)) {
      phoneNumbers = [];
      const users = await getUsersByIds(memberIds);
      for (const user of users) {
        if (user && user.phoneNumber) {
          phoneNumbers.push(user.phoneNumber);
        }
      }
    }
    
    const group = await updateWhatsAppGroup(id, {
      name,
      nameAr,
      description,
      descriptionAr,
      memberIds,
      phoneNumbers,
    });
    
    if (!group) {
      return NextResponse.json(
        { success: false, message: 'Group not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      group,
      message: 'Group updated successfully',
    });
  } catch (error) {
    console.error('Error updating WhatsApp group:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update group' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/whatsapp/groups/[id]
 * Delete a WhatsApp group
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const { id } = await params;
    
    // Only admin can delete
    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const success = await deleteWhatsAppGroup(id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Group not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Group deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting WhatsApp group:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete group' },
      { status: 500 }
    );
  }
}
