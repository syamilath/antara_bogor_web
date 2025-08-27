'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ArticleSidebar from '@/app/components/ArticleSidebar';
import { fallbackCategories } from '@/app/page';
import Image from 'next/image';
import '../article-content.css';
import { usePersonalization, useReadingTracker } from '../../../hooks/usePersonalization';
   

export default function ArticlePage() {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  // selectedCategory is the slug of the current article's category
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // <-- Add sidebar state
  const params = useParams();
  const { id: slug } = params;
  
  // Personalization hooks
  const { trackView, trackClick } = usePersonalization();
  
  // Reading tracker (will be initialized after article loads)
  const { scrollPercentage } = article ? useReadingTracker(article.id, article.category_id) : { scrollPercentage: 0 };

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
        if (res.ok) {
          setArticle(data);
          // Set selectedCategory to the article's category slug if available
          setSelectedCategory(data.category_slug || null);
          
          // Track article view for personalization
          if (data.id && data.category_id) {
            trackView(data.id, data.category_id);
          }
        } else {
          console.error(data.error);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching article:', error);
        setLoading(false);
      }
    };
    if (slug) fetchArticle();
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    // Increment visit count
    fetch(`/api/articles/${slug}/visit`, { method: 'POST' });
  }, [slug]);

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://your-domain.com/article/${article?.slug || ''}`} />
        <title>{article ? `${article.title} - RetroNews` : 'Loading - RetroNews'}</title>
        <meta name="description" content={article ? article.summary || article.title : 'Loading article...'} />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Tiempos+Headline:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-24 h-24 bg-yellow-400 rounded-full opacity-20 blur-2xl animate-pulse"></div>
        <div className="absolute top-1/3 right-16 w-32 h-32 bg-blue-500 rounded-full opacity-20 blur-2xl animate-pulse delay-200"></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-yellow-400 rounded-full opacity-20 blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Hamburger for mobile */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-white/80 rounded-full p-2 shadow-lg border border-gray-200 hover:bg-blue-100 transition"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <svg className="h-7 w-7 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="container mx-auto px-4 py-12 relative z-10 flex flex-col md:flex-row gap-8">
        {/* Sidebar: hidden on mobile unless open, always visible on md+ */}
        <div
          className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-lg transform transition-transform duration-300 md:static md:translate-x-0 md:w-1/4 md:max-w-xs md:bg-transparent md:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:block`}
        >
          {/* Close button for mobile */}
          <div className="flex justify-end md:hidden p-4">
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-blue-700 p-2 rounded-full focus:outline-none"
              aria-label="Close sidebar"
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ArticleSidebar
            categories={fallbackCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={slug => {
              setSelectedCategory(slug);
              setSidebarOpen(false); // close sidebar on select (mobile)
            }}
          />
        </div>

        <main className="flex-1">
          {loading ? (
            <div className="text-center text-gray-500 text-lg animate-pulse">Loading article...</div>
          ) : article ? (
            <article className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
              <div className="p-8">
                <div className="flex flex-wrap gap-3 items-center mb-6">
                  <span className="bg-blue-600 text-white text-xs font-semibold uppercase px-3 py-1 rounded-full">{article.category_name || 'Unknown'}</span>
                  {/* <span className="text-gray-500 text-sm">{getFormattedDate(article.published_at)}</span> */}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 mb-4">{article.title}</h1>
                <div className="flex items-center gap-4 text-gray-500 text-sm">
                  <Image
                    src={article.author_profile_photo || "https://randomuser.me/api/portraits/women/44.jpg"}
                    alt={article.author_name ? `Profile photo of ${article.author_name}` : "Author profile photo"}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                  />
                  <span>By {article.author_name || 'Unknown'}</span>
                </div>
              </div>
              <div>
<Image
  src={article.image_url || 'https://via.placeholder.com/800x400?text=No+Image'}
  alt={article.title || 'Article image'}
  width={800}
  height={400}
  className="w-full h-auto object-contain"
/>

              </div>
              <div className="p-8 text-gray-800 leading-relaxed text-lg space-y-6 article-content">
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </div>
              {Array.isArray(article.tags) && article.tags.length > 0 && (
                <div className="px-8 pb-2 flex flex-wrap gap-2 border-t border-gray-100">
                  <span className="text-gray-500 text-sm mr-2 mt-4">Tags:</span>
                  {article.tags.map((tag, idx) => (
                    <span key={idx} className="inline-block mt-4 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full hover:bg-blue-200 transition cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="p-8 text-center border-t border-gray-200">
                <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:bg-blue-700 transition">← Back to Home</Link>
              </div>
            </article>
          ) : (
            <div className="text-center text-gray-500 text-lg">Article not found.</div>
          )}
        </main>
      </div>

      <footer className="py-16 mt-16 bg-slate-50 relative z-10">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 px-4">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-3 text-[#013f6e] mb-4">
              <Image
                src="/uploads/logo-removebg-preview.png"
                alt="Logo"
                width={56}
                height={56}
                className="w-14"
              />
              ANTARABOGOR
            </h3>
            <p className="text-gray-600 mb-6">Delivering news with a retro-modern twist since 2023. Your trusted source for accurate and timely information from around the globe.</p>
            <div className="flex gap-4">
              {['facebook-f', 'twitter', 'instagram', 'linkedin-in'].map((icon, i) => (
                <Link key={i} href="#" className="bg-gray-200 hover:bg-blue-600 hover:text-white transition p-3 rounded-full text-gray-600" rel="noopener noreferrer">
                  <i className={`fab fa-${icon}`}></i>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 border-b border-blue-600 pb-2">Quick Links</h4>
            <ul className="space-y-3">
              {['About Us', 'Contact', 'Advertise', 'Careers', 'Privacy Policy'].map((link, i) => (
                <li key={i}>
                  <Link href="#" className="flex items-center gap-2 text-gray-600 hover:text-yellow-500 transition">
                    <i className="fas fa-chevron-right text-xs text-blue-600"></i> {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 border-b border-blue-600 pb-2">Categories</h4>
            <ul className="space-y-3">
              {['Politics', 'Technology', 'Business', 'Sports', 'Entertainment'].map((category, i) => (
                <li key={i}>
                  <Link href={`/category/${category.toLowerCase()}`} className="flex items-center gap-2 text-gray-600 hover:text-yellow-500 transition">
                    <i className="fas fa-chevron-right text-xs text-blue-600"></i> {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 border-b border-blue-600 pb-2">Contact Us</h4>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start gap-3">
                <i className="fas fa-map-marker-alt text-blue-600"></i> <span>123 Retro Street, News City, NC 12345</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-phone-alt text-blue-600"></i> <span>(123) 456-7890</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-envelope text-blue-600"></i> <span>info@retronews.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-8">
          Icons made from <a href="https://www.onlinewebfonts.com/icon" target="_blank" rel="noopener noreferrer" className="underline">svg icons</a> is licensed by CC BY 4.0
        </div>
      </footer>
    </>
  );
}
