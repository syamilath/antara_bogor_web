'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState([]);
  const [stats, setStats] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
    fetchPreferences();
    fetchCategories();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        if (!userData || (userData.role !== 'user' && userData.role !== 'member' && userData.role !== 'writer' && userData.role !== 'admin')) {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      router.push('/login');
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences || []);
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (categoryId, newScore) => {
    setPreferences(prev => {
      const existing = prev.find(p => p.category_id === categoryId);
      if (existing) {
        return prev.map(p => 
          p.category_id === categoryId 
            ? { ...p, preference_score: newScore }
            : p
        );
      } else {
        const category = categories.find(c => c.id === categoryId);
        return [...prev, {
          category_id: categoryId,
          preference_score: newScore,
          category_name: category?.name,
          category_slug: category?.slug
        }];
      }
    });
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const preferencesToSave = preferences.map(p => ({
        categoryId: p.category_id,
        score: p.preference_score
      }));

      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: preferencesToSave })
      });

      if (response.ok) {
        alert('Preferences saved successfully!');
      } else {
        alert('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Error saving preferences');
    } finally {
      setSaving(false);
    }
  };

  const resetPreferences = async () => {
    if (confirm('Are you sure you want to reset all your preferences? This will delete your reading history and start fresh.')) {
      try {
        const response = await fetch('/api/user/preferences', {
          method: 'DELETE'
        });

        if (response.ok) {
          setPreferences([]);
          setStats({});
          alert('Preferences reset successfully!');
        } else {
          alert('Failed to reset preferences');
        }
      } catch (error) {
        console.error('Error resetting preferences:', error);
        alert('Error resetting preferences');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">News Preferences</h1>
              <p className="text-gray-600 mt-2">
                Customize your news feed based on your interests
              </p>
            </div>
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Back to News
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Interactions</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats.total_interactions || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Categories Explored</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats.categories_interacted || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Avg. Reading Time</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {Math.round(stats.avg_time_spent || 0)}s
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Algorithm Version</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {user?.algorithm_version || 'v1.0'}
            </p>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Category Preferences</h2>
            <div className="space-x-4">
              <button
                onClick={savePreferences}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={resetPreferences}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Reset All
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {categories.map(category => {
              const preference = preferences.find(p => p.category_id === category.id);
              const score = preference?.preference_score || 0;

              return (
                <div key={category.id} className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {category.article_count} articles available
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {score.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-500">Interest Score</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Not Interested</span>
                      <span>Very Interested</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={score}
                      onChange={(e) => updatePreference(category.id, parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0</span>
                      <span>2.5</span>
                      <span>5</span>
                      <span>7.5</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your preferences are automatically learned from your reading behavior</li>
              <li>• Higher scores mean you'll see more articles from that category</li>
              <li>• The algorithm considers your reading time, clicks, and engagement</li>
              <li>• Guest users see articles sorted by recency and popularity</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}