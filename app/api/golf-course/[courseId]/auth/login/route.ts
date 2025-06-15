import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const golfCourseId = parseInt(courseId);

    if (isNaN(golfCourseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check if golf course exists
    const golfCourse = await prisma.golfCourse.findUnique({
      where: { id: golfCourseId },
      select: {
        id: true,
        name: true
      }
    });

    if (!golfCourse) {
      return NextResponse.json(
        { error: 'Golf course not found' },
        { status: 404 }
      );
    }

    // Find user by username and golf course
    const user = await prisma.user.findFirst({
      where: {
        username,
        golfCourseId
      },
      include: {
        GolfCourse: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token with golf course context
    const token = generateToken(user.id, user.username, `${user.role}:${golfCourseId}`);

    // Return success response with token
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        golfCourse: user.GolfCourse
      }
    });

  } catch (error) {
    console.error('Golf course login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 