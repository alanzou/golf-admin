import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth-middleware';

// GET /api/admin/devices - List all devices
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const devices = await prisma.device.findMany({
      include: {
        GolfCourse: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      devices
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}

// POST /api/admin/devices - Create new device
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, deviceType, deviceId, isActive, golfCourseId } = await request.json();

    if (!name || !deviceId || !golfCourseId) {
      return NextResponse.json(
        { error: 'Name, device ID, and golf course ID are required' },
        { status: 400 }
      );
    }

    // Check if device ID already exists
    const existingDevice = await prisma.device.findUnique({
      where: { deviceId }
    });

    if (existingDevice) {
      return NextResponse.json(
        { error: 'Device with this ID already exists' },
        { status: 409 }
      );
    }

    // Verify golf course exists
    const golfCourse = await prisma.golfCourse.findUnique({
      where: { id: golfCourseId }
    });

    if (!golfCourse) {
      return NextResponse.json(
        { error: 'Golf course not found' },
        { status: 404 }
      );
    }

    // Create device
    const device = await prisma.device.create({
      data: {
        name,
        deviceType: deviceType || 'android',
        deviceId,
        isActive: isActive !== undefined ? isActive : true,
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

    return NextResponse.json({
      success: true,
      device
    });
  } catch (error) {
    console.error('Error creating device:', error);
    return NextResponse.json(
      { error: 'Failed to create device' },
      { status: 500 }
    );
  }
} 