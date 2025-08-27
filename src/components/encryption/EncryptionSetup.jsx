'use client';

import { useState, useEffect } from 'react';
import { clientSideEncryption } from '../../lib/encryption.js';

export default function EncryptionSetup({ onSetupComplete }) {
    const [step, setStep] = useState(1);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [encryptionStatus, setEncryptionStatus] = useState(null);
    const [keyPair, setKeyPair] = useState(null);

    // Check encryption status on component mount
    useEffect(() => {
        checkEncryptionStatus();
    }, []);

    const checkEncryptionStatus = async () => {
        try {
            const response = await fetch('/api/encryption/setup');
            if (response.ok) {
                const data = await response.json();
                setEncryptionStatus(data);
                if (data.encryptionEnabled) {
                    setStep(4); // Already set up
                }
            }
        } catch (error) {
            console.error('Failed to check encryption status:', error);
        }
    };

    const generateClientKeys = async () => {
        setLoading(true);
        setError('');
        
        try {
            // Generate key pair in browser
            const keys = await clientSideEncryption.generateKeyPair();
            setKeyPair(keys);
            setStep(2);
        } catch (error) {
            setError('Failed to generate encryption keys: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const setupEncryption = async () => {
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/encryption/setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password,
                    confirmPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setStep(3);
                if (onSetupComplete) {
                    onSetupComplete(data);
                }
            } else {
                setError(data.error || 'Failed to setup encryption');
            }
        } catch (error) {
            setError('Network error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadBackupKeys = () => {
        if (!keyPair) return;

        const backupData = {
            publicKey: keyPair.publicKey,
            privateKey: keyPair.privateKey,
            timestamp: new Date().toISOString(),
            warning: 'Keep this file secure and private. Anyone with access to your private key can decrypt your data.'
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `encryption-backup-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (encryptionStatus?.encryptionEnabled) {
        return (
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Encryption Enabled</h2>
                    <p className="text-gray-600 mb-4">Your account is protected with end-to-end encryption.</p>
                    
                    {encryptionStatus.recentActivity && encryptionStatus.recentActivity.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Recent Activity</h3>
                            <div className="space-y-2">
                                {encryptionStatus.recentActivity.slice(0, 3).map((activity, index) => (
                                    <div key={index} className="text-xs text-gray-500 flex justify-between">
                                        <span>{activity.action.replace(/_/g, ' ').toLowerCase()}</span>
                                        <span>{new Date(activity.created_at).toLocaleDateString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Setup End-to-End Encryption</h2>
                <p className="text-gray-600 mt-2">Protect your sensitive data with encryption</p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {step === 1 && (
                <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <div className="flex">
                            <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <h3 className="text-sm font-medium text-yellow-800">Important Security Notice</h3>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Once enabled, you'll need your password to access encrypted data. 
                                    Make sure to use a strong, memorable password.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={generateClientKeys}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Generating Keys...' : 'Start Encryption Setup'}
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <p className="text-sm text-green-700">
                            ✓ Encryption keys generated successfully in your browser
                        </p>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Encryption Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter a strong password"
                            minLength={8}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Confirm your password"
                            minLength={8}
                            required
                        />
                    </div>

                    <button
                        onClick={setupEncryption}
                        disabled={loading || !password || !confirmPassword}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Setting up Encryption...' : 'Enable Encryption'}
                    </button>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <div className="flex">
                            <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <h3 className="text-sm font-medium text-green-800">Encryption Enabled Successfully!</h3>
                                <p className="text-sm text-green-700 mt-1">
                                    Your account is now protected with end-to-end encryption.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <h3 className="text-sm font-medium text-blue-800 mb-2">Backup Your Keys</h3>
                        <p className="text-sm text-blue-700 mb-3">
                            Download a backup of your encryption keys for safekeeping.
                        </p>
                        <button
                            onClick={downloadBackupKeys}
                            className="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700"
                        >
                            Download Backup
                        </button>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                    >
                        Continue
                    </button>
                </div>
            )}
        </div>
    );
}