import mysql from 'mysql2/promise';

// Create a connection pool
export const pool = mysql.createPool({ // Add export here
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'antara_bogor',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query(sql, values) {
  try {
    const [results] = await pool.execute(sql, values);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function incrementVisitCount(slug, sessionId, userId = null, path) {
  console.log('Tracking visit for article:', { slug, sessionId, userId, path });

  // Get a connection from the pool for transaction
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Get the article ID from the slug
    const [articles] = await connection.execute(
      'SELECT id FROM articles WHERE slug = ?',
      [slug]
    );

    if (articles.length === 0) {
      throw new Error('Article not found');
    }

    const articleId = articles[0].id;

    // 2. Check if this is a unique page view for this session
    const [existingView] = await connection.execute(
      'SELECT id FROM page_views WHERE session_id = ? AND article_id = ?',
      [sessionId, articleId]
    );

    // 3. Only insert a new page view if this session hasn't viewed this article yet
    if (existingView.length === 0) {
      await connection.execute(
        'INSERT INTO page_views (session_id, user_id, article_id, path) VALUES (?, ?, ?, ?)',
        [sessionId, userId, articleId, path || `/article/${slug}`]
      );

      // 4. Update the visits counter in the articles table
      await connection.execute(
        'UPDATE articles SET visits = COALESCE(visits, 0) + 1 WHERE id = ?',
        [articleId]
      );

      console.log('New page view recorded for article ID:', articleId);
    } else {
      console.log('Session already viewed this article, not counting as a new visit');
    }

    await connection.commit();
    return { success: true, articleId };
  } catch (error) {
    await connection.rollback();
    console.error('Error tracking page view:', error);
    throw error;
  } finally {
    connection.release();
  }
}