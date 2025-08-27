// API endpoint for encrypting/decrypting user data
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

// POST: Encrypt user data field
export async function POST(request) {
    const user = await verifyUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { fieldName, value, password } = await request.json();

        if (!fieldName || !value || !password) {
            return NextResponse.json({ 
                error: 'Field name, value, and password required' 
            }, { status: 400 });
        }

        // Validate field name (only allow specific sensitive fields)
        const allowedFields = ['email', 'phone', 'address', 'real_name', 'personal_notes'];
        if (!allowedFields.includes(fieldName)) {
            return NextResponse.json({ 
                error: 'Invalid field name' 
            }, { status: 400 });
        }

        await encryptionService.encryptUserField(user.userId, fieldName, value, password);

        return NextResponse.json({
            success: true,
            message: `${fieldName} encrypted successfully`
        });

    } catch (error) {
        console.error('User data encryption failed:', error);
        return NextResponse.json({ 
            error: 'Failed to encrypt user data',
            details: error.message 
        }, { status: 500 });
    }
}

// GET: Decrypt user data field
export async function GET(request) {
    const user = await verifyUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const fieldName = searchParams.get('field');
        const password = searchParams.get('password');

        if (!fieldName || !password) {
            return NextResponse.json({ 
                error: 'Field name and password required' 
            }, { status: 400 });
        }

        const decryptedValue = await encryptionService.decryptUserField(user.userId, fieldName, password);

        return NextResponse.json({
            success: true,
            fieldName,
            value: decryptedValue
        });

    } catch (error) {
        console.error('User data decryption failed:', error);
        return NextResponse.json({ 
            error: 'Failed to decrypt user data',
            details: error.message 
        }, { status: 500 });
    }
}