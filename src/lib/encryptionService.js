// Encryption Service for News Website
// Handles user encryption, key management, and secure data operations

import { 
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
    decryptArticleContent
} from './encryption.js';
import { query } from './db.js';

/**
 * Encryption Service Class
 */
export class EncryptionService {
    constructor() {
        this.auditLog = [];
    }

    /**
     * Initialize encryption for a user
     * @param {number} userId - User ID
     * @param {string} password - User's password
     * @returns {Promise<Object>} Encryption setup result
     */
    async initializeUserEncryption(userId, password) {
        try {
            // Generate salt for key derivation
            const salt = generateSalt();
            
            // Generate RSA key pair
            const { publicKey, privateKey } = generateKeyPair();
            
            // Derive encryption key from password
            const userKey = deriveKeyFromPassword(password, salt);
            
            // Encrypt private key with user's derived key
            const encryptedPrivateKey = encryptData(privateKey, userKey);
            
            // Update user record with encryption data
            await query(`
                UPDATE users 
                SET encryption_key_salt = ?, 
                    public_key = ?, 
                    encrypted_private_key = ?, 
                    encryption_enabled = TRUE 
                WHERE id = ?
            `, [salt, publicKey, JSON.stringify(encryptedPrivateKey), userId]);
            
            // Log the action
            await this.logEncryptionAction(userId, 'ENCRYPTION_INITIALIZED', 'user', userId, true);
            
            return {
                success: true,
                publicKey,
                message: 'Encryption initialized successfully'
            };
        } catch (error) {
            await this.logEncryptionAction(userId, 'ENCRYPTION_INIT_FAILED', 'user', userId, false, error.message);
            throw new Error(`Failed to initialize encryption: ${error.message}`);
        }
    }

    /**
     * Get user's encryption key from password
     * @param {number} userId - User ID
     * @param {string} password - User's password
     * @returns {Promise<Buffer>} User's encryption key
     */
    async getUserEncryptionKey(userId, password) {
        try {
            const [user] = await query(`
                SELECT encryption_key_salt, encryption_enabled 
                FROM users 
                WHERE id = ? AND encryption_enabled = TRUE
            `, [userId]);
            
            if (!user) {
                throw new Error('User encryption not enabled');
            }
            
            return deriveKeyFromPassword(password, user.encryption_key_salt);
        } catch (error) {
            await this.logEncryptionAction(userId, 'KEY_DERIVATION_FAILED', 'user', userId, false, error.message);
            throw error;
        }
    }

    /**
     * Get user's private key
     * @param {number} userId - User ID
     * @param {string} password - User's password
     * @returns {Promise<string>} Decrypted private key
     */
    async getUserPrivateKey(userId, password) {
        try {
            const [user] = await query(`
                SELECT encrypted_private_key, encryption_key_salt 
                FROM users 
                WHERE id = ? AND encryption_enabled = TRUE
            `, [userId]);
            
            if (!user) {
                throw new Error('User encryption not enabled');
            }
            
            const userKey = deriveKeyFromPassword(password, user.encryption_key_salt);
            const encryptedPrivateKeyData = JSON.parse(user.encrypted_private_key);
            
            return decryptData(encryptedPrivateKeyData, userKey);
        } catch (error) {
            await this.logEncryptionAction(userId, 'PRIVATE_KEY_ACCESS_FAILED', 'user', userId, false, error.message);
            throw error;
        }
    }

    /**
     * Encrypt and store user sensitive data
     * @param {number} userId - User ID
     * @param {string} fieldName - Field name to encrypt
     * @param {string} value - Value to encrypt
     * @param {string} password - User's password
     * @returns {Promise<boolean>} Success status
     */
    async encryptUserField(userId, fieldName, value, password) {
        try {
            const userKey = await this.getUserEncryptionKey(userId, password);
            const encryptedData = encryptData(value, userKey);
            
            // Store encrypted data
            await query(`
                INSERT INTO encrypted_user_data (user_id, field_name, encrypted_value, encryption_iv, encryption_tag)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                encrypted_value = VALUES(encrypted_value),
                encryption_iv = VALUES(encryption_iv),
                encryption_tag = VALUES(encryption_tag),
                updated_at = CURRENT_TIMESTAMP
            `, [userId, fieldName, encryptedData.encrypted, encryptedData.iv, encryptedData.tag]);
            
            await this.logEncryptionAction(userId, 'USER_DATA_ENCRYPTED', 'user_data', null, true);
            return true;
        } catch (error) {
            await this.logEncryptionAction(userId, 'USER_DATA_ENCRYPTION_FAILED', 'user_data', null, false, error.message);
            throw error;
        }
    }

