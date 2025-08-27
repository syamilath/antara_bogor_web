import { NextResponse } from 'next/server';

// This endpoint provides runtime configuration to the client
// It can be used to override environment variables at runtime

export async function GET() {
  try {
    // In a real app, you might want to add authentication/authorization here
    // to prevent exposing sensitive configuration to unauthorized users
    
    // Get server-side environment variables
    const serverConfig = {
      // Public config that's safe to expose to the client
      apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
      environment: process.env.NODE_ENV || 'development',
      
      // Feature flags - these could be managed in a database in a real app
      featureFlags: {
        enableAnalytics: process.env.NEXT_PUBLIC_FEATURE_ANALYTICS === 'true',
        enableComments: process.env.NEXT_PUBLIC_FEATURE_COMMENTS !== 'false',
        enableNotifications: process.env.NEXT_PUBLIC_FEATURE_NOTIFICATIONS === 'true',
        // Add more feature flags as needed
      },
      
      // Analytics configuration
      analytics: {
        googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || '',
        hotjarId: process.env.NEXT_PUBLIC_HOTJAR_ID || '',
        // Add other analytics providers as needed
      },
      
      // API endpoints
      endpoints: {
        articles: '/api/articles',
        categories: '/api/categories',
        // Add other API endpoints as needed
      },
      
      // App metadata
      app: {
        name: process.env.NEXT_PUBLIC_APP_NAME || 'Antara Bogor',
        description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Berita terbaru dan terpercaya dari Bogor',
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        // Add other app metadata as needed
      },
      
      // Add any other non-sensitive configuration here
    };
    
    return NextResponse.json(serverConfig, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, max-age=300',
        'Vercel-CDN-Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Error in config API:', error);
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    );
  }
}

// Prevent caching of this endpoint in development
// This ensures you always get fresh config when developing
export const dynamic = 'force-dynamic';

// Optionally, you can add a revalidation time for production
export const revalidate = 300; // Revalidate every 5 minutes
