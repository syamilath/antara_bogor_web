'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Separate component that uses useSearchParams
function SearchContent() {
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
                    alt={article.title || 'Search result article image'}
                    width={400}
                    height={250}
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
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
            <p className="text-gray-600 mb-6 leading-relaxed">
              Your trusted source for local news, community updates, and in-depth coverage of Bogor and surrounding areas.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-[var(--primary)]">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">Home</Link></li>
              <li><Link href="/search" className="text-gray-600 hover:text-blue-600 transition-colors">Search News</Link></li>
              <li><Link href="/admin" className="text-gray-600 hover:text-blue-600 transition-colors">Admin Panel</Link></li>
              <li><Link href="/login" className="text-gray-600 hover:text-blue-600 transition-colors">Login</Link></li>
              <li><Link href="/signup" className="text-gray-600 hover:text-blue-600 transition-colors">Sign Up</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-[var(--primary)]">Contact Info</h3>
            <div className="space-y-3 text-gray-600">
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Bogor, West Java, Indonesia
              </p>
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                info@antarabogor.com
              </p>
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                +62 251 123456
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 ANTARABOGOR. All rights reserved. | 
            <span className="text-xs text-gray-400 ml-2">
              Icons by <a href="https://heroicons.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">Heroicons</a>
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}

// Main component with Suspense boundary
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading search page...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
} 