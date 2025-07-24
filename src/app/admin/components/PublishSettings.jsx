import React from 'react';

const PublishSettings = React.memo(function PublishSettings({ isPublishing, handlePublish, handleSaveDraft, publishStatus, articleStatus, setArticleStatus }) {
  const cardStyle = 'bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-lg shadow-lg transition-all duration-300 animate-fadeIn';
  return (
    <div className={cardStyle}>
      <h3 className="text-lg font-medium text-blue-600 mb-4">Publish Settings</h3>
      <div className="mb-4">
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          id="status"
          value={articleStatus}
          onChange={(e) => setArticleStatus(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          aria-label="Set article status"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>
      {publishStatus && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center ${
            publishStatus.startsWith('Success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
          role="alert"
        >
          <svg
            className="h-5 w-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {publishStatus.startsWith('Success') ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
          {publishStatus}
        </div>
      )}
    </div>
  );
});

export default PublishSettings; 