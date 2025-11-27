'use client';

import {
  useState, useEffect,
  useRef, useMemo
} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CustomLoader from './components/CustomLoader';
import TimeCard from './components/TimeCard';
import { fallbackCategories, popularArticles } from '@/data/fallbacks';

// Utility to format dates
const getFormattedDate = (dateString, options = { month: 'short', day: 'numeric' }) => {
  if (!dateString) return 'Unknown Date';
  const date = new Date(dateString);
  return !isNaN(date.getTime()) ? date.toLocaleDateString('en-US', options) : 'Invalid Date';
};

// Article Card Component
function ArticleCard({ article }) {
  const formattedDate = getFormattedDate(article.created_at);

  return (
    <div className="relative rounded-lg overflow-hidden shadow-md">
      <Link href={`/article/${article.slug}`} aria-label={`Read ${article.title}`}>
        <Image
          src={article.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c'}
          alt={article.title}
          width={400}
          height={250}
          sizes="(max-width: 768px) 100vw, 400px"
          className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />

        {/* Overlay Text */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <span className="inline-block bg-[#013f6e] text-white text-xs px-2 py-0.5 rounded">{article.category?.name || 'General'}</span>
          <h3 className="text-white text-lg font-semibold mt-2 leading-tight">
            {article.title}
          </h3>
          <p className="text-gray-300 text-sm">{formattedDate}</p>
        </div>
      </Link>
    </div>
  );
}


// Main RetroNews Component
export default function RetroNews() {
  // State
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navMenuRef = useRef(null);
  const router = useRouter();

  // Fallback Data is now imported from src/data/fallbacks.js
  
  // Fetch Articles and Categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const articlesUrl = selectedCategory === 'all' ? '/api/articles' : `/api/articles?category=${selectedCategory}`;
        const [articlesRes, categoriesRes] = await Promise.all([
          fetch(articlesUrl, { cache: 'no-store' }),
          fetch('/api/categories', { cache: 'no-store' }),
        ]);

        if (!articlesRes.ok) throw new Error(`Failed to fetch articles: ${articlesRes.statusText}`);
        if (!categoriesRes.ok) throw new Error(`Failed to fetch categories: ${categoriesRes.statusText}`);

        const articlesData = await articlesRes.json();
        const categoriesData = await categoriesRes.json();

        const safeArticlesData = Array.isArray(articlesData) ? articlesData : [];
        const safeCategoriesData = Array.isArray(categoriesData) ? categoriesData : [];

        const articlesMapped = safeArticlesData.map((article) => ({
          ...article,
          category: article.category_slug && article.category_name
            ? { name: article.category_name, slug: article.category_slug }
            : safeCategoriesData.find((cat) => String(cat.id) === String(article.category_id)) || {
              name: 'Uncategorized',
              slug: 'uncategorized',
            },
        }));

        setArticles(articlesMapped);
        setCategories(safeCategoriesData);




      } catch (error) {
        setError(`Failed to load data. Please try again later.`);
        setArticles([]);
        setCategories([]);
      } finally {
        // Delay 3 detik sebelum matikan loading
        setTimeout(() => {
          setLoading(false);
        }, 3000); // 3000 ms = 3 detik
      }


    };

    fetchData();
  }, [selectedCategory]);

  // Intersection Observer for Animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.neumorphic-card, .popular-item, .neumorphic').forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `all 0.5s ease ${index * 0.1}s`;
      observer.observe(el);
    });


    return () => observer.disconnect();
  }, []);

  // Draggable Navigation with Keyboard Support
  useEffect(() => {
    const navMenu = navMenuRef.current;
    if (!navMenu) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    const handleMouseDown = (e) => {
      isDown = true;
      startX = e.pageX - navMenu.offsetLeft;
      scrollLeft = navMenu.scrollLeft;
      navMenu.style.cursor = 'grabbing';
    };

    const handleMouseLeave = () => {
      isDown = false;
      navMenu.style.cursor = 'grab';
    };

    const handleMouseUp = () => {
      isDown = false;
      navMenu.style.cursor = 'grab';
    };

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

    const handleTouchEnd = () => {
      isDown = false;
    };

    const handleTouchMove = (e) => {
      if (!isDown) return;
      const x = e.touches[0].pageX - navMenu.offsetLeft;
      const walk = (x - startX) * 2;
      navMenu.scrollLeft = scrollLeft - walk;
    };

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') navMenu.scrollLeft += 100;
      if (e.key === 'ArrowLeft') navMenu.scrollLeft -= 100;
    };

    navMenu.addEventListener('mousedown', handleMouseDown);
    navMenu.addEventListener('mouseleave', handleMouseLeave);
    navMenu.addEventListener('mouseup', handleMouseUp);
    navMenu.addEventListener('mousemove', handleMouseMove);
    navMenu.addEventListener('touchstart', handleTouchStart);
    navMenu.addEventListener('touchend', handleTouchEnd);
    navMenu.addEventListener('touchmove', handleTouchMove);
    navMenu.addEventListener('keydown', handleKeyDown);

    return () => {
      navMenu.removeEventListener('mousedown', handleMouseDown);
      navMenu.removeEventListener('mouseleave', handleMouseLeave);
      navMenu.removeEventListener('mouseup', handleMouseUp);
      navMenu.removeEventListener('mousemove', handleMouseMove);
      navMenu.removeEventListener('touchstart', handleTouchStart);
      navMenu.removeEventListener('touchend', handleTouchEnd);
      navMenu.removeEventListener('touchmove', handleTouchMove);
      navMenu.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Navbar Scroll Behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handlers
  const handleCategoryClick = (categorySlug) => {
    setSelectedCategory(categorySlug);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = e.target.search.value.trim();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  // breaking news barnya 


  // Memoized Filtered Articles
  const filteredArticles = useMemo(() => {
    return selectedCategory === 'all'
      ? articles
      : articles.filter((article) => article?.category?.slug === selectedCategory);
  }, [articles, selectedCategory]);

  // Structured Data for SEO
  const structuredData = filteredArticles[0]
    ? {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: filteredArticles[0].title,
      image: filteredArticles[0].image_url || 'https://images.unsplash.com/photo-1495020689067-958852a7765e',
      datePublished: filteredArticles[0].created_at,
      author: { '@type': 'Person', name: filteredArticles[0].author?.name || 'Staff Writer' },
    }
    : null;

  // Render



  const today = new Date();
  const articlesToday = filteredArticles
    .filter((article) => {
      const articleDate = new Date(article.created_at);
      return (
        articleDate.getDate() === today.getDate() &&
        articleDate.getMonth() === today.getMonth() &&
        articleDate.getFullYear() === today.getFullYear()
      );
    })
    .sort((a, b) => (b.views || 0) - (a.views || 0)); // kalau mau urutkan by views

  if (loading) {
    return <CustomLoader />;
  }



  return (
    <div className="relative">
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      {/* Floating Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-10 w-20 h-20 rounded-full bg-[var(--secondary)] opacity-10 mix-blend-multiply filter blur-xl animate-float"
          style={{ animationDelay: '0s' }}
        ></div>
        <div
          className="absolute top-1/3 right-20 w-32 h-32 rounded-full bg-[var(--primary)] opacity-10 mix-blend-multiply filter blur-xl animate-float"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/4 w-24 h-24 rounded-full bg-[var(--secondary)] opacity-10 mix-blend-multiply filter blur-xl animate-float"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      {/* Header */}
      <header className="py-8 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <img
                src="/uploads/logo-removebg-preview.png"
                alt="Logo"
                className="w-20
     h-auto"
              />
              <h1 className="hidden md:block text-xl sm:text-2xl md:text-4xl font-extrabold text-[#013f6e]">
                ANTARA<span className="text-[#a9a9a9]">BOGOR</span>
              </h1>
            </div>

            <TimeCard />
          </div>
          <nav className="neumorphic-nav p-4 flex items-center justify-between" role="navigation">
            <ul
              ref={navMenuRef}
              className="flex space-x-6 overflow-x-auto pb-2 scrollbar-hide"
              tabIndex={0}
            >
              <li>
                <button
                  role="button"
                  onClick={() => handleCategoryClick('all')}
                  className={`nav-link py-2 px-1 ${selectedCategory === 'all' ? 'active-nav' : ''}`}
                >
                  All
                </button>
              </li>
              {(categories.length > 0 ? categories : fallbackCategories).map((category) => (
                <li key={category.id}>
                  <button
                    role="button"
                    onClick={() => handleCategoryClick(category.slug)}
                    className={`nav-link py-2 px-1 font-bold transition-all duration-300 ease-in-out ${selectedCategory === category.slug ? 'active-nav' : ''}`}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
            {/* <div className="flex items-center space-x-2 ml-4">
              <Link href="/admin">
                <button
                  className={`neumorphic-btn neumorphic-btn-secondary text-sm transition-all duration-300 ease-in-out ${
                    isScrolled ? 'px-2 py-1' : 'px-3 py-2'
                  }`}
                  title="Go to Admin Panel"
                  aria-label="Go to Admin Panel"
                >
                  Admin Panel
                </button>
              </Link>
            </div> */}
          </nav>
        </div>
      </header>

      <div className="max-w-[1285px] mx-auto px-4" >
        <div className="max-w-screen-xl mx-auto  bg-[#013f6e] text-white flex items-center rounded-md overflow-hidden">

          {/* Label */}
          <div className="px-2 py-2 font-bold bg-red-800 whitespace-nowrap rounded-md text-sm sm:text-base">
            BREAKING NEWS
          </div>

          {/* Konten Berita Berjalan */}
          <div className="relative overflow-hidden flex-1 group font-bold text-xs sm:text-lg ml-4">
            <div className="animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]">
              {articlesToday && articlesToday.length > 0 ? (
                [...articlesToday, ...articlesToday].map((article, index) => (
                  <span key={index} className="inline-block mr-8 sm:mr-12 p-1">
                    <Link href={`/article/${article.slug}`} className="hover:underline">
                      {article.title}
                    </Link>
                  </span>
                ))
              ) : (
                // Jika tidak ada berita, tetap buat animasi berjalan
                [
                  "There is no latest news today.",
                  "Please check back later.",
                  "Thank you for visiting us!"
                ]
                  .map((msg, index) => (
                    <span key={index} className="inline-block mr-8 sm:mr-12 p-1">
                      {msg}
                    </span>
                  ))
              )}
            </div>
          </div>

        </div>
      </div>



      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* News Feed */}
          <div className="lg:w-2/3">
            {loading ? (
              <p>Loading articles...</p>
            ) : error ? (
              <div className="text-red-500">
                <p>{error}</p>
                <button
                  onClick={() => setSelectedCategory(selectedCategory)}
                  className="neumorphic-btn neumorphic-btn-primary mt-4"
                >
                  Retry
                </button>
              </div>
            ) : filteredArticles.length > 0 ? (
              <>
                {/* Featured Story */}
                {filteredArticles[0] && (
                  <div className="neumorphic-card relative overflow-hidden rounded-2xl mb-12" style={{ height: '450px' }}>
                    <Link href={`/article/${filteredArticles[0].slug}`} aria-label={`Read ${filteredArticles[0].title}`}>
                      <Image
                        src={filteredArticles[0].image_url || 'https://images.unsplash.com/photo-1495020689067-958852a7765e'}
                        alt={filteredArticles[0].title}
                        width={1200}
                        height={450}
                        sizes="(max-width: 768px) 100vw, 1200px"
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        priority
                      />
                      {/* Overlay Teks */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                        <div className="flex items-center space-x-4 mb-2">
                          <span className="category-tag bg-[#013f6e] text-white px-3 py-1 rounded text-xs">{filteredArticles[0].category?.name || 'General'}</span>
                          <span className="date-badge bg-gray-800 text-white px-3 py-1 rounded text-xs">
                            {getFormattedDate(filteredArticles[0].created_at, { month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                        <h2 className="text-3xl font-bold text-white leading-tight mb-1">{filteredArticles[0].title}</h2>
                        <p className="text-sm text-gray-200 line-clamp-2">{filteredArticles[0].excerpt}</p>
                        <p className="text-xs text-gray-300 mt-1">By {filteredArticles[0].author?.name || 'Staff Writer'}</p>
                      </div>
                    </Link>
                  </div>
                )}


                {/* Article Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                  {filteredArticles.slice(filteredArticles[0] ? 1 : 0).map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </>
            ) : (
              <p>
                No articles found
                {selectedCategory !== 'all'
                  ? ` in the "${categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}" category`
                  : ''}.
              </p>
            )}
          </div>



          {/* Sidebar */}
          <div className="lg:w-1/3">
            {/* Remove max-height and overflow from here */}
            <div className="sticky-sidebar lg:sticky lg:top-32 space-y-8 lg:pr-2">
              {/* Popular News → GANTI jadi Today's News */}
              <div className="neumorphic p-6 rounded-2xl">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <div className="neumorphic w-10 h-10 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-sun text-[#013f6e]"></i>
                  </div>
                  Today’s News
                </h2>
                {/* Add overflow and max-height to the list container */}
                <div className="space-y-5 overflow-y h-fit scrollbar-thin scrollbar-thumb-primary scrollbar-track-gray-100 pr-2">
                  {articlesToday.length > 0 ? (
                    articlesToday.map((item, index) => (
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
                                <i className="far fa-clock mr-1"></i>{" "}
                                {getFormattedDate(item.created_at, {
                                  month: "long",
                                  day: "numeric",
                                })}
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
                {/* Add overflow and max-height to the list container */}
                <ul className="space-y-3 overflow-y-auto max-h-[200rem] scrollbar-thin scrollbar-thumb-primary scrollbar-track-gray-100 pr-2"> {/* Added classes */}
                  {(categories.length > 0 ? categories : fallbackCategories).map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/category/${category.slug}`}
                        className={`flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 transition-colors ${selectedCategory === category.slug ? 'bg-blue-50 text-[var(--primary)] font-semibold neumorphic-inset-light' : 'text-gray-700'
                          }`}
                        onClick={(e) => { e.preventDefault(); handleCategoryClick(category.slug); }} // Use button-like behavior
                        aria-current={selectedCategory === category.slug ? 'page' : undefined}
                      >
                        <span>{category.name}</span>
                        <span className={`neumorphic-badge text-xs px-2 py-0.5 rounded-full ${selectedCategory === category.slug ? 'bg-[var(--primary)] text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                          {category.article_count || 0}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
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
        className={`text-gray-600 hover:text-[var(--secondary)] transition-colors duration-300 flex items-center ${
          selectedCategory === category.slug ? 'font-semibold text-[var(--primary)]' : ''
        }`}
        onClick={(e) => {
          e.preventDefault(); // Mencegah pindah halaman
          handleCategoryClick(category.slug); // Jalankan filter
        }}
        aria-current={selectedCategory === category.slug ? 'page' : undefined}
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
    </div>
  );
}


