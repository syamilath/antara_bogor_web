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

export async function incrementVisitCount(slug) {
  console.log('Incrementing visits for:', slug);
  // This will increment the visits column by 1 for the article with the given slug
  await query('UPDATE articles SET visits = visits + 1 WHERE slug = ?', [slug]);
}