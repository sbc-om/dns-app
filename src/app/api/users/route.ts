import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import { getAllUsers } from '@/lib/db/repositories/userRepository';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has permission (only admin and coach can fetch all users)
    if (currentUser.role !== 'admin' && currentUser.role !== 'coach') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: You do not have permission to view users' },
        { status: 403 }
      );
    }

    // Fetch all users
    const users = await getAllUsers();
    
    // Remove sensitive data
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profilePicture: user.profilePicture,
      isActive: user.isActive,
    }));

    return NextResponse.json(
      {
        success: true,
        users: sanitizedUsers,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching users:', error);
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
