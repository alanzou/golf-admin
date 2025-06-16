import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyGolfCourseToken } from '@/lib/auth-middleware';

// GET /api/golf-course/[courseId]/checkin-orders - Get check-in orders for a golf course
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const paymentStatus = searchParams.get('paymentStatus');

    // Build where clause
    const whereClause: any = {
      golfCourseId: courseId
    };

    // Filter by date if provided (check created date)
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      whereClause.createdAt = {
        gte: startDate,
        lt: endDate
      };
    }

    // Filter by payment status if provided
    if (paymentStatus && paymentStatus !== 'all') {
      whereClause.paymentStatus = paymentStatus.toUpperCase();
    }

    const orders = await prisma.checkInOrder.findMany({
      where: whereClause,
      include: {
        CheckInOrderDetail: {
          orderBy: {
            teeTime: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      orders: orders
    });

  } catch (error) {
    console.error('Error fetching check-in orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch check-in orders' },
      { status: 500 }
    );
  }
} 