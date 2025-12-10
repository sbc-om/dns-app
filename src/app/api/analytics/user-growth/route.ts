import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import { getAllUsers } from '@/lib/db/repositories/userRepository';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all users
    const users = await getAllUsers();
    
    // Calculate user growth for last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    
    // Create a map for counting users per day
    const dailyCount: { [key: string]: number } = {};
    
    // Initialize all days with 0
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyCount[dateStr] = 0;
    }
    
    // Count users created on each day
    users.forEach(user => {
      if (user.createdAt) {
        const userDate = new Date(user.createdAt);
        const dateStr = userDate.toISOString().split('T')[0];
        
        if (dailyCount.hasOwnProperty(dateStr)) {
          dailyCount[dateStr]++;
        }
      }
    });
    
    // Calculate cumulative counts (total users up to each day)
    const data: { date: string; users: number }[] = [];
    let cumulativeCount = 0;
    
    // Count users created before the 30-day window
    const usersBeforeWindow = users.filter(user => {
      if (!user.createdAt) return false;
      return new Date(user.createdAt) < thirtyDaysAgo;
    }).length;
    
    cumulativeCount = usersBeforeWindow;
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Add new users for this day
      cumulativeCount += dailyCount[dateStr];
      
      data.push({
        date: dateStr,
        users: cumulativeCount,
      });
    }
    
    // Calculate statistics
    const totalUsers = users.length;
    const usersThirtyDaysAgo = data[0].users;
    const growthCount = totalUsers - usersThirtyDaysAgo;
    const growthRate = usersThirtyDaysAgo > 0 
      ? (growthCount / usersThirtyDaysAgo) * 100 
      : 0;
    
    return NextResponse.json({
      data,
      stats: {
        totalUsers,
        growthCount,
        growthRate: Math.round(growthRate * 10) / 10,
      },
    });
  } catch (error) {
    console.error('Error fetching user growth data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user growth data' },
      { status: 500 }
    );
  }
}
