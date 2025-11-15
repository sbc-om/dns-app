import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { findUserById } from '../db/repositories/userRepository';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-in-production'
);

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  phoneNumber?: string;
  groupIds: string[];
  directPermissions: string[];
}

/**
 * Get the current authenticated user from the cookie
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return null;
    }

    // Verify JWT
    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    
    if (!payload.userId || typeof payload.userId !== 'string') {
      return null;
    }

    // Get user from database
    const user = await findUserById(payload.userId);
    
    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      groupIds: user.groupIds,
      directPermissions: user.directPermissions,
    };

  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}
