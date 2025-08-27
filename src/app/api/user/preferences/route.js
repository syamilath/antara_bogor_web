import { query } from '../../../../lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Get user preferences
export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Get user preferences with category details
    const preferences = await query(`
      SELECT 
        up.category_id, 
        up.preference_score, 
        up.last_updated,
        c.name as category_name, 
        c.slug as category_slug
      FROM user_preferences up
      JOIN categories c ON up.category_id = c.id
      WHERE up.user_id = ?
      ORDER BY up.preference_score DESC
    `, [userId]);

    // Get user interaction stats
    const stats = await query(`
      SELECT 
        COUNT(*) as total_interactions,
        COUNT(DISTINCT category_id) as categories_interacted,
        AVG(time_spent) as avg_time_spent,
        MAX(created_at) as last_interaction
      FROM user_interactions 
      WHERE user_id = ?
    `, [userId]);

    return NextResponse.json({
      preferences,
      stats: stats[0] || {}
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

// Update user preferences manually
export async function POST(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const { preferences } = await request.json();

    // Update preferences
    for (const pref of preferences) {
      await query(`
        INSERT INTO user_preferences (user_id, category_id, preference_score) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
        preference_score = ?,
        last_updated = NOW()
      `, [userId, pref.categoryId, pref.score, pref.score]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}

// Reset user preferences
export async function DELETE() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const userId = decoded.userId;

    await query('DELETE FROM user_preferences WHERE user_id = ?', [userId]);
    await query('DELETE FROM user_interactions WHERE user_id = ?', [userId]);
    await query('DELETE FROM user_reading_history WHERE user_id = ?', [userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting user preferences:', error);
    return NextResponse.json({ error: 'Failed to reset preferences' }, { status: 500 });
  }
}