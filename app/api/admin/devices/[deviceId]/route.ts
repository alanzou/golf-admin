import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth-middleware';

// PUT /api/admin/devices/[deviceId] - Update device
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deviceId: deviceIdStr } = await params;
    const deviceId = parseInt(deviceIdStr);
    if (isNaN(deviceId)) {
      return NextResponse.json({ error: 'Invalid device ID' }, { status: 400 });
    }

    const { name, deviceType, deviceId: newDeviceId, isActive, golfCourseId } = await request.json();

    if (!name || !newDeviceId || !golfCourseId) {
      return NextResponse.json(
        { error: 'Name, device ID, and golf course ID are required' },
        { status: 400 }
      );
    }

    // Check if device exists
    const existingDevice = await prisma.device.findUnique({
      where: { id: deviceId }
    });

    if (!existingDevice) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Check if new device ID conflicts with another device (if changed)
    if (newDeviceId !== existingDevice.deviceId) {
      const conflictingDevice = await prisma.device.findUnique({
        where: { deviceId: newDeviceId }
      });

      if (conflictingDevice) {
        return NextResponse.json(
          { error: 'Device with this ID already exists' },
          { status: 409 }
        );
      }
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

    // Update device
    const device = await prisma.device.update({
      where: { id: deviceId },
      data: {
        name,
        deviceType: deviceType || 'android',
        deviceId: newDeviceId,
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
    console.error('Error updating device:', error);
    return NextResponse.json(
      { error: 'Failed to update device' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/devices/[deviceId] - Delete device
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deviceId: deviceIdStr } = await params;
    const deviceId = parseInt(deviceIdStr);
    if (isNaN(deviceId)) {
      return NextResponse.json({ error: 'Invalid device ID' }, { status: 400 });
    }

    // Check if device exists
    const existingDevice = await prisma.device.findUnique({
      where: { id: deviceId }
    });

    if (!existingDevice) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Delete device
    await prisma.device.delete({
      where: { id: deviceId }
    });

    return NextResponse.json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting device:', error);
    return NextResponse.json(
      { error: 'Failed to delete device' },
      { status: 500 }
    );
  }
} 