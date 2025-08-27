import { NextResponse } from "next/server";
import { query, pool } from "../../../../lib/db"; // Ensure pool is imported
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import slugify from "slugify";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// --- JWT Secret (should match your auth routes) ---
const JWT_SECRET = process.env.JWT_SECRET || "YOUR_VERY_SECRET_KEY_REPLACE_ME";

// --- Helper function to verify admin ---
async function verifyAdmin(request) {
  // Await cookies() before accessing it
  const cookieStore = await cookies(); // <-- Fix 1: Await cookies()
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return (decoded.role === "admin" || decoded.role === "writer") ? decoded : null;
  } catch (error) {
    console.error("Admin verification failed:", error.message);
    return null;
  }
}

// --- GET: Fetch all articles (for admin manage page) ---
export async function GET(request) {
  const user = await verifyAdmin(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let articles;
    if (user.role === 'admin') {
      // Admin: fetch all articles
      articles = await query(`
        SELECT
          a.id, a.title, a.slug, a.status, a.created_at,
          a.image_url, COALESCE(a.visits, 0) as visits, a.keywords,
          c.name AS category_name, c.id AS category_id,
          u.username AS author_name,
          GROUP_CONCAT(t.name SEPARATOR ', ') AS tags_concatenated
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        LEFT JOIN users u ON a.author_id = u.id
        LEFT JOIN article_tags at ON a.id = at.article_id
        LEFT JOIN tags t ON at.tag_id = t.id
        GROUP BY a.id
        ORDER BY a.created_at DESC
      `);
    } else {
      // Writer: fetch only their own articles
      articles = await query(`
        SELECT
          a.id, a.title, a.slug, a.status, a.created_at,
          a.image_url, COALESCE(a.visits, 0) as visits, a.keywords,
          c.name AS category_name, c.id AS category_id,
          u.username AS author_name,
          GROUP_CONCAT(t.name SEPARATOR ', ') AS tags_concatenated
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        LEFT JOIN users u ON a.author_id = u.id
        LEFT JOIN article_tags at ON a.id = at.article_id
        LEFT JOIN tags t ON at.tag_id = t.id
        WHERE a.author_id = ?
        GROUP BY a.id
        ORDER BY a.created_at DESC
      `, [user.userId]);
    }

    // Optional: Convert concatenated tags string back to array if needed by frontend
    const articlesWithTagsArray = articles.map((article) => ({
      ...article,
      tags: article.tags_concatenated
        ? article.tags_concatenated.split(", ")
        : [],
    }));

    return NextResponse.json(articlesWithTagsArray);
  } catch (error) {
    console.error("Failed to fetch admin articles:", error);
    console.error(
      "Database query error details:",
      error.sqlMessage || error.message
    );
    
    // Check if error is due to missing columns
    if (error.sqlMessage && (error.sqlMessage.includes("visits") || error.sqlMessage.includes("keywords"))) {
      return NextResponse.json(
        { 
          error: "Database schema outdated", 
          details: "Missing required columns. Please run the database update script.",
          sqlError: error.sqlMessage
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch articles", details: error.message },
      { status: 500 }
    );
  }
}

// --- POST: Create a new article ---
export async function POST(request) {
  const adminUser = await verifyAdmin(request);
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let connection; // Define connection variable for transaction
  try {
    connection = await pool.getConnection(); // Get connection from pool
    await connection.beginTransaction(); // Start transaction

    const formData = await request.formData();
    const title = formData.get("title");
    const content = formData.get("content");
    const category_id = formData.get("category_id");
    const author_id = adminUser.userId;
    const status = formData.get("status") || "draft";
    const tagsArray = JSON.parse(formData.get("tags") || "[]"); // Get tags array
    const keywordsArray = JSON.parse(formData.get("keywords") || "[]"); // Get keywords array
    const imageFile = formData.get("image");

    if (!title || !content || !category_id) {
      await connection.rollback(); // Rollback on validation error
      connection.release();
      return NextResponse.json(
        { error: "Missing required fields (title, content, category)" },
        { status: 400 }
      );
    }

    // --- Slug Generation (using connection) ---
    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const [existing] = await connection.execute(
        "SELECT id FROM articles WHERE slug = ?",
        [slug]
      );
      if (!existing || existing.length === 0) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    // --- End Slug Generation ---

    // --- Image Handling (using existing logic) ---
    let imageUrl = null;
    if (imageFile && imageFile.size > 0) {
      const relativeUploadDir = `/uploads/${new Date().getFullYear()}/${
        new Date().getMonth() + 1
      }`;
      const uploadDir = path.join(process.cwd(), "public", relativeUploadDir);
      await mkdir(uploadDir, { recursive: true });
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `${slug}-${uniqueSuffix}${path.extname(imageFile.name)}`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, Buffer.from(await imageFile.arrayBuffer()));
      imageUrl = `${relativeUploadDir}/${filename}`;
    }
    // --- End Image Handling ---

    // Determine if the article is being published now
    const isPublishingNow = status === "published"; // Check status before insert

    // Insert article data (add keywords field)
    const articleSql = `
            INSERT INTO articles (title, slug, content, category_id, author_id, status, image_url, keywords, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
    const [articleResult] = await connection.execute(articleSql, [
      title,
      slug,
      content,
      category_id,
      author_id,
      status,
      imageUrl,
      JSON.stringify(keywordsArray),
    ]);
    const newArticleId = articleResult.insertId;

    // --- Handle Tags (using connection) ---
    if (tagsArray && tagsArray.length > 0) {
      const tagIds = [];
      for (const tagName of tagsArray) {
        // Try to find existing tag using connection
        let [tag] = await connection.execute(
          "SELECT id FROM tags WHERE name = ?",
          [tagName]
        );
        let tagId;
        if (tag && tag.length > 0) {
          tagId = tag[0].id;
        } else {
          // Insert new tag if not found using connection
          const [newTagResult] = await connection.execute(
            "INSERT INTO tags (name) VALUES (?)",
            [tagName]
          );
          tagId = newTagResult.insertId;
        }
        tagIds.push(tagId);
      }

      // Insert into article_tags junction table using connection
      if (tagIds.length > 0) {
        const articleTagsSql =
          "INSERT INTO article_tags (article_id, tag_id) VALUES ?";
        const articleTagsValues = tagIds.map((tagId) => [newArticleId, tagId]);
        // Use connection.query for bulk insert syntax
        await connection.query(articleTagsSql, [articleTagsValues]);
      }
    }
    // --- End Handle Tags ---

    await connection.commit(); // Commit transaction
    connection.release(); // Release connection back to pool

    return NextResponse.json(
      {
        message: "Article created successfully",
        articleId: newArticleId,
        slug: slug,
        title: title, // Add the title to the response
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create article:", error);
    if (connection) {
      await connection.rollback(); // Rollback on error
      connection.release(); // Release connection
    }
    const errorMessage =
      error.sqlMessage || error.message || "Internal Server Error";
    // Ensure the specific error message is included in the response
    return NextResponse.json(
      { error: `Failed to create article: ${errorMessage}` },
      { status: 500 }
    );
  }
}
