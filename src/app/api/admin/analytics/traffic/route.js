import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { query } from '../../../../../lib/db';

// --- JWT Secret (should match your auth routes) ---
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_VERY_SECRET_KEY_REPLACE_ME';

// --- Helper function to verify admin ---
async function verifyAdmin(request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return (decoded.role === 'admin' || decoded.role === 'writer') ? decoded : null;
    } catch (error) {
        console.error('Admin verification failed:', error.message);
        return null;
    }
}

// --- GET: Fetch traffic analytics ---
export async function GET(request) {
    console.log('Traffic analytics endpoint called');
    const user = await verifyAdmin(request);
    if (!user) {
        console.error('Unauthorized access to traffic analytics');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Date calculations for current and previous month
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        let totalVisits = 0;
        let pageViews = 0;
        let bounceCount = 0;
        let previousTotalVisits = 0;
        let previousPageViews = 0;
        let previousBounceCount = 0;
        let topPages = [];

        // Base query conditions based on user role
        let baseCondition = '1=1';
        let joinCondition = '';
        const queryParams = [];
        const previousQueryParams = [];

        if (user.role !== 'admin') {
            // For writers, only show their articles
            baseCondition = 'a.author_id = ?';
            queryParams.push(user.userId);
            previousQueryParams.push(user.userId);
            joinCondition = 'INNER JOIN articles a ON pv.article_id = a.id';
        }

        // === CURRENT MONTH DATA ===
        
        // 1. Get current month total unique sessions (visits)
        const [totalVisitsRow] = await query(
            `SELECT COUNT(DISTINCT session_id) as count 
             FROM page_views pv
             ${joinCondition}
             WHERE ${baseCondition} AND pv.created_at >= ?`,
            [...queryParams, currentMonthStart.toISOString().slice(0, 19).replace('T', ' ')]
        );
        totalVisits = parseInt(totalVisitsRow?.count) || 0;

        // 2. Get current month total page views
        const [pageViewsRow] = await query(
            `SELECT COUNT(*) as count 
             FROM page_views pv
             ${joinCondition}
             WHERE ${baseCondition} AND pv.created_at >= ?`,
            [...queryParams, currentMonthStart.toISOString().slice(0, 19).replace('T', ' ')]
        );
        pageViews = parseInt(pageViewsRow?.count) || 0;

        // 3. Get current month bounce count (sessions with only one page view)
        const [bounceCountRow] = await query(
            `SELECT COUNT(*) as count FROM (
                SELECT session_id 
                FROM page_views pv
                ${joinCondition}
                WHERE ${baseCondition} AND pv.created_at >= ?
                GROUP BY session_id 
                HAVING COUNT(*) = 1
            ) as single_page_sessions`,
            [...queryParams, currentMonthStart.toISOString().slice(0, 19).replace('T', ' ')]
        );
        bounceCount = parseInt(bounceCountRow?.count) || 0;

        // === PREVIOUS MONTH DATA ===
        
        // 4. Get previous month total unique sessions (visits)
        const [previousTotalVisitsRow] = await query(
            `SELECT COUNT(DISTINCT session_id) as count 
             FROM page_views pv
             ${joinCondition}
             WHERE ${baseCondition} AND pv.created_at >= ? AND pv.created_at <= ?`,
            [...previousQueryParams, 
             previousMonthStart.toISOString().slice(0, 19).replace('T', ' '),
             previousMonthEnd.toISOString().slice(0, 19).replace('T', ' ')]
        );
        previousTotalVisits = parseInt(previousTotalVisitsRow?.count) || 0;

        // 5. Get previous month total page views
        const [previousPageViewsRow] = await query(
            `SELECT COUNT(*) as count 
             FROM page_views pv
             ${joinCondition}
             WHERE ${baseCondition} AND pv.created_at >= ? AND pv.created_at <= ?`,
            [...previousQueryParams, 
             previousMonthStart.toISOString().slice(0, 19).replace('T', ' '),
             previousMonthEnd.toISOString().slice(0, 19).replace('T', ' ')]
        );
        previousPageViews = parseInt(previousPageViewsRow?.count) || 0;

        // 6. Get previous month bounce count
        const [previousBounceCountRow] = await query(
            `SELECT COUNT(*) as count FROM (
                SELECT session_id 
                FROM page_views pv
                ${joinCondition}
                WHERE ${baseCondition} AND pv.created_at >= ? AND pv.created_at <= ?
                GROUP BY session_id 
                HAVING COUNT(*) = 1
            ) as single_page_sessions`,
            [...previousQueryParams, 
             previousMonthStart.toISOString().slice(0, 19).replace('T', ' '),
             previousMonthEnd.toISOString().slice(0, 19).replace('T', ' ')]
        );
        previousBounceCount = parseInt(previousBounceCountRow?.count) || 0;

        // 7. Get top viewed articles (current month)
        const topArticlesQuery = `
            SELECT 
                a.id, 
                a.slug, 
                a.title, 
                COUNT(pv.id) as view_count,
                a.visits as total_visits
            FROM articles a
            LEFT JOIN page_views pv ON a.id = pv.article_id AND pv.created_at >= ?
            ${user.role !== 'admin' ? 'WHERE a.author_id = ?' : ''}
            GROUP BY a.id, a.slug, a.title, a.visits
            ORDER BY view_count DESC
            LIMIT 10
        `;
        
        const topArticlesParams = [currentMonthStart.toISOString().slice(0, 19).replace('T', ' ')];
        if (user.role !== 'admin') {
            topArticlesParams.push(user.userId);
        }
        
        const topArticlesResult = await query(topArticlesQuery, topArticlesParams);

        topPages = topArticlesResult.map(article => ({
            path: `/article/${article.slug}`,
            visits: article.view_count,
            title: article.title,
        }));

        // 8. Calculate bounce rates
        const currentBounceRate = totalVisits > 0 
            ? Math.round((bounceCount / totalVisits) * 100)
            : 0;
        
        const previousBounceRate = previousTotalVisits > 0 
            ? Math.round((previousBounceCount / previousTotalVisits) * 100)
            : 0;

        // 9. Calculate percentage changes
        const calculatePercentageChange = (current, previous) => {
            if (previous === 0) {
                return current > 0 ? 100 : 0;
            }
            return Math.round(((current - previous) / previous) * 100);
        };

        const visitsChange = calculatePercentageChange(totalVisits, previousTotalVisits);
        const pageViewsChange = calculatePercentageChange(pageViews, previousPageViews);
        const bounceRateChange = currentBounceRate - previousBounceRate; // Direct difference for bounce rate

        return NextResponse.json({
            totalVisits,
            pageViews,
            bounceRate: `${currentBounceRate}%`,
            topPages,
            changes: {
                visits: visitsChange,
                pageViews: pageViewsChange,
                bounceRate: bounceRateChange
            },
            previousMonth: {
                totalVisits: previousTotalVisits,
                pageViews: previousPageViews,
                bounceRate: `${previousBounceRate}%`
            }
        });
    } catch (error) {
        console.error('Failed to fetch real analytics:', error);
        console.error('Error stack:', error.stack);
        
        // Log detailed error information
        if (error.code) {
            console.error('Database error code:', error.code);
        }
        if (error.sqlMessage) {
            console.error('SQL Error:', error.sqlMessage);
        }
        
        return NextResponse.json({
            totalVisits: 0,
            pageViews: 0,
            bounceRate: '0%',
            topPages: [],
            changes: {
                visits: 0,
                pageViews: 0,
                bounceRate: 0
            },
            previousMonth: {
                totalVisits: 0,
                pageViews: 0,
                bounceRate: '0%'
            },
            error: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage
        }, { status: 500 });
    }
}