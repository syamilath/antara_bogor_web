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

    const articleId = params.id;

    // Check if article exists
    const articleCheck = await query('SELECT id FROM articles WHERE id = ?', [articleId]);
    if (articleCheck.length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Delete related data first
    await query('DELETE FROM user_interactions WHERE article_id = ?', [articleId]);
    await query('DELETE FROM user_reading_history WHERE article_id = ?', [articleId]);
    await query('DELETE FROM page_views WHERE article_id = ?', [articleId]);

    // Delete the article
    await query('DELETE FROM articles WHERE id = ?', [articleId]);

    return NextResponse.json({ message: 'Article deleted successfully' });

  } catch (error) {
    console.error('Article deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}