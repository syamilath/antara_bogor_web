// Simple test script for analytics API
const mysql = require('mysql2/promise');

async function testAnalytics() {
    try {
        // Database connection (adjust credentials as needed)
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '', // Adjust as needed
            database: 'antara_bogor'
        });

        console.log('Connected to database');

        // Test current month data
        const currentMonthStart = new Date(2025, 1, 1); // February 1, 2025
        console.log('Current month start:', currentMonthStart.toISOString());

        // Get current month visits
        const [currentVisits] = await connection.execute(
            `SELECT COUNT(DISTINCT session_id) as count 
             FROM page_views 
             WHERE created_at >= ?`,
            [currentMonthStart.toISOString().slice(0, 19).replace('T', ' ')]
        );

        // Get current month page views
        const [currentPageViews] = await connection.execute(
            `SELECT COUNT(*) as count 
             FROM page_views 
             WHERE created_at >= ?`,
            [currentMonthStart.toISOString().slice(0, 19).replace('T', ' ')]
        );

        // Get current month bounces
        const [currentBounces] = await connection.execute(
            `SELECT COUNT(*) as count FROM (
                SELECT session_id 
                FROM page_views 
                WHERE created_at >= ?
                GROUP BY session_id 
                HAVING COUNT(*) = 1
            ) as single_page_sessions`,
            [currentMonthStart.toISOString().slice(0, 19).replace('T', ' ')]
        );

        console.log('Current Month Results:');
        console.log('- Visits:', currentVisits[0].count);
        console.log('- Page Views:', currentPageViews[0].count);
        console.log('- Bounces:', currentBounces[0].count);
        console.log('- Bounce Rate:', Math.round((currentBounces[0].count / currentVisits[0].count) * 100) + '%');

        // Test previous month data
        const previousMonthStart = new Date(2025, 0, 1); // January 1, 2025
        const previousMonthEnd = new Date(2025, 0, 31, 23, 59, 59); // January 31, 2025
        console.log('\nPrevious month start:', previousMonthStart.toISOString());
        console.log('Previous month end:', previousMonthEnd.toISOString());

        // Get previous month visits
        const [previousVisits] = await connection.execute(
            `SELECT COUNT(DISTINCT session_id) as count 
             FROM page_views 
             WHERE created_at >= ? AND created_at <= ?`,
            [
                previousMonthStart.toISOString().slice(0, 19).replace('T', ' '),
                previousMonthEnd.toISOString().slice(0, 19).replace('T', ' ')
            ]
        );

        // Get previous month page views
        const [previousPageViews] = await connection.execute(
            `SELECT COUNT(*) as count 
             FROM page_views 
             WHERE created_at >= ? AND created_at <= ?`,
            [
                previousMonthStart.toISOString().slice(0, 19).replace('T', ' '),
                previousMonthEnd.toISOString().slice(0, 19).replace('T', ' ')
            ]
        );

        // Get previous month bounces
        const [previousBounces] = await connection.execute(
            `SELECT COUNT(*) as count FROM (
                SELECT session_id 
                FROM page_views 
                WHERE created_at >= ? AND created_at <= ?
                GROUP BY session_id 
                HAVING COUNT(*) = 1
            ) as single_page_sessions`,
            [
                previousMonthStart.toISOString().slice(0, 19).replace('T', ' '),
                previousMonthEnd.toISOString().slice(0, 19).replace('T', ' ')
            ]
        );

        console.log('\nPrevious Month Results:');
        console.log('- Visits:', previousVisits[0].count);
        console.log('- Page Views:', previousPageViews[0].count);
        console.log('- Bounces:', previousBounces[0].count);
        console.log('- Bounce Rate:', Math.round((previousBounces[0].count / previousVisits[0].count) * 100) + '%');

        // Calculate changes
        const visitsChange = Math.round(((currentVisits[0].count - previousVisits[0].count) / previousVisits[0].count) * 100);
        const pageViewsChange = Math.round(((currentPageViews[0].count - previousPageViews[0].count) / previousPageViews[0].count) * 100);
        const currentBounceRate = Math.round((currentBounces[0].count / currentVisits[0].count) * 100);
        const previousBounceRate = Math.round((previousBounces[0].count / previousVisits[0].count) * 100);
        const bounceRateChange = currentBounceRate - previousBounceRate;

        console.log('\nPercentage Changes:');
        console.log('- Visits Change:', visitsChange + '%');
        console.log('- Page Views Change:', pageViewsChange + '%');
        console.log('- Bounce Rate Change:', bounceRateChange + '%');

        await connection.end();
        console.log('\nTest completed successfully!');

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testAnalytics();