'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import EncryptionSetup from '../../../components/encryption/EncryptionSetup.jsx';

export default function EncryptionPage() {
    const [user, setUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const [encryptionStatus, setEncryptionStatus] = useState(null);
    const [auditLog, setAuditLog] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
        fetchEncryptionStatus();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/auth/me', { cache: 'no-store' });
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            }
        } catch (e) {
            console.error('Failed to fetch user:', e);
        } finally {
            setUserLoading(false);
        }
    };

    const fetchEncryptionStatus = async () => {
        try {
            const response = await fetch('/api/encryption/setup');
            if (response.ok) {
                const data = await response.json();
                setEncryptionStatus(data);
                setAuditLog(data.recentActivity || []);
            }
        } catch (error) {
            console.error('Failed to fetch encryption status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSetupComplete = (data) => {
        setEncryptionStatus({ encryptionEnabled: true });
        fetchEncryptionStatus(); // Refresh data
    };

    if (userLoading) {
        return (
            <div className="flex h-screen bg-gray-50">
                <div className="w-64 h-screen bg-white shadow-lg flex flex-col">
                    <div className="p-4 animate-pulse">
                        <div className="h-10 bg-gray-200 rounded mb-4"></div>
                        <div className="space-y-2">
                            <div className="h-8 bg-gray-200 rounded"></div>
                            <div className="h-8 bg-gray-200 rounded"></div>
                            <div className="h-8 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
                <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    <div className="text-center text-lg text-blue-600 animate-pulse">Loading...</div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar role={user?.role} />
            <main className="flex-1 overflow-y-auto">
                <div className="p-6 lg:p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Encryption Settings</h1>
                        <p className="text-gray-600">Manage end-to-end encryption for your account and data protection.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Encryption Setup */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Encryption Status</h2>
                                <EncryptionSetup onSetupComplete={handleSetupComplete} />
                            </div>

                            {encryptionStatus?.encryptionEnabled && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Encryption Features</h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div>
                                                    <p className="font-medium text-gray-900">User Data Protection</p>
                                                    <p className="text-sm text-gray-600">Personal information encrypted</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div>
                                                    <p className="font-medium text-gray-900">Article Draft Encryption</p>
                                                    <p className="text-sm text-gray-600">Secure content editing</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div>
                                                    <p className="font-medium text-gray-900">Secure Messaging</p>
                                                    <p className="text-sm text-gray-600">End-to-end encrypted communications</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Activity Log */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                                {loading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="animate-pulse">
                                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : auditLog.length > 0 ? (
                                    <div className="space-y-3">
                                        {auditLog.map((activity, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center">
                                                    <div className={`w-2 h-2 rounded-full mr-3 ${
                                                        activity.success ? 'bg-green-500' : 'bg-red-500'
                                                    }`}></div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {activity.action.replace(/_/g, ' ').toLowerCase()}
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            {activity.resource_type}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(activity.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <p className="text-gray-600">No encryption activity yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Security Information */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-blue-900 mb-3">Security Information</h3>
                                <div className="space-y-2 text-sm text-blue-800">
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        AES-256-GCM encryption
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        RSA-2048 key pairs
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        PBKDF2 key derivation
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Client-side key generation
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}