import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyGolfCourseToken } from '@/lib/auth-middleware';

// GET /api/golf-course/[courseId]/settings - Get golf course settings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId: courseIdStr } = await params;
    const courseId = parseInt(courseIdStr);
    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    // Verify golf course authentication
    const authResult = await verifyGolfCourseToken(request, courseId);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const golfCourse = await prisma.golfCourse.findUnique({
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

    if (!golfCourse) {
      return NextResponse.json({ error: 'Golf course not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      golfCourse
    });
  } catch (error) {
    console.error('Error fetching golf course settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch golf course settings' },
      { status: 500 }
    );
  }
}

// PUT /api/golf-course/[courseId]/settings - Update golf course settings
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId: courseIdStr } = await params;
    const courseId = parseInt(courseIdStr);
    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    // Verify golf course authentication
    const authResult = await verifyGolfCourseToken(request, courseId);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    // Check if user has permission to edit settings (MANAGER or OWNER)
    if (authResult.user && authResult.user.role !== 'MANAGER' && authResult.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
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
    console.error('Error updating golf course settings:', error);
    return NextResponse.json(
      { error: 'Failed to update golf course settings' },
      { status: 500 }
    );
  }
} 