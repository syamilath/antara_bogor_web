-- Fix missing columns in the database
-- Run this script to add missing columns that are causing the API to fail

-- Check if visits column exists, if not add it
ALTER TABLE `articles` ADD COLUMN IF NOT EXISTS `visits` INT(11) DEFAULT 0 AFTER `updated_at`;

-- Check if keywords column exists, if not add it  
ALTER TABLE `articles` ADD COLUMN IF NOT EXISTS `keywords` TEXT DEFAULT NULL AFTER `image_url`;

-- Check if role column exists in users table, if not add it
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `role` VARCHAR(50) DEFAULT 'user' AFTER `password_hash`;

-- Check if profile_photo column exists in users table, if not add it
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `profile_photo` VARCHAR(500) DEFAULT NULL AFTER `role`;

-- Update content column to LONGTEXT to handle large DOCX imports with embedded images
ALTER TABLE `articles` MODIFY COLUMN `content` LONGTEXT NOT NULL;

-- Create page_views table if it doesn't exist
CREATE TABLE IF NOT EXISTS `page_views` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `article_id` int(11) NOT NULL,
  `path` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `session_id` (`session_id`),
  KEY `user_id` (`user_id`),
  KEY `article_id` (`article_id`),
  KEY `idx_page_views_created` (`created_at`),
  CONSTRAINT `page_views_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `page_views_ibfk_2` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create tags table if it doesn't exist
CREATE TABLE IF NOT EXISTS `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL UNIQUE,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create article_tags junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS `article_tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `article_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_article_tag` (`article_id`, `tag_id`),
  KEY `article_id` (`article_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `article_tags_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `article_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS `idx_articles_status_created` ON `articles` (`status`, `created_at`);

-- Update existing users with admin role if needed (uncomment and modify as needed)
-- UPDATE `users` SET `role` = 'admin' WHERE `username` = 'your_admin_username';

SELECT 'Database columns and tables have been updated successfully!' as message;