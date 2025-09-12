import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

// Simple in-memory cache for rate limiting
const ratelimitCache = new Map<string, { count: number; timestamp: number }>();

export async function rateLimit(
  req: NextRequest,
  identifier: string = 'global'
) {
  // Get the IP address from the request
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  // Use the IP address and any custom identifier to create a unique key
  const key = `${ip}-${identifier}`;
  
  // Get the current time
  const now = Date.now();
  
  // Get the current count and timestamp for this key
  const currentCount = ratelimitCache.get(key);
  
  // If no current count or the timestamp is older than the rate limit duration, reset
  if (!currentCount || (now - currentCount.timestamp) > env.RATE_LIMIT_DURATION * 1000) {
    ratelimitCache.set(key, { count: 1, timestamp: now });
    return { success: true, remaining: env.RATE_LIMIT_REQUESTS - 1 };
  }
  
  // If the count is less than the limit, increment and continue
  if (currentCount.count < env.RATE_LIMIT_REQUESTS) {
    ratelimitCache.set(key, { count: currentCount.count + 1, timestamp: currentCount.timestamp });
    return { success: true, remaining: env.RATE_LIMIT_REQUESTS - (currentCount.count + 1) };
  }
  
  // Otherwise, rate limit exceeded
  return { success: false, remaining: 0, reset: new Date(currentCount.timestamp + env.RATE_LIMIT_DURATION * 1000) };
}

export function rateLimitResponse() {
  return NextResponse.json(
    { error: 'Rate limit exceeded. Please try again later.' },
    { status: 429, headers: { 'Retry-After': env.RATE_LIMIT_DURATION.toString() } }
  );
}
