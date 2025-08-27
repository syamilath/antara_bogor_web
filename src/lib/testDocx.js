// Test file to verify mammoth functionality
import mammoth from 'mammoth';

export async function testMammothInstallation() {
  try {
    // Test basic mammoth functionality
    const testHtml = '<p>Test content</p>';
    console.log('Mammoth is available:', typeof mammoth);
    console.log('Mammoth convertToHtml:', typeof mammoth.convertToHtml);
    console.log('Mammoth images:', typeof mammoth.images);
    console.log('Mammoth imgElement:', typeof mammoth.images?.imgElement);
    
    return {
      success: true,
      mammothAvailable: typeof mammoth !== 'undefined',
      convertToHtmlAvailable: typeof mammoth.convertToHtml === 'function',
      imagesAvailable: typeof mammoth.images !== 'undefined',
      imgElementAvailable: typeof mammoth.images?.imgElement === 'function'
    };
  } catch (error) {
    console.error('Mammoth test error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}