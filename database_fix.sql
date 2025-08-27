-- Safe Database Update Script for antara_bogor
-- This script checks for existing columns before adding them to prevent duplicate errors

-- Check and add missing columns to users table safely
SET @sql = '';

-- Add role column if it doesn't exist
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'users' 
AND column_name = 'role';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE `users` ADD COLUMN `role` VARCHAR(50) DEFAULT ''user'' AFTER `password_hash`;', 
    'SELECT ''Column role already exists'' as message;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add profile_picture column if it doesn't exist
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'users' 
AND column_name = 'profile_picture';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE `users` ADD COLUMN `profile_picture` VARCHAR(500) DEFAULT NULL AFTER `role`;', 
    'SELECT ''Column profile_picture already exists'' as message;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add full_name column if it doesn't exist
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'users' 
AND column_name = 'full_name';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE `users` ADD COLUMN `full_name` VARCHAR(255) DEFAULT NULL AFTER `profile_picture`;', 
    'SELECT ''Column full_name already exists'' as message;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add bio column if it doesn't exist
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'users' 
AND column_name = 'bio';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE `users` ADD COLUMN `bio` TEXT DEFAULT NULL AFTER `full_name`;', 
    'SELECT ''Column bio already exists'' as message;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add updated_at column if it doesn't exist
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'users' 
AND column_name = 'updated_at';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE `users` ADD COLUMN `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;', 
    'SELECT ''Column updated_at already exists'' as message;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing users to have 'user' role if they don't have one
UPDATE `users` SET `role` = 'user' WHERE `role` IS NULL OR `role` = '';

-- Show final users table structure
DESCRIBE `users`;

SELECT 'Database update completed successfully!' as message;