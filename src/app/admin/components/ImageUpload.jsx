import React from 'react';
import Image from 'next/image';

const ImageUpload = React.memo(function ImageUpload({ image, imagePreview, handleImageChange }) {
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
});

export default ImageUpload; 