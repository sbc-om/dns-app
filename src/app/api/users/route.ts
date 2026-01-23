import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import {
  countUsers,
  getAllUsers,
  listUsersByIdsPage,
  listUsersPage,
} from '@/lib/db/repositories/userRepository';
import { ROLES } from '@/config/roles';
import { requireAcademyContext } from '@/lib/academies/academyContext';
import { listAcademyMembers } from '@/lib/db/repositories/academyMembershipRepository';

function sanitizeUsers(users: Array<{ [key: string]: any }>) {
  return users.map((user) => ({
    id: user.id,
    email: user.email,
    username: user.username,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    profilePicture: user.profilePicture,
    isActive: user.isActive,
  }));
}

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

    // Check if user has permission (admin, manager, coach)
    if (
      currentUser.role !== ROLES.ADMIN &&
      currentUser.role !== ROLES.MANAGER &&
      currentUser.role !== ROLES.COACH
    ) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: You do not have permission to view users' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const pageParam = url.searchParams.get('page');
    const pageSizeParam = url.searchParams.get('pageSize');
    const roleParam = url.searchParams.get('role');
    const searchParam = url.searchParams.get('search') || '';

    const page = pageParam ? Math.max(1, Number(pageParam) || 1) : null;
    const pageSize = pageSizeParam
      ? Math.min(100, Math.max(1, Number(pageSizeParam) || 25))
      : null;
    const offset = page && pageSize ? (page - 1) * pageSize : 0;

    const shouldPaginate = !!page || !!pageSize;
    const hasFilters = !!roleParam || !!searchParam;

    if (shouldPaginate) {
      if (currentUser.role === ROLES.MANAGER) {
        const ctx = await requireAcademyContext();
        const members = await listAcademyMembers(ctx.academyId);
        const ids = Array.from(new Set(members.map((m) => m.userId)));
        const allowedRoles = [ROLES.PARENT, ROLES.COACH, ROLES.PLAYER];

        const roleFilter = roleParam && allowedRoles.includes(roleParam as any)
          ? (roleParam as any)
          : undefined;

        const result = await listUsersByIdsPage(ids, {
          offset,
          limit: pageSize || 25,
          role: roleFilter,
          search: searchParam,
          allowedRoles,
        });

        return NextResponse.json(
          {
            success: true,
            users: sanitizeUsers(result.users),
            total: result.total,
            page: page || 1,
            pageSize: pageSize || 25,
          },
          { status: 200 }
        );
      }

      const roleFilter = roleParam ? (roleParam as any) : undefined;
      const [users, total] = await Promise.all([
        listUsersPage({
          offset,
          limit: pageSize || 25,
          role: roleFilter,
          search: searchParam,
        }),
        countUsers({ role: roleFilter, search: searchParam }),
      ]);

      return NextResponse.json(
        {
          success: true,
          users: sanitizeUsers(users),
          total,
          page: page || 1,
          pageSize: pageSize || 25,
        },
        { status: 200 }
      );
    }

    if (hasFilters) {
      if (currentUser.role === ROLES.MANAGER) {
        const ctx = await requireAcademyContext();
        const members = await listAcademyMembers(ctx.academyId);
        const ids = Array.from(new Set(members.map((m) => m.userId)));
        const allowedRoles = [ROLES.PARENT, ROLES.COACH, ROLES.PLAYER];
        const roleFilter = roleParam && allowedRoles.includes(roleParam as any)
          ? (roleParam as any)
          : undefined;
        const result = await listUsersByIdsPage(ids, {
          offset: 0,
          limit: Number.MAX_SAFE_INTEGER,
          role: roleFilter,
          search: searchParam,
          allowedRoles,
        });
        return NextResponse.json(
          {
            success: true,
            users: sanitizeUsers(result.users),
          },
          { status: 200 }
        );
      }

      const users = await listUsersPage({
        offset: 0,
        limit: Number.MAX_SAFE_INTEGER,
        role: roleParam ? (roleParam as any) : undefined,
        search: searchParam,
      });

      return NextResponse.json(
        {
          success: true,
          users: sanitizeUsers(users),
        },
        { status: 200 }
      );
    }

    // Fetch all users (legacy behavior)
    const users = await getAllUsers();
    const sanitizedUsers = sanitizeUsers(users);

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
