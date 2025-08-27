'use client';

import { useState } from 'react';
import { parseDocxFile, validateDocxFile } from '../../../lib/docxParser';

export default function DocxUpload({ onDocxParsed, onError }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleDocxUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validation = validateDocxFile(file);
    if (!validation.isValid) {
      onError(validation.errors.join(', '));
      return;
    }

    setIsUploading(true);
    setUploadStatus('Parsing document and extracting images...');

    try {
      const result = await parseDocxFile(file);
      
      console.log('DOCX parsing result:', {
        success: result.success,
        imageCount: result.imageCount,
        tableCount: result.tableCount,
        hasImages: result.images?.length > 0,
        hasTables: result.tables?.length > 0,
        contentLength: result.content?.length
      });
      
      if (result.success) {
        const imageText = result.imageCount > 0 ? `${result.imageCount} image(s)` : '';
        const tableText = result.tableCount > 0 ? `${result.tableCount} table(s)` : '';
        const foundItems = [imageText, tableText].filter(Boolean);
        
        const statusMessage = foundItems.length > 0 
          ? `Document parsed successfully! Found ${foundItems.join(' and ')}.`
          : 'Document parsed successfully! No images or tables found.';
        
        setUploadStatus(statusMessage);
        onDocxParsed({
          title: result.title,
          content: result.content,
          images: result.images || [],
          imageCount: result.imageCount || 0,
          tables: result.tables || [],
          tableCount: result.tableCount || 0,
          warnings: result.warnings
        });
        
        // Clear status after 5 seconds (longer for image info)
        setTimeout(() => setUploadStatus(''), 5000);
      } else {
        console.error('DOCX parsing failed:', result.error);
        onError(result.error);
        setUploadStatus('');
      }
    } catch (error) {
      console.error('DOCX upload error:', error);
      onError('Failed to parse document: ' + error.message);
      setUploadStatus('');
    } finally {
      setIsUploading(false);
      // Clear the file input
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-lg shadow-lg transition-all duration-300 animate-fadeIn">
      <h3 className="text-lg font-medium text-blue-600 mb-4 flex items-center">
        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Import from Word Document
      </h3>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
        <div className="space-y-4">
          <div className="flex justify-center">
            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div>
            <label htmlFor="docx-upload" className="cursor-pointer">
              <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Upload a Word document
              </span>
              <input
                id="docx-upload"
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleDocxUpload}
                disabled={isUploading}
                className="sr-only"
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Supports .docx files up to 50MB
            </p>
          </div>
          
          {isUploading && (
            <div className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"></path>
              </svg>
              <span className="text-sm text-blue-600">{uploadStatus}</span>
            </div>
          )}
          
          {uploadStatus && !isUploading && (
            <p className="text-sm text-green-600">{uploadStatus}</p>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p className="font-medium mb-1">What happens when you upload:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Document title will be extracted automatically</li>
          <li>Content will be converted to web-friendly format</li>
          <li>Images will be embedded directly in the content</li>
          <li>Tables will be converted with proper styling</li>
          <li>You can still edit everything after import</li>
          <li>Large images may take a moment to process</li>
        </ul>
      </div>
    </div>
  );
}