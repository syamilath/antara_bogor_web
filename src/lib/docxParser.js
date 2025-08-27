// DOCX Parser utility for extracting content from Word documents
import mammoth from 'mammoth';

export async function parseDocxFile(file) {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    console.log('Starting DOCX parsing for file:', file.name, 'Size:', file.size);
    
    // Configure mammoth to extract images with proper error handling
    const options = {
      convertImage: mammoth.images.imgElement(function(image) {

        
        return image.read("base64").then(function(imageBuffer) {
          try {
            // Determine MIME type from content type or default to PNG
            let mimeType = 'image/png';
            if (image.contentType) {
              mimeType = getImageMimeType(image.contentType);
            }
            
            // Create a data URL for the image
            const dataUrl = `data:${mimeType};base64,${imageBuffer}`;
            
            console.log('Successfully processed image:', {
              contentType: image.contentType,
              mimeType: mimeType,
              altText: image.altText,
              bufferLength: imageBuffer.length,
              dataUrlLength: dataUrl.length
            });
            
            // Return img element with data URL
            return {
              src: dataUrl,
              alt: image.altText || 'Image from document',
              title: image.altText || 'Extracted image',
              style: 'max-width: 100%; height: auto;'
            };
          } catch (error) {
            console.error('Error processing image:', error);
            // Return a placeholder if image processing fails
            return {
              src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==',
              alt: 'Image processing error',
              title: 'Failed to process image'
            };
          }
        }).catch(function(error) {
          console.error('Error reading image buffer:', error);
          // Return placeholder for read errors
          return {
            src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=',
            alt: 'Image not found',
            title: 'Could not read image'
          };
        });
      }),
      // Enhanced style mapping for better table and content conversion
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Heading 4'] => h4:fresh",
        "p[style-name='Heading 5'] => h5:fresh",
        "p[style-name='Heading 6'] => h6:fresh",
        "b => strong",
        "i => em",
        "u => u",
        // List styling for better presentation
        "p[style-name='List Paragraph'] => li:fresh",
        "p[style-name='ListParagraph'] => li:fresh",
        // Table styling for better presentation
        "table => table.docx-table",
        "tr => tr",
        "td => td",
        "th => th"
      ],
      // Include table handling
      includeDefaultStyleMap: true,
      // Transform document to handle tables better
      transformDocument: mammoth.transforms.paragraph(function(paragraph) {
        // Keep default paragraph handling
        return paragraph;
      })
    };
    
    // Parse DOCX content using mammoth with image extraction
    const result = await mammoth.convertToHtml({ arrayBuffer }, options);
    
    // Extract title from first heading or first paragraph
    const titleMatch = result.value.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/) || 
                      result.value.match(/<p[^>]*><strong>(.*?)<\/strong><\/p>/) ||
                      result.value.match(/<p[^>]*>(.*?)<\/p>/);
    
    const extractedTitle = titleMatch ? 
      titleMatch[1].replace(/<[^>]*>/g, '').trim() : 
      file.name.replace(/\.[^/.]+$/, ""); // Use filename without extension as fallback
    
    // Clean up the HTML content
    let cleanContent = result.value;
    
    // Remove the title from content if it was extracted from first paragraph/heading
    if (titleMatch && titleMatch[0]) {
      cleanContent = cleanContent.replace(titleMatch[0], '');
    }
    
    // Extract images from content for separate handling
    const imageMatches = cleanContent.match(/<img[^>]*>/g) || [];
    const extractedImages = imageMatches.map((imgTag, index) => {
      const srcMatch = imgTag.match(/src="([^"]+)"/);
      const altMatch = imgTag.match(/alt="([^"]+)"/);
      const titleMatch = imgTag.match(/title="([^"]+)"/);
      
      return {
        id: `docx-image-${index}`,
        dataUrl: srcMatch ? srcMatch[1] : '',
        alt: altMatch ? altMatch[1] : `Image ${index + 1} from document`,
        title: titleMatch ? titleMatch[1] : '',
        originalTag: imgTag
      };
    });
    
    // Extract and enhance tables for Tiptap compatibility
    const tableMatches = cleanContent.match(/<table[^>]*>[\s\S]*?<\/table>/g) || [];
    const extractedTables = tableMatches.map((tableHtml, index) => {
      // Clean and enhance table for Tiptap
      let enhancedTable = tableHtml
        .replace(/<table[^>]*>/g, '<div class="table-responsive"><table>')
        .replace(/<\/table>/g, '</table></div>')
        .replace(/style="[^"]*"/g, '') // Remove inline styles that might conflict
        .replace(/class="[^"]*"/g, ''); // Remove existing classes
      
      // Try to detect and enhance first row as header if it looks like one
      const firstRowMatch = enhancedTable.match(/<tr[^>]*>([\s\S]*?)<\/tr>/);
      if (firstRowMatch) {
        const firstRowContent = firstRowMatch[1];
        // If first row has bold content or looks like headers, convert to th
        if (firstRowContent.includes('<strong>') || firstRowContent.includes('<b>')) {
          const headerRow = firstRowContent
            .replace(/<td([^>]*)>/g, '<th$1>')
            .replace(/<\/td>/g, '</th>')
            .replace(/<strong>|<\/strong>/g, '')
            .replace(/<b>|<\/b>/g, '');
          
          enhancedTable = enhancedTable.replace(
            firstRowMatch[0],
            `<thead><tr>${headerRow}</tr></thead><tbody>`
          );
          
          // Close tbody before table ends
          enhancedTable = enhancedTable.replace('</table>', '</tbody></table>');
        }
      }
      
      // Clean up cell content - remove paragraph wrappers for cleaner display
      enhancedTable = enhancedTable
        .replace(/<td([^>]*)><p>(.*?)<\/p><\/td>/g, '<td$1>$2</td>')
        .replace(/<th([^>]*)><p>(.*?)<\/p><\/th>/g, '<th$1>$2</th>')
        .replace(/<td([^>]*)><\/td>/g, '<td$1></td>') // Keep empty cells
        .replace(/<th([^>]*)><\/th>/g, '<th$1></th>'); // Keep empty headers
      
      return {
        id: `docx-table-${index}`,
        html: enhancedTable,
        originalHtml: tableHtml
      };
    });
    
    // Replace tables in content with enhanced versions
    extractedTables.forEach((table) => {
      cleanContent = cleanContent.replace(table.originalHtml, table.html);
    });
    
    console.log(`Successfully extracted ${extractedImages.length} images and ${extractedTables.length} tables from DOCX`);
    
    // Enhanced HTML cleanup and formatting
    cleanContent = cleanContent
      .replace(/<p><\/p>/g, '') // Remove empty paragraphs
      .replace(/<p>\s*<\/p>/g, '') // Remove paragraphs with only whitespace
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/>\s+</g, '><') // Remove whitespace between tags
      .trim();

    // Fix numbered lists - convert consecutive single-item lists to proper multi-item lists
    cleanContent = fixNumberedLists(cleanContent);
    
    // If content is empty, add a placeholder
    if (!cleanContent || cleanContent === '') {
      cleanContent = '<p>Content extracted from uploaded document.</p>';
    }
    
    return {
      success: true,
      title: extractedTitle,
      content: cleanContent,
      images: extractedImages,
      imageCount: extractedImages.length,
      tables: extractedTables,
      tableCount: extractedTables.length,
      warnings: result.messages || []
    };
    
  } catch (error) {
    console.error('Error parsing DOCX file:', error);
    return {
      success: false,
      error: 'Failed to parse DOCX file. Please ensure it\'s a valid Word document.',
      details: error.message
    };
  }
}

