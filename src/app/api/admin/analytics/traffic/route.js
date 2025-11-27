import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// --- JWT Secret (should match your auth routes) ---
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_VERY_SECRET_KEY_REPLACE_ME';

// --- Helper function to verify admin ---
async function verifyAdmin(request) {
    const cookieStore = cookies();
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

    // --- Placeholder Data ---
    const placeholderStats = {
        totalVisits: Math.floor(Math.random() * 5000) + 1000, // Random visits
        uniqueVisitors: Math.floor(Math.random() * 3000) + 500,
        pageViews: Math.floor(Math.random() * 10000) + 2000,
        bounceRate: `${Math.floor(Math.random() * 60) + 20}%`, // Random bounce rate
        topPages: [
            { path: '/', visits: Math.floor(Math.random() * 500) + 100 },
            { path: '/article/some-popular-article', visits: Math.floor(Math.random() * 200) + 50 },
            { path: '/category/technology', visits: Math.floor(Math.random() * 150) + 40 },
            { path: '/article/another-one', visits: Math.floor(Math.random() * 100) + 30 },
            { path: '/about', visits: Math.floor(Math.random() * 80) + 20 },
        ],
        // Add more stats if needed by your dashboard
        totalArticles: 0, // You could query this
        totalUsers: 0,    // You could query this
    };

    // --- Optional: Query actual counts ---
    try {
        const [articleCount] = await query('SELECT COUNT(*) as count FROM articles');
        const [userCount] = await query('SELECT COUNT(*) as count FROM users');
        placeholderStats.totalArticles = articleCount?.count || 0;
        placeholderStats.totalUsers = userCount?.count || 0;
    } catch (error) {
        console.error("Failed to fetch counts for dashboard:", error);
        // Don't fail the request, just use 0s
    }
    // --- End Optional Query ---


    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(placeholderStats);
}