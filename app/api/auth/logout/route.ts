import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    // Verify the current token
    const authResult = await verifyToken(request);
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // In a production environment, you might want to:
    // 1. Add the token to a blacklist/revocation list
    // 2. Update user's last logout time in database
    // 3. Clear any server-side sessions
    // 4. Log the logout event for security auditing

    // For now, we'll just return success since JWT tokens are stateless
    // The client will remove the token from localStorage
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 