// Helper function to determine image MIME type
function getImageMimeType(contentType) {
  // Handle various content type formats
  const normalizedType = contentType?.toLowerCase() || '';
  
  const mimeTypes = {
    'image/png': 'image/png',
    'image/jpeg': 'image/jpeg',
    'image/jpg': 'image/jpeg',
    'image/gif': 'image/gif',
    'image/bmp': 'image/bmp',
    'image/webp': 'image/webp',
    'image/tiff': 'image/tiff',
    'image/svg+xml': 'image/svg+xml',
    // Handle Office-specific formats
    'application/octet-stream': 'image/png', // Default for unknown binary
    'image/x-emf': 'image/png', // Enhanced Metafile -> PNG
    'image/x-wmf': 'image/png', // Windows Metafile -> PNG
  };
  
  // Direct match
  if (mimeTypes[normalizedType]) {
    return mimeTypes[normalizedType];
  }
  
  // Partial matches
  if (normalizedType.includes('jpeg') || normalizedType.includes('jpg')) {
    return 'image/jpeg';
  }
  if (normalizedType.includes('png')) {
    return 'image/png';
  }
  if (normalizedType.includes('gif')) {
    return 'image/gif';
  }
  
  // Default to PNG for unknown types
  return 'image/png';
}

export function validateDocxFile(file) {
  const errors = [];
  
  // Check file type
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  
  if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.docx')) {
    errors.push('Please upload a valid Word document (.docx file)');
  }
  
  // Check file size (max 50MB)
  if (file.size > 50 * 1024 * 1024) {
    errors.push('File size must be less than 50MB');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Helper function to fix numbered lists structure
function fixNumberedLists(html) {
  // Pattern to match numbered list items (1., 2., 3., etc.)
  const numberedPattern = /(<p[^>]*>)\s*(\d+)\.\s*(.*?)<\/p>/g;
  const matches = [];
  let match;
  
  // Find all numbered paragraphs
  while ((match = numberedPattern.exec(html)) !== null) {
    matches.push({
      fullMatch: match[0],
      number: parseInt(match[2]),
      content: match[3],
      index: match.index
    });
  }
  
  if (matches.length === 0) return html;
  
  // Group consecutive numbered items
  const groups = [];
  let currentGroup = [matches[0]];
  
  for (let i = 1; i < matches.length; i++) {
    const current = matches[i];
    const previous = matches[i - 1];
    
    // If numbers are consecutive and close together, group them
    if (current.number === previous.number + 1 && 
        current.index - previous.index < 500) { // Within 500 characters
      currentGroup.push(current);
    } else {
      groups.push(currentGroup);
      currentGroup = [current];
    }
  }
  groups.push(currentGroup);
  
  // Replace groups with proper <ol><li> structure
  let result = html;
  
  // Process groups in reverse order to maintain string indices
  for (let i = groups.length - 1; i >= 0; i--) {
    const group = groups[i];
    if (group.length > 1) { // Only process groups with multiple items
      const listItems = group.map(item => `<li>${item.content}</li>`).join('');
      const orderedList = `<ol>${listItems}</ol>`;
      
      // Replace the original paragraphs with the ordered list
      const firstMatch = group[0];
      const lastMatch = group[group.length - 1];
      const startIndex = firstMatch.index;
      const endIndex = lastMatch.index + lastMatch.fullMatch.length;
      
      result = result.substring(0, startIndex) + orderedList + result.substring(endIndex);
    }
  }
  
  return result;
}

// Helper function to convert data URL to File object
export function dataUrlToFile(dataUrl, filename) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}