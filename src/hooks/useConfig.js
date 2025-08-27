import { useEffect, useState } from 'react';

/**
 * Custom hook to handle environment configuration with runtime overrides
 */
export function useConfig() {
  const [config, setConfig] = useState({
    apiBaseUrl: '',
    isProduction: false,
    analyticsId: '',
    featureFlags: {},
    isLoaded: false
  });

  useEffect(() => {
    // Load config from environment variables with runtime overrides
    const loadConfig = async () => {
      try {
        // In development, we can use environment variables directly
        // In production, these should be injected at build time or runtime
        const envConfig = {
          apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
          isProduction: process.env.NODE_ENV === 'production',
          analyticsId: process.env.NEXT_PUBLIC_ANALYTICS_ID || '',
          featureFlags: {
            enableAnalytics: process.env.NEXT_PUBLIC_FEATURE_ANALYTICS === 'true',
            enableComments: process.env.NEXT_PUBLIC_FEATURE_COMMENTS !== 'false',
            enableNotifications: process.env.NEXT_PUBLIC_FEATURE_NOTIFICATIONS === 'true',
          },
          isLoaded: true
        };

        // If we have a runtime config endpoint, use it to override the defaults
        try {
          const runtimeConfig = await fetch('/api/config').then(res => {
            if (!res.ok) return {};
            return res.json();
          }).catch(() => ({}));
          
          setConfig({
            ...envConfig,
            ...runtimeConfig,
            // Ensure feature flags are merged properly
            featureFlags: {
              ...envConfig.featureFlags,
              ...(runtimeConfig.featureFlags || {})
            },
            isLoaded: true
          });
        } catch (error) {
          console.warn('Failed to load runtime config, using defaults', error);
          setConfig(envConfig);
        }
      } catch (error) {
        console.error('Error loading config:', error);
        setConfig(prev => ({
          ...prev,
          isLoaded: true,
          error: 'Failed to load configuration'
        }));
      }
    };

    loadConfig();
  }, []);

  return config;
}

/**
 * Get API URL with the configured base URL
 * @param {string} path - API endpoint path
 * @returns {string} Full API URL
 */
export function useApiUrl(path = '') {
  const { apiBaseUrl } = useConfig();
  
  // Ensure path doesn't start with a slash to avoid double slashes
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `${apiBaseUrl.replace(/\/+$/, '')}/${normalizedPath}`;
}

/**
 * Hook to check if a feature is enabled
 * @param {string} feature - Feature name to check
 * @returns {boolean} Whether the feature is enabled
 */
export function useFeatureFlag(feature) {
  const { featureFlags } = useConfig();
  return Boolean(featureFlags[feature]);
}

/**
 * Hook to get the analytics ID if analytics are enabled
 * @returns {string|undefined} Analytics ID or undefined if not enabled
 */
export function useAnalytics() {
  const { analyticsId, featureFlags } = useConfig();
  const isEnabled = featureFlags.enableAnalytics && analyticsId;
  
  return {
    isEnabled,
    analyticsId: isEnabled ? analyticsId : undefined,
    trackEvent: (eventName, eventData) => {
      if (!isEnabled) return;
      
      // Example implementation using gtag
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, eventData);
      }
      
      // You could also send to your own analytics endpoint
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Analytics] ${eventName}:`, eventData);
      }
    }
  };
}
