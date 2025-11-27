'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import the Image component
import { usePathname } from 'next/navigation'; // <-- Import usePathname

// Sidebar Component (Copied from admin/page.js)
function Sidebar({ isMobile = false, onClose }) {
  // Get current pathname
  const pathname = usePathname();

  // Define sidebar items with hrefs and remove 'Users' and 'Settings'
  const items = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Create News', href: '/admin', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' }, // Assuming /admin is the create page
    { name: 'Manage News', href: '/admin/manage-news', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    // { name: 'Settings', href: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }, // Removed Settings
  ];

  return (
    <div className={`${isMobile ? 'p-4 h-full bg-white' : 'w-64 min-h-screen bg-gray-50 shadow-lg'} transition-all duration-300`}>
      <div className="flex items-center justify-between mb-8 mt-4">
        <div className="flex items-center">
          <div className={`w-${isMobile ? '12' : '16'} h-${isMobile ? '12' : '16'} rounded-full bg-blue-600 flex items-center justify-center shadow-md animate-pulse`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-${isMobile ? '6' : '8'} w-${isMobile ? '6' : '8'} text-white`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h1 className={`text-${isMobile ? 'xl' : '2xl'} font-bold ml-3 text-blue-600`}>News Portal Admin</h1>
        </div>
        {isMobile && (
          <button onClick={onClose} onKeyDown={(e) => e.key === 'Enter' && onClose()} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition" aria-label="Close sidebar">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <nav>
        {items.map((item, index) => {
          // Check if the current item's href matches the pathname
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href} // Use href for navigation
              className={`w-full mb-2 p-3 rounded-lg flex items-center transition-transform transform hover:scale-105 ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              style={{ animation: `slideIn 0.4s ease-out ${0.1 + index * 0.1}s forwards`, opacity: 0 }} // Added opacity 0 for animation
              aria-current={isActive ? 'page' : undefined}
              onClick={isMobile ? onClose : undefined} // Close mobile sidebar on click
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              <span className="ml-3">{item.name}</span>
            </Link>
          );
        })}
        {/* Add the "Go to Main Website" button here */}
        <Link
          href="/"
          className="w-full mt-4 mb-2 p-3 rounded-lg flex items-center text-gray-600 hover:bg-gray-100 transition-transform transform hover:scale-105"
          style={{ animation: `slideIn 0.4s ease-out ${0.1 + items.length * 0.1}s forwards`, opacity: 0 }}
          target="_blank" // Optional: Open in new tab
          rel="noopener noreferrer" // Optional: Security for new tab
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span className="ml-3">Go to Main Website</span>
        </Link>
      </nav>
    </div>
  );
}
// End Sidebar Component

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
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {/* Ensure no whitespace directly inside the tr */}
                <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredArticles.length > 0 ? filteredArticles.map((article) => (
                  // Ensure no whitespace directly inside the tr
                  <tr key={article.id}>
                    <td className="px-6 py-4 whitespace-nowrap"> {/* Image Cell */}
                      {article.image_url ? (
                        <Image
                          src={article.image_url}
                          alt={article.title || 'Article image'}
                          width={64}
                          height={40}
                          className="h-10 w-16 object-cover rounded"
                          unoptimized={true}
                        />
                      ) : (
                        <div className="h-10 w-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No Image</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{article.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{article.category_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"> {/* <-- Add Tags Cell */}
                      {/* Display tags, join array if it exists */}
                      {article.tags && article.tags.length > 0 ? article.tags.join(', ') : 'No Tags'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{article.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"> {/* <-- Added */}
                      {article.created_at ? new Date(article.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/edit-article/${article.id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</Link>
                      <button onClick={() => handleDelete(article.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                )) : (
                  // Ensure no whitespace directly inside the tr
                  <tr><td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">No articles found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}