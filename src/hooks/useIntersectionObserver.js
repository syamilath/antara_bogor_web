import { useEffect, useRef } from 'react';

/**
 * Custom hook for observing elements with Intersection Observer
 * @param {Object} options - Intersection Observer options
 * @param {string} [options.threshold=0.1] - Threshold for intersection ratio
 * @param {string} [options.root=null] - The element used as the viewport
 * @param {string} [options.rootMargin='0px'] - Margin around the root
 * @returns {Object} - Ref and setter function for elements to observe
 */
const useIntersectionObserver = (options = {}) => {
  const elementsRef = useRef(new Set());
  const observerRef = useRef(null);
  const { threshold = 0.1, root = null, rootMargin = '0px' } = options;

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const setObserver = (element) => {
    if (!element || elementsRef.current.has(element)) return;
    
    elementsRef.current.add(element);
    
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
            }
          });
        },
        { threshold, root, rootMargin }
      );
    }
    
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observerRef.current.observe(element);
  };

  return { ref: setObserver };
};

export default useIntersectionObserver;
