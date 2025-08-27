import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_VERY_SECRET_KEY_REPLACE_ME';
if (JWT_SECRET === 'YOUR_VERY_SECRET_KEY_REPLACE_ME') {
  console.warn('WARNING: Using default JWT_SECRET. Please set a strong secret in your environment variables.');
}

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    console.log(`Login attempt for username: ${username}`);

    // --- Database Authentication Logic ---
    const users = await query('SELECT id, username, email, password_hash, role FROM users WHERE username = ?', [username]);

    if (users.length === 0) {
      console.log(`Login failed: No user found for username ${username}`);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      console.log(`Login failed: Password mismatch for username ${username}`);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const userRole = user.role;
    console.log(`Login successful for user: ${user.username} (ID: ${user.id}), Assigned Role: ${userRole}`);

    const tokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: userRole,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return NextResponse.json({
      message: 'Login successful',
      role: userRole,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
