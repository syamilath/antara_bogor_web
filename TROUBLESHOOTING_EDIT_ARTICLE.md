# Troubleshooting: "Failed to fetch article data" Error

## Problem
When trying to edit articles in the manage news section, you get an error "failed to fetch article data".

## Root Cause
The database is missing required columns that were added in recent updates:
- `visits` column in `articles` table
- `keywords` column in `articles` table  
- `role` column in `users` table
- `page_views` table for analytics
- `tags` and `article_tags` tables for tag management

## Solution

### Option 1: Run the Database Update Script (Recommended)
Execute the `database_update.sql` file in your database:

```sql
-- Run this in your MySQL/phpMyAdmin
source database_update.sql;
```

### Option 2: Run the Simple Fix Script
If the main update script has issues, use the simpler version:

```sql
-- Run fix_database_simple.sql
source fix_database_simple.sql;
```

### Option 3: Manual Column Addition
Add the missing columns manually:

```sql
-- Add missing columns to articles table
ALTER TABLE `articles` ADD COLUMN `visits` INT(11) DEFAULT 0 AFTER `updated_at`;
ALTER TABLE `articles` ADD COLUMN `keywords` TEXT DEFAULT NULL AFTER `image_url`;

-- Add missing columns to users table  
ALTER TABLE `users` ADD COLUMN `role` VARCHAR(50) DEFAULT 'user' AFTER `password_hash`;
ALTER TABLE `users` ADD COLUMN `profile_photo` VARCHAR(500) DEFAULT NULL AFTER `role`;

-- Update content column size for large DOCX imports
ALTER TABLE `articles` MODIFY COLUMN `content` LONGTEXT NOT NULL;
```

### Option 4: Check Database Connection
Verify your database connection settings in `.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=antara_bogor
```

## Verification Steps

### 1. Check if columns exist:
```sql
DESCRIBE articles;
DESCRIBE users;
```

You should see:
- `visits` column in articles table
- `keywords` column in articles table
- `role` column in users table

### 2. Test the API endpoint:
Visit: `http://localhost:3000/api/admin/articles`

Should return JSON with article data, not an error.

### 3. Check user roles:
```sql
SELECT id, username, role FROM users;
```

Make sure at least one user has `role = 'admin'` or `role = 'writer'`.

### 4. Update user role if needed:
```sql
UPDATE users SET role = 'admin' WHERE username = 'your_username';
```

## Common Issues

### Issue 1: "Column 'visits' doesn't exist"
**Solution:** Run the database update script or add the column manually.

### Issue 2: "Unauthorized" error
**Solution:** Make sure your user has `admin` or `writer` role in the database.

### Issue 3: "Article not found" 
**Solution:** Check if the article ID exists and the user has permission to access it.

### Issue 4: Foreign key constraint errors
**Solution:** Create the missing tables first, then add foreign key constraints.

## Testing the Fix

1. **Run the database update script**
2. **Restart your development server**
3. **Clear browser cache/cookies**
4. **Try editing an article again**

## Files to Check

- `src/app/api/admin/articles/route.js` - Main articles API
- `src/app/api/admin/articles/[id]/route.js` - Individual article API  
- `src/lib/db.js` - Database connection
- `database_update.sql` - Database schema updates
- `.env` - Database configuration

## Success Indicators

✅ **Manage News page loads without errors**  
✅ **Article list displays properly**  
✅ **Edit button works and loads article data**  
✅ **No console errors in browser developer tools**  
✅ **API endpoints return proper JSON responses**

## Still Having Issues?

1. Check browser developer tools console for detailed error messages
2. Check server logs for database connection errors
3. Verify all required tables exist: `articles`, `users`, `categories`, `page_views`, `tags`, `article_tags`
4. Make sure your database user has proper permissions
5. Test with a fresh browser session (incognito mode)

The most common cause is missing database columns, so running the database update script should resolve the issue.