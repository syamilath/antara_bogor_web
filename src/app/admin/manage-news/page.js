'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import the Image component
import { usePathname } from 'next/navigation'; // <-- Import usePathname
import Sidebar from '../components/Sidebar.jsx';

export default function ManageNewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  // Add state for categories if needed for filtering

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
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? article.category_id === parseInt(filterCategory) : true; // Adjust based on your data structure
    // Add tag filtering if needed in the future
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Add the Sidebar component here */}
      <div className="hidden md:block"> {/* Hide on mobile by default, adjust as needed */}
        <Sidebar />
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
          <div className="bg-white shadow rounded-lg overflow-x-auto max-w-full mx-auto" style={{ maxHeight: '70vh' }}>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Image</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Title</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Category</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Tags</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Created</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredArticles.length > 0 ? filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-blue-50 transition">
                    <td className="px-3 py-2 whitespace-nowrap">
                      {article.image_url ? (
                        <Image
                          src={article.image_url}
                          alt={article.title || 'Article image'}
                          width={48}
                          height={32}
                          className="h-8 w-12 object-cover rounded shadow-sm border"
                          unoptimized={true}
                        />
                      ) : (
                        <div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No Image</div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900 max-w-xs truncate" title={article.title}>{article.title}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-600">{article.category_name || 'N/A'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-500 max-w-xs truncate" title={article.tags && article.tags.length > 0 ? article.tags.join(', ') : ''}>
                      {article.tags && article.tags.length > 0 ? article.tags.join(', ') : 'No Tags'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-500">{article.status}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-500">{article.created_at ? new Date(article.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-right">
                      <Link href={`/admin/edit-article/${article.id}`} className="text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded transition">Edit</Link>
                      <button onClick={() => handleDelete(article.id)} className="text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded transition">Delete</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="7" className="px-3 py-4 text-center text-gray-400">No articles found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}