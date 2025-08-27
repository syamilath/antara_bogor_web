import { query } from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  console.log("Attempting to fetch public categories..."); // Keep this log
  try {
    // Fetch all categories (including those with no articles)
    const sql = `
      SELECT c.id, c.name, c.slug, COUNT(a.id) AS article_count
      FROM categories c
      LEFT JOIN articles a ON a.category_id = c.id AND a.status = 'published'
      GROUP BY c.id, c.name, c.slug
      ORDER BY c.name
    `;
    console.log("Executing SQL:", sql); // Keep this log
    const categories = await query(sql);
    console.log(`Successfully fetched ${categories.length} public categories.`); // Keep this log

    return NextResponse.json(categories);
  } catch (error) {
    // This catch block might also be triggered
    console.error('Failed to fetch public categories:', error); // Keep this log
    // Add more detail to the error response
    return NextResponse.json({ error: 'Failed to fetch categories', details: error.message }, { status: 500 });
  }
}
