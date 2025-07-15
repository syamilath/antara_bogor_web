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
        return decoded.role === 'admin' ? decoded : null;
    } catch (error) {
        console.error('Admin verification failed:', error.message);
        return null;
    }
}

// --- GET: Fetch placeholder traffic stats ---
export async function GET(request) {
    const adminUser = await verifyAdmin(request);
    if (!adminUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get total visits (all page_views)
        const [totalVisitsRow] = await query('SELECT COUNT(*) as count FROM page_views');
        const totalVisits = totalVisitsRow?.count || 0;

        // Get unique visitors (by user_id or IP if available)
        const [uniqueVisitorsRow] = await query('SELECT COUNT(DISTINCT user_id) as count FROM page_views');
        const uniqueVisitors = uniqueVisitorsRow?.count || 0;

        // Get total page views (same as totalVisits for now)
        const pageViews = totalVisits;

        // Get bounce rate (placeholder, or calculate if you have session data)
        const bounceRate = '0%';

        // Get all articles and their slugs
        const articles = await query('SELECT slug, title, visits FROM articles ORDER BY visits DESC LIMIT 10');
        const topPages = articles.map(article => ({
            path: `/article/${article.slug}`,
            visits: article.visits,
            title: article.title,
        }));

        return NextResponse.json({
            totalVisits,
            uniqueVisitors,
            pageViews,
            bounceRate,
            topPages: topPages,
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