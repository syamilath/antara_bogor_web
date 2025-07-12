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
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Sidebar />
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
              <div className="overflow-x-auto rounded-xl">
                <table className="min-w-full text-base bg-white rounded-xl shadow divide-y divide-blue-100">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="px-6 py-3 text-left font-bold text-blue-700 uppercase tracking-wider rounded-tl-xl">Title</th>
                      <th className="px-6 py-3 text-right font-bold text-blue-700 uppercase tracking-wider rounded-tr-xl">Visits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topPages
                      .filter(page => page.path.startsWith('/article/'))
                      .map((page, idx) => (
                        <tr key={page.path} className="border-b last:border-b-0 hover:bg-blue-50/60 transition group">
                          <td className="px-6 py-4">
                            <Link href={page.path} className="text-blue-800 group-hover:text-blue-600 font-semibold underline underline-offset-2 decoration-blue-200 hover:decoration-blue-500 transition-all duration-150" target="_blank" rel="noopener noreferrer">
                              {page.title || decodeURIComponent(page.path.replace('/article/', '').replace(/-/g, ' ')).replace(/\b\w/g, l => l.toUpperCase())}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-gray-700 group-hover:text-blue-700 text-lg">{page.visits}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {stats.topPages.filter(page => page.path.startsWith('/article/')).length === 0 && (
                  <div className="text-center text-gray-400 py-6">No news article visits yet.</div>
                )}
              </div>
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

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center border border-blue-100 hover:shadow-2xl transition-all duration-200">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="text-sm font-semibold text-blue-700 uppercase mb-1 tracking-wider">{title}</h3>
      <p className="text-4xl font-extrabold text-gray-900 drop-shadow">{value}</p>
    </div>
  );
}