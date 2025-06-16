import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { verifyToken } from '@/lib/auth-middleware';

// PUT /api/admin/users/[userId] - Update system user
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

    const { name, email, password, role, isActive } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.systemUser.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if name is taken by another user
    if (name !== existingUser.name) {
      const nameExists = await prisma.systemUser.findUnique({
        where: { name }
      });

      if (nameExists) {
        return NextResponse.json(
          { error: 'User with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      email: email || '',
      role: role || 'admin',
      isActive: isActive !== undefined ? isActive : true,
      updatedAt: new Date()
    };

    // Only update password if provided
    if (password) {
      updateData.password = await hashPassword(password);
    }

    // Update user
    const user = await prisma.systemUser.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error updating system user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[userId] - Delete system user
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
    const existingUser = await prisma.systemUser.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deleting the current user (basic safety check)
    if (authResult.user && authResult.user.id === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Delete user
    await prisma.systemUser.delete({
      where: { id: userId }
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting system user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 