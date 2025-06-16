import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth-middleware';

// PUT /api/admin/golf-courses/[courseId] - Update golf course
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId: courseIdStr } = await params;
    const courseId = parseInt(courseIdStr);
    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    const {
      name,
      address,
      city,
      state,
      zip,
      phone,
      website,
      taxRate,
      discountRate,
      leadDiscountRate
    } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Golf course name is required' },
        { status: 400 }
      );
    }

    // Check if golf course exists
    const existingCourse = await prisma.golfCourse.findUnique({
      where: { id: courseId }
    });

    if (!existingCourse) {
      return NextResponse.json({ error: 'Golf course not found' }, { status: 404 });
    }

    // Update golf course
    const golfCourse = await prisma.golfCourse.update({
      where: { id: courseId },
      data: {
        name,
        address: address || '',
        city: city || '',
        state: state || '',
        zip: zip || '',
        phone: phone || '',
        website: website || '',
        taxRate: taxRate || 0.06,
        discountRate: discountRate || 0.1,
        leadDiscountRate: leadDiscountRate || 0.3,
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: {
            User: true,
            Customer: true,
            Booking: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      golfCourse
    });
  } catch (error) {
    console.error('Error updating golf course:', error);
    return NextResponse.json(
      { error: 'Failed to update golf course' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/golf-courses/[courseId] - Delete golf course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId: courseIdStr } = await params;
    const courseId = parseInt(courseIdStr);
    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    // Check if golf course exists
    const existingCourse = await prisma.golfCourse.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: {
            User: true,
            Customer: true,
            Booking: true
          }
        }
      }
    });

    if (!existingCourse) {
      return NextResponse.json({ error: 'Golf course not found' }, { status: 404 });
    }

    // Delete golf course (this will cascade delete related records due to foreign key constraints)
    await prisma.golfCourse.delete({
      where: { id: courseId }
    });

    return NextResponse.json({
      success: true,
      message: 'Golf course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting golf course:', error);
    return NextResponse.json(
      { error: 'Failed to delete golf course' },
      { status: 500 }
    );
  }
} 