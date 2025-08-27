// API endpoint for encrypting/decrypting article drafts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { encryptionService } from '../../../../lib/encryptionService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_VERY_SECRET_KEY_REPLACE_ME';

// Verify user authentication
async function verifyUser(request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return (decoded.role === 'admin' || decoded.role === 'writer') ? decoded : null;
    } catch (error) {
        console.error('User verification failed:', error.message);
        return null;
    }
}

// POST: Encrypt article draft
export async function POST(request) {
    const user = await verifyUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { articleId, content, password } = await request.json();

        if (!articleId || !content || !password) {
            return NextResponse.json({ 
                error: 'Article ID, content, and password required' 
            }, { status: 400 });
        }

        await encryptionService.encryptArticleDraft(articleId, user.userId, content, password);

        return NextResponse.json({
            success: true,
            message: 'Article draft encrypted successfully'
        });

    } catch (error) {
        console.error('Article encryption failed:', error);
        return NextResponse.json({ 
            error: 'Failed to encrypt article',
            details: error.message 
        }, { status: 500 });
    }
}

// GET: Decrypt article draft
export async function GET(request) {
    const user = await verifyUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const articleId = searchParams.get('articleId');
        const password = searchParams.get('password');

        if (!articleId || !password) {
            return NextResponse.json({ 
                error: 'Article ID and password required' 
            }, { status: 400 });
        }

        const decryptedContent = await encryptionService.decryptArticleDraft(
            parseInt(articleId), 
            user.userId, 
            password
        );

        return NextResponse.json({
            success: true,
            articleId: parseInt(articleId),
            content: decryptedContent
        });

    } catch (error) {
        console.error('Article decryption failed:', error);
        return NextResponse.json({ 
            error: 'Failed to decrypt article',
            details: error.message 
        }, { status: 500 });
    }
}