    /**
     * Decrypt user sensitive data
     * @param {number} userId - User ID
     * @param {string} fieldName - Field name to decrypt
     * @param {string} password - User's password
     * @returns {Promise<string>} Decrypted value
     */
    async decryptUserField(userId, fieldName, password) {
        try {
            const userKey = await this.getUserEncryptionKey(userId, password);
            
            const [encryptedField] = await query(`
                SELECT encrypted_value, encryption_iv, encryption_tag 
                FROM encrypted_user_data 
                WHERE user_id = ? AND field_name = ?
            `, [userId, fieldName]);
            
            if (!encryptedField) {
                throw new Error('Encrypted field not found');
            }
            
            const encryptedData = {
                encrypted: encryptedField.encrypted_value,
                iv: encryptedField.encryption_iv,
                tag: encryptedField.encryption_tag
            };
            
            const decryptedValue = decryptData(encryptedData, userKey);
            await this.logEncryptionAction(userId, 'USER_DATA_DECRYPTED', 'user_data', null, true);
            
            return decryptedValue;
        } catch (error) {
            await this.logEncryptionAction(userId, 'USER_DATA_DECRYPTION_FAILED', 'user_data', null, false, error.message);
            throw error;
        }
    }

    /**
     * Encrypt article draft
     * @param {number} articleId - Article ID
     * @param {number} authorId - Author ID
     * @param {string} content - Article content
     * @param {string} password - Author's password
     * @returns {Promise<boolean>} Success status
     */
    async encryptArticleDraft(articleId, authorId, content, password) {
        try {
            const userKey = await this.getUserEncryptionKey(authorId, password);
            const encryptedData = encryptData(content, userKey);
            const contentHash = hashData(content);
            
            // Store encrypted draft
            await query(`
                INSERT INTO encrypted_article_drafts 
                (article_id, author_id, encrypted_content, encryption_iv, encryption_tag, content_hash)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                encrypted_content = VALUES(encrypted_content),
                encryption_iv = VALUES(encryption_iv),
                encryption_tag = VALUES(encryption_tag),
                content_hash = VALUES(content_hash),
                draft_version = draft_version + 1,
                updated_at = CURRENT_TIMESTAMP
            `, [articleId, authorId, encryptedData.encrypted, encryptedData.iv, encryptedData.tag, contentHash]);
            
            // Update article metadata
            await query(`
                UPDATE articles 
                SET is_encrypted = TRUE, 
                    encryption_metadata = ?,
                    content_hash = ?
                WHERE id = ?
            `, [JSON.stringify({ encrypted_draft: true, last_encrypted: new Date().toISOString() }), contentHash, articleId]);
            
            await this.logEncryptionAction(authorId, 'ARTICLE_ENCRYPTED', 'article', articleId, true);
            return true;
        } catch (error) {
            await this.logEncryptionAction(authorId, 'ARTICLE_ENCRYPTION_FAILED', 'article', articleId, false, error.message);
            throw error;
        }
    }

    /**
     * Decrypt article draft
     * @param {number} articleId - Article ID
     * @param {number} authorId - Author ID
     * @param {string} password - Author's password
     * @returns {Promise<string>} Decrypted content
     */
    async decryptArticleDraft(articleId, authorId, password) {
        try {
            const userKey = await this.getUserEncryptionKey(authorId, password);
            
            const [draft] = await query(`
                SELECT encrypted_content, encryption_iv, encryption_tag, content_hash 
                FROM encrypted_article_drafts 
                WHERE article_id = ? AND author_id = ?
                ORDER BY updated_at DESC 
                LIMIT 1
            `, [articleId, authorId]);
            
            if (!draft) {
                throw new Error('Encrypted draft not found');
            }
            
            const encryptedData = {
                encrypted: draft.encrypted_content,
                iv: draft.encryption_iv,
                tag: draft.encryption_tag
            };
            
            const decryptedContent = decryptData(encryptedData, userKey);
            
            // Verify content integrity
            const contentHash = hashData(decryptedContent);
            if (contentHash !== draft.content_hash) {
                throw new Error('Content integrity check failed');
            }
            
            await this.logEncryptionAction(authorId, 'ARTICLE_DECRYPTED', 'article', articleId, true);
            return decryptedContent;
        } catch (error) {
            await this.logEncryptionAction(authorId, 'ARTICLE_DECRYPTION_FAILED', 'article', articleId, false, error.message);
            throw error;
        }
    }

    /**
     * Send encrypted message between users
     * @param {number} senderId - Sender ID
     * @param {number} recipientId - Recipient ID
     * @param {string} message - Message content
     * @param {string} senderPassword - Sender's password
     * @returns {Promise<boolean>} Success status
     */
    async sendEncryptedMessage(senderId, recipientId, message, senderPassword) {
        try {
            // Get recipient's public key
            const [recipient] = await query(`
                SELECT public_key 
                FROM users 
                WHERE id = ? AND encryption_enabled = TRUE
            `, [recipientId]);
            
            if (!recipient) {
                throw new Error('Recipient encryption not enabled');
            }
            
            // Generate symmetric key for this message
            const messageKey = generateEncryptionKey();
            
            // Encrypt message with symmetric key
            const encryptedMessage = encryptData(message, messageKey);
            
            // Encrypt symmetric key with recipient's public key
            const encryptedKey = encryptWithPublicKey(messageKey, recipient.public_key);
            
            const messageHash = hashData(message);
            
            // Store encrypted message
            await query(`
                INSERT INTO encrypted_messages 
                (sender_id, recipient_id, encrypted_content, encryption_iv, encryption_tag, message_hash)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [senderId, recipientId, JSON.stringify({
                encryptedMessage: encryptedMessage,
                encryptedKey: encryptedKey
            }), encryptedMessage.iv, encryptedMessage.tag, messageHash]);
            
            await this.logEncryptionAction(senderId, 'MESSAGE_SENT', 'message', null, true);
            return true;
        } catch (error) {
            await this.logEncryptionAction(senderId, 'MESSAGE_SEND_FAILED', 'message', null, false, error.message);
            throw error;
        }
    }

    /**
     * Receive and decrypt message
     * @param {number} messageId - Message ID
     * @param {number} recipientId - Recipient ID
     * @param {string} recipientPassword - Recipient's password
     * @returns {Promise<string>} Decrypted message
     */
    async receiveEncryptedMessage(messageId, recipientId, recipientPassword) {
        try {
            const [message] = await query(`
                SELECT encrypted_content, sender_id, message_hash 
                FROM encrypted_messages 
                WHERE id = ? AND recipient_id = ?
            `, [messageId, recipientId]);
            
            if (!message) {
                throw new Error('Message not found');
            }
            
            const privateKey = await this.getUserPrivateKey(recipientId, recipientPassword);
            const messageData = JSON.parse(message.encrypted_content);
            
            // Decrypt symmetric key with private key
            const messageKey = decryptWithPrivateKey(messageData.encryptedKey, privateKey);
            
            // Decrypt message with symmetric key
            const decryptedMessage = decryptData(messageData.encryptedMessage, messageKey);
            
            // Verify message integrity
            const messageHash = hashData(decryptedMessage);
            if (messageHash !== message.message_hash) {
                throw new Error('Message integrity check failed');
            }
            
            // Mark as read
            await query(`
                UPDATE encrypted_messages 
                SET is_read = TRUE 
                WHERE id = ?
            `, [messageId]);
            
            await this.logEncryptionAction(recipientId, 'MESSAGE_RECEIVED', 'message', messageId, true);
            return decryptedMessage;
        } catch (error) {
            await this.logEncryptionAction(recipientId, 'MESSAGE_RECEIVE_FAILED', 'message', messageId, false, error.message);
            throw error;
        }
    }

    /**
     * Rotate user's encryption keys
     * @param {number} userId - User ID
     * @param {string} oldPassword - Current password
     * @param {string} newPassword - New password
     * @param {string} reason - Reason for rotation
     * @returns {Promise<boolean>} Success status
     */
    async rotateUserKeys(userId, oldPassword, newPassword, reason = 'User requested') {
        try {
            // Get current encryption data
            const oldKey = await this.getUserEncryptionKey(userId, oldPassword);
            const oldPrivateKey = await this.getUserPrivateKey(userId, oldPassword);
            
            // Generate new salt and key pair
            const newSalt = generateSalt();
            const { publicKey: newPublicKey, privateKey: newPrivateKey } = generateKeyPair();
            const newUserKey = deriveKeyFromPassword(newPassword, newSalt);
            
            // Encrypt new private key
            const encryptedNewPrivateKey = encryptData(newPrivateKey, newUserKey);
            
            // Hash keys for audit trail
            const oldKeyHash = hashData(oldKey.toString('base64'));
            const newKeyHash = hashData(newUserKey.toString('base64'));
            
            // Update user record
            await query(`
                UPDATE users 
                SET encryption_key_salt = ?, 
                    public_key = ?, 
                    encrypted_private_key = ? 
                WHERE id = ?
            `, [newSalt, newPublicKey, JSON.stringify(encryptedNewPrivateKey), userId]);
            
            // Log key rotation
            await query(`
                INSERT INTO key_rotation_history 
                (user_id, old_key_hash, new_key_hash, rotation_reason)
                VALUES (?, ?, ?, ?)
            `, [userId, oldKeyHash, newKeyHash, reason]);
            
            await this.logEncryptionAction(userId, 'KEY_ROTATION_SUCCESS', 'user', userId, true);
            return true;
        } catch (error) {
            await this.logEncryptionAction(userId, 'KEY_ROTATION_FAILED', 'user', userId, false, error.message);
            throw error;
        }
    }

    /**
     * Log encryption-related actions for audit
     * @param {number} userId - User ID
     * @param {string} action - Action performed
     * @param {string} resourceType - Type of resource
     * @param {number} resourceId - Resource ID
     * @param {boolean} success - Whether action succeeded
     * @param {string} errorMessage - Error message if failed
     * @returns {Promise<void>}
     */
    async logEncryptionAction(userId, action, resourceType, resourceId, success, errorMessage = null) {
        try {
            await query(`
                INSERT INTO encryption_audit_log 
                (user_id, action, resource_type, resource_id, success, error_message)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [userId, action, resourceType, resourceId, success, errorMessage]);
        } catch (error) {
            console.error('Failed to log encryption action:', error);
        }
    }

    /**
     * Get encryption audit log for user
     * @param {number} userId - User ID
     * @param {number} limit - Number of records to return
     * @returns {Promise<Array>} Audit log entries
     */
    async getEncryptionAuditLog(userId, limit = 50) {
        try {
            // Ensure limit is a safe integer
            const safeLimit = Math.max(1, Math.min(parseInt(limit) || 50, 1000));
            
            return await query(`
                SELECT action, resource_type, resource_id, success, error_message, created_at
                FROM encryption_audit_log 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT ${safeLimit}
            `, [userId]);
        } catch (error) {
            console.error('Failed to get audit log:', error);
            return [];
        }
    }

    /**
     * Check if user has encryption enabled
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} Encryption status
     */
    async isEncryptionEnabled(userId) {
        try {
            const [user] = await query(`
                SELECT encryption_enabled 
                FROM users 
                WHERE id = ?
            `, [userId]);
            
            return user ? user.encryption_enabled : false;
        } catch (error) {
            console.error('Failed to check encryption status:', error);
            return false;
        }
    }
}

// Export singleton instance
export const encryptionService = new EncryptionService();
export default encryptionService;