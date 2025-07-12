'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation'; // Ensure useRouter is imported
import Link from 'next/link';
import 'easymde/dist/easymde.min.css';
import Sidebar from './components/Sidebar.jsx';
import Image from 'next/image';

const EasyMDE = dynamic(() => import('react-simplemde-editor').then((mod) => mod.default), { ssr: false });

// EasyMDE Configuration
const mdeOptions = {
  spellChecker: false,
  // Customize toolbar, shortcuts, or other options as needed
};

// Custom Hook for Article Form Logic
function useArticleForm() {
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState('');
  const [user, setUser] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [articleStatus, setArticleStatus] = useState('draft');

  // Fetch Categories and User
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, userRes] = await Promise.all([
          fetch('/api/categories', { cache: 'no-store' }),
          fetch('/api/auth/me', { cache: 'no-store' }),
        ]);

        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          const validCategories = Array.isArray(data) ? data : [];
          setCategories(validCategories);
          if (validCategories.length > 0) setCategoryId(validCategories[0].id);
        } else {
          setPublishStatus('Error: Could not load categories.');
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        } else {
          setPublishStatus('Error: Please log in to continue.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setPublishStatus('Error: Could not load data.');
      }
    };
    fetchData();
  }, []);

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!title.trim()) errors.title = 'Title is required';
    if (!content.trim()) errors.content = 'Content is required';
    if (!categoryId) errors.category = 'Category is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Image Handling
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setPublishStatus('Error: Only JPEG or PNG images are allowed.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setPublishStatus('Error: Image size must be less than 5MB.');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Tag Handling
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Publish or Save Draft
  const handlePublish = async (e, status = 'published') => {
    e.preventDefault();
    if (!user) {
      setPublishStatus('Error: Please log in to publish.');
      return;
    }

    if (!validateForm()) {
      setPublishStatus('Error: Please fix form errors.');
      return;
    }

    setIsPublishing(true);
    setPublishStatus('Publishing...');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category_id', categoryId);
    formData.append('author_id', user.id || 1);
    formData.append('status', status);
    formData.append('tags', JSON.stringify(tags));
    if (image) formData.append('image', image);

    try {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setPublishStatus(`Success: Article "${result.title}" ${status === 'draft' ? 'saved as draft' : 'published'}!`);
        setTitle('');
        setContent('');
        setTags([]);
        setImage(null);
        setImagePreview(null);
        setCategoryId(categories[0]?.id || '');
        setFormErrors({});
      } else {
        setPublishStatus(`Error: ${result.error || 'Failed to publish article.'}`);
      }
    } catch (error) {
      console.error('Publishing error:', error);
      setPublishStatus('Error: An unexpected error occurred.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = (e) => handlePublish(e, 'draft');

  return {
    title,
    setTitle,
    content,
    setContent,
    categoryId,
    setCategoryId,
    categories,
    image,
    imagePreview,
    handleImageChange,
    tags,
    newTag,
    setNewTag,
    handleAddTag,
    handleRemoveTag,
    isPublishing,
    publishStatus,
    user,
    handlePublish,
    handleSaveDraft,
    formErrors,
    articleStatus,
    setArticleStatus,
  };
}

// Image Upload Component
function ImageUpload({ image, imagePreview, handleImageChange }) {
  const cardStyle = 'bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-lg shadow-lg transition-all duration-300 animate-fadeIn';
  return (
    <div className={cardStyle}>
      <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
        Featured Image
      </label>
      <div className="relative w-full h-48 bg-gray-100 rounded-lg flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-400 transition">
        {imagePreview ? (
          <Image
            src={imagePreview}
            alt="Selected image"
            fill
            className="object-cover"
            style={{ width: '100%', height: '100%', position: 'absolute' }}
          />
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 mt-2 text-sm">Drag & drop or click to upload</p>
          </>
        )}
        <input
          id="image"
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleImageChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Upload featured image"
        />
      </div>
      {image && <p className="text-sm text-gray-500 mt-2">Selected: {image.name}</p>}
    </div>
  );
}

// Category Select Component
function CategorySelect({ categoryId, setCategoryId, categories, error }) {
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
}

// Tags Component
function Tags({ tags, newTag, setNewTag, handleAddTag, handleRemoveTag }) {
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
}

// Publish Settings Component
function PublishSettings({ isPublishing, handlePublish, handleSaveDraft, publishStatus, articleStatus, setArticleStatus }) {
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
}

// Main Admin Panel Component
export default function AdminPanel() {
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const {
    title,
    setTitle,
    content,
    setContent,
    categoryId,
    setCategoryId,
    categories,
    image,
    imagePreview,
    handleImageChange,
    tags,
    newTag,
    setNewTag,
    handleAddTag,
    handleRemoveTag,
    isPublishing,
    publishStatus,
    user,
    handlePublish,
    handleSaveDraft,
    formErrors,
    articleStatus,
    setArticleStatus,
  } = useArticleForm();

  // Authentication Check
  useEffect(() => {
    if (!user && publishStatus.includes('Please log in')) {
      router.push('/login');
    }
  }, [user, publishStatus, router]);

  // Memoized Editor Change Handler
  const handleEditorChange = useCallback((value) => {
    setContent(value);
  }, [setContent]);

  const toggleMobileSidebar = (e) => {
    if (e.type === 'click' || (e.type === 'keydown' && (e.key === 'Enter' || e.key === ' '))) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"></path>
          </svg>
          <p className="text-lg text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={toggleMobileSidebar}
          onKeyDown={toggleMobileSidebar}
          className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition"
          aria-label="Toggle mobile sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity ${isMobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`absolute left-0 top-0 h-full w-64 transform ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
          <Sidebar isMobile={true} onClose={toggleMobileSidebar} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={handlePublish} noValidate>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-600">Create New Article</h2>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg flex items-center hover:bg-gray-300 transition disabled:opacity-50"
                  disabled={isPublishing}
                  aria-label="Save draft"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Save Draft
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700 transition disabled:opacity-50"
                  disabled={isPublishing}
                  aria-label="Publish article"
                >
                  {isPublishing ? (
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {isPublishing ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Article Title */}
                <div className="bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-lg shadow-lg transition-all duration-300 animate-fadeIn">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Article Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${formErrors.title ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                    placeholder="Enter article title"
                    required
                    aria-required="true"
                    aria-invalid={!!formErrors.title}
                    aria-describedby={formErrors.title ? 'title-error' : undefined}
                  />
                  {formErrors.title && (
                    <p id="title-error" className="text-red-500 text-sm mt-1">
                      {formErrors.title}
                    </p>
                  )}
                </div>
                {/* Article Content */}
                <div className="bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-lg shadow-lg transition-all duration-300 animate-fadeIn">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Article Content
                  </label>
                  {typeof window !== 'undefined' && (
                    <EasyMDE
                      id="content"
                      value={content}
                      onChange={handleEditorChange}
                      options={mdeOptions}
                      className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      aria-label="Article Content"
                      aria-describedby={formErrors.content ? 'content-error' : undefined}
                    />
                  )}
                  {formErrors.content && (
                    <p id="content-error" className="text-red-500 text-sm mt-1">
                      {formErrors.content}
                    </p>
                  )}
                </div>
                {/* Featured Image */}
                <ImageUpload image={image} imagePreview={imagePreview} handleImageChange={handleImageChange} />
              </div>
              <div className="space-y-6">
                {/* Publish Settings */}
                <PublishSettings
                  isPublishing={isPublishing}
                  handlePublish={handlePublish}
                  handleSaveDraft={handleSaveDraft}
                  publishStatus={publishStatus}
                  articleStatus={articleStatus}
                  setArticleStatus={setArticleStatus}
                />
                {/* Categories */}
                <CategorySelect categoryId={categoryId} setCategoryId={setCategoryId} categories={categories} error={formErrors.category} />
                {/* Tags */}
                <Tags tags={tags} newTag={newTag} setNewTag={setNewTag} handleAddTag={handleAddTag} handleRemoveTag={handleRemoveTag} />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}