import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { verifyToken } from '@/lib/auth-middleware';

// GET /api/admin/users - List all system users
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.systemUser.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching system users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new system user
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, password, role, isActive } = await request.json();

    if (!name || !password) {
      return NextResponse.json(
        { error: 'Name and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.systemUser.findUnique({
      where: { name }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this name already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.systemUser.create({
      data: {
        name,
        email: email || '',
        password: hashedPassword,
        role: role || 'admin',
        isActive: isActive !== undefined ? isActive : true
      },
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
    console.error('Error creating system user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 