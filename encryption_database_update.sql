-- Database schema updates for End-to-End Encryption support
-- Run this script to add encryption-related columns and tables

-- Add encryption fields to users table
ALTER TABLE `users` ADD COLUMN `encryption_key_salt` VARCHAR(255) DEFAULT NULL AFTER `profile_photo`;
ALTER TABLE `users` ADD COLUMN `public_key` TEXT DEFAULT NULL AFTER `encryption_key_salt`;
ALTER TABLE `users` ADD COLUMN `encrypted_private_key` TEXT DEFAULT NULL AFTER `public_key`;
ALTER TABLE `users` ADD COLUMN `key_derivation_iterations` INT DEFAULT 100000 AFTER `encrypted_private_key`;
ALTER TABLE `users` ADD COLUMN `encryption_enabled` BOOLEAN DEFAULT FALSE AFTER `key_derivation_iterations`;

-- Add encryption fields to articles table
ALTER TABLE `articles` ADD COLUMN `is_encrypted` BOOLEAN DEFAULT FALSE AFTER `keywords`;
ALTER TABLE `articles` ADD COLUMN `encryption_metadata` JSON DEFAULT NULL AFTER `is_encrypted`;
ALTER TABLE `articles` ADD COLUMN `content_hash` VARCHAR(64) DEFAULT NULL AFTER `encryption_metadata`;

-- Create table for encrypted user data
CREATE TABLE `encrypted_user_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `field_name` varchar(50) NOT NULL,
  `encrypted_value` TEXT NOT NULL,
  `encryption_iv` varchar(255) NOT NULL,
  `encryption_tag` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_field` (`user_id`, `field_name`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `encrypted_user_data_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create table for encrypted article drafts
CREATE TABLE `encrypted_article_drafts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `article_id` int(11) NOT NULL,
  `author_id` int(11) NOT NULL,
  `encrypted_content` LONGTEXT NOT NULL,
  `encryption_iv` varchar(255) NOT NULL,
  `encryption_tag` varchar(255) NOT NULL,
  `content_hash` varchar(64) NOT NULL,
  `draft_version` int(11) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `article_id` (`article_id`),
  KEY `author_id` (`author_id`),
  KEY `content_hash` (`content_hash`),
  CONSTRAINT `encrypted_article_drafts_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `encrypted_article_drafts_ibfk_2` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create table for secure communications between users
CREATE TABLE `encrypted_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NOT NULL,
  `recipient_id` int(11) NOT NULL,
  `encrypted_content` TEXT NOT NULL,
  `encryption_iv` varchar(255) NOT NULL,
  `encryption_tag` varchar(255) NOT NULL,
  `message_hash` varchar(64) NOT NULL,
  `is_read` boolean DEFAULT FALSE,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `recipient_id` (`recipient_id`),
  KEY `message_hash` (`message_hash`),
  KEY `created_at` (`created_at`),
  CONSTRAINT `encrypted_messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `encrypted_messages_ibfk_2` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create table for encryption audit logs
CREATE TABLE `encryption_audit_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `resource_type` varchar(50) NOT NULL,
  `resource_id` int(11) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `success` boolean NOT NULL,
  `error_message` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `action` (`action`),
  KEY `resource_type` (`resource_type`),
  KEY `created_at` (`created_at`),
  CONSTRAINT `encryption_audit_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create table for key rotation history
CREATE TABLE `key_rotation_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `old_key_hash` varchar(64) NOT NULL,
  `new_key_hash` varchar(64) NOT NULL,
  `rotation_reason` varchar(100) DEFAULT NULL,
  `rotated_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `rotated_at` (`rotated_at`),
  CONSTRAINT `key_rotation_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create indexes for better performance
CREATE INDEX `idx_users_encryption_enabled` ON `users` (`encryption_enabled`);
CREATE INDEX `idx_articles_is_encrypted` ON `articles` (`is_encrypted`);
CREATE INDEX `idx_encrypted_messages_unread` ON `encrypted_messages` (`recipient_id`, `is_read`, `created_at`);

-- Add some sample encryption settings (optional)
-- UPDATE `users` SET `encryption_enabled` = TRUE WHERE `role` IN ('admin', 'writer');

SELECT 'Encryption database schema updated successfully!' as message;