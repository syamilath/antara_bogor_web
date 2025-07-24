import React from 'react';

const Tags = React.memo(function Tags({ tags, newTag, setNewTag, handleAddTag, handleRemoveTag }) {
  const cardStyle = 'bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-lg shadow-lg transition-all duration-300 animate-fadeIn';
  return (
    <div className={cardStyle}>
      <h3 className="text-lg font-medium text-blue-600 mb-4">Tags</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 text-blue-600 hover:text-blue-800"
              aria-label={`Remove ${tag} tag`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
          placeholder="Add new tag"
          aria-label="Add new tag"
        />
        <button
          type="button"
          onClick={handleAddTag}
          className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          aria-label="Add tag"
        >
          Add
        </button>
      </div>
    </div>
  );
});

export default Tags; 