import { query } from '../../../lib/db';
import bcrypt from 'bcrypt';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        // Parse form data (multipart)
        const form = new IncomingForm({
            multiples: false,
            uploadDir: path.join(process.cwd(), 'public', 'uploads', 'profiles'),
            keepExtensions: true,
            maxFileSize: 5 * 1024 * 1024, // 5MB
        });
        // Ensure upload directory exists
        fs.mkdirSync(form.uploadDir, { recursive: true });
        const data = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve({ fields, files });
            });
        });
        console.log('FIELDS:', data.fields);
        console.log('FILES:', data.files);
        let { username, email, password } = data.fields;
        // formidable may return fields as arrays
        if (Array.isArray(username)) username = username[0];
        if (Array.isArray(email)) email = email[0];
        if (Array.isArray(password)) password = password[0];
        // Handle profile photo path
        let profilePhotoFile = data.files.profile_photo;
        if (Array.isArray(profilePhotoFile)) profilePhotoFile = profilePhotoFile[0];
        let profilePhotoPath = null;
        if (profilePhotoFile && profilePhotoFile.size > 0) {
            profilePhotoPath = `/uploads/profiles/${path.basename(profilePhotoFile.filepath || profilePhotoFile.path)}`;
        }
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }
        // Check if user already exists
        const existingUser = await query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'Email or username already exists' });
        }
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // Insert the new user into the database
        const result = await query(
            'INSERT INTO users (username, email, password_hash, profile_photo, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [username, email, hashedPassword, profilePhotoPath, 'writer']
        );
        if (result.affectedRows === 1) {
            return res.status(201).json({ message: 'User created successfully', userId: result.insertId });
        } else {
            throw new Error('Failed to insert user into database');
        }
    } catch (error) {
        console.error('Signup API error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email or username already exists' });
        }
        return res.status(500).json({ error: 'Internal Server Error during signup' });
    }
} 