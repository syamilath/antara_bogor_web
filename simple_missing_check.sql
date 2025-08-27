-- Simple check for missing columns and tables
-- Run this first to see what you actually need

-- Check articles table structure
SELECT 'ARTICLES TABLE COLUMNS:' as info;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
FROM information_schema.columns 
WHERE table_schema = DATABASE() AND table_name = 'articles'
ORDER BY ORDINAL_POSITION;

-- Check users table structure  
SELECT 'USERS TABLE COLUMNS:' as info;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
FROM information_schema.columns 
WHERE table_schema = DATABASE() AND table_name = 'users'
ORDER BY ORDINAL_POSITION;

-- Check what tables exist
SELECT 'EXISTING TABLES:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name IN ('articles', 'users', 'categories', 'page_views', 'tags', 'article_tags')
ORDER BY table_name;

-- Check user roles
SELECT 'USER ROLES:' as info;
SELECT id, username, 
  CASE 
    WHEN role IS NULL THEN 'NO ROLE SET' 
    ELSE role 
  END as current_role
FROM users;