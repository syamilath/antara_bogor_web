import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db'; // Adjust path as needed
import bcrypt from 'bcrypt'; // Install bcrypt: npm install bcrypt

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Username, email, and password are required' }, { status: 400 });
    }

    // --- !!! Placeholder Signup Logic !!! --- // <-- Removed placeholder comment
    // Replace this with actual database insertion and password hashing // <-- Removed placeholder comment
    console.log(`Signup attempt for username: ${username}, email: ${email}`);

    // 1. Check if user already exists (by email or username)
    const existingUser = await query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]); // <-- Uncommented
    if (existingUser.length > 0) { // <-- Uncommented
      return NextResponse.json({ error: 'Email or username already exists' }, { status: 409 }); // Conflict // <-- Uncommented
    } // <-- Uncommented

    // 2. Hash the password
    const saltRounds = 10; // <-- Uncommented
    const hashedPassword = await bcrypt.hash(password, saltRounds); // <-- Uncommented

    // 3. Insert the new user into the database
    //    Removed 'role' column from insert to match your table schema
    const result = await query( // <-- Uncommented
      'INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, NOW())', // <-- Modified query (removed role)
      [username, email, hashedPassword] // <-- Modified values (removed 'user' role)
    ); // <-- Uncommented

    if (result.affectedRows === 1) { // <-- Uncommented
      console.log(`User created with ID: ${result.insertId}`); // <-- Uncommented
      return NextResponse.json({ message: 'User created successfully', userId: result.insertId }, { status: 201 }); // <-- Uncommented
    } else { // <-- Uncommented
      throw new Error('Failed to insert user into database'); // <-- Uncommented
    } // <-- Uncommented

    // --- Hardcoded Success Example (REMOVE IN PRODUCTION) --- // <-- Removed placeholder block
    //  console.log('Placeholder: User creation successful');
    //  return NextResponse.json({ message: 'User created successfully (placeholder)' }, { status: 201 });
    // --- End Hardcoded Example ---

    // --- End Placeholder --- // <-- Removed placeholder comment

  } catch (error) {
    console.error('Signup API error:', error);
    // Handle specific errors like duplicate entry if needed
    if (error.code === 'ER_DUP_ENTRY') { // <-- Keep duplicate entry check
       return NextResponse.json({ error: 'Email or username already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error during signup' }, { status: 500 });
  }
}