'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ArticleSidebar({ 
  selectedCategory = 'all', 
  isVisible = true,
  onClose
}) {
  const [categories, setCategories] = useState([]);
  const [todaysArticles, setTodaysArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState(selectedCategory);

  const router = useRouter();

  const handleCategoryClick = (slug) => {
    setCurrentCategory(slug); // Update selected category (optional)
    router.push(`/category/${slug}`); // Navigate manually
  };

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
            .slice(0, 5);

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

  const getFormattedDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'Invalid Date';
  };

  return (
    <>
      <div 
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-20 transition-opacity duration-300 md:hidden ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      <aside 
        className={`fixed md:sticky top-0 left-0 h-full md:h-auto z-30 bg-white w-3/4 max-w-xs md:max-w-none md:w-1/4 shadow-lg md:shadow-none transition-transform duration-300 ease-in-out transform ${isVisible ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} overflow-y-auto`}
      >
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
          {/* Today’s News */}
          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <div className="neumorphic w-10 h-10 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-sun text-[#013f6e]"></i>
              </div>
              Today’s News
            </h2>
            <div className="space-y-5 overflow-y h-fit scrollbar-thin scrollbar-thumb-primary scrollbar-track-gray-100 pr-2">
              {todaysArticles.length > 0 ? (
                todaysArticles.map((item, index) => (
                  <Link
                    key={item.id}
                    href={`/article/${item.slug}`}
                    className="popular-item block pb-4"
                    aria-label={`Read ${item.title}`}
                  >
                    <div className="flex items-start">
                      <div className="neumorphic w-8 h-8 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="popular-rank">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-bold mb-1 hover:text-[var(--primary)] transition-colors">
                          {item.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>
                            <i className="far fa-clock mr-1"></i> {getFormattedDate(item.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p>No articles submitted today.</p>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <div className="neumorphic w-10 h-10 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-tags text-[#013f6e]"></i>
              </div>
              Categories
            </h2>
            <ul className="space-y-3 overflow-y-auto max-h-[200rem] scrollbar-thin scrollbar-thumb-primary scrollbar-track-gray-100 pr-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/category/${category.slug}`}
                    className={`flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                      currentCategory === category.slug ? 'bg-blue-50 text-[var(--primary)] font-semibold neumorphic-inset-light' : 'text-gray-700'
                    }`}
                    onClick={(e) => {
                      e.preventDefault(); 
                      handleCategoryClick(category.slug);
                    }}
                    aria-current={currentCategory === category.slug ? 'page' : undefined}
                  >
                    <span>{category.name}</span>
                    <span className={`neumorphic-badge text-xs px-2 py-0.5 rounded-full ${
                      currentCategory === category.slug ? 'bg-[var(--primary)] text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {category.article_count || 0}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
}
