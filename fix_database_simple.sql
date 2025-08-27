-- Simple database fix script
-- Run this to add missing columns (ignore errors if columns already exist)

-- Add missing columns to articles table
ALTER TABLE `articles` ADD COLUMN `visits` INT(11) DEFAULT 0 AFTER `updated_at`;
ALTER TABLE `articles` ADD COLUMN `keywords` TEXT DEFAULT NULL AFTER `image_url`;

-- Add missing columns to users table  
ALTER TABLE `users` ADD COLUMN `role` VARCHAR(50) DEFAULT 'user' AFTER `password_hash`;
ALTER TABLE `users` ADD COLUMN `profile_photo` VARCHAR(500) DEFAULT NULL AFTER `role`;

-- Update content column size
ALTER TABLE `articles` MODIFY COLUMN `content` LONGTEXT NOT NULL;

-- Create page_views table
CREATE TABLE `page_views` (
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
  KEY `idx_page_views_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create tags table
CREATE TABLE `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL UNIQUE,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create article_tags junction table
CREATE TABLE `article_tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `article_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_article_tag` (`article_id`, `tag_id`),
  KEY `article_id` (`article_id`),
  KEY `tag_id` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add foreign key constraints (run separately if needed)
-- ALTER TABLE `page_views` ADD CONSTRAINT `page_views_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
-- ALTER TABLE `page_views` ADD CONSTRAINT `page_views_ibfk_2` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE;
-- ALTER TABLE `article_tags` ADD CONSTRAINT `article_tags_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE;
-- ALTER TABLE `article_tags` ADD CONSTRAINT `article_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE;

-- Add performance indexes
CREATE INDEX `idx_articles_status_created` ON `articles` (`status`, `created_at`);

SELECT 'Database update completed!' as message;