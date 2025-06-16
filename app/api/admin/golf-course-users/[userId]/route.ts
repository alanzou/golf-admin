import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth-middleware';
import { hashPassword } from '@/lib/auth';

// PUT /api/admin/golf-course-users/[userId] - Update golf course user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId: userIdStr } = await params;
    const userId = parseInt(userIdStr);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
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

    if (!username || !golfCourseId) {
      return NextResponse.json(
        { error: 'Username and golf course are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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

    // Check if username already exists for this golf course (excluding current user)
    const duplicateUser = await prisma.user.findFirst({
      where: {
        username,
        golfCourseId: parseInt(golfCourseId),
        id: { not: userId }
      }
    });

    if (duplicateUser) {
      return NextResponse.json(
        { error: 'Username already exists for this golf course' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      username,
      email: email || '',
      firstName: firstName || '',
      lastName: lastName || '',
      role: role || 'STAFF',
      isActive: isActive ?? true,
      golfCourseId: parseInt(golfCourseId),
      updatedAt: new Date()
    };

    // Only update password if provided
    if (password) {
      updateData.password = await hashPassword(password);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
    console.error('Error updating golf course user:', error);
    return NextResponse.json(
      { error: 'Failed to update golf course user' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/golf-course-users/[userId] - Delete golf course user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId: userIdStr } = await params;
    const userId = parseInt(userIdStr);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        GolfCourse: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({
      success: true,
      message: 'Golf course user deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting golf course user:', error);
    return NextResponse.json(
      { error: 'Failed to delete golf course user' },
      { status: 500 }
    );
  }
} 