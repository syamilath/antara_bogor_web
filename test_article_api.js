// Simple test script for article API endpoints
const mysql = require('mysql2/promise');

async function testArticleAPI() {
    try {
        // Database connection (adjust credentials as needed)
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '', // Adjust as needed
            database: 'antara_bogor'
        });

        console.log('Connected to database');

        // Test if articles table exists and has data
        const [articles] = await connection.execute('SELECT COUNT(*) as count FROM articles');
        console.log('Total articles in database:', articles[0].count);

        // Test if we can fetch articles with all required fields
        const [sampleArticles] = await connection.execute(`
            SELECT
                a.id, a.title, a.slug, a.status, a.created_at,
                a.image_url, a.author_id,
                c.name AS category_name, c.id AS category_id,
                u.username AS author_name
            FROM articles a
            LEFT JOIN categories c ON a.category_id = c.id
            LEFT JOIN users u ON a.author_id = u.id
            LIMIT 3
        `);

        console.log('\nSample articles:');
        sampleArticles.forEach(article => {
            console.log(`- ID: ${article.id}, Title: ${article.title}, Author: ${article.author_name}, Status: ${article.status}`);
        });

        // Test if users table has admin/writer roles
        const [users] = await connection.execute('SELECT id, username, role FROM users WHERE role IN ("admin", "writer")');
        console.log('\nAdmin/Writer users:');
        users.forEach(user => {
            console.log(`- ID: ${user.id}, Username: ${user.username}, Role: ${user.role}`);
        });

        // Test if categories table has data
        const [categories] = await connection.execute('SELECT COUNT(*) as count FROM categories');
        console.log('\nTotal categories:', categories[0].count);

        // Test if tags and article_tags tables exist
        try {
            const [tags] = await connection.execute('SELECT COUNT(*) as count FROM tags');
            console.log('Total tags:', tags[0].count);
            
            const [articleTags] = await connection.execute('SELECT COUNT(*) as count FROM article_tags');
            console.log('Total article-tag associations:', articleTags[0].count);
        } catch (e) {
            console.log('Tags tables might not exist:', e.message);
        }

        await connection.end();
        console.log('\nDatabase test completed successfully!');

    } catch (error) {
        console.error('Database test failed:', error);
    }
}

testArticleAPI();