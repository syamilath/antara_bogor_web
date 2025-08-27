// Simple in-memory rate limiter for admin access
const attempts = new Map();

export function checkRateLimit(ip, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const key = `${ip}`;
  
  if (!attempts.has(key)) {
    attempts.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }
  
  const record = attempts.get(key);
  
  // Reset if window expired
  if (now > record.resetTime) {
    attempts.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }
  
  // Check if limit exceeded
  if (record.count >= maxAttempts) {
    return { 
      allowed: false, 
      remaining: 0,
      resetTime: record.resetTime 
    };
  }
  
  // Increment count
  record.count++;
  return { 
    allowed: true, 
    remaining: maxAttempts - record.count 
  };
}

export function resetRateLimit(ip) {
  attempts.delete(ip);
}