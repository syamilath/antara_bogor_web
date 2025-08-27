-- Database Update Script for antara_bogor
-- This script adds missing columns and tables to bring your database up to date

-- 1. Add missing columns to the users table (profile_photo already exists)
ALTER TABLE `users` ADD COLUMN `role` VARCHAR(50) DEFAULT 'user' AFTER `password_hash`;
ALTER TABLE `users` ADD COLUMN `full_name` VARCHAR(255) DEFAULT NULL AFTER `profile_photo`;
ALTER TABLE `users` ADD COLUMN `bio` TEXT DEFAULT NULL AFTER `full_name`;

-- 2. Add the 'visits' column to the articles table (if not exists)
ALTER TABLE `articles` ADD COLUMN `visits` INT(11) DEFAULT 0 AFTER `updated_at`;

-- 3. Create the page_views table for analytics tracking
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
  CONSTRAINT `page_views_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `page_views_ibfk_2` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Update existing users with appropriate roles (optional - adjust as needed)
-- Uncomment and modify the lines below to assign roles to specific users

-- Make specific users admin (full access)
-- UPDATE `users` SET `role` = 'admin' WHERE `username` IN ('sirhan');

-- Make specific users writers (can create/edit articles, limited analytics)
-- UPDATE `users` SET `role` = 'writer' WHERE `username` IN ('kaivanra', 'rehan ganteng');

-- All other users will remain as 'user' (default role)

-- 5. Update content column to LONGTEXT to handle large DOCX imports with embedded images
-- LONGTEXT can store up to 4GB of text data, which is sufficient for documents with base64 images
ALTER TABLE `articles` MODIFY COLUMN `content` LONGTEXT NOT NULL;

-- 6. Add keywords column to articles table for SEO (if not exists)
ALTER TABLE `articles` ADD COLUMN `keywords` TEXT DEFAULT NULL AFTER `image_url`;

-- 7. Add indexes for better performance
CREATE INDEX `idx_articles_status_created` ON `articles` (`status`, `created_at`);
CREATE INDEX `idx_page_views_created` ON `page_views` (`created_at`);
-- 8. Ad
d a sample Technology article to test category visibility
INSERT INTO `articles` (`title`, `slug`, `content`, `image_url`, `author_id`, `category_id`, `status`, `created_at`, `updated_at`) VALUES
('LVM PADA LINUX', 'lvm-pada-linux', 'LVM (Logical Volume Manager) adalah teknologi manajemen storage yang memungkinkan administrator sistem untuk mengelola disk space secara lebih fleksibel. Dengan LVM, Anda dapat membuat, mengubah ukuran, dan menghapus logical volume tanpa perlu memformat ulang atau kehilangan data.

Keuntungan utama LVM:
- Fleksibilitas dalam manajemen storage
- Kemampuan resize volume secara dinamis  
- Snapshot untuk backup
- Mirroring untuk redundansi
- Striping untuk performa

LVM terdiri dari tiga komponen utama:
1. Physical Volume (PV) - disk fisik atau partisi
2. Volume Group (VG) - kumpulan PV yang digabung
3. Logical Volume (LV) - volume virtual yang dibuat dari VG

Untuk implementasi LVM, langkah-langkahnya adalah:
1. Buat Physical Volume dengan pvcreate
2. Buat Volume Group dengan vgcreate  
3. Buat Logical Volume dengan lvcreate
4. Format dan mount logical volume

LVM sangat berguna untuk server production yang membutuhkan fleksibilitas storage management.', '/uploads/2025/8/lvm-pada-linux-1746242444529-502074943.jpeg', 1, 2, 'published', NOW(), NOW());--
 9. Add a sample Business article to test category visibility
INSERT INTO `articles` (`title`, `slug`, `content`, `image_url`, `author_id`, `category_id`, `status`, `created_at`, `updated_at`) VALUES
('Strategi Digital Marketing untuk UMKM', 'strategi-digital-marketing-untuk-umkm', 'Di era digital saat ini, UMKM (Usaha Mikro, Kecil, dan Menengah) perlu mengadaptasi strategi pemasaran digital untuk tetap kompetitif. Digital marketing menawarkan peluang besar bagi UMKM untuk menjangkau pasar yang lebih luas dengan biaya yang relatif terjangkau.

Strategi digital marketing yang efektif untuk UMKM:

1. **Social Media Marketing**
   - Manfaatkan platform seperti Instagram, Facebook, dan TikTok
   - Buat konten yang engaging dan konsisten
   - Gunakan hashtag yang relevan untuk meningkatkan visibility

2. **Search Engine Optimization (SEO)**
   - Optimasi website untuk mesin pencari
   - Buat konten berkualitas dengan keyword yang tepat
   - Daftarkan bisnis di Google My Business

3. **Email Marketing**
   - Bangun database email pelanggan
   - Kirim newsletter berkala dengan penawaran menarik
   - Personalisasi pesan untuk meningkatkan engagement

4. **Content Marketing**
   - Buat blog dengan tips dan informasi berguna
   - Produksi video tutorial atau behind-the-scenes
   - Share customer testimonials dan success stories

5. **Paid Advertising**
   - Google Ads untuk targeting berdasarkan keyword
   - Facebook/Instagram Ads untuk targeting demografis
   - Mulai dengan budget kecil dan scale up gradually

Kunci sukses digital marketing untuk UMKM adalah konsistensi, kreativitas, dan pemahaman mendalam tentang target audience. Dengan strategi yang tepat, UMKM dapat bersaing dengan perusahaan besar dan meraih kesuksesan di pasar digital.', '/uploads/2025/8/strategi-digital-marketing-untuk-umkm-1746242444529-502074943.jpeg', 1, 3, 'published', NOW(), NOW());-- 10
. Add personalized news algorithm system

-- Add new role for regular users who can login but have limited access
-- Update the role enum to include 'member' role
ALTER TABLE `users` MODIFY COLUMN `role` ENUM('user', 'member', 'writer', 'admin') DEFAULT 'user';

-- Create user_preferences table to track user category preferences
CREATE TABLE `user_preferences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `preference_score` decimal(5,2) DEFAULT 1.00,
  `last_updated` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_category` (`user_id`, `category_id`),
  KEY `user_id` (`user_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `user_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_preferences_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create user_interactions table to track user behavior
CREATE TABLE `user_interactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `article_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `interaction_type` enum('view', 'click', 'share', 'like', 'comment') NOT NULL DEFAULT 'view',
  `time_spent` int(11) DEFAULT 0, -- in seconds
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `article_id` (`article_id`),
  KEY `category_id` (`category_id`),
  KEY `session_id` (`session_id`),
  KEY `created_at` (`created_at`),
  CONSTRAINT `user_interactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `user_interactions_ibfk_2` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_interactions_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create user_reading_history table for detailed tracking
