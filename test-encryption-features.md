# Testing E2E Encryption Features

## 🔐 Available Test Scenarios

### 1. User Data Encryption Test
**API Endpoint**: `/api/encryption/user-data`

**Test with cURL or browser console**:
```javascript
// Encrypt user data
fetch('/api/encryption/user-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'encrypt',
    fieldName: 'personal_email',
    value: 'secret@example.com',
    password: 'YourEncryptionPassword'
  })
})

// Decrypt user data
fetch('/api/encryption/user-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'decrypt',
    fieldName: 'personal_email',
    password: 'YourEncryptionPassword'
  })
})
```

### 2. Article Draft Encryption Test
**API Endpoint**: `/api/encryption/articles`

**Test encrypting article content**:
```javascript
// Encrypt article draft
fetch('/api/encryption/articles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'encrypt',
    articleId: 1, // Use existing article ID
    content: 'This is a secret article draft that should be encrypted!',
    password: 'YourEncryptionPassword'
  })
})

// Decrypt article draft
fetch('/api/encryption/articles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'decrypt',
    articleId: 1,
    password: 'YourEncryptionPassword'
  })
})
```

### 3. Secure Messaging Test
**API Endpoint**: `/api/encryption/messages`

**Test sending encrypted messages** (requires another user):
```javascript
// Send encrypted message
fetch('/api/encryption/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'send',
    recipientId: 2, // Another user's ID
    message: 'This is a secret encrypted message!',
    password: 'YourEncryptionPassword'
  })
})

// Receive encrypted message
fetch('/api/encryption/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'receive',
    messageId: 1,
    password: 'YourEncryptionPassword'
  })
})
```

## 🧪 Browser Console Testing

Open browser console (F12) and run these tests after setting up encryption:

### Test 1: Basic Encryption Status
```javascript
fetch('/api/encryption/setup')
  .then(r => r.json())
  .then(data => console.log('Encryption Status:', data));
```

### Test 2: Encrypt Personal Data
```javascript
fetch('/api/encryption/user-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'encrypt',
    fieldName: 'test_field',
    value: 'This is sensitive test data',
    password: 'YourEncryptionPassword' // Replace with your actual password
  })
})
.then(r => r.json())
.then(data => console.log('Encryption Result:', data));
```

### Test 3: Decrypt Personal Data
```javascript
fetch('/api/encryption/user-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'decrypt',
    fieldName: 'test_field',
    password: 'YourEncryptionPassword' // Replace with your actual password
  })
})
.then(r => r.json())
.then(data => console.log('Decryption Result:', data));
```

## 📊 Database Verification

Check the database to see encrypted data:

```sql
-- Check if user has encryption enabled
SELECT id, username, encryption_enabled FROM users WHERE username = 'amate';

-- Check encrypted user data
SELECT * FROM encrypted_user_data WHERE user_id = YOUR_USER_ID;

-- Check encryption audit log
SELECT * FROM encryption_audit_log WHERE user_id = YOUR_USER_ID ORDER BY created_at DESC;

-- Check encrypted article drafts
SELECT * FROM encrypted_article_drafts WHERE author_id = YOUR_USER_ID;
```

## 🔍 What to Look For

### Success Indicators:
- ✅ Encryption setup completes without errors
- ✅ Audit log shows successful encryption activities
- ✅ Encrypted data appears as gibberish in database
- ✅ Decrypted data matches original input
- ✅ Browser shows "Encryption Enabled" status

### Error Indicators:
- ❌ Setup fails with database errors
- ❌ API calls return 500 errors
- ❌ Decryption fails or returns wrong data
- ❌ Audit log shows failed operations

## 🔄 Multi-User Testing

To test with multiple users:

1. **Create another user account** (or use existing admin account)
2. **Set up encryption for that user** separately
3. **Test secure messaging** between users
4. **Verify each user can only decrypt their own data**

## 🛡️ Security Verification

- **Password Protection**: Try decrypting with wrong password (should fail)
- **Data Integrity**: Modify encrypted data in database (decryption should fail)
- **Access Control**: Try accessing another user's encrypted data (should fail)
- **Audit Trail**: Check that all operations are logged properly