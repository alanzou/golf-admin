import { NextRequest, NextResponse } from 'next/server';
import { verifyGolfCourseToken } from '@/lib/auth-middleware';

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

    // Verify the current token
    const authResult = await verifyGolfCourseToken(request, courseId);
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // In a production environment, you might want to:
    // 1. Add the token to a blacklist/revocation list
    // 2. Update user's last logout time in database
    // 3. Clear any server-side sessions
    // 4. Log the logout event for security auditing
    // 5. Record logout activity for the golf course

    // For now, we'll just return success since JWT tokens are stateless
    // The client will remove the token from localStorage
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
      user: {
        id: authResult.user?.id,
        username: authResult.user?.username,
        golfCourseId: courseId
      }
    });

  } catch (error) {
    console.error('Golf course logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 