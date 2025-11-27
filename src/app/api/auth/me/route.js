import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// --- Use the same JWT Secret as in your login route ---
// IMPORTANT: Store this securely, e.g., in environment variables (.env.local)
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_VERY_SECRET_KEY_REPLACE_ME';
if (JWT_SECRET === 'YOUR_VERY_SECRET_KEY_REPLACE_ME' && process.env.NODE_ENV !== 'production') {
  console.warn('WARNING: Using default JWT_SECRET. Please set a strong secret in your environment variables.');
}

export async function GET(request) {
  // Get Cookie
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  // Token Check
  if (!token) {
    console.log('Auth check failed: No token found');
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    // Verify Token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Success: Return user data from token payload
    console.log('Auth check successful for user:', decoded.username, 'Role:', decoded.role);
    return NextResponse.json({
        id: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role // Crucial role included
    });

  } catch (error) {
    // Failure: Handle invalid token
    console.error('Auth check failed: Invalid token', error.message);
    // Optional: Clear the invalid cookie
    // cookieStore.delete('auth_token');
    return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
  }
}