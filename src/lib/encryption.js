// End-to-End Encryption Library for News Website
import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32; // 256 bits

/**
 * Generate a cryptographically secure random key
 * @returns {string} Base64 encoded key
 */
export function generateEncryptionKey() {
    return crypto.randomBytes(KEY_LENGTH).toString('base64');
}

/**
 * Generate a key pair for asymmetric encryption
 * @returns {Object} Object containing publicKey and privateKey
 */
export function generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
    
    return { publicKey, privateKey };
}

/**
 * Derive key from password using PBKDF2
 * @param {string} password - User password
 * @param {string} salt - Salt (base64 encoded)
 * @param {number} iterations - Number of iterations (default: 100000)
 * @returns {Buffer} Derived key
 */
export function deriveKeyFromPassword(password, salt, iterations = 100000) {
    const saltBuffer = Buffer.from(salt, 'base64');
    return crypto.pbkdf2Sync(password, saltBuffer, iterations, KEY_LENGTH, 'sha256');
}

/**
 * Generate a random salt
 * @returns {string} Base64 encoded salt
 */
export function generateSalt() {
    return crypto.randomBytes(SALT_LENGTH).toString('base64');
}

/**
 * Encrypt data using AES-256-GCM
 * @param {string} plaintext - Data to encrypt
 * @param {string|Buffer} key - Encryption key (base64 string or Buffer)
 * @returns {Object} Object containing encrypted data, iv, and tag
 */
export function encryptData(plaintext, key) {
    try {
        // Convert key to Buffer if it's a string
        const keyBuffer = typeof key === 'string' ? Buffer.from(key, 'base64') : key;
        
        // Generate random IV
        const iv = crypto.randomBytes(16); // 16 bytes for CBC
        
        // Create cipher with explicit IV
        const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
        // Encrypt data
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // For CBC mode, we don't have auth tag, so we'll use HMAC
        const tag = crypto.createHmac('sha256', keyBuffer).update(encrypted).digest('hex');
        
        return {
            encrypted,
            iv: iv.toString('hex'),
            tag: tag.toString('hex')
        };
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
}

/**
 * Decrypt data using AES-256-GCM
 * @param {Object} encryptedData - Object containing encrypted, iv, and tag
 * @param {string|Buffer} key - Decryption key (base64 string or Buffer)
 * @returns {string} Decrypted plaintext
 */
export function decryptData(encryptedData, key) {
    try {
        const { encrypted, iv, tag } = encryptedData;
        
        // Convert key to Buffer if it's a string
        const keyBuffer = typeof key === 'string' ? Buffer.from(key, 'base64') : key;
        
        // Create decipher with explicit IV
        const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, Buffer.from(iv, 'hex'));
        // Verify HMAC tag
        const expectedTag = crypto.createHmac('sha256', keyBuffer).update(encrypted).digest('hex');
        if (tag !== expectedTag) {
            throw new Error('Authentication failed - data may have been tampered with');
        }
        
        // Decrypt data
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
}

/**
 * Encrypt data with RSA public key (for key exchange)
 * @param {string} plaintext - Data to encrypt
 * @param {string} publicKey - RSA public key in PEM format
 * @returns {string} Base64 encoded encrypted data
 */
export function encryptWithPublicKey(plaintext, publicKey) {
    try {
        const encrypted = crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
            Buffer.from(plaintext, 'utf8')
        );
        
        return encrypted.toString('base64');
    } catch (error) {
        console.error('RSA encryption error:', error);
        throw new Error('Failed to encrypt with public key');
    }
}

/**
 * Decrypt data with RSA private key
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @param {string} privateKey - RSA private key in PEM format
 * @returns {string} Decrypted plaintext
 */
export function decryptWithPrivateKey(encryptedData, privateKey) {
    try {
        const decrypted = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
            Buffer.from(encryptedData, 'base64')
        );
        
        return decrypted.toString('utf8');
    } catch (error) {
        console.error('RSA decryption error:', error);
        throw new Error('Failed to decrypt with private key');
    }
}

/**
 * Hash data using SHA-256
 * @param {string} data - Data to hash
 * @returns {string} Hex encoded hash
 */
export function hashData(data) {
    return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

/**
 * Create HMAC for data integrity
 * @param {string} data - Data to create HMAC for
 * @param {string} key - HMAC key
 * @returns {string} Hex encoded HMAC
 */
export function createHMAC(data, key) {
    return crypto.createHmac('sha256', key).update(data, 'utf8').digest('hex');
}

/**
 * Verify HMAC
 * @param {string} data - Original data
 * @param {string} hmac - HMAC to verify
 * @param {string} key - HMAC key
 * @returns {boolean} True if HMAC is valid
 */
export function verifyHMAC(data, hmac, key) {
    const computedHmac = createHMAC(data, key);
    return crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(computedHmac, 'hex'));
}