CREATE TABLE `user_reading_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `article_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `read_percentage` decimal(5,2) DEFAULT 0.00,
  `time_spent` int(11) DEFAULT 0,
  `device_type` varchar(50) DEFAULT NULL,
  `referrer` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `article_id` (`article_id`),
  KEY `category_id` (`category_id`),
  KEY `session_id` (`session_id`),
  KEY `created_at` (`created_at`),
  CONSTRAINT `user_reading_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `user_reading_history_ibfk_2` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_reading_history_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add algorithm_version column to track different recommendation versions
ALTER TABLE `users` ADD COLUMN `algorithm_version` varchar(20) DEFAULT 'v1.0' AFTER `bio`;
ALTER TABLE `users` ADD COLUMN `last_activity` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() AFTER `algorithm_version`;

-- Create indexes for better performance
CREATE INDEX `idx_user_preferences_score` ON `user_preferences` (`user_id`, `preference_score` DESC);
CREATE INDEX `idx_user_interactions_type_time` ON `user_interactions` (`user_id`, `interaction_type`, `created_at` DESC);
CREATE INDEX `idx_reading_history_user_time` ON `user_reading_history` (`user_id`, `created_at` DESC);

-- Sample data for testing the algorithm
-- Update some existing users to 'member' role for testing
UPDATE `users` SET `role` = 'member' WHERE `id` IN (1, 2, 3);

-- Insert sample user preferences (this would normally be generated by the algorithm)
INSERT INTO `user_preferences` (`user_id`, `category_id`, `preference_score`) VALUES
(1, 2, 8.5), -- User 1 likes Technology
(1, 4, 6.2), -- User 1 somewhat likes Sports  
(1, 3, 4.1), -- User 1 less interested in Business
(2, 1, 9.1), -- User 2 loves Politics
(2, 6, 7.3), -- User 2 likes History
(2, 5, 5.8); -- User 2 moderately likes Entertainment