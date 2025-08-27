-- Check if encryption tables and columns exist
-- Run this to see what's missing for encryption setup

SELECT 'Checking encryption readiness...' as status;

-- Check if encryption columns exist in users table
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as encryption_key_salt_column
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
    AND table_name = 'users' 
    AND column_name = 'encryption_key_salt';

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as encryption_enabled_column
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
    AND table_name = 'users' 
    AND column_name = 'encryption_enabled';

-- Check if encryption tables exist
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as encrypted_user_data_table
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
    AND table_name = 'encrypted_user_data';

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as encrypted_article_drafts_table
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
    AND table_name = 'encrypted_article_drafts';

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as encrypted_messages_table
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
    AND table_name = 'encrypted_messages';

-- Check current user encryption status
SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN encryption_enabled = TRUE THEN 1 ELSE 0 END) as users_with_encryption
FROM users 
WHERE encryption_enabled IS NOT NULL;

SELECT 'Encryption status check complete!' as result;