/**
 * Environment variable utilities with type safety and default values
 * This provides a single source of truth for all environment variables used in the application
 */

// Client-side safe getter for environment variables
// These are prefixed with NEXT_PUBLIC_ and are available in the browser
const clientEnv = {
  // Application
  NODE_ENV: process.env.NODE_ENV || 'development',
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  
  // API
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  
  // Analytics
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID || '',
  NEXT_PUBLIC_HOTJAR_ID: process.env.NEXT_PUBLIC_HOTJAR_ID || '',
  
  // Feature Flags
  NEXT_PUBLIC_FEATURE_ANALYTICS: process.env.NEXT_PUBLIC_FEATURE_ANALYTICS === 'true',
  NEXT_PUBLIC_FEATURE_COMMENTS: process.env.NEXT_PUBLIC_FEATURE_COMMENTS !== 'false', // Enabled by default
  NEXT_PUBLIC_FEATURE_NOTIFICATIONS: process.env.NEXT_PUBLIC_FEATURE_NOTIFICATIONS === 'true',
  
  // Image Optimization
  NEXT_PUBLIC_IMAGE_DOMAINS: (process.env.NEXT_PUBLIC_IMAGE_DOMAINS || 'localhost,res.cloudinary.com')
    .split(',')
    .map(domain => domain.trim())
    .filter(Boolean),
};

// Server-side only environment variables (not exposed to the client)
const serverEnv = {
  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '3306', 10),
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'antara_bogor',
  
  // Authentication
  JWT_SECRET: process.env.JWT_SECRET || 'your_very_secure_jwt_secret_key_here',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'your_nextauth_secret_here',
  
  // External Services
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

// Type definitions for better IDE support
/**
 * @typedef {Object} ClientEnv
 * @property {string} NODE_ENV - Current environment (development, production, test)
 * @property {string} NEXT_PUBLIC_BASE_URL - Base URL of the application
 * @property {string} NEXT_PUBLIC_API_BASE_URL - Base URL for API requests
 * @property {string} NEXT_PUBLIC_GA_ID - Google Analytics Measurement ID
 * @property {string} NEXT_PUBLIC_HOTJAR_ID - Hotjar Tracking ID
 * @property {boolean} NEXT_PUBLIC_FEATURE_ANALYTICS - Whether analytics are enabled
 * @property {boolean} NEXT_PUBLIC_FEATURE_COMMENTS - Whether comments are enabled
 * @property {boolean} NEXT_PUBLIC_FEATURE_NOTIFICATIONS - Whether notifications are enabled
 * @property {string[]} NEXT_PUBLIC_IMAGE_DOMAINS - Allowed domains for image optimization
 */

/**
 * @typedef {Object} ServerEnv
 * @property {string} DB_HOST - Database host
 * @property {number} DB_PORT - Database port
 * @property {string} DB_USER - Database username
 * @property {string} DB_PASSWORD - Database password
 * @property {string} DB_NAME - Database name
 * @property {string} JWT_SECRET - Secret for JWT token signing
 * @property {string} NEXTAUTH_URL - Base URL for NextAuth.js
 * @property {string} NEXTAUTH_SECRET - Secret for NextAuth.js
 * @property {string} [CLOUDINARY_CLOUD_NAME] - Cloudinary cloud name
 * @property {string} [CLOUDINARY_API_KEY] - Cloudinary API key
 * @property {string} [CLOUDINARY_API_SECRET] - Cloudinary API secret
 */

/**
 * Get client-side environment variables
 * @returns {ClientEnv}
 */
export function getClientEnv() {
  return { ...clientEnv };
}

/**
 * Get server-side environment variables
 * @returns {ServerEnv}
 */
export function getServerEnv() {
  // In a browser environment, this will return an empty object
  if (typeof window !== 'undefined') {
    console.warn('Attempted to access server environment variables in the browser');
    return {};
  }
  return { ...serverEnv };
}

/**
 * Get all environment variables (for server-side use only)
 * @returns {ClientEnv & ServerEnv}
 */
export function getAllEnv() {
  return {
    ...getClientEnv(),
    ...getServerEnv(),
  };
}

/**
 * Validate required environment variables
 * @throws {Error} If any required environment variables are missing
 */
export function validateEnv() {
  const requiredVars = [
    'NEXT_PUBLIC_BASE_URL',
    'JWT_SECRET',
    'NEXTAUTH_SECRET',
  ];

  const missingVars = requiredVars.filter(
    (key) => !process.env[key] && !clientEnv[key] && !serverEnv[key]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

// Validate environment variables when this module is imported
if (process.env.NODE_ENV !== 'test') {
  try {
    validateEnv();
  } catch (error) {
    // Don't crash in development, but log a warning
    if (process.env.NODE_ENV === 'development') {
      console.warn('Environment validation warning:', error.message);
    } else {
      console.error('Environment validation failed:', error.message);
      process.exit(1);
    }
  }
}

// Export all client environment variables as a frozen object
export default Object.freeze({
  ...clientEnv,
  // Add type-safe getters for server-side variables that throw in the browser
  get server() {
    if (typeof window !== 'undefined') {
      throw new Error('Attempted to access server environment variables in the browser');
    }
    return { ...serverEnv };
  },
});