/**
 * Encrypt user sensitive data (email, personal info)
 * @param {Object} userData - User data to encrypt
 * @param {string} userKey - User's encryption key
 * @returns {Object} Encrypted user data
 */
export function encryptUserData(userData, userKey) {
    const sensitiveFields = ['email', 'phone', 'address', 'real_name'];
    const encryptedData = { ...userData };
    
    sensitiveFields.forEach(field => {
        if (userData[field]) {
            encryptedData[field] = encryptData(userData[field], userKey);
        }
    });
    
    return encryptedData;
}

/**
 * Decrypt user sensitive data
 * @param {Object} encryptedUserData - Encrypted user data
 * @param {string} userKey - User's encryption key
 * @returns {Object} Decrypted user data
 */
export function decryptUserData(encryptedUserData, userKey) {
    const sensitiveFields = ['email', 'phone', 'address', 'real_name'];
    const decryptedData = { ...encryptedUserData };
    
    sensitiveFields.forEach(field => {
        if (encryptedUserData[field] && typeof encryptedUserData[field] === 'object') {
            try {
                decryptedData[field] = decryptData(encryptedUserData[field], userKey);
            } catch (error) {
                console.error(`Failed to decrypt ${field}:`, error);
                decryptedData[field] = '[ENCRYPTED]';
            }
        }
    });
    
    return decryptedData;
}

/**
 * Encrypt article draft content
 * @param {string} content - Article content
 * @param {string} authorKey - Author's encryption key
 * @returns {Object} Encrypted content data
 */
export function encryptArticleContent(content, authorKey) {
    return encryptData(content, authorKey);
}

/**
 * Decrypt article draft content
 * @param {Object} encryptedContent - Encrypted content data
 * @param {string} authorKey - Author's encryption key
 * @returns {string} Decrypted content
 */
export function decryptArticleContent(encryptedContent, authorKey) {
    return decryptData(encryptedContent, authorKey);
}

// Client-side encryption utilities (for browser)
export const clientSideEncryption = {
    /**
     * Generate key pair in browser
     * @returns {Promise<Object>} Key pair object
     */
    async generateKeyPair() {
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: 'RSA-OAEP',
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: 'SHA-256'
            },
            true,
            ['encrypt', 'decrypt']
        );
        
        const publicKey = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
        const privateKey = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
        
        return {
            publicKey: btoa(String.fromCharCode(...new Uint8Array(publicKey))),
            privateKey: btoa(String.fromCharCode(...new Uint8Array(privateKey)))
        };
    },
    
    /**
     * Encrypt data in browser
     * @param {string} plaintext - Data to encrypt
     * @param {string} password - User password
     * @returns {Promise<Object>} Encrypted data
     */
    async encryptInBrowser(plaintext, password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);
        
        // Generate salt and IV
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        
        // Derive key from password
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );
        
        const key = await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
        
        // Encrypt data
        const encrypted = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            data
        );
        
        return {
            encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
            salt: btoa(String.fromCharCode(...salt)),
            iv: btoa(String.fromCharCode(...iv))
        };
    },
    
    /**
     * Decrypt data in browser
     * @param {Object} encryptedData - Encrypted data object
     * @param {string} password - User password
     * @returns {Promise<string>} Decrypted plaintext
     */
    async decryptInBrowser(encryptedData, password) {
        const { encrypted, salt, iv } = encryptedData;
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        
        // Convert base64 to arrays
        const encryptedArray = new Uint8Array(atob(encrypted).split('').map(c => c.charCodeAt(0)));
        const saltArray = new Uint8Array(atob(salt).split('').map(c => c.charCodeAt(0)));
        const ivArray = new Uint8Array(atob(iv).split('').map(c => c.charCodeAt(0)));
        
        // Derive key from password
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );
        
        const key = await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: saltArray,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
        
        // Decrypt data
        const decrypted = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: ivArray },
            key,
            encryptedArray
        );
        
        return decoder.decode(decrypted);
    }
};

export default {
    generateEncryptionKey,
    generateKeyPair,
    deriveKeyFromPassword,
    generateSalt,
    encryptData,
    decryptData,
    encryptWithPublicKey,
    decryptWithPrivateKey,
    hashData,
    createHMAC,
    verifyHMAC,
    encryptUserData,
    decryptUserData,
    encryptArticleContent,
    decryptArticleContent,
    clientSideEncryption
};