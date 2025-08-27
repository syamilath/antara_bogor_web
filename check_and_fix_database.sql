-- Safe database update script that checks for existing columns first
-- This script will only add columns that don't already exist

-- Check current structure of articles table
SELECT 'Current articles table structure:' as info;
DESCRIBE articles;

-- Check current structure of users table  
SELECT 'Current users table structure:' as info;
DESCRIBE users;

-- Check if page_views table exists
SELECT 'Checking if page_views table exists:' as info;
SELECT COUNT(*) as page_views_exists FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'page_views';

-- Check if tags table exists
SELECT 'Checking if tags table exists:' as info;
SELECT COUNT(*) as tags_exists FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'tags';

-- Check if article_tags table exists
SELECT 'Checking if article_tags table exists:' as info;
SELECT COUNT(*) as article_tags_exists FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'article_tags';

-- Show current user roles
SELECT 'Current user roles:' as info;
SELECT id, username, 
       CASE 
         WHEN role IS NULL THEN 'role column missing' 
         ELSE role 
       END as role_status 
FROM users;