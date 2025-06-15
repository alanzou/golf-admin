import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { verifyToken } from '@/lib/auth-middleware';

const prisma = new PrismaClient();

// GET /api/admin/golf-courses - List all golf courses
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const golfCourses = await prisma.golfCourse.findMany({
      include: {
        _count: {
          select: {
            User: true,
            Customer: true,
            Booking: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      golfCourses
    });
  } catch (error) {
    console.error('Error fetching golf courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch golf courses' },
      { status: 500 }
    );
  }
}

// POST /api/admin/golf-courses - Create new golf course
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Create golf course
    const golfCourse = await prisma.golfCourse.create({
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
    console.error('Error creating golf course:', error);
    return NextResponse.json(
      { error: 'Failed to create golf course' },
      { status: 500 }
    );
  }
} 