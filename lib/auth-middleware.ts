import { NextRequest, NextResponse } from 'next/server';
import { verifyToken as verifyJwtToken } from './auth';
import { prisma } from './db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Add warning if JWT_SECRET is not set
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET environment variable is not set! Using fallback value. Please set JWT_SECRET in your .env.local file.');
}

export function withAuth(handler: (request: NextRequest, user: any) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      // Get token from Authorization header
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Authorization token required' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const user = verifyJwtToken(token);

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Call the original handler with the authenticated user
      return handler(request, user);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}

export async function verifyToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'No token provided' };
    }

    const token = authHeader.substring(7);
    
    // Add token validation
    if (!token || token.length < 10) {
      console.error('Token appears to be malformed or empty:', token);
      return { success: false, error: 'Malformed token' };
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Get system user from database
    const user = await prisma.systemUser.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return { success: false, error: 'Invalid or inactive user' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Token verification error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return { success: false, error: 'Invalid token format' };
    }
    if (error instanceof jwt.TokenExpiredError) {
      return { success: false, error: 'Token expired' };
    }
    return { success: false, error: 'Invalid token' };
  }
}

export async function verifyGolfCourseToken(request: NextRequest, expectedCourseId?: number) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'No token provided' };
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Get golf course user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        golfCourseId: true
      }
    });

    if (!user || !user.isActive) {
      return { success: false, error: 'Invalid or inactive user' };
    }

    // If expectedCourseId is provided, verify the user belongs to that course
    if (expectedCourseId && user.golfCourseId !== expectedCourseId) {
      return { success: false, error: 'User does not belong to this golf course' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Golf course token verification error:', error);
    return { success: false, error: 'Invalid token' };
  }
} 