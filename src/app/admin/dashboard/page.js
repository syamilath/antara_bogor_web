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
  const [userLoading, setUserLoading] = useState(true);

  // Helper function to get change indicator styling
  const getChangeIndicator = (changeValue, isInverted = false) => {
    if (changeValue === 0) {
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        icon: 'minus',
        prefix: ''
      };
    }
    
    const isPositive = isInverted ? changeValue < 0 : changeValue > 0;
    return {
      color: isPositive ? 'text-green-600' : 'text-red-600',
      bgColor: isPositive ? 'bg-green-100' : 'bg-red-100',
      icon: isPositive ? 'up' : 'down',
      prefix: changeValue > 0 ? '+' : ''
    };
  };

  useEffect(() => {
    // Fetch user info
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

  // Show loading state until user data is loaded to prevent sidebar flickering
  if (userLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-64 h-screen bg-white shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-8 mt-4 px-4">
            <div className="flex items-center">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center mr-3 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <span className="text-xl font-bold text-gray-800">Admin Panel</span>
            </div>
          </div>
          <nav className="flex-grow px-4">
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-10 bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-10 bg-gray-200 rounded-lg mb-2"></div>
            </div>
          </nav>
        </div>
        <main className="flex-1 p-6 sm:p-10 md:p-12">
          <div className="text-center text-lg text-blue-600 animate-pulse">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={user?.role} />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening with your news platform.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleManualReload}
                className={`inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                  loading ? 'cursor-not-allowed opacity-50' : ''
                }`}
                disabled={loading}
              >
                <svg
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading dashboard data</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && stats && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Visits */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Visits</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalVisits?.toLocaleString() || '0'}</p>
                    {(() => {
                      const indicator = getChangeIndicator(stats.changes?.visits || 0);
                      return (
                        <div className={`text-sm mt-2 flex items-center gap-1 font-medium ${indicator.color}`}>
                          <div className={`flex items-center justify-center w-5 h-5 rounded-full ${indicator.bgColor}`}>
                            {indicator.icon === 'minus' ? (
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                              </svg>
                            ) : indicator.icon === 'up' ? (
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                              </svg>
                            ) : (
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                              </svg>
                            )}
                          </div>
                          <span>
                            {indicator.prefix}{stats.changes?.visits || 0}% from last month
                            {stats.previousMonth && (
                              <span className="text-gray-500 font-normal ml-1">
                                ({stats.previousMonth.totalVisits} → {stats.totalVisits})
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Page Views */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Page Views</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.pageViews?.toLocaleString() || '0'}</p>
                    {(() => {
                      const indicator = getChangeIndicator(stats.changes?.pageViews || 0);
                      return (
                        <div className={`text-sm mt-2 flex items-center gap-1 font-medium ${indicator.color}`}>
                          <div className={`flex items-center justify-center w-5 h-5 rounded-full ${indicator.bgColor}`}>
                            {indicator.icon === 'minus' ? (
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                              </svg>
                            ) : indicator.icon === 'up' ? (
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                              </svg>
                            ) : (
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                              </svg>
                            )}
                          </div>
                          <span>
                            {indicator.prefix}{stats.changes?.pageViews || 0}% from last month
                            {stats.previousMonth && (
                              <span className="text-gray-500 font-normal ml-1">
                                ({stats.previousMonth.pageViews} → {stats.pageViews})
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bounce Rate */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                      <div className="group relative">
                        <svg className="h-3 w-3 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          Percentage of visitors who leave after viewing only one page
                        </div>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.bounceRate || '0%'}</p>
                    {(() => {
                      const indicator = getChangeIndicator(stats.changes?.bounceRate || 0, true); // true for inverted logic
                      return (
                        <div className={`text-sm mt-2 flex items-center gap-1 font-medium ${indicator.color}`}>
                          <div className={`flex items-center justify-center w-5 h-5 rounded-full ${indicator.bgColor}`}>
                            {indicator.icon === 'minus' ? (
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                              </svg>
                            ) : indicator.icon === 'up' ? (
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                              </svg>
                            ) : (
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                              </svg>
                            )}
                          </div>
                          <span>
                            {indicator.prefix}{stats.changes?.bounceRate || 0}% from last month
                            {stats.previousMonth && (
                              <span className="text-gray-500 font-normal ml-1">
                                ({stats.previousMonth.bounceRate} → {stats.bounceRate})
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Articles Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Top Performing Articles</h2>
                    <p className="text-sm text-gray-600 mt-1">Most visited articles this month</p>
                  </div>
                  <Link 
                    href="/admin/manage-news"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View all articles
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <TopArticlesTable topPages={stats.topPages} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Create New Article</h3>
                <p className="text-blue-100 mb-4">Start writing your next news article</p>
                <Link 
                  href="/admin"
                  className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Article
                </Link>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Manage Content</h3>
                <p className="text-green-100 mb-4">Edit, publish, or archive your articles</p>
                <Link 
                  href="/admin/manage-news"
                  className="inline-flex items-center gap-2 bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Manage
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !stats && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first article.</p>
          </div>
        )}
      </main>
    </div>
  );
}