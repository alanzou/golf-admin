import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyGolfCourseToken } from '@/lib/auth-middleware';

// GET /api/golf-course/[courseId]/tee-time-sheet - Get tee time sheet for a golf course
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    // Build where clause
    const whereClause: any = {
      golfCourseId: courseId
    };

    // Filter by date if provided
    if (date) {
      const targetDate = new Date(date);
      whereClause.date = targetDate;
    }

    const teeTimeSlots = await prisma.checkin_tee_time_sheet.findMany({
      where: whereClause,
      orderBy: {
        tee_time: 'asc'
      }
    });

    // Transform the data to include formatted time
    const transformedSlots = teeTimeSlots.map(slot => ({
      ...slot,
      date: slot.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      tee_time: slot.tee_time.toISOString().substring(11, 19) // Format time as HH:MM:SS
    }));

    return NextResponse.json({
      success: true,
      slots: transformedSlots
    });

  } catch (error) {
    console.error('Error fetching tee time sheet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tee time sheet' },
      { status: 500 }
    );
  }
} 