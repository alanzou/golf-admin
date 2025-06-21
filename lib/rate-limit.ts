import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';

// Create rate limiters for different endpoints
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 minutes
  analytics: true,
});

export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true,
});

export const strictRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute for sensitive operations
  analytics: true,
});

// Helper function to get client IP for rate limiting
export function getClientIP(request: Request): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to connection remote address
  return 'unknown';
}

// Rate limit checker function
export async function checkRateLimit(
  rateLimit: Ratelimit,
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> {
  const { success, limit, remaining, reset } = await rateLimit.limit(identifier);
  
  return {
    success,
    limit,
    remaining,
    reset: new Date(reset),
  };
} 