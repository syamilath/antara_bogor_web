'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import the Image component
import { usePathname } from 'next/navigation'; // <-- Import usePathname
import Sidebar from '../components/Sidebar.jsx';
import ArticleTable from '../components/ArticleTable.jsx';

export default function ManageNewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
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
    // Fetch articles from your API endpoint for admin
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        // Adjust API endpoint if necessary
        const response = await fetch('/api/admin/articles'); // Assuming a GET endpoint exists
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        const data = await response.json();
        setArticles(data); // Assuming the API returns an array of articles
      } catch (err) {
        setError(err.message);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
    // Fetch categories if needed for filter dropdown
  }, []);

  const handleDelete = async (articleId) => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return;
    }
    try {
      // Adjust API endpoint and method
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete article');
      }
      // Remove article from state
      setArticles(articles.filter(article => article.id !== articleId));
      alert('Article deleted successfully.');
    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    }
  };

  // Filter logic (basic example)
  const filteredArticles = useMemo(() => articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? article.category_id === parseInt(filterCategory) : true;
    return matchesSearch && matchesCategory;
  }), [articles, searchTerm, filterCategory]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Add the Sidebar component here */}
      <div className="hidden md:block"> {/* Hide on mobile by default, adjust as needed */}
        <Sidebar role={user?.role} />
      </div>
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage News</h1>

        {/* Filters and Search */}
        <div className="mb-6 flex space-x-4">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg w-1/3"
          />
          {/* Add Category Filter Dropdown Here */}
        </div>

        {loading && <p>Loading articles...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <ArticleTable articles={filteredArticles} onDelete={handleDelete} loading={loading} error={error} />
        )}
      </main>
    </div>
  );
}