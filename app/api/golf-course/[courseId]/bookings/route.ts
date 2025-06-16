import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyGolfCourseToken } from '@/lib/auth-middleware';

// GET /api/golf-course/[courseId]/bookings - Get bookings for a golf course
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
    const status = searchParams.get('status');

    // Build where clause
    const whereClause: any = {
      golfCourseId: courseId
    };

    // Filter by date if provided
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      whereClause.BookingDetail = {
        some: {
          teeTime: {
            gte: startDate,
            lt: endDate
          }
        }
      };
    }

    // Filter by status if provided
    if (status && status !== 'all') {
      whereClause.bookingStatus = status.toUpperCase();
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        BookingDetail: {
          orderBy: {
            teeTime: 'asc'
          }
        },
        BookingPayment: true
      },
      orderBy: [
        { 
          BookingDetail: {
            _count: 'desc' // This might not work as expected, we'll sort by createdAt instead
          }
        },
        { createdAt: 'desc' }
      ]
    });

    // If filtering by date, sort by tee time
    const sortedBookings = date 
      ? bookings.sort((a, b) => {
          const aTime = a.BookingDetail[0]?.teeTime || a.createdAt;
          const bTime = b.BookingDetail[0]?.teeTime || b.createdAt;
          return new Date(aTime).getTime() - new Date(bTime).getTime();
        })
      : bookings;

    return NextResponse.json({
      success: true,
      bookings: sortedBookings
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/golf-course/[courseId]/bookings - Create a new booking (for future use)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId: courseIdStr } = await params;
    const courseId = parseInt(courseIdStr);
    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      teeTime,
      numberOfPlayers,
      playerNames,
      holes,
      cart,
      playerType,
      rateType,
      subTotal,
      tax,
      total,
      specialRequests
    } = await request.json();

    // Validation
    if (!firstName || !lastName || !phone || !teeTime) {
      return NextResponse.json(
        { error: 'First name, last name, phone, and tee time are required' },
        { status: 400 }
      );
    }

    // Check if golf course exists
    const golfCourse = await prisma.golfCourse.findUnique({
      where: { id: courseId }
    });

    if (!golfCourse) {
      return NextResponse.json({ error: 'Golf course not found' }, { status: 404 });
    }

    // Generate unique booking UUID
    const { randomUUID } = await import('crypto');
    const bookingUUID = randomUUID();

    // Create booking with transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the main booking record
      const booking = await tx.booking.create({
        data: {
          bookingUUID,
          golfCourseId: courseId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email?.trim() || '',
          phone: phone.trim(),
          subTotal: subTotal || 0,
          tax: tax || 0,
          total: total || 0,
          bookingStatus: 'PENDING',
          integrationStatus: 'PENDING',
          notificationStatus: 'PENDING',
          updatedAt: new Date()
        }
      });

      // Create booking detail record
      const bookingDetail = await tx.bookingDetail.create({
        data: {
          bookingUUID,
          teeTime: new Date(teeTime),
          playerNames: playerNames?.trim() || '',
          numberOfPlayers: numberOfPlayers || 1,
          subTotal: subTotal || 0,
          tax: tax || 0,
          total: total || 0,
          cart: cart ?? true,
          holes: holes || 18,
          playerType: playerType || 'adult',
          rateType: rateType || 'cart'
        }
      });

      // Check if customer exists, if not create them
      let customer = await tx.customer.findFirst({
        where: {
          phone: phone.trim(),
          golfCourseId: courseId
        }
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone.trim(),
            email: email?.trim() || '',
            golfCourseId: courseId,
            updatedAt: new Date()
          }
        });
      } else {
        // Update existing customer with latest info
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email?.trim() || '',
            updatedAt: new Date()
          }
        });
      }

      return { booking, bookingDetail, customer };
    });

    // Return the created booking with details
    const completeBooking = await prisma.booking.findUnique({
      where: { bookingUUID },
      include: {
        BookingDetail: true,
        GolfCourse: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
            phone: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      booking: completeBooking,
      message: 'Booking created successfully'
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
} 