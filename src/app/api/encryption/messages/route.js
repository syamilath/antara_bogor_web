// API endpoint for encrypted messaging between users
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { encryptionService } from '../../../../lib/encryptionService.js';
import { query } from '../../../../lib/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_VERY_SECRET_KEY_REPLACE_ME';

// Verify user authentication
async function verifyUser(request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        console.error('User verification failed:', error.message);
        return null;
    }
}

// POST: Send encrypted message
export async function POST(request) {
    const user = await verifyUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { recipientId, message, password } = await request.json();

        if (!recipientId || !message || !password) {
            return NextResponse.json({ 
                error: 'Recipient ID, message, and password required' 
            }, { status: 400 });
        }

        // Verify recipient exists and has encryption enabled
        const [recipient] = await query(`
            SELECT id, username, encryption_enabled 
            FROM users 
            WHERE id = ?
        `, [recipientId]);

        if (!recipient) {
            return NextResponse.json({ 
                error: 'Recipient not found' 
            }, { status: 404 });
        }

        if (!recipient.encryption_enabled) {
            return NextResponse.json({ 
                error: 'Recipient does not have encryption enabled' 
            }, { status: 400 });
        }

        await encryptionService.sendEncryptedMessage(user.userId, recipientId, message, password);

        return NextResponse.json({
            success: true,
            message: 'Encrypted message sent successfully',
            recipient: recipient.username
        });

    } catch (error) {
        console.error('Message sending failed:', error);
        return NextResponse.json({ 
            error: 'Failed to send encrypted message',
            details: error.message 
        }, { status: 500 });
    }
}

// GET: Get encrypted messages for user
export async function GET(request) {
    const user = await verifyUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const messageId = searchParams.get('messageId');
        const password = searchParams.get('password');

        if (messageId && password) {
            // Decrypt specific message
            const decryptedMessage = await encryptionService.receiveEncryptedMessage(
                parseInt(messageId), 
                user.userId, 
                password
            );

            return NextResponse.json({
                success: true,
                messageId: parseInt(messageId),
                content: decryptedMessage
            });
        } else {
            // Get list of messages for user
            const messages = await query(`
                SELECT 
                    em.id,
                    em.sender_id,
                    u.username as sender_username,
                    em.is_read,
                    em.created_at
                FROM encrypted_messages em
                JOIN users u ON em.sender_id = u.id
                WHERE em.recipient_id = ?
                ORDER BY em.created_at DESC
                LIMIT 50
            `, [user.userId]);

            return NextResponse.json({
                success: true,
                messages: messages
            });
        }

    } catch (error) {
        console.error('Message retrieval failed:', error);
        return NextResponse.json({ 
            error: 'Failed to retrieve messages',
            details: error.message 
        }, { status: 500 });
    }
}