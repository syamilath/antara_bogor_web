import { useState, useEffect, useCallback } from 'react';

export function usePersonalization() {
  const [isTracking, setIsTracking] = useState(false);

  // Track article view
  const trackView = useCallback(async (articleId, categoryId) => {
    try {
      await fetch('/api/articles/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          categoryId,
          interactionType: 'view'
        })
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }, []);

  // Track article click
  const trackClick = useCallback(async (articleId, categoryId) => {
    try {
      await fetch('/api/articles/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          categoryId,
          interactionType: 'click'
        })
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  }, []);

  // Track reading behavior
  const trackReading = useCallback(async (articleId, categoryId, timeSpent, readPercentage) => {
    try {
      await fetch('/api/articles/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          categoryId,
          interactionType: 'view',
          timeSpent,
          readPercentage
        })
      });
    } catch (error) {
      console.error('Error tracking reading:', error);
    }
  }, []);

  // Track social interactions
  const trackShare = useCallback(async (articleId, categoryId) => {
    try {
      await fetch('/api/articles/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          categoryId,
          interactionType: 'share'
        })
      });
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  }, []);

  const trackLike = useCallback(async (articleId, categoryId) => {
    try {
      await fetch('/api/articles/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          categoryId,
          interactionType: 'like'
        })
      });
    } catch (error) {
      console.error('Error tracking like:', error);
    }
  }, []);

  return {
    trackView,
    trackClick,
    trackReading,
    trackShare,
    trackLike,
    isTracking
  };
}

// Hook for reading time tracking
export function useReadingTracker(articleId, categoryId) {
  const [startTime, setStartTime] = useState(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const { trackReading } = usePersonalization();

  useEffect(() => {
    setStartTime(Date.now());

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      setScrollPercentage(Math.max(scrollPercentage, scrollPercent));
    };

    const handleBeforeUnload = () => {
      if (startTime) {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        trackReading(articleId, categoryId, timeSpent, scrollPercentage);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Track reading when component unmounts
      if (startTime) {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        trackReading(articleId, categoryId, timeSpent, scrollPercentage);
      }
    };
  }, [articleId, categoryId, startTime, scrollPercentage, trackReading]);

  return { scrollPercentage };
}