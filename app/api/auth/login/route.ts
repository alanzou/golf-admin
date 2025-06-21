import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';
import { authRateLimit, getClientIP, checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  
  try {
    // Temporarily disable rate limiting for debugging
    console.log('Rate limiting temporarily disabled for debugging');
    
    /* 
    // Check rate limit first
    const rateLimitResult = await checkRateLimit(authRateLimit, clientIP);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          retryAfter: rateLimitResult.reset.toISOString(),
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.getTime().toString(),
          },
        }
      );
    }
    */

    // Parse and validate request body
    const body = await request.json().catch(() => ({}));
    
    // Debug logging
    console.log('Login request body:', body);
    console.log('Body type:', typeof body);
    console.log('Body keys:', Object.keys(body || {}));
    
    // Simple validation - accept both 'name' and 'username' fields
    const username = body.username || body.name;
    const { password } = body;
    
    if (!username || !password) {
      console.log('Missing username or password:', { username: !!username, password: !!password });
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    if (typeof username !== 'string' || typeof password !== 'string') {
      console.log('Invalid types:', { usernameType: typeof username, passwordType: typeof password });
      return NextResponse.json(
        { error: 'Username and password must be strings' },
        { status: 400 }
      );
    }
    
    if (username.length === 0 || password.length === 0) {
      console.log('Empty values:', { usernameLength: username.length, passwordLength: password.length });
      return NextResponse.json(
        { error: 'Username and password cannot be empty' },
        { status: 400 }
      );
    }
    
    console.log('Basic validation passed:', { username, passwordLength: password.length });

    // Find system user
    const systemUser = await prisma.systemUser.findUnique({
      where: { name: username },
      select: {
        id: true,
        name: true,
        password: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!systemUser) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!systemUser.isActive) {
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, systemUser.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate JWT token
    const token = generateToken(systemUser.id, systemUser.name, systemUser.role);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: systemUser.id,
        name: systemUser.name,
        email: systemUser.email,
        role: systemUser.role,
      },
    });
  } catch (error) {
    // Log error securely (don't expose internal details)
    console.error('Login error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      clientIP,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 