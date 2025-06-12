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
  const params = useParams();
  const { id: slug } = params;

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // Close sidebar
  const closeSidebar = () => {
    setSidebarVisible(false);
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    // You can add navigation logic here if needed
    // For example: router.push(`/?category=${category}`);
  };

  useEffect(() => {
    const animateOnScroll = () => {
      const elements = document.querySelectorAll('.neumorph-card, .neumorph');
      elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (elementPosition < windowHeight - 100) {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }
      });
    };

    document.querySelectorAll('.neumorph-card, .neumorph').forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = `all 0.5s ease ${index * 0.1}s`;
    });

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();
    return () => window.removeEventListener('scroll', animateOnScroll);
  }, []);

  useEffect(() => {
    const navMenu = document.querySelector('nav ul');
    if (navMenu) {
      let isDown = false;
      let startX;
      let scrollLeft;

      const handleMouseDown = (e) => {
        isDown = true;
        startX = e.pageX - navMenu.offsetLeft;
        scrollLeft = navMenu.scrollLeft;
        navMenu.style.cursor = 'grabbing';
      };

      const handleMouseLeave = () => { isDown = false; navMenu.style.cursor = 'grab'; };
      const handleMouseUp = () => { isDown = false; navMenu.style.cursor = 'grab'; };
      const handleMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - navMenu.offsetLeft;
        const walk = (x - startX) * 2;
        navMenu.scrollLeft = scrollLeft - walk;
      };

      const handleTouchStart = (e) => {
        isDown = true;
        startX = e.touches[0].pageX - navMenu.offsetLeft;
        scrollLeft = navMenu.scrollLeft;
      };
      const handleTouchEnd = () => { isDown = false; };
      const handleTouchMove = (e) => {
        if (!isDown) return;
        const x = e.touches[0].pageX - navMenu.offsetLeft;
        const walk = (x - startX) * 2;
        navMenu.scrollLeft = scrollLeft - walk;
      };

      navMenu.addEventListener('mousedown', handleMouseDown);
      navMenu.addEventListener('mouseleave', handleMouseLeave);
      navMenu.addEventListener('mouseup', handleMouseUp);
      navMenu.addEventListener('mousemove', handleMouseMove);
      navMenu.addEventListener('touchstart', handleTouchStart);
      navMenu.addEventListener('touchend', handleTouchEnd);
      navMenu.addEventListener('touchmove', handleTouchMove);

      return () => {
        navMenu.removeEventListener('mousedown', handleMouseDown);
        navMenu.removeEventListener('mouseleave', handleMouseLeave);
        navMenu.removeEventListener('mouseup', handleMouseUp);
        navMenu.removeEventListener('mousemove', handleMouseMove);
        navMenu.removeEventListener('touchstart', handleTouchStart);
        navMenu.removeEventListener('touchend', handleTouchEnd);
        navMenu.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, []);

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

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      // Auto-show sidebar on desktop
      if (window.innerWidth >= 768) { // md breakpoint
        setSidebarVisible(true);
      } else {
        setSidebarVisible(false);
      }
    };

    // Set initial state based on screen size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
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

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-24 h-24 bg-[var(--secondary)] rounded-full opacity-20 blur-2xl animate-pulse"></div>
        <div className="absolute top-1/3 right-16 w-32 h-32 bg-[var(--primary)] rounded-full opacity-20 blur-2xl animate-pulse delay-200"></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-[var(--secondary)] rounded-full opacity-20 blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Hamburger Menu Button - Fixed position for mobile */}
      <button 
        onClick={toggleSidebar}
        className="hamburger-btn neumorphic-btn"
        aria-label="Toggle sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar with visibility toggle */}
      <div className="flex flex-col md:flex-row min-h-screen bg-[var(--bg)]">
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
              {/* Article Header */}
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
                  <div className="neumorphic w-12 h-12 rounded-full overflow-hidden">
                    <img 
                      src="https://randomuser.me/api/portraits/women/44.jpg" 
                      alt="Author" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span>By {article.author_name || 'Unknown'}</span>
                </div>
              </div>
              
              {/* Article Image */}
              {article.image_url && (
                <div className="px-8">
                  <div className="neumorphic-inset rounded-xl overflow-hidden">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              )}
              
              {/* Article Content */}
              <div className="p-8 text-[var(--text)] leading-relaxed text-lg space-y-6">
                {article.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
              
              {/* Article Footer */}
              <div className="p-8 text-center border-t border-[var(--text)]/10">
                <Link 
                  href="/" 
                  className="neumorphic-btn neumorphic-btn-primary inline-flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-300"
                >
                  <i className="fas fa-arrow-left"></i>
                  Back to Home
                </Link>
              </div>
            </article>
          ) : (
            <div className="text-center text-[var(--text)]/60 text-lg">Article not found.</div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="py-16 mt-16 bg-[var(--bg)] relative z-10">
        <div className="container mx-auto px-4 text-center">
          <div className="neumorphic p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-[var(--text)] mb-4">ANTARA<span className="text-[var(--secondary)]">BOGOR</span></h3>
            <p className="text-[var(--text)]/60">Your trusted source for local news and information</p>
          </div>
        </div>
      </footer>
    </>
  );
}
