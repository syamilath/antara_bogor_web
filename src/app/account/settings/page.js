'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match');
      setSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters long');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage(result.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      setMessage('An error occurred while changing your password');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Account deleted successfully');
        router.push('/');
      } else {
        const result = await response.json();
        setMessage(result.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      setMessage('An error occurred while deleting your account');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#013f6e]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-[#013f6e] hover:text-blue-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            </div>
            <Link
              href="/account/profile"
              className="text-sm text-[#013f6e] hover:text-blue-700"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Username</p>
                  <p className="text-sm text-gray-500">{user?.username}</p>
                </div>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Account Type</p>
                  <p className="text-sm text-gray-500 capitalize">{user?.role || 'User'}</p>
                </div>
              </div>
              <div className="flex justify-between items-center py-3">
                <div>
                  <p className="font-medium text-gray-900">Member Since</p>
                  <p className="text-sm text-gray-500">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#013f6e] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#013f6e] focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#013f6e] focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>

              {message && (
                <div className={`p-4 rounded-md ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 text-sm font-medium text-white bg-[#013f6e] rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* Privacy & Security */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Security</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <button className="text-sm text-[#013f6e] hover:text-blue-700 font-medium">
                  Enable
                </button>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Login Activity</p>
                  <p className="text-sm text-gray-500">See where you're logged in</p>
                </div>
                <button className="text-sm text-[#013f6e] hover:text-blue-700 font-medium">
                  View
                </button>
              </div>
              <div className="flex justify-between items-center py-3">
                <div>
                  <p className="font-medium text-gray-900">Data Export</p>
                  <p className="text-sm text-gray-500">Download a copy of your data</p>
                </div>
                <button className="text-sm text-[#013f6e] hover:text-blue-700 font-medium">
                  Request
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
            <h2 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3">
                <div>
                  <p className="font-medium text-red-900">Delete Account</p>
                  <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}