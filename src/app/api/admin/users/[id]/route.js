import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { query } from '../../../../../lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function DELETE(request, { params }) {
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

    // Check if user is admin
    const adminCheck = await query('SELECT role FROM users WHERE id = ?', [decoded.userId]);
    if (adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const userId = params.id;

    // Check if user exists and is not an admin
    const userToDelete = await query('SELECT id, role FROM users WHERE id = ?', [userId]);
    if (userToDelete.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (userToDelete[0].role === 'admin') {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 403 });
    }

    // Delete related data first
    await query('DELETE FROM user_preferences WHERE user_id = ?', [userId]);
    await query('DELETE FROM user_interactions WHERE user_id = ?', [userId]);
    await query('DELETE FROM user_reading_history WHERE user_id = ?', [userId]);
    await query('DELETE FROM page_views WHERE user_id = ?', [userId]);

    // Delete the user
    await query('DELETE FROM users WHERE id = ?', [userId]);

    return NextResponse.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('User deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}