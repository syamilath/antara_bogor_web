'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';

// Placeholder data - replace with actual data fetching
const placeholderStats = {
  totalVisits: 1250,
  uniqueVisitors: 800,
  pageViews: 3500,
  bounceRate: '45%',
  topPages: [
    { path: '/', visits: 500 },
    { path: '/article/historic-peace-agreement-2023', visits: 150 },
    { path: '/category/technology', visits: 120 },
  ],
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate fetching data
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // --- TODO: Replace with actual API call to your analytics backend ---
        // Example: const response = await fetch('/api/admin/analytics/traffic');
        // if (!response.ok) throw new Error('Failed to fetch traffic data');
        // const data = await response.json();
        // setStats(data);

        // Using placeholder data for now
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        setStats(placeholderStats);
        // --- End TODO ---
      } catch (err) {
        setError(err.message);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Assuming Sidebar is in a layout component */}
      {/* <Sidebar /> */}
      <Sidebar /> {/* Add the Sidebar component here */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

        {loading && <p>Loading dashboard data...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stat Cards */}
            <StatCard title="Total Visits" value={stats.totalVisits} />
            <StatCard title="Unique Visitors" value={stats.uniqueVisitors} />
            <StatCard title="Page Views" value={stats.pageViews} />
            <StatCard title="Bounce Rate" value={stats.bounceRate} />

            {/* More complex charts/tables can go here */}
            <div className="md:col-span-2 lg:col-span-4 bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Top Pages</h2>
              <ul>
                {stats.topPages.map((page, index) => (
                  <li key={index} className="flex justify-between py-1 border-b last:border-b-0">
                    <span>{page.path}</span>
                    <span>{page.visits} visits</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

         {!loading && !error && !stats && (
            <p>No dashboard data available.</p>
         )}
      </main>
    </div>
  );
}

// Simple Stat Card Component
function StatCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500 uppercase">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}