import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { query } from '../../../../lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_VERY_SECRET_KEY_REPLACE_ME';

export async function DELETE(request) {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user exists
    const users = await query('SELECT id, role FROM users WHERE id = ?', [decoded.userId]);
    
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];

    // Prevent admin users from deleting their accounts (optional security measure)
    if (user.role === 'admin') {
      return NextResponse.json({ error: 'Admin accounts cannot be deleted' }, { status: 403 });
    }

    // Delete user data (you might want to soft delete instead)
    // First, delete related data
    await query('DELETE FROM user_preferences WHERE user_id = ?', [decoded.userId]);
    await query('DELETE FROM user_interactions WHERE user_id = ?', [decoded.userId]);
    await query('DELETE FROM user_reading_history WHERE user_id = ?', [decoded.userId]);
    
    // Finally, delete the user
    await query('DELETE FROM users WHERE id = ?', [decoded.userId]);

    // Clear the authentication cookie
    const response = NextResponse.json({ message: 'Account deleted successfully' });
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
    });

    return response;

  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}