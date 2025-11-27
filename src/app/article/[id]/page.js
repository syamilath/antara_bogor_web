'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ArticleSidebar from '@/app/components/ArticleSidebar';

const getFormattedDate = (dateString, options = { year: 'numeric', month: 'long', day: 'numeric' }) => {
  if (!dateString) return 'Unknown Date';
  const date = new Date(dateString);
  return !isNaN(date.getTime()) ? date.toLocaleDateString('en-US', options) : 'Invalid Date';
};

export default function ArticlePage() {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [categories, setCategories] = useState([]);

  const fallbackCategories = [
    { id: 1, name: 'Business', slug: 'business' },
    { id: 2, name: 'Entertainment', slug: 'entertainment' },
    { id: 3, name: 'History', slug: 'history' },
    { id: 4, name: 'Politics', slug: 'politics' },
    { id: 5, name: 'Sports', slug: 'sports' },
  ];

  const params = useParams();
  const { id: slug } = params;

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
  const closeSidebar = () => setSidebarVisible(false);
  const handleCategorySelect = (category) => setSelectedCategory(category);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/articles/${slug}`);
        const data = await res.json();
        if (res.ok) setArticle(data);
        else console.error(data.error);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching article:', error);
        setLoading(false);
      }
    };
    if (slug) fetchArticle();
  }, [slug]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (res.ok) setCategories(data);
        else console.error('Gagal mengambil kategori:', data.error);
      } catch (err) {
        console.error('Error saat fetch kategori:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setSidebarVisible(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{article ? `${article.title} - RetroNews` : 'Loading - RetroNews'}</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Tiempos+Headline:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <button 
        onClick={toggleSidebar}
        className="hamburger-btn neumorphic-btn"
        aria-label="Toggle sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex flex-col md:flex-row min-h-screen bg-white">
        <ArticleSidebar
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
          isVisible={sidebarVisible}
          onClose={closeSidebar}
        />

        <main className="container mx-auto px-4 py-12 relative z-10 flex-1">
          {loading ? (
            <div className="text-center text-[var(--text)]/60 text-lg animate-pulse">Loading article...</div>
          ) : article ? (
            <article className="neumorphic-card overflow-hidden border border-gray-200/20 hover:shadow-2xl transition-transform transform hover:-translate-y-1 duration-500">
              <div className="p-8">
                <div className="flex flex-wrap gap-3 items-center mb-6">
                  <span className="category-tag px-4 py-2 text-sm font-semibold">
                    {article.category_name || 'Unknown'}
                  </span>
                  <span className="text-[var(--text)]/60 text-sm">
                    {getFormattedDate(article.created_at)}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-[var(--text)] mb-6">
                  {article.title}
                </h1>
                <div className="flex items-center gap-4 text-[var(--text)]/60 text-sm">
                  <span>By {article.author_name || 'Unknown'}</span>
                </div>
              </div>

              {article.image_url && (
                <div className="px-8">
                  <div className="neumorphic-inset rounded-xl overflow-hidden">
                    <img src={article.image_url} alt={article.title} className="w-full h-auto object-cover" />
                  </div>
                </div>
              )}

              <div className="p-8 text-[var(--text)] leading-relaxed text-lg space-y-6">
                {article.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>

              <div className="p-8 text-center border-t border-[var(--text)]/10">
                <Link href="/" className="neumorphic-btn neumorphic-btn-primary inline-flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-300">
                  <i className="fas fa-arrow-left"></i> Back to Home
                </Link>
              </div>
            </article>
          ) : (
            <div className="text-center text-[var(--text)]/60 text-lg">Article not found.</div>
          )}
        </main>
      </div>

     {/* footer */}

       <footer className="py-8 mt-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-[var(--primary)] flex items-center">
                <img src="/uploads/logo-removebg-preview.png" alt="Logo" className="w-[80px] h-auto mr-4" />
                ANTARABOGOR
              </h3>
              <p className="text-gray-600 mb-6">
                Delivering news with a retro-modern twist since 2023. Your trusted source for accurate and timely
                information.
              </p>
              <div className="flex space-x-4">
                {['facebook-f', 'twitter', 'instagram', 'linkedin-in'].map((icon, index) => (
                  <Link
                    key={index}
                    href="#"
                    className="social-icon"
                    aria-label={`Follow us on ${icon.replace('-', ' ')}`}
                    rel="noopener noreferrer"
                  >
                    <i className={`fab fa-${icon}`}></i>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 border-b border-[var(--primary)] pb-2">Quick Links</h4>
              <ul className="space-y-3">
                {['About Us', 'Contact', 'Advertise', 'Careers', 'Privacy Policy'].map((link, index) => (
                  <li key={index}>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-[var(--secondary)] transition-colors duration-300 flex items-center"
                      aria-label={link}
                    >
                      <div className="neumorphic-flat w-6 h-6 rounded-full flex items-center justify-center mr-2">
                        <i className="fas fa-chevron-right text-xs text-[var(--primary)]"></i>
                      </div>
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 border-b border-[var(--primary)] pb-2">Categories</h4>
              <ul className="space-y-3">
                {(categories.length > 0 ? categories.slice(0, 5) : fallbackCategories).map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/category/${category.slug}`}
                      className="text-gray-600 hover:text-[var(--secondary)] transition-colors duration-300 flex items-center"
                      aria-label={`View ${category.name} category`}
                    >
                      <div className="neumorphic-flat w-6 h-6 rounded-full flex items-center justify-center mr-2">
                        <i className="fas fa-chevron-right text-xs text-[var(--primary)]"></i>
                      </div>
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 border-b border-[var(--primary)] pb-2">Contact Us</h4>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <div className="neumorphic-flat w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-map-marker-alt text-[var(--primary)]"></i>
                  </div>
                  <span>123 Retro Street, News City, NC 12345</span>
                </li>
                <li className="flex items-center">
                  <div className="neumorphic-flat w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-phone-alt text-[var(--primary)]"></i>
                  </div>
                  <span>(123) 456-7890</span>
                </li>
                <li className="flex items-center">
                  <div className="neumorphic-flat w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-envelope text-[var(--primary)]"></i>
                  </div>
                  <span>info@retronews.com</span>
                </li>
                <li className="flex items-center">
                  <div className="neumorphic-flat w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    <i className="far fa-clock text-[var(--primary)]"></i>
                  </div>
                  <span>Mon-Fri: 9AM - 5PM</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-300 mt-12 pt-8 text-center text-gray-500">
            <p>
              © 2025 ANTARABOGOR. All rights reserved. | Designed with{' '}
              <i className="fas fa-heart text-[var(--secondary)] mx-1"></i> for news enthusiasts
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
