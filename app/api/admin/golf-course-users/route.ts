import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth-middleware';
import { hashPassword } from '@/lib/auth';

// GET /api/admin/golf-course-users - List all golf course users
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const golfCourseId = searchParams.get('golfCourseId');
    const search = searchParams.get('search');

    // Build where clause
    const whereClause: any = {};
    
    if (golfCourseId && golfCourseId !== 'all') {
      whereClause.golfCourseId = parseInt(golfCourseId);
    }

    if (search) {
      whereClause.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        GolfCourse: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true
          }
        }
      },
      orderBy: [
        { GolfCourse: { name: 'asc' } },
        { username: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching golf course users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch golf course users' },
      { status: 500 }
    );
  }
}

// POST /api/admin/golf-course-users - Create new golf course user
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      username,
      password,
      email,
      firstName,
      lastName,
      role,
      isActive,
      golfCourseId
    } = await request.json();

    if (!username || !password || !golfCourseId) {
      return NextResponse.json(
        { error: 'Username, password, and golf course are required' },
        { status: 400 }
      );
    }

    // Check if golf course exists
    const golfCourse = await prisma.golfCourse.findUnique({
      where: { id: parseInt(golfCourseId) }
    });

    if (!golfCourse) {
      return NextResponse.json(
        { error: 'Golf course not found' },
        { status: 404 }
      );
    }

    // Check if username already exists for this golf course
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        golfCourseId: parseInt(golfCourseId)
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists for this golf course' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email: email || '',
        firstName: firstName || '',
        lastName: lastName || '',
        role: role || 'STAFF',
        isActive: isActive ?? true,
        golfCourseId: parseInt(golfCourseId),
        updatedAt: new Date()
      },
      include: {
        GolfCourse: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error creating golf course user:', error);
    return NextResponse.json(
      { error: 'Failed to create golf course user' },
      { status: 500 }
    );
  }
} 