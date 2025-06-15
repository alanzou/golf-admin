import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { withAuth } from '@/lib/auth-middleware';

// GET /api/golf-course/[courseId]/users - List users for a golf course
async function getUsersHandler(
  request: NextRequest,
  user: any,
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

    // Check if golf course exists
    const golfCourse = await prisma.golfCourse.findUnique({
      where: { id: golfCourseId }
    });

    if (!golfCourse) {
      return NextResponse.json(
        { error: 'Golf course not found' },
        { status: 404 }
      );
    }

    // Get users for this golf course
    const users = await prisma.user.findMany({
      where: { golfCourseId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      users,
      golfCourse: {
        id: golfCourse.id,
        name: golfCourse.name
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/golf-course/[courseId]/users - Create a new user for a golf course
async function createUserHandler(
  request: NextRequest,
  user: any,
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
    const { username, password, email, firstName, lastName, role } = body;

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check if golf course exists
    const golfCourse = await prisma.golfCourse.findUnique({
      where: { id: golfCourseId }
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
        golfCourseId
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists for this golf course' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email: email || '',
        firstName: firstName || '',
        lastName: lastName || '',
        role: role || 'STAFF',
        golfCourseId
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        GolfCourse: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      user: newUser
    });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Wrap handlers with authentication
export const GET = (request: NextRequest, context: any) => 
  withAuth((req, user) => getUsersHandler(req, user, context))(request);

export const POST = (request: NextRequest, context: any) => 
  withAuth((req, user) => createUserHandler(req, user, context))(request); 