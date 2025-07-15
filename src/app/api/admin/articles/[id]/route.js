import { NextResponse } from 'next/server';
import { query, pool } from '../../../../../lib/db'; // Ensure pool is imported
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import slugify from 'slugify';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// --- JWT Secret (should match your auth routes) ---
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_VERY_SECRET_KEY_REPLACE_ME';

// --- Helper function to verify admin ---
async function verifyAdmin(request) {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded.role === 'admin' ? decoded : null;
    } catch (error) {
        console.error('Admin verification failed:', error.message);
        return null;
    }
}

// --- GET: Fetch a single article for editing (Optional, but good practice) ---
export async function GET(request, { params }) {
    const adminUser = await verifyAdmin(request);
    if (!adminUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    try {
        const [article] = await query('SELECT * FROM articles WHERE id = ?', [id]);
        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }
        // Fetch tags for this article (many-to-many join)
        const tagRows = await query(
          `SELECT t.name FROM tags t
           JOIN article_tags at ON t.id = at.tag_id
           WHERE at.article_id = ?`,
          [id]
        );
        article.tags = tagRows.map(t => t.name);
        // Parse tags if stored as JSON (legacy)
        // try {
        //     article.tags = JSON.parse(article.tags || '[]');
        // } catch (e) {
        //     article.tags = []; // Default to empty array if parsing fails
        // }
        return NextResponse.json(article);
    } catch (error) {
        console.error(`Failed to fetch article ${id}:`, error);
        return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
    }
}


// --- PUT: Update an existing article ---
export async function PUT(request, { params }) {
    const adminUser = await verifyAdmin(request);
    if (!adminUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: articleId } = params; // Use articleId consistently

    let connection; // Define connection for transaction
    try {
        connection = await pool.getConnection(); // Get connection from pool
        await connection.beginTransaction(); // Start transaction

        const formData = await request.formData();
        const title = formData.get('title');
        const content = formData.get('content');
        const category_id = formData.get('category_id');
        const status = formData.get('status');
        const tagsArray = JSON.parse(formData.get('tags') || '[]'); // Use tagsArray consistently
        const imageFile = formData.get('image');
        const removeImage = formData.get('remove_image') === 'true';

        if (!title || !content || !category_id || !status) {
            await connection.rollback();
            connection.release();
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Fetch existing article using the connection
        const [existingArticles] = await connection.execute('SELECT slug, image_url FROM articles WHERE id = ?', [articleId]);
        if (!existingArticles || existingArticles.length === 0) {
            await connection.rollback();
            connection.release();
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }
        const existingArticle = existingArticles[0];

        let imageUrl = existingArticle.image_url;
        let slug = existingArticle.slug; // Keep existing slug unless title changes significantly

        // --- Optional: Slug regeneration if title changed (keep existing logic if needed) ---
        // const newBaseSlug = slugify(title, { lower: true, strict: true });
        // if (newBaseSlug !== slug.replace(/-\d+$/, '')) { ... }

        // --- Handle image update/removal (using existing logic) ---
        const oldImagePathAbsolute = imageUrl ? path.join(process.cwd(), 'public', imageUrl) : null;

        if (removeImage && imageUrl) {
            if (oldImagePathAbsolute) {
                try { await unlink(oldImagePathAbsolute); } catch (e) { console.error(`Failed to delete old image ${oldImagePathAbsolute}:`, e.message); }
            }
            imageUrl = null;
        } else if (imageFile && imageFile.size > 0) {
            if (oldImagePathAbsolute) {
                try { await unlink(oldImagePathAbsolute); } catch (e) { console.error(`Failed to delete old image ${oldImagePathAbsolute}:`, e.message); }
            }
            // Upload new image (using existing logic)
            const relativeUploadDir = `/uploads/${new Date().getFullYear()}/${new Date().getMonth() + 1}`;
            const uploadDir = path.join(process.cwd(), 'public', relativeUploadDir);
            await mkdir(uploadDir, { recursive: true });
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
            const filename = `${slug}-${uniqueSuffix}${path.extname(imageFile.name)}`; // Use current slug
            const filepath = path.join(uploadDir, filename);
            await writeFile(filepath, Buffer.from(await imageFile.arrayBuffer()));
            imageUrl = `${relativeUploadDir}/${filename}`;
            console.log(`New image uploaded to: ${imageUrl}`);
        }
        // --- End Image Handling ---

        // Update database (Remove tags = ? from this query)
        const updateSql = `
            UPDATE articles
            SET title = ?, slug = ?, content = ?, category_id = ?, status = ?, image_url = ?, updated_at = NOW()
            WHERE id = ?
        `;
        const [updateResult] = await connection.execute(updateSql, // Use connection.execute
            [title, slug, content, category_id, status, imageUrl, articleId] // Remove tags from parameters
        );

        // --- Handle Tags Update (using connection) ---
        // 1. Delete existing tag associations
        await connection.execute('DELETE FROM article_tags WHERE article_id = ?', [articleId]);

        // 2. Find/Create new tags and insert associations
        if (tagsArray && tagsArray.length > 0) {
            const tagIds = [];
            for (const tagName of tagsArray) {
                // Try to find existing tag using connection
                let [tag] = await connection.execute('SELECT id FROM tags WHERE name = ?', [tagName]);
                let tagId;
                if (tag && tag.length > 0) {
                    tagId = tag[0].id;
                } else {
                    // Insert new tag if not found using connection
                    const [newTagResult] = await connection.execute('INSERT INTO tags (name) VALUES (?)', [tagName]);
                    tagId = newTagResult.insertId;
                }
                tagIds.push(tagId);
            }

            // Insert new associations into article_tags using connection
            if (tagIds.length > 0) {
                const articleTagsSql = 'INSERT INTO article_tags (article_id, tag_id) VALUES ?';
                const articleTagsValues = tagIds.map(tagId => [articleId, tagId]);
                // Use connection.query for bulk insert syntax
                await connection.query(articleTagsSql, [articleTagsValues]);
            }
        }
        // --- End Handle Tags Update ---

        await connection.commit(); // Commit transaction
        connection.release(); // Release connection

        // Check affectedRows from the article update result
        if (updateResult.affectedRows > 0) {
             return NextResponse.json({ message: 'Article updated successfully', id: articleId, slug: slug });
        } else {
             // This case might be redundant due to the initial check, but good for safety
             return NextResponse.json({ error: 'Article not found or no changes needed' }, { status: 404 });
        }

    } catch (error) {
        console.error(`Failed to update article ${articleId}:`, error);
        if (connection) {
            await connection.rollback(); // Rollback on error
            connection.release(); // Ensure connection is released
        }
        const errorMessage = error.sqlMessage || error.message || 'Internal Server Error';
        return NextResponse.json({ error: 'Failed to update article', details: errorMessage }, { status: 500 });
    }
}


// --- DELETE: Delete an article ---
export async function DELETE(request, { params }) {
    const adminUser = await verifyAdmin(request);
    if (!adminUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    try {
        // Optional: Get image URL before deleting to remove the file
        const [article] = await query('SELECT image_url FROM articles WHERE id = ?', [id]);

        // Delete from database
        const result = await query('DELETE FROM articles WHERE id = ?', [id]);

        if (result.affectedRows > 0) {
            // If deletion successful, try to delete the associated image file
            if (article && article.image_url) {
                const imagePath = path.join(process.cwd(), 'public', article.image_url);
                try {
                    await unlink(imagePath);
                    console.log(`Deleted image file: ${imagePath}`);
                } catch (fileError) {
                    // Log error if file deletion fails, but don't fail the request
                    console.error(`Failed to delete image file ${imagePath}:`, fileError.message);
                }
            }
            return NextResponse.json({ message: 'Article deleted successfully' });
        } else {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }
    } catch (error) {
        console.error(`Failed to delete article ${id}:`, error);
        return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
    }
}