import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { withAuth } from '@/lib/auth-middleware';

// GET /api/golf-course/[courseId]/users/[userId] - Get a specific user
async function getUserHandler(
  request: NextRequest,
  user: any,
  { params }: { params: Promise<{ courseId: string; userId: string }> }
) {
  try {
    const { courseId, userId } = await params;
    const golfCourseId = parseInt(courseId);
    const userIdInt = parseInt(userId);

    if (isNaN(golfCourseId) || isNaN(userIdInt)) {
      return NextResponse.json(
        { error: 'Invalid course ID or user ID' },
        { status: 400 }
      );
    }

    // Get user for this golf course
    const courseUser = await prisma.user.findFirst({
      where: {
        id: userIdInt,
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
        updatedAt: true,
        GolfCourse: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!courseUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: courseUser
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/golf-course/[courseId]/users/[userId] - Update a user
async function updateUserHandler(
  request: NextRequest,
  user: any,
  { params }: { params: Promise<{ courseId: string; userId: string }> }
) {
  try {
    const { courseId, userId } = await params;
    const golfCourseId = parseInt(courseId);
    const userIdInt = parseInt(userId);

    if (isNaN(golfCourseId) || isNaN(userIdInt)) {
      return NextResponse.json(
        { error: 'Invalid course ID or user ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { username, password, email, firstName, lastName, role, isActive } = body;

    // Check if user exists for this golf course
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userIdInt,
        golfCourseId
      }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If username is being changed, check for conflicts
    if (username && username !== existingUser.username) {
      const usernameConflict = await prisma.user.findFirst({
        where: {
          username,
          golfCourseId,
          id: { not: userIdInt }
        }
      });

      if (usernameConflict) {
        return NextResponse.json(
          { error: 'Username already exists for this golf course' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Hash password if provided
    if (password) {
      updateData.password = await hashPassword(password);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userIdInt },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
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
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/golf-course/[courseId]/users/[userId] - Delete a user
async function deleteUserHandler(
  request: NextRequest,
  user: any,
  { params }: { params: Promise<{ courseId: string; userId: string }> }
) {
  try {
    const { courseId, userId } = await params;
    const golfCourseId = parseInt(courseId);
    const userIdInt = parseInt(userId);

    if (isNaN(golfCourseId) || isNaN(userIdInt)) {
      return NextResponse.json(
        { error: 'Invalid course ID or user ID' },
        { status: 400 }
      );
    }

    // Check if user exists for this golf course
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userIdInt,
        golfCourseId
      }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userIdInt }
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Wrap handlers with authentication
export const GET = (request: NextRequest, context: any) => 
  withAuth((req, user) => getUserHandler(req, user, context))(request);

export const PUT = (request: NextRequest, context: any) => 
  withAuth((req, user) => updateUserHandler(req, user, context))(request);

export const DELETE = (request: NextRequest, context: any) => 
  withAuth((req, user) => deleteUserHandler(req, user, context))(request); 