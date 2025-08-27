// API endpoint for setting up user encryption
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
        return decoded;
    } catch (error) {
        console.error('User verification failed:', error.message);
        return null;
    }
}

// POST: Initialize encryption for user
export async function POST(request) {
    const user = await verifyUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { password, confirmPassword } = await request.json();

        if (!password || !confirmPassword) {
            return NextResponse.json({ 
                error: 'Password and confirmation required' 
            }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ 
                error: 'Passwords do not match' 
            }, { status: 400 });
        }

        // Check if encryption is already enabled
        const isEnabled = await encryptionService.isEncryptionEnabled(user.userId);
        if (isEnabled) {
            return NextResponse.json({ 
                error: 'Encryption already enabled for this user' 
            }, { status: 400 });
        }

        // Initialize encryption
        const result = await encryptionService.initializeUserEncryption(user.userId, password);

        return NextResponse.json({
            success: true,
            message: 'Encryption initialized successfully',
            publicKey: result.publicKey
        });

    } catch (error) {
        console.error('Encryption setup failed:', error);
        return NextResponse.json({ 
            error: 'Failed to setup encryption',
            details: error.message 
        }, { status: 500 });
    }
}

// GET: Check encryption status
export async function GET(request) {
    const user = await verifyUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const isEnabled = await encryptionService.isEncryptionEnabled(user.userId);
        const auditLog = await encryptionService.getEncryptionAuditLog(user.userId, 10);

        return NextResponse.json({
            encryptionEnabled: isEnabled,
            recentActivity: auditLog
        });

    } catch (error) {
        console.error('Failed to check encryption status:', error);
        return NextResponse.json({ 
            error: 'Failed to check encryption status' 
        }, { status: 500 });
    }
}