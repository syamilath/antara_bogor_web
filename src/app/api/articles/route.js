
import { query } from '../../../lib/db';
import { NextResponse } from 'next/server';

// Modified GET function to accept request and handle query parameters
export async function GET(request) {
  // Extract search parameters from the request URL
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get('category'); // Get 'category' query parameter
  const searchQuery = searchParams.get('q'); // Get 'q' search parameter

  console.log(`Attempting to fetch public articles... Category: ${categorySlug || 'All'}`); // Updated log

  try {
    let sql = `
      SELECT a.id, a.title, a.slug, a.content, a.image_url, a.created_at,
             c.name AS category_name, c.slug AS category_slug,
             u.username AS author_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.status = 'published'
    `;
    const params = []; // Initialize parameters array for the query

    // Add category filtering if categorySlug is provided
    if (categorySlug) {
      sql += ` AND c.slug = ?`;
      params.push(categorySlug);
      console.log(`Filtering by category slug: ${categorySlug}`); // Log category filter
    }

    // Add search query filtering
    if (searchQuery) {
      sql += ` AND (
        a.title LIKE ?
        OR JSON_SEARCH(a.keywords, 'one', ?) IS NOT NULL
        OR a.id IN (
          SELECT at.article_id FROM article_tags at
          JOIN tags t ON at.tag_id = t.id
          WHERE t.name LIKE ?
        )
      )`;
      params.push(`%${searchQuery}%`, searchQuery, `%${searchQuery}%`);
      console.log(`Filtering by search query: ${searchQuery}`); // Log search query filter
    }

    // Add tag filtering if tagSlug is provided (Example structure)
    // if (tagSlug) {
    //   sql += ` AND a.id IN (SELECT at.article_id FROM article_tags at JOIN tags t ON at.tag_id = t.id WHERE t.slug = ?)`;
    //   params.push(tagSlug);
    //   console.log(`Filtering by tag slug: ${tagSlug}`);
    // }

    sql += ` ORDER BY a.created_at DESC LIMIT 20`; // Keep ordering and limit

    console.log("Executing SQL:", sql, "with params:", params); // Log SQL and params
    const articles = await query(sql, params); // Pass params to the query function
    console.log(`Successfully fetched ${articles.length} public articles.`); // Keep this log

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Failed to fetch public articles:', error); // Keep this log
    return NextResponse.json({ error: 'Failed to fetch articles', details: error.message }, { status: 500 });
  }
}
