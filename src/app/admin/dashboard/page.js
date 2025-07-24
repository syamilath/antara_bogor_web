'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Link from 'next/link';
import StatCard from '../components/StatCard.jsx';
import TopArticlesTable from '../components/TopArticlesTable.jsx';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user info
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (e) {}
    };
    fetchUser();
  }, []);

  useEffect(() => {
    let intervalId;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/analytics/traffic?ts=' + Date.now(), {
          cache: 'no-store'
        });
        if (!response.ok) throw new Error('Failed to fetch traffic data');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats(); // Initial fetch

    // Poll every 2 minutes (120,000 ms)
    intervalId = setInterval(fetchStats, 120000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Manual reload handler
  const handleManualReload = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/analytics/traffic?ts=' + Date.now(), {
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch traffic data');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Sidebar role={user?.role} />
      <main className="flex-1 p-6 sm:p-10 md:p-12">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-10 tracking-tight drop-shadow-sm">Dashboard</h1>
        {loading && <div className="text-center text-lg text-blue-600 animate-pulse">Loading dashboard data...</div>}
        {error && <div className="text-center text-lg text-red-500">Error: {error}</div>}
        {!loading && !error && stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard title="Total Visits" value={stats.totalVisits} icon="👁️" />
              <StatCard title="Unique Visitors" value={stats.uniqueVisitors} icon="🧑‍🤝‍🧑" />
              <StatCard title="Page Views" value={stats.pageViews} icon="📄" />
              <StatCard title="Bounce Rate" value={stats.bounceRate} icon="↩️" />
            </div>
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl mb-8 border border-blue-100">
              <h2 className="text-2xl font-bold text-blue-700 mb-6 tracking-tight flex items-center gap-2">
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a4 4 0 014-4h4m0 0V7m0 4h-4" /></svg>
                Top News Articles
              </h2>
              <TopArticlesTable topPages={stats.topPages} />
            </div>
            {/* Manual Reload Button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={handleManualReload}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={loading}
                aria-label="Reload dashboard data"
              >
                <svg
                  className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h5M20 20v-5h-5M5.07 19.07A9 9 0 1112 21a9 9 0 01-6.93-1.93"
                  />
                </svg>
                <span className="ml-2">{loading ? 'Reloading...' : 'Reload'}</span>
              </button>
            </div>
          </>
        )}
        {!loading && !error && !stats && (
          <div className="text-center text-gray-400 text-lg">No dashboard data available.</div>
        )}
      </main>
    </div>
  );
}