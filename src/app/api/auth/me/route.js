import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { query } from '../../../../lib/db';

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
    console.log('Token decoded successfully for user ID:', decoded.userId);

    // Fetch complete user data from database
    const users = await query(
      'SELECT id, username, email, profile_photo, role, created_at FROM users WHERE id = ?',
      [decoded.userId]
    ).catch(async (error) => {
      // If the query fails (likely due to missing columns), try with basic fields only
      console.log('Full query failed, trying basic fields:', error.message);
      return await query(
        'SELECT id, username, email, profile_photo, created_at FROM users WHERE id = ?',
        [decoded.userId]
      );
    });

    if (users.length === 0) {
      console.log('User not found in database for ID:', decoded.userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];

    // Success: Return user data (with fallbacks for missing fields)
    console.log('Auth check successful for user:', user.username, 'Role:', user.role || 'user');
    return NextResponse.json({
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.username, // Use username as full_name since full_name column doesn't exist
        bio: null, // bio column doesn't exist
        profile_picture: user.profile_photo || null,
        role: user.role || 'user',
        created_at: user.created_at,
        updated_at: user.created_at // Use created_at since updated_at doesn't exist
    });

  } catch (error) {
    // Failure: Handle invalid token or database error
    console.error('Auth check failed:', error.message);
    if (error.name === 'TokenExpiredError') {
      console.log('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      console.log('Invalid token format');
    }
    return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
  }
}