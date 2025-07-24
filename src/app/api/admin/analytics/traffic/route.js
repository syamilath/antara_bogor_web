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

// --- GET: Fetch placeholder traffic stats ---
export async function GET(request) {
    const user = await verifyAdmin(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        let totalVisits = 0;
        let uniqueVisitors = 0;
        let pageViews = 0;
        let topPages = [];

        if (user.role === 'admin') {
            // Admin: all stats
            const [totalVisitsRow] = await query('SELECT COUNT(*) as count FROM page_views');
            totalVisits = totalVisitsRow?.count || 0;

            const [uniqueVisitorsRow] = await query('SELECT COUNT(DISTINCT user_id) as count FROM page_views');
            uniqueVisitors = uniqueVisitorsRow?.count || 0;

            pageViews = totalVisits;

            const articles = await query('SELECT slug, title, visits FROM articles ORDER BY visits DESC LIMIT 10');
            topPages = articles.map(article => ({
                path: `/article/${article.slug}`,
                visits: article.visits,
                title: article.title,
            }));
        } else {
            // Writer: only their own articles
            const articles = await query('SELECT id, slug, title, visits FROM articles WHERE author_id = ? ORDER BY visits DESC LIMIT 10', [user.userId]);
            const articleIds = articles.map(a => a.id);

            if (articleIds.length > 0) {
                const idsString = articleIds.join(',');
                const [totalVisitsRow] = await query(`SELECT COUNT(*) as count FROM page_views WHERE article_id IN (${idsString})`);
                totalVisits = totalVisitsRow?.count || 0;

                const [uniqueVisitorsRow] = await query(`SELECT COUNT(DISTINCT user_id) as count FROM page_views WHERE article_id IN (${idsString})`);
                uniqueVisitors = uniqueVisitorsRow?.count || 0;

                pageViews = totalVisits;

                topPages = articles.map(article => ({
                    path: `/article/${article.slug}`,
                    visits: article.visits,
                    title: article.title,
                }));
            }
        }

        const bounceRate = '0%'; // Placeholder

        return NextResponse.json({
            totalVisits,
            uniqueVisitors,
            pageViews,
            bounceRate,
            topPages,
        });
    } catch (error) {
        console.error('Failed to fetch real analytics:', error);
        return NextResponse.json({
            totalVisits: 0,
            uniqueVisitors: 0,
            pageViews: 0,
            bounceRate: '0%',
            topPages: [],
            error: error.message,
        }, { status: 500 });
    }
}