'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '../../components/Sidebar.jsx';
import Image from 'next/image';
import TagsInput from '../../components/TagsInput.jsx';
import ImageUploadEdit from '../../components/ImageUploadEdit.jsx';
import TiptapEditor from '../../components/TiptapEditor.jsx';

export default function EditArticlePage() {
    const router = useRouter();
    const params = useParams();
    const { id: articleId } = params; // Get article ID from URL

    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [status, setStatus] = useState('draft'); // Default status
    const [tags, setTags] = useState([]); // Store tags as an array
    const [currentImageUrl, setCurrentImageUrl] = useState(null); // URL of existing image
    const [imageFile, setImageFile] = useState(null); // New image file selected by user
    const [imagePreview, setImagePreview] = useState(null); // Preview URL for new image
    const [removeImage, setRemoveImage] = useState(false); // Flag to remove existing image
    // Add newTag and customSlug state
    const [newTag, setNewTag] = useState('');
    const [customSlug, setCustomSlug] = useState('');

    // Other State
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    // Fetch Categories and Article Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch categories
                const catRes = await fetch('/api/categories'); // Assuming this endpoint exists
                if (!catRes.ok) throw new Error('Failed to fetch categories');
                const catData = await catRes.json();
                setCategories(catData);

                // Fetch article data if articleId is available
                if (articleId) {
                    const articleRes = await fetch(`/api/admin/articles/${articleId}`);
                    if (!articleRes.ok) {
                         if (articleRes.status === 404) throw new Error('Article not found');
                         throw new Error('Failed to fetch article data');
                    }
                    const articleData = await articleRes.json();

                    // Populate form state
                    setTitle(articleData.title || '');
                    setContent(articleData.content || '');
                    setCategoryId(articleData.category_id || '');
                    setStatus(articleData.status || 'draft');
                    setTags(
                      Array.isArray(articleData.tags)
                        ? articleData.tags
                        : typeof articleData.tags === 'string'
                          ? articleData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
                          : []
                    );
                    setCustomSlug(articleData.custom_slug || '');
                    setCurrentImageUrl(articleData.image_url || null);
                    setImagePreview(articleData.image_url || null); // Initially show current image
                } else {
                    throw new Error('Article ID not provided');
                }

            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [articleId]); // Re-run if articleId changes

    // Add cleanup effect for Object URLs
    useEffect(() => {
        // Check if imagePreview is an Object URL
        let objectUrl = null;
        if (imagePreview && typeof imagePreview === 'string' && imagePreview.startsWith('blob:')) {
            objectUrl = imagePreview;
        }

        // Return cleanup function
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
                // console.log("Revoked Object URL:", objectUrl); // Optional: for debugging
            }
        };
    }, [imagePreview]); // Dependency array ensures cleanup runs when preview changes

    // Fetch user info
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me', { cache: 'no-store' });
                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData);
                }
            } catch (e) {}
        };
        fetchUser();
    }, []);

    // SimpleMDE options (optional)
    const editorOptions = useMemo(() => {
        return {
            spellChecker: false,
            // Add other options here
        };
    }, []);

    // Handle content change from SimpleMDE
    const onContentChange = useCallback((value) => {
        setContent(value);
    }, []);

    // Handle image selection
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Basic validation (optional but recommended)
            if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
                 setError('Invalid file type. Please select an image (JPEG, PNG, GIF, WebP).');
                 return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                 setError('Image size exceeds 5MB limit.');
                 return;
            }

            setImageFile(file);
            setRemoveImage(false); // If new image is selected, don't remove old one yet

            // --- Use URL.createObjectURL for preview ---
            const objectUrl = URL.createObjectURL(file);
            setImagePreview(objectUrl);
            // --- End change ---

            // Clear any previous error
            setError(null);

            /* --- Remove FileReader logic ---
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            */
        }
    };

    // Handle request to remove image
    const handleRemoveImageClick = () => {
        setRemoveImage(true);
        setImageFile(null); // Clear any selected new file
        setImagePreview(null); // Clear preview
        setCurrentImageUrl(null); // Clear current image URL state visually
         // Also clear the file input visually
        const fileInput = document.getElementById('image-upload');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    // Add tag handlers
    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };
    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('category_id', categoryId);
        formData.append('status', status);
        formData.append('tags', JSON.stringify(tags)); // Send tags as JSON string
        formData.append('remove_image', removeImage.toString()); // Send remove flag
        if (customSlug) formData.append('custom_slug', customSlug);

        // Only append image file if a new one was selected
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const response = await fetch(`/api/admin/articles/${articleId}`, {
                method: 'PUT',
                body: formData,
                // Headers are not needed for FormData with fetch
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            alert('Article updated successfully!');
            // Redirect to manage page or view article page
            router.push('/admin/manage-news');

        } catch (err) {
            console.error('Failed to update article:', err);
            setError(err.message);
            alert(`Error updating article: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading article data...</div>;
    // Display error state if validation fails during image selection
    if (error && !loading) return <div className="p-8 text-center text-red-600">Error: {error} <button onClick={() => setError(null)} className="ml-2 text-blue-500 underline">Dismiss</button></div>;
    // Keep original error display for fetch errors
    if (error && loading) return <div className="p-8 text-center text-red-600">Error: {error}</div>;


    return (
        <div className="flex h-screen bg-gray-100">
            {/* Assuming Sidebar is in a layout component */}
            <Sidebar role={user?.role} />
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 min-h-full">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Article</h1>

                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* Content Editor */}
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <TiptapEditor value={content} onChange={setContent} />
                    </div>

                    {/* Category */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            id="category"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="" disabled>Select a category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Custom Link */}
                    <div>
                        <label htmlFor="custom-slug" className="block text-sm font-medium text-gray-700 mb-1">Custom Link (optional)</label>
                        <input
                            type="text"
                            id="custom-slug"
                            value={customSlug}
                            onChange={e => setCustomSlug(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g., my-custom-article-link"
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave blank to auto-generate from title.</p>
                    </div>

                    {/* Tags */}
                    <TagsInput tags={tags} newTag={newTag} setNewTag={setNewTag} handleAddTag={handleAddTag} handleRemoveTag={handleRemoveTag} />

                    {/* Status */}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            {/* Add other statuses if needed */}
                        </select>
                    </div>

                    {/* Image Upload */}
                    <ImageUploadEdit imagePreview={imagePreview} currentImageUrl={currentImageUrl} removeImage={removeImage} handleImageChange={handleImageChange} handleRemoveImageClick={handleRemoveImageClick} error={error} />


                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => router.back()} // Go back button
                            className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Update Article'}
                        </button>
                    </div>
                </form>
                </div>
            </main>
        </div>
    );
}