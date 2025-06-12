// components/ArticleSidebar.jsx
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';

export default function ArticleSidebar({ 
  selectedCategory = 'all', 
  onSelectCategory,
  isVisible = true,
  onClose
}) {
  const [categories, setCategories] = useState([]);
  const [todaysArticles, setTodaysArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch live categories and today's articles
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, articlesRes] = await Promise.all([
          fetch('/api/categories', { cache: 'no-store' }),
          fetch('/api/articles', { cache: 'no-store' })
        ]);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        }

        if (articlesRes.ok) {
          const articlesData = await articlesRes.json();
          const today = new Date();
          
          // Filter articles for today
          const todayFiltered = articlesData
            .filter(article => {
              const articleDate = new Date(article.created_at);
              return (
                articleDate.getDate() === today.getDate() &&
                articleDate.getMonth() === today.getMonth() &&
                articleDate.getFullYear() === today.getFullYear()
              );
            })
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5); // Limit to 5 articles
          
          setTodaysArticles(todayFiltered);
        }
      } catch (error) {
        console.error('Error fetching sidebar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add a default handler if onSelectCategory is not provided
  const handleCategorySelect = (category) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    } else {
      console.warn('onSelectCategory prop is not provided to ArticleSidebar');
    }
  };

  // Format date utility
  const getFormattedDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Invalid Date';
  };

  return (
    <>
      {/* Overlay for mobile - closes sidebar when clicked */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-20 transition-opacity duration-300 md:hidden ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      
      <aside 
        className={`fixed md:sticky top-0 left-0 h-full md:h-auto z-30 bg-[var(--bg)] w-3/4 max-w-xs md:max-w-none md:w-1/4 shadow-lg md:shadow-none transition-transform duration-300 ease-in-out transform ${isVisible ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} overflow-y-auto`}
      >
        {/* Close button - visible only on mobile */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text)] hover:text-[var(--primary)] md:hidden neumorphic-btn p-2 rounded-full"
          aria-label="Close sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="p-6 space-y-8">
          {/* Categories Section */}
          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center text-[var(--text)]">
              <div className="neumorphic w-10 h-10 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-tags text-[var(--primary)]"></i>
              </div>
              Categories
            </h2>
            
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => handleCategorySelect('all')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
                    selectedCategory === 'all' 
                      ? 'neumorphic-pressed text-[var(--primary)] bg-[var(--primary)]/10' 
                      : 'neumorphic-btn hover:text-[var(--primary)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>All Categories</span>
                    <span className="text-xs bg-[var(--primary)] text-white px-2 py-1 rounded-full">
                      {categories.reduce((sum, cat) => sum + (cat.article_count || 0), 0)}
                    </span>
                  </div>
                </button>
                
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
                      selectedCategory === cat.slug 
                        ? 'neumorphic-pressed text-[var(--primary)] bg-[var(--primary)]/10' 
                        : 'neumorphic-btn hover:text-[var(--primary)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{cat.name}</span>
                      <span className="text-xs bg-[var(--secondary)] text-white px-2 py-1 rounded-full">
                        {cat.article_count || 0}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Today's Articles Section */}
          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center text-[var(--text)]">
              <div className="neumorphic w-10 h-10 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-sun text-[var(--primary)]"></i>
              </div>
              Today's Articles
            </h2>
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-3 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : todaysArticles.length > 0 ? (
              <div className="space-y-4">
                {todaysArticles.map((article, index) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    className="popular-item block pb-4 group"
                    aria-label={`Read ${article.title}`}
                  >
                    <div className="flex items-start">
                      <div className="neumorphic w-8 h-8 rounded-full flex items-center justify-center mr-4 flex-shrink-0 group-hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] transition-all duration-300">
                        <span className="popular-rank text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1 hover:text-[var(--primary)] transition-colors line-clamp-2 leading-tight">
                          {article.title}
                        </h3>
                        <div className="flex items-center text-xs text-[var(--text)]/60">
                          <i className="far fa-clock mr-1"></i>
                          <span>{getFormattedDate(article.created_at)}</span>
                          {article.views && (
                            <>
                              <span className="mx-2">•</span>
                              <i className="far fa-eye mr-1"></i>
                              <span>{article.views}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="neumorphic w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-calendar-times text-[var(--text)]/40 text-xl"></i>
                </div>
                <p className="text-[var(--text)]/60 text-sm">No articles published today</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
