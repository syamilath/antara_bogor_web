import React from 'react';
import Image from 'next/image';

const ImageUploadEdit = React.memo(function ImageUploadEdit({ imagePreview, currentImageUrl, removeImage, handleImageChange, handleRemoveImageClick, error }) {
  return (
    <div>
      <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
      <div className="mt-1 flex items-center space-x-4">
        {imagePreview && (
          <Image
            src={imagePreview}
            alt="Image Preview"
            width={80}
            height={80}
            className="h-20 w-auto object-cover rounded border border-gray-200"
          />
        )}
        <input
          type="file"
          id="image-upload"
          accept="image/jpeg, image/png, image/gif, image/webp"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {!imagePreview && currentImageUrl && !removeImage && (
          <span className="text-xs text-gray-500">(Current image set)</span>
        )}
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
      {error && error.includes('Invalid file type') && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {error && error.includes('exceeds 5MB') && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
});

export default ImageUploadEdit; 