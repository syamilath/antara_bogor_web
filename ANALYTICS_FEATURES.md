# Enhanced Analytics Dashboard Features

## Overview
The analytics dashboard now provides dynamic statistics with month-over-month comparisons and comprehensive bounce rate tracking.

## Key Features

### 1. Dynamic Statistics
- **Total Visits**: Unique sessions (visitors) with percentage change from previous month
- **Page Views**: Total page views with percentage change from previous month  
- **Bounce Rate**: Percentage of single-page sessions with change indicator

### 2. Visual Indicators
- **Green arrows (↑)**: Positive changes (good for visits/page views, bad for bounce rate)
- **Red arrows (↓)**: Negative changes (bad for visits/page views, good for bounce rate)
- **Circular indicators**: Color-coded backgrounds for quick visual reference
- **Comparison numbers**: Shows previous month → current month values

### 3. Bounce Rate Intelligence
- **Definition**: Percentage of visitors who leave after viewing only one page
- **Calculation**: (Single-page sessions / Total sessions) × 100
- **Interpretation**: Lower bounce rates are better (indicates engaged users)
- **Tooltip**: Hover over the info icon for explanation

### 4. Time-Based Analysis
- **Current Month**: Data from the 1st of current month to now
- **Previous Month**: Complete data from the previous month
- **Percentage Changes**: Calculated as ((current - previous) / previous) × 100

## Database Structure

### page_views Table
```sql
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
);
```

## API Response Format
```json
{
  "totalVisits": 8,
  "pageViews": 16,
  "bounceRate": "38%",
  "topPages": [...],
  "changes": {
    "visits": 60,
    "pageViews": 128,
    "bounceRate": -22
  },
  "previousMonth": {
    "totalVisits": 5,
    "pageViews": 7,
    "bounceRate": "60%"
  }
}
```

## Sample Data
Use `sample_analytics_data.sql` to populate test data:
- Previous month: 5 visits, 7 page views, 60% bounce rate
- Current month: 8 visits, 16 page views, 38% bounce rate
- Expected changes: +60% visits, +128% page views, -22% bounce rate

## Testing
Run `test_analytics.js` to verify the analytics calculations are working correctly.

## Performance Considerations
- Indexes on `created_at` column for efficient date-range queries
- Separate queries for current and previous month data
- Optimized bounce rate calculation using subqueries
- Role-based filtering for writers vs admins

## Future Enhancements
- Weekly and daily comparisons
- Traffic source tracking
- Geographic analytics
- Real-time visitor tracking
- Custom date range selection