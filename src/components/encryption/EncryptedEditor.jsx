'use client';

import { useState, useEffect } from 'react';
import { clientSideEncryption } from '../../lib/encryption.js';

export default function EncryptedEditor({ articleId, initialContent = '', onSave }) {
    const [content, setContent] = useState(initialContent);
    const [password, setPassword] = useState('');
    const [isEncrypted, setIsEncrypted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [encryptionEnabled, setEncryptionEnabled] = useState(false);

    useEffect(() => {
        checkEncryptionStatus();
    }, []);

    const checkEncryptionStatus = async () => {
        try {
            const response = await fetch('/api/encryption/setup');
            if (response.ok) {
                const data = await response.json();
                setEncryptionEnabled(data.encryptionEnabled);
            }
        } catch (error) {
            console.error('Failed to check encryption status:', error);
        }
    };

    const encryptContent = async () => {
        if (!password) {
            setError('Password required for encryption');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/encryption/articles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    articleId,
                    content,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                setIsEncrypted(true);
                setShowPasswordPrompt(false);
                if (onSave) {
                    onSave({ encrypted: true, content });
                }
            } else {
                setError(data.error || 'Failed to encrypt content');
            }
        } catch (error) {
            setError('Network error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const decryptContent = async () => {
        if (!password) {
            setError('Password required for decryption');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/encryption/articles?articleId=${articleId}&password=${encodeURIComponent(password)}`);
            const data = await response.json();

            if (response.ok) {
                setContent(data.content);
                setIsEncrypted(false);
                setShowPasswordPrompt(false);
            } else {
                setError(data.error || 'Failed to decrypt content');
            }
        } catch (error) {
            setError('Network error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEncryptToggle = () => {
        if (isEncrypted) {
            setShowPasswordPrompt(true);
        } else {
            setShowPasswordPrompt(true);
        }
    };

    const handlePasswordSubmit = () => {
        if (isEncrypted) {
            decryptContent();
        } else {
            encryptContent();
        }
    };

    if (!encryptionEnabled) {
        return (
            <div className="border border-gray-300 rounded-md p-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                    <div className="flex">
                        <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h3 className="text-sm font-medium text-yellow-800">Encryption Not Enabled</h3>
                            <p className="text-sm text-yellow-700 mt-1">
                                Enable encryption in your account settings to use encrypted drafts.
                            </p>
                        </div>
                    </div>
                </div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-64 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write your article content here..."
                />
            </div>
        );
    }

    return (
        <div className="border border-gray-300 rounded-md">
            {/* Encryption Controls */}
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isEncrypted ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium text-gray-700">
                        {isEncrypted ? 'Encrypted Draft' : 'Unencrypted Draft'}
                    </span>
                </div>
                <button
                    onClick={handleEncryptToggle}
                    className={`px-3 py-1 text-xs rounded-md ${
                        isEncrypted 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                >
                    {isEncrypted ? 'Decrypt' : 'Encrypt'}
                </button>
            </div>

            {/* Password Prompt Modal */}
            {showPasswordPrompt && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            {isEncrypted ? 'Decrypt Content' : 'Encrypt Content'}
                        </h3>
                        
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <div className="mb-4">
                            <label htmlFor="encryptPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Encryption Password
                            </label>
                            <input
                                type="password"
                                id="encryptPassword"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your encryption password"
                                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                            />
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowPasswordPrompt(false);
                                    setPassword('');
                                    setError('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePasswordSubmit}
                                disabled={loading || !password}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : (isEncrypted ? 'Decrypt' : 'Encrypt')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Editor */}
            <div className="p-4">
                {isEncrypted ? (
                    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-md p-8 text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Content Encrypted</h3>
                        <p className="text-gray-600 mb-4">
                            This draft is encrypted and protected. Click "Decrypt" to view and edit the content.
                        </p>
                        <button
                            onClick={handleEncryptToggle}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            Decrypt to Edit
                        </button>
                    </div>
                ) : (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-64 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Write your article content here..."
                    />
                )}
            </div>

            {/* Save Controls */}
            {!isEncrypted && (
                <div className="bg-gray-50 px-4 py-2 border-t border-gray-300 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        Content is currently unencrypted
                    </div>
                    <div className="space-x-2">
                        <button
                            onClick={() => onSave && onSave({ encrypted: false, content })}
                            className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            Save Draft
                        </button>
                        <button
                            onClick={handleEncryptToggle}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Encrypt & Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}