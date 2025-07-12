import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    // Get the cookie store
    const cookieStore = cookies();

    // Delete the authentication token cookie
    cookieStore.delete('auth_token');

    console.log('Logout successful: auth_token cookie cleared.');

    // Return a success response
    return NextResponse.json({ message: 'Logout successful' }, { status: 200 });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed', details: error.message }, { status: 500 });
  }
}