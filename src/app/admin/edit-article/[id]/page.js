'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'easymde/dist/easymde.min.css';
import Sidebar from '../../components/Sidebar.jsx';

// Dynamically import SimpleMDE to avoid SSR issues
const SimpleMdeReact = dynamic(() => import('react-simplemde-editor'), { ssr: false });

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

    // Other State
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

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
                    setTags(articleData.tags || []); // Assuming API returns tags array
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

    // Handle tag input (basic example: comma-separated)
    const handleTagsChange = (event) => {
        const tagsString = event.target.value;
        // Split by comma, trim whitespace, remove empty strings
        const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        setTags(tagsArray);
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
        <div className="flex min-h-screen bg-gray-100">
            {/* Assuming Sidebar is in a layout component */}
            <Sidebar />
            <main className="flex-1 p-8">
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
                        <SimpleMdeReact
                            id="content"
                            value={content}
                            onChange={onContentChange}
                            options={editorOptions}
                        />
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

                     {/* Tags Input */}
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                        <input
                            type="text"
                            id="tags"
                            value={tags.join(', ')} // Display tags as comma-separated string
                            onChange={handleTagsChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g., technology, programming, news"
                        />
                    </div>

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
                    <div>
                        <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
                        <div className="mt-1 flex items-center space-x-4">
                            {imagePreview && (
                                <img
                                    src={imagePreview}
                                    alt="Image Preview"
                                    className="h-20 w-auto object-cover rounded border border-gray-200" // Added border
                                />
                            )}
                            <input
                                type="file"
                                id="image-upload"
                                accept="image/jpeg, image/png, image/gif, image/webp" // Accept common image types
                                onChange={handleImageChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {/* Display currentImageUrl only if no new preview exists and removeImage is false */}
                            {!imagePreview && currentImageUrl && !removeImage && (
                                <span className="text-xs text-gray-500">(Current image set)</span>
                            )}
                            {/* Show remove button only if there's a current image or a preview */}
                            {(currentImageUrl || imagePreview) && !removeImage && (
                                <button
                                    type="button"
                                    onClick={handleRemoveImageClick}
                                    className="text-sm text-red-600 hover:text-red-800"
                                >
                                    Remove Image
                                </button>
                            )}
                             {removeImage && <span className="text-xs text-red-500">(Image will be removed on save)</span>}
                        </div>
                         {/* Display validation error message */}
                         {error && error.includes('Invalid file type') && <p className="text-red-500 text-xs mt-1">{error}</p>}
                         {error && error.includes('exceeds 5MB') && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>


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
            </main>
        </div>
    );
}