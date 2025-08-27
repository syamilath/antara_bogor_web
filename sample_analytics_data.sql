-- Sample Analytics Data for Testing
-- This script adds sample page_views data for current and previous months

-- First, let's ensure we have some articles to work with
INSERT IGNORE INTO `articles` (`id`, `title`, `slug`, `content`, `author_id`, `status`, `created_at`, `updated_at`, `visits`) VALUES
(1, 'Sample Article 1', 'sample-article-1', 'This is sample content for article 1', 1, 'published', '2025-01-15 10:00:00', '2025-01-15 10:00:00', 0),
(2, 'Sample Article 2', 'sample-article-2', 'This is sample content for article 2', 1, 'published', '2025-01-20 11:00:00', '2025-01-20 11:00:00', 0),
(3, 'Sample Article 3', 'sample-article-3', 'This is sample content for article 3', 1, 'published', '2025-01-25 12:00:00', '2025-01-25 12:00:00', 0);

-- Sample page views for PREVIOUS MONTH (January 2025)
-- Session 1: User viewed 3 pages (not a bounce)
INSERT INTO `page_views` (`session_id`, `user_id`, `article_id`, `path`, `created_at`) VALUES
('session_prev_1', 1, 1, '/article/sample-article-1', '2025-01-05 10:30:00'),
('session_prev_1', 1, 2, '/article/sample-article-2', '2025-01-05 10:35:00'),
('session_prev_1', 1, 3, '/article/sample-article-3', '2025-01-05 10:40:00');

-- Session 2: User viewed only 1 page (bounce)
INSERT INTO `page_views` (`session_id`, `user_id`, `article_id`, `path`, `created_at`) VALUES
('session_prev_2', NULL, 1, '/article/sample-article-1', '2025-01-10 14:20:00');

-- Session 3: User viewed 2 pages (not a bounce)
INSERT INTO `page_views` (`session_id`, `user_id`, `article_id`, `path`, `created_at`) VALUES
('session_prev_3', NULL, 2, '/article/sample-article-2', '2025-01-15 16:10:00'),
('session_prev_3', NULL, 1, '/article/sample-article-1', '2025-01-15 16:15:00');

-- Session 4: User viewed only 1 page (bounce)
INSERT INTO `page_views` (`session_id`, `user_id`, `article_id`, `path`, `created_at`) VALUES
('session_prev_4', NULL, 3, '/article/sample-article-3', '2025-01-20 09:45:00');

-- Session 5: User viewed only 1 page (bounce)
INSERT INTO `page_views` (`session_id`, `user_id`, `article_id`, `path`, `created_at`) VALUES
('session_prev_5', NULL, 2, '/article/sample-article-2', '2025-01-25 13:30:00');

-- Previous month summary: 5 sessions, 7 page views, 3 bounces = 60% bounce rate

-- Sample page views for CURRENT MONTH (February 2025)
-- Session 1: User viewed 2 pages (not a bounce)
INSERT INTO `page_views` (`session_id`, `user_id`, `article_id`, `path`, `created_at`) VALUES
('session_curr_1', 1, 1, '/article/sample-article-1', '2025-02-02 11:20:00'),
('session_curr_1', 1, 2, '/article/sample-article-2', '2025-02-02 11:25:00');

-- Session 2: User viewed only 1 page (bounce)
INSERT INTO `page_views` (`session_id`, `user_id`, `article_id`, `path`, `created_at`) VALUES
('session_curr_2', NULL, 3, '/article/sample-article-3', '2025-02-05 15:40:00');

-- Session 3: User viewed 4 pages (not a bounce)
INSERT INTO `page_views` (`session_id`, `user_id`, `article_id`, `path`, `created_at`) VALUES
('session_curr_3', NULL, 1, '/article/sample-article-1', '2025-02-10 08:15:00'),
('session_curr_3', NULL, 2, '/article/sample-article-2', '2025-02-10 08:20:00'),
('session_curr_3', NULL, 3, '/article/sample-article-3', '2025-02-10 08:25:00'),
('session_curr_3', NULL, 1, '/article/sample-article-1', '2025-02-10 08:30:00');

-- Session 4: User viewed 3 pages (not a bounce)
INSERT INTO `page_views` (`session_id`, `user_id`, `article_id`, `path`, `created_at`) VALUES
('session_curr_4', NULL, 2, '/article/sample-article-2', '2025-02-15 12:10:00'),
('session_curr_4', NULL, 1, '/article/sample-article-1', '2025-02-15 12:15:00'),
('session_curr_4', NULL, 3, '/article/sample-article-3', '2025-02-15 12:20:00');

-- Session 5: User viewed only 1 page (bounce)
INSERT INTO `page_views` (`session_id`, `user_id`, `article_id`, `path`, `created_at`) VALUES
('session_curr_5', NULL, 1, '/article/sample-article-1', '2025-02-18 17:30:00');

-- Session 6: User viewed 2 pages (not a bounce)
INSERT INTO `page_views` (`session_id`, `user_id`, `article_id`, `path`, `created_at`) VALUES
('session_curr_6', NULL, 3, '/article/sample-article-3', '2025-02-20 10:45:00'),
('session_curr_6', NULL, 2, '/article/sample-article-2', '2025-02-20 10:50:00');

-- Session 7: User viewed only 1 page (bounce)
INSERT INTO `page_views` (`session_id`, `user_id`, `article_id`, `path`, `created_at`) VALUES
('session_curr_7', NULL, 2, '/article/sample-article-2', '2025-02-22 14:20:00');

-- Session 8: User viewed 5 pages (not a bounce)
INSERT INTO `page_views` (`session_id`, `user_id`, `article_id`, `path`, `created_at`) VALUES
('session_curr_8', NULL, 1, '/article/sample-article-1', '2025-02-25 16:00:00'),
('session_curr_8', NULL, 2, '/article/sample-article-2', '2025-02-25 16:05:00'),
('session_curr_8', NULL, 3, '/article/sample-article-3', '2025-02-25 16:10:00'),
('session_curr_8', NULL, 1, '/article/sample-article-1', '2025-02-25 16:15:00'),
('session_curr_8', NULL, 2, '/article/sample-article-2', '2025-02-25 16:20:00');

-- Current month summary: 8 sessions, 16 page views, 3 bounces = 37.5% bounce rate

-- Expected results:
-- Previous month: 5 visits, 7 page views, 60% bounce rate
-- Current month: 8 visits, 16 page views, 38% bounce rate
-- Changes: +60% visits, +128% page views, -22% bounce rate (improvement)