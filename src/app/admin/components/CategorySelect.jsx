import React from 'react';

const CategorySelect = React.memo(function CategorySelect({ categoryId, setCategoryId, categories, error }) {
  const cardStyle = 'bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-lg shadow-lg transition-all duration-300 animate-fadeIn';
  return (
    <div className={cardStyle}>
      <h3 className="text-lg font-medium text-blue-600 mb-4">Categories</h3>
      <div className="mb-4">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Primary Category
        </label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
          required
          aria-required="true"
          aria-label="Select primary category"
          aria-invalid={!!error}
          aria-describedby={error ? 'category-error' : undefined}
        >
          {categories.length > 0 ? (
            categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))
          ) : (
            <option value="">No categories available</option>
          )}
        </select>
        {error && (
          <p id="category-error" className="text-red-500 text-sm mt-1">
            {error}
          </p>
        )}
      </div>
    </div>
  );
});

export default CategorySelect; 