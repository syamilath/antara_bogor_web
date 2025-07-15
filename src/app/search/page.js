'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';
  const [searchValue, setSearchValue] = useState(q);
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navMenuRef = useRef(null);

  const fallbackCategories = [
    { id: 1, name: 'Politics', slug: 'politics', article_count: 24 },
    { id: 2, name: 'Technology', slug: 'technology', article_count: 18 },
    { id: 3, name: 'Business', slug: 'business', article_count: 15 },
    { id: 4, name: 'Sports', slug: 'sports', article_count: 22 },
    { id: 5, name: 'Entertainment', slug: 'entertainment', article_count: 17 },
    { id: 6, name: 'History', slug: 'history', article_count: 20 },
  ];

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    setError(null);
    fetch(`/api/articles?q=${encodeURIComponent(q)}`)
      .then(res => res.json())
      .then(data => {
        setResults(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch search results.');
        setLoading(false);
      });
  }, [q]);

  // Filter results by selected category (client-side)
  const filteredResults = selectedCategory === 'all'
    ? results
    : results.filter(article => article.category_slug === selectedCategory);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Header with logo and search bar */}
      <header className="py-8 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-row items-center justify-between gap-4 mb-8 w-full">
            {/* Logo on the left */}
            <div className="flex items-center gap-3">
              <Image
                src="/uploads/logo-removebg-preview.png"
                alt="Logo"
                width={80}
                height={80}
                className="w-20 h-auto"
                priority
              />
              <h1 className="hidden md:block text-xl sm:text-2xl md:text-4xl font-extrabold text-[#013f6e]">
                ANTARA<span className="text-[#a9a9a9]">BOGOR</span>
              </h1>
            </div>
            {/* Search bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center bg-white rounded-full shadow-md px-4 py-2 w-full max-w-xl border border-gray-200 focus-within:ring-2 focus-within:ring-blue-400"
              style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}
            >
              <input
                type="text"
                name="q"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                placeholder="Search news by keyword, title, or tag..."
                className="flex-1 bg-transparent outline-none px-2 py-1 text-lg text-gray-700"
                required
                aria-label="Search news"
              />
              <button
                type="submit"
                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition"
                aria-label="Search"
              >
                Search
              </button>
            </form>
          </div>
          {/* Category Bar */}
          <nav className="neumorphic-nav p-4 flex items-center justify-between" role="navigation">
            <ul
              ref={navMenuRef}
              className="flex space-x-6 overflow-x-auto pb-2 scrollbar-hide"
              tabIndex={0}
            >
              <li>
                <button
                  role="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`nav-link py-2 px-1 font-bold transition-all duration-300 ease-in-out ${selectedCategory === 'all' ? 'active-nav' : ''}`}
                >
                  All
                </button>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    role="button"
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`nav-link py-2 px-1 font-bold transition-all duration-300 ease-in-out ${selectedCategory === category.slug ? 'active-nav' : ''}`}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-4 text-blue-700">Search Results for &quot;{q}&quot;</h1>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-600 text-base">
              {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
              {selectedCategory !== 'all' && (
                <>
                  {' '}in <span className="font-semibold text-blue-700">{categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}</span>
                </>
              )}
            </span>
          </div>
        </div>
        {loading && <div className="text-lg text-gray-500">Loading...</div>}
        {error && <div className="text-lg text-red-500">{error}</div>}
        {!loading && !error && filteredResults.length === 0 && (
          <div className="text-lg text-gray-400">No articles found matching your search{selectedCategory !== 'all' ? ` in ${categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}` : ''}.</div>
        )}
        <div className="grid md:grid-cols-2 gap-8">
          {filteredResults.map(article => (
            <div key={article.id} className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4 border border-gray-100 hover:shadow-xl transition-all">
              <Link href={`/article/${article.slug}`} className="block">
                <div className="relative w-full h-48 mb-4">
                  <Image
                    src={article.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c'}
                    alt={article.title}
                    fill
                    className="object-cover rounded-xl"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{article.title}</h2>
                <p className="text-gray-600 line-clamp-2 mb-2">{article.content?.slice(0, 120)}...</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{article.category_name}</span>
                  <span>•</span>
                  <span>{new Date(article.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </main>
      {/* Footer (reuse from homepage) */}
      <footer className="py-16 mt-16 bg-slate-50 relative z-10">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-4">
          {/* Column 1: Logo/About/Socials */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-[var(--primary)] flex items-center">
              <Image
                src="/uploads/logo-removebg-preview.png"
                alt="Logo"
                width={80}
                height={80}
                className="w-[80px] h-auto mr-4"
                priority
              />
              ANTARABOGOR
            </h3>
            <p className="text-gray-600 mb-6">
              Delivering news with a retro-modern twist since 2025. Your trusted source for accurate and timely
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
          {/* Column 2: Quick Links & Categories (side by side) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
          </div>
          {/* Column 3: Contact Us */}
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
      </footer>
    </div>
  );
} 