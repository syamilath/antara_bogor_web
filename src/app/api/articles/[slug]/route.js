import { query } from '../../../../lib/db'; // Adjusted path
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { slug } = params;

  try {
    // Fetch a single published article by slug
    const [article] = await query(`
      SELECT a.id, a.title, a.slug, a.content, a.image_url, a.created_at, -- Removed a.published_at
             c.name AS category_name, c.slug AS category_slug,
             u.username AS author_name, u.profile_photo AS author_profile_photo
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.slug = ? AND a.status = 'published'
    `, [slug]); // Pass slug as parameter

    if (!article) {
      return NextResponse.json({ error: 'Article not found or not published' }, { status: 404 });
    }

    // Fetch tags for the article
    const tags = await query('SELECT t.name FROM tags t JOIN article_tags at ON t.id = at.tag_id WHERE at.article_id = ?', [article.id]);
    article.tags = tags.map(tag => tag.name);

    return NextResponse.json(article);
  } catch (error) {
    console.error(`Failed to fetch article with slug ${slug}:`, error);
    // Log the specific SQL error if available
    console.error('Database query error details:', error.sqlMessage || error.message);
    return NextResponse.json({ error: 'Failed to fetch article', details: error.message }, { status: 500 });
  }
}