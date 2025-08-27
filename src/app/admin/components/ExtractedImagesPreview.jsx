'use client';

import { useState } from 'react';

export default function ExtractedImagesPreview({ images, onImageSelect }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images || images.length === 0) {
    return null;
  }

  const handleImageClick = (image) => {
    setSelectedImage(image);
    if (onImageSelect) {
      onImageSelect(image);
    }
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-lg shadow-lg transition-all duration-300 animate-fadeIn">
      <h3 className="text-lg font-medium text-blue-600 mb-4 flex items-center">
        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Extracted Images ({images.length})
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div 
            key={image.id || index}
            className="relative group cursor-pointer"
            onClick={() => handleImageClick(image)}
          >
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={image.dataUrl}
                alt={image.alt || `Image ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
              <svg className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
            <p className="text-xs text-gray-600 mt-2 truncate">
              {image.alt || `Image ${index + 1}`}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>✓ All images have been embedded in your article content</p>
        <p>✓ Click on any image above to view it in full size</p>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImage.dataUrl}
              alt={selectedImage.alt}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 rounded-b-lg">
              <p className="text-sm">{selectedImage.alt || 'Extracted image'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}