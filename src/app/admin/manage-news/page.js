'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Sidebar from '../components/Sidebar.jsx';
import ArticleTable from '../components/ArticleTable.jsx';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { useNotification } from '@/components/ui/Notification';

export default function ManageNewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [user, setUser] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const { showNotification, NotificationComponent } = useNotification();

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

  const handleDeleteClick = (articleId) => {
    setArticleToDelete(articleId);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = useCallback(async () => {
    if (!articleToDelete) return;
    
    try {
      const response = await fetch(`/api/admin/articles/${articleToDelete}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete article');
      }
      
      // Remove article from state
      setArticles(articles.filter(article => article.id !== articleToDelete));
      showNotification('Article deleted successfully!', 'success');
    } catch (err) {
      console.error('Delete error:', err);
      showNotification(`Error: ${err.message}`, 'error');
    } finally {
      setArticleToDelete(null);
      setIsConfirmOpen(false);
    }
  }, [articleToDelete, articles, showNotification]);

  const handleDeleteCancel = useCallback(() => {
    setArticleToDelete(null);
    setIsConfirmOpen(false);
  }, []);

  // Filter logic (basic example)
  const filteredArticles = useMemo(() => articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? article.category_id === parseInt(filterCategory) : true;
    return matchesSearch && matchesCategory;
  }), [articles, searchTerm, filterCategory]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Add the Sidebar component here */}
      <div className="hidden md:block"> {/* Hide on mobile by default, adjust as needed */}
        <Sidebar role={user?.role} />
      </div>
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage News</h1>
          <Link 
            href="/admin" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Create New Article
          </Link>
        </div>

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

<>
          <ArticleTable 
            articles={filteredArticles} 
            onDelete={handleDeleteClick} 
            loading={loading} 
            error={error} 
          />
          
          <ConfirmationDialog
            isOpen={isConfirmOpen}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            title="Delete Article"
            message="Are you sure you want to delete this article? This action cannot be undone."
            confirmText="Delete Article"
            cancelText="Cancel"
            type="danger"
          />
          
          <NotificationComponent />
        </>
        </div>
      </main>
    </div>
  );
}