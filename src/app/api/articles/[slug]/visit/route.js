// src/app/api/articles/[slug]/visit/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { incrementVisitCount } from '@/lib/db';

// Generate or get a unique session ID for the visitor
function getSessionId() {
  const cookieStore = cookies();
  let sessionId = cookieStore.get('session_id')?.value;
  
  // If no session ID exists, create one
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    // Set the session cookie to expire in 7 days
    cookieStore.set('session_id', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  }
  
  return sessionId;
}

export async function POST(request, { params }) {
    const { slug } = params;
    const sessionId = getSessionId();
    
    // Get the user ID if the user is logged in
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    let userId = null;
    
    if (token) {
        try {
            const jwt = (await import('jsonwebtoken')).default;
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'YOUR_VERY_SECRET_KEY_REPLACE_ME');
            userId = decoded.userId;
        } catch (error) {
            console.error('Error decoding auth token:', error);
            // Continue without user ID if token is invalid
        }
    }
    
    try {
        // Get the full URL path from the referrer or use a default
        const referer = request.headers.get('referer');
        const path = referer ? new URL(referer).pathname : `/article/${slug}`;
        
        // Track the visit with session and user information
        await incrementVisitCount(slug, sessionId, userId, path);
        
        return NextResponse.json({ 
            success: true,
            sessionId: sessionId,
            isNewVisitor: true // This would be determined by the incrementVisitCount function
        });
    } catch (error) {
        console.error('Error tracking visit:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}