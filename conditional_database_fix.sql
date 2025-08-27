-- Conditional database fix - only adds missing columns/tables
-- Run this script to safely update your database

-- First, let's check what we have
SET @visits_exists = (SELECT COUNT(*) FROM information_schema.columns 
                     WHERE table_schema = DATABASE() 
                     AND table_name = 'articles' 
                     AND column_name = 'visits');

SET @keywords_exists = (SELECT COUNT(*) FROM information_schema.columns 
                       WHERE table_schema = DATABASE() 
                       AND table_name = 'articles' 
                       AND column_name = 'keywords');

SET @role_exists = (SELECT COUNT(*) FROM information_schema.columns 
                   WHERE table_schema = DATABASE() 
                   AND table_name = 'users' 
                   AND column_name = 'role');

SET @profile_photo_exists = (SELECT COUNT(*) FROM information_schema.columns 
                            WHERE table_schema = DATABASE() 
                            AND table_name = 'users' 
                            AND column_name = 'profile_photo');

-- Add visits column only if it doesn't exist
SET @sql = IF(@visits_exists = 0, 
              'ALTER TABLE articles ADD COLUMN visits INT(11) DEFAULT 0 AFTER updated_at', 
              'SELECT "visits column already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add keywords column only if it doesn't exist
SET @sql = IF(@keywords_exists = 0, 
              'ALTER TABLE articles ADD COLUMN keywords TEXT DEFAULT NULL AFTER image_url', 
              'SELECT "keywords column already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add role column only if it doesn't exist
SET @sql = IF(@role_exists = 0, 
              'ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT "user" AFTER password_hash', 
              'SELECT "role column already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add profile_photo column only if it doesn't exist
SET @sql = IF(@profile_photo_exists = 0, 
              'ALTER TABLE users ADD COLUMN profile_photo VARCHAR(500) DEFAULT NULL AFTER role', 
              'SELECT "profile_photo column already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update content column to LONGTEXT (this is safe to run multiple times)
ALTER TABLE articles MODIFY COLUMN content LONGTEXT NOT NULL;

-- Create page_views table if it doesn't exist
CREATE TABLE IF NOT EXISTS page_views (
  id int(11) NOT NULL AUTO_INCREMENT,
  session_id varchar(255) NOT NULL,
  user_id int(11) DEFAULT NULL,
  article_id int(11) NOT NULL,
  path varchar(500) DEFAULT NULL,
  created_at timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY session_id (session_id),
  KEY user_id (user_id),
  KEY article_id (article_id),
  KEY idx_page_views_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create tags table if it doesn't exist
CREATE TABLE IF NOT EXISTS tags (
  id int(11) NOT NULL AUTO_INCREMENT,
  name varchar(100) NOT NULL UNIQUE,
  created_at timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create article_tags table if it doesn't exist
CREATE TABLE IF NOT EXISTS article_tags (
  id int(11) NOT NULL AUTO_INCREMENT,
  article_id int(11) NOT NULL,
  tag_id int(11) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_article_tag (article_id, tag_id),
  KEY article_id (article_id),
  KEY tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add indexes if they don't exist (this will show warnings if they exist, but won't fail)
CREATE INDEX IF NOT EXISTS idx_articles_status_created ON articles (status, created_at);

-- Show final status
SELECT 'Database update completed successfully!' as message;
SELECT 'Updated table structures:' as info;
DESCRIBE articles;
DESCRIBE users;