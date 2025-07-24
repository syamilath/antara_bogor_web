import React from 'react';
import Link from 'next/link';

const TopArticlesTable = React.memo(function TopArticlesTable({ topPages }) {
  const filteredPages = topPages.filter(page => page.path.startsWith('/article/'));
  return (
    <div className="overflow-x-auto rounded-xl">
      <table className="min-w-full text-base bg-white rounded-xl shadow divide-y divide-blue-100">
        <thead>
          <tr className="bg-blue-50">
            <th className="px-6 py-3 text-left font-bold text-blue-700 uppercase tracking-wider rounded-tl-xl">Title</th>
            <th className="px-6 py-3 text-right font-bold text-blue-700 uppercase tracking-wider rounded-tr-xl">Visits</th>
          </tr>
        </thead>
        <tbody>
          {filteredPages.map((page) => (
            <tr key={page.path} className="border-b last:border-b-0 hover:bg-blue-50/60 transition group">
              <td className="px-6 py-4">
                <Link href={page.path} className="text-blue-800 group-hover:text-blue-600 font-semibold underline underline-offset-2 decoration-blue-200 hover:decoration-blue-500 transition-all duration-150" target="_blank" rel="noopener noreferrer">
                  {page.title || decodeURIComponent(page.path.replace('/article/', '').replace(/-/g, ' ')).replace(/\b\w/g, l => l.toUpperCase())}
                </Link>
              </td>
              <td className="px-6 py-4 text-right font-bold text-gray-700 group-hover:text-blue-700 text-lg">{page.visits}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredPages.length === 0 && (
        <div className="text-center text-gray-400 py-6">No news article visits yet.</div>
      )}
    </div>
  );
});

export default TopArticlesTable; 