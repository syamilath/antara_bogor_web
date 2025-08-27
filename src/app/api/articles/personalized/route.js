import { query } from '../../../../lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = parseInt(searchParams.get('offset')) || 0;

    let userId = null;
    let sessionId = null;

    // Check if user is logged in
    if (token && process.env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (error) {
        console.log('Invalid token, treating as guest');
      }
    }

    // Get or create session ID for tracking
    sessionId = cookieStore.get('session_id')?.value || generateSessionId();

    let articles;

    if (userId) {
      // Personalized algorithm for logged-in users
      articles = await getPersonalizedArticles(userId, limit, offset);
    } else {
      // Timestamp-based algorithm for guests
      articles = await getGuestArticles(limit, offset, sessionId);
    }

    // Set session ID cookie if not exists
    if (!cookieStore.get('session_id')) {
      const response = NextResponse.json(articles);
      response.cookies.set('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
      return response;
    }

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching personalized articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

async function getPersonalizedArticles(userId, limit, offset) {
  // Get user preferences
  const preferencesQuery = `
    SELECT up.category_id, up.preference_score, c.name as category_name, c.slug as category_slug
    FROM user_preferences up
    JOIN categories c ON up.category_id = c.id
    WHERE up.user_id = ?
    ORDER BY up.preference_score DESC
  `;
  const preferences = await query(preferencesQuery, [userId]);

  if (preferences.length === 0) {
    // New user, return recent articles and start building preferences
    return await getGuestArticles(limit, offset);
  }

  // Build weighted query based on preferences
  const categoryWeights = preferences.map(p => 
    `WHEN a.category_id = ${p.category_id} THEN ${p.preference_score}`
  ).join(' ');

  const personalizedQuery = `
    SELECT 
      a.id, a.title, a.slug, a.content, a.image_url, a.author_id, a.category_id, 
      a.status, a.created_at, a.updated_at, a.visits,
      u.username as author_name,
      c.name as category_name, c.slug as category_slug,
      CASE ${categoryWeights} ELSE 1.0 END as preference_weight,
      (CASE ${categoryWeights} ELSE 1.0 END * 
       (1 + LOG10(GREATEST(a.visits, 1))) * 
       (1 / (1 + DATEDIFF(NOW(), a.created_at) / 7))
      ) as recommendation_score
    FROM articles a
    LEFT JOIN users u ON a.author_id = u.id
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.status = 'published'
    ORDER BY recommendation_score DESC, a.created_at DESC
    LIMIT ? OFFSET ?
  `;

  return await query(personalizedQuery, [limit, offset]);
}

async function getGuestArticles(limit, offset, sessionId = null) {
  // Simple timestamp-based algorithm for guests
  const guestQuery = `
    SELECT 
      a.id, a.title, a.slug, a.content, a.image_url, a.author_id, a.category_id,
      a.status, a.created_at, a.updated_at, a.visits,
      u.username as author_name,
      c.name as category_name, c.slug as category_slug,
      (1 + LOG10(GREATEST(a.visits, 1))) as popularity_score
    FROM articles a
    LEFT JOIN users u ON a.author_id = u.id
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.status = 'published'
    ORDER BY a.created_at DESC, popularity_score DESC
    LIMIT ? OFFSET ?
  `;

  return await query(guestQuery, [limit, offset]);
}

function generateSessionId() {
  return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Track user interaction for algorithm improvement
export async function POST(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    const sessionId = cookieStore.get('session_id')?.value;
    const body = await request.json();
    
    const { articleId, categoryId, interactionType, timeSpent, readPercentage } = body;

    let userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (error) {
        console.log('Invalid token for interaction tracking');
      }
    }

    // Record interaction
    await query(
      `INSERT INTO user_interactions (user_id, session_id, article_id, category_id, interaction_type, time_spent) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, sessionId, articleId, categoryId, interactionType, timeSpent || 0]
    );

    // Record reading history if provided
    if (readPercentage !== undefined) {
      await query(
        `INSERT INTO user_reading_history (user_id, session_id, article_id, category_id, read_percentage, time_spent) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, sessionId, articleId, categoryId, readPercentage, timeSpent || 0]
      );
    }

    // Update user preferences if logged in
    if (userId) {
      await updateUserPreferences(userId, categoryId, interactionType, timeSpent, readPercentage);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking interaction:', error);
    return NextResponse.json({ error: 'Failed to track interaction' }, { status: 500 });
  }
}

async function updateUserPreferences(userId, categoryId, interactionType, timeSpent, readPercentage) {
  // Calculate preference score adjustment based on interaction
  let scoreAdjustment = 0;
  
  switch (interactionType) {
    case 'view':
      scoreAdjustment = 0.1;
      break;
    case 'click':
      scoreAdjustment = 0.3;
      break;
    case 'share':
      scoreAdjustment = 1.0;
      break;
    case 'like':
      scoreAdjustment = 0.8;
      break;
    case 'comment':
      scoreAdjustment = 1.2;
      break;
  }

  // Bonus for time spent and read percentage
  if (timeSpent > 30) scoreAdjustment += 0.2;
  if (timeSpent > 120) scoreAdjustment += 0.3;
  if (readPercentage > 50) scoreAdjustment += 0.4;
  if (readPercentage > 80) scoreAdjustment += 0.6;

  // Update or insert preference
  await query(
    `INSERT INTO user_preferences (user_id, category_id, preference_score) 
     VALUES (?, ?, ?) 
     ON DUPLICATE KEY UPDATE 
     preference_score = LEAST(10.0, preference_score + ?),
     last_updated = NOW()`,
    [userId, categoryId, scoreAdjustment, scoreAdjustment]
  );
}