import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { query } from '../../../../lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_VERY_SECRET_KEY_REPLACE_ME';

export async function POST(request) {
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
      console.log('Token verified successfully for user ID:', decoded.userId);
    } catch (error) {
      console.error('Token verification failed:', error.message);
      console.error('Token:', token?.substring(0, 20) + '...');
      console.error('JWT_SECRET being used:', JWT_SECRET?.substring(0, 10) + '...');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const username = formData.get('username');
    const email = formData.get('email');
    const fullName = formData.get('full_name');
    const bio = formData.get('bio');
    const profilePicture = formData.get('profile_picture');

    // Validate required fields
    if (!username || !email) {
      return NextResponse.json({ error: 'Username and email are required' }, { status: 400 });
    }

    // Check if username or email already exists (excluding current user)
    const existingUser = await query(
      'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
      [username, email, decoded.userId]
    );

    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Username or email already exists' }, { status: 400 });
    }

    let profilePicturePath = null;

    // Handle profile picture upload
    if (profilePicture && profilePicture.size > 0) {
      const bytes = await profilePicture.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }

      // Generate unique filename
      const fileExtension = profilePicture.name.split('.').pop();
      const fileName = `${decoded.userId}-${Date.now()}.${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);

      // Write file
      await writeFile(filePath, buffer);
      profilePicturePath = `/uploads/profiles/${fileName}`;
    }

    // Update user in database
    const updateFields = [];
    const updateValues = [];

    updateFields.push('username = ?', 'email = ?');
    updateValues.push(username, email);

    // Skip full_name and bio updates since these columns don't exist
    // if (fullName !== null) {
    //   updateFields.push('full_name = ?');
    //   updateValues.push(fullName);
    // }

    // if (bio !== null) {
    //   updateFields.push('bio = ?');
    //   updateValues.push(bio);
    // }

    if (profilePicturePath) {
      updateFields.push('profile_photo = ?');
      updateValues.push(profilePicturePath);
    }

    // Skip updated_at since column doesn't exist
    // updateFields.push('updated_at = NOW()');
    updateValues.push(decoded.userId);

    await query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated user data
    const updatedUser = await query(
      'SELECT id, username, email, profile_photo, role, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (updatedUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser[0]
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}