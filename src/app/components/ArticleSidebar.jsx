// components/ArticleSidebar.jsx
import Link from 'next/link';
import { useMemo } from 'react';

export default function ArticleSidebar({ categories, fallbackCategories, popularArticles }) {
  const usedCategories = useMemo(() => {
    return categories && categories.length > 0 ? categories : fallbackCategories;
  }, [categories, fallbackCategories]);

  return (
    <aside className="w-full md:w-1/4 border-r border-gray-200 pr-4">
      {/* Kategori */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Kategori</h2>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onSelectCategory('all')}
              className={`block w-full text-left px-3 py-2 rounded-md ${
                selectedCategory === 'all' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
              }`}
            >
              Semua Kategori
            </button>
          </li>
          {usedCategories.map((cat) => (
            <li key={cat.slug}>
              <button
                onClick={() => onSelectCategory(cat.slug)}
                className={`block w-full text-left px-3 py-2 rounded-md ${
                  selectedCategory === cat.slug ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
              >
                {cat.name} ({cat.article_count})
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Artikel Populer */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Artikel Populer</h2>
        <ul className="space-y-2 text-sm">
          {popularArticles.map((article) => (
            <li key={article.slug}>
              <Link href={`/article/${article.slug}`} className="block px-3 py-2 hover:bg-gray-100 rounded-md">
                #{article.rank}. {article.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
