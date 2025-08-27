import { query } from '../../../lib/db';
import bcrypt from 'bcrypt';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { validatePassword } from '../../../lib/passwordValidation';
import { encryptionService } from '../../../lib/encryptionService';

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

        // Validate password complexity
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                error: 'Password does not meet security requirements',
                details: passwordValidation.errors
            });
        }
        // Check if user already exists
        const existingUser = await query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'Email or username already exists' });
        }
        // Hash the password with increased security
        const saltRounds = 12; // Increased from 10 for better security
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // Insert the new user into the database
        const result = await query(
            'INSERT INTO users (username, email, password_hash, profile_photo, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [username, email, hashedPassword, profilePhotoPath, 'user']
        );
        
        if (result.affectedRows === 1) {
            const userId = result.insertId;
            
            try {
                // Automatically enable E2E encryption for new user
                console.log(`Setting up E2E encryption for new user: ${userId}`);
                await encryptionService.initializeUserEncryption(userId, password);
                console.log(`E2E encryption enabled successfully for user: ${userId}`);
                
                return res.status(201).json({ 
                    message: 'User created successfully with E2E encryption enabled', 
                    userId: userId,
                    encryptionEnabled: true
                });
            } catch (encryptionError) {
                console.error('Failed to enable encryption for new user:', encryptionError);
                // User was created but encryption failed - still return success
                // The user can set up encryption later if needed
                return res.status(201).json({ 
                    message: 'User created successfully (encryption setup failed - can be enabled later)', 
                    userId: userId,
                    encryptionEnabled: false,
                    encryptionError: encryptionError.message
                });
            }
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