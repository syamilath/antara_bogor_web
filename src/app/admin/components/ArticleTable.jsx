import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const ArticleTable = React.memo(function ArticleTable({ articles, onDelete, loading, error }) {
  if (loading) return <p>Loading articles...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="bg-white shadow rounded-lg overflow-x-auto max-w-full mx-auto" style={{ maxHeight: '70vh' }}>
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Image</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Title</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Category</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Tags</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Created</th>
            <th className="px-3 py-2 text-right font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {articles.length > 0 ? articles.map((article) => (
            <tr key={article.id} className="hover:bg-blue-50 transition">
              <td className="px-3 py-2 whitespace-nowrap">
                {article.image_url ? (
                  <Image
                    src={article.image_url}
                    alt={article.title || 'Article image'}
                    width={48}
                    height={32}
                    className="h-8 w-12 object-cover rounded shadow-sm border"
                    unoptimized={true}
                  />
                ) : (
                  <div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No Image</div>
                )}
              </td>
              <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900 max-w-xs truncate" title={article.title}>{article.title}</td>
              <td className="px-3 py-2 whitespace-nowrap text-gray-600">{article.category_name || 'N/A'}</td>
              <td className="px-3 py-2 whitespace-nowrap text-gray-500 max-w-xs truncate" title={article.tags && article.tags.length > 0 ? article.tags.join(', ') : ''}>
                {article.tags && article.tags.length > 0 ? article.tags.join(', ') : 'No Tags'}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-gray-500">{article.status}</td>
              <td className="px-3 py-2 whitespace-nowrap text-gray-500">{article.created_at ? new Date(article.created_at).toLocaleDateString() : 'N/A'}</td>
              <td className="px-3 py-2 whitespace-nowrap text-right">
                <Link href={`/admin/edit-article/${article.id}`} className="text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded transition">Edit</Link>
                <button onClick={() => onDelete(article.id)} className="text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded transition">Delete</button>
              </td>
            </tr>
          )) : (
            <tr><td colSpan="7" className="px-3 py-4 text-center text-gray-400">No articles found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

export default ArticleTable; 