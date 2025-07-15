// components/ArticleSidebar.jsx
import Link from 'next/link';
import PropTypes from 'prop-types';

export default function ArticleSidebar({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="w-64 min-h-screen bg-gray-50 shadow-lg flex flex-col transition-all duration-300">
      <div className="flex items-center mb-8 mt-4 px-4">
        <div className="neumorphic p-2 mr-3 pulse rounded-full bg-blue-500 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <span className="text-xl font-bold text-gray-700">Kategori</span>
      </div>
      <nav className="flex-grow px-4">
        <ul>
          <li className="mb-2">
            <button
              onClick={() => onSelectCategory('all')}
              className={`flex items-center w-full py-2 px-3 rounded-lg transition-all duration-200 text-left ${
                selectedCategory === 'all'
                  ? 'neumorphic-inset bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Semua Kategori
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug} className="mb-2">
              <button
                onClick={() => onSelectCategory(cat.slug)}
                className={`flex items-center w-full py-2 px-3 rounded-lg transition-all duration-200 text-left ${
                  selectedCategory === cat.slug
                    ? 'neumorphic-inset bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6" />
                </svg>
                {cat.name} <span className="ml-2 text-xs text-gray-400">({cat.article_count})</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

ArticleSidebar.propTypes = {
  categories: PropTypes.array.isRequired,
  selectedCategory: PropTypes.string,
  onSelectCategory: PropTypes.func.isRequired,
};
