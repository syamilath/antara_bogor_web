'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/analytics/traffic');
        if (!response.ok) throw new Error('Failed to fetch traffic data');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
        {loading && <p>Loading dashboard data...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Visits" value={stats.totalVisits} />
              <StatCard title="Unique Visitors" value={stats.uniqueVisitors} />
              <StatCard title="Page Views" value={stats.pageViews} />
              <StatCard title="Bounce Rate" value={stats.bounceRate} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-xl font-semibold mb-4">Top News Articles</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-500 uppercase tracking-wider">Visits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topPages
                      .filter(page => page.path.startsWith('/article/'))
                      .map((page, idx) => (
                        <tr key={page.path} className="border-b last:border-b-0 hover:bg-blue-50 transition">
                          <td className="px-4 py-2">
                            <Link href={page.path} className="text-blue-700 hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                              {decodeURIComponent(page.path.replace('/article/', '').replace(/-/g, ' ')).replace(/\b\w/g, l => l.toUpperCase())}
                            </Link>
                          </td>
                          <td className="px-4 py-2 text-right font-semibold text-gray-800">{page.visits}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {stats.topPages.filter(page => page.path.startsWith('/article/')).length === 0 && (
                  <div className="text-center text-gray-400 py-4">No news article visits yet.</div>
                )}
              </div>
            </div>
          </>
        )}
        {!loading && !error && !stats && (
          <p>No dashboard data available.</p>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center">
      <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}