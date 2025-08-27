/**
 * Performance monitoring utility
 * Tracks various performance metrics and reports them to your analytics service
 */

// Performance metrics collection
const metrics = {
  navigationStart: 0,
  pageLoadTime: 0,
  domContentLoaded: 0,
  firstContentfulPaint: 0,
  largestContentfulPaint: 0,
  firstInputDelay: 0,
  cumulativeLayoutShift: 0,
};

// Flag to track if performance monitoring is enabled
let isMonitoring = false;

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined' || isMonitoring) return;
  
  isMonitoring = true;
  metrics.navigationStart = performance.timing?.navigationStart || performance.timeOrigin;
  
  // Track page load time
  if (performance.timing) {
    metrics.pageLoadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    metrics.domContentLoaded = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
  }
  
  // Track First Contentful Paint (FCP)
  const fcpObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntriesByName('first-contentful-paint');
    if (entries.length > 0) {
      metrics.firstContentfulPaint = entries[0].startTime;
      reportMetrics('fcp', metrics.firstContentfulPaint);
    }
  });
  fcpObserver.observe({ type: 'paint', buffered: true });
  
  // Track Largest Contentful Paint (LCP)
  const lcpObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    metrics.largestContentfulPaint = lastEntry.renderTime || lastEntry.loadTime;
    reportMetrics('lcp', metrics.largestContentfulPaint);
  });
  lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  
  // Track First Input Delay (FID)
  const fidObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    for (const entry of entries) {
      metrics.firstInputDelay = entry.processingStart - entry.startTime;
      reportMetrics('fid', metrics.firstInputDelay);
    }
  });
  fidObserver.observe({ type: 'first-input', buffered: true });
  
  // Track Cumulative Layout Shift (CLS)
  let clsValue = 0;
  let clsEntries = [];
  
  const clsObserver = new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        clsEntries.push(entry);
        metrics.cumulativeLayoutShift = clsValue;
        reportMetrics('cls', clsValue);
      }
    }
  });
  
  clsObserver.observe({ type: 'layout-shift', buffered: true });
  
  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // Report all metrics when page is hidden
      reportMetrics('page_hide', metrics);
    }
  });
  
  // Report initial metrics after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      reportMetrics('page_load', metrics);
    }, 0);
  });
}

/**
 * Report metrics to your analytics service
 * @param {string} eventName - Name of the performance event
 * @param {*} data - Performance data to report
 */
function reportMetrics(eventName, data) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${eventName}:`, data);
  }
  
  // Replace with your actual analytics service integration
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'performance_metric', {
      event_category: 'Performance Metrics',
      event_label: eventName,
      value: typeof data === 'number' ? Math.round(data) : undefined,
      ...(typeof data === 'object' ? data : {})
    });
  }
}

/**
 * Get current performance metrics
 * @returns {Object} Current performance metrics
 */
export function getPerformanceMetrics() {
  return { ...metrics };
}

/**
 * Track a custom performance metric
 * @param {string} name - Name of the custom metric
 * @param {number} value - Value of the metric
 * @param {Object} [metadata] - Additional metadata
 */
export function trackCustomMetric(name, value, metadata = {}) {
  if (typeof value !== 'number') {
    console.warn(`Custom metric ${name} value must be a number`);
    return;
  }
  
  reportMetrics(`custom_${name}`, { value, ...metadata });
}

/**
 * Measure the execution time of a function
 * @param {Function} fn - Function to measure
 * @param {string} name - Name of the measurement
 * @returns {*} The result of the function
 */
export function measureExecution(fn, name) {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  trackCustomMetric(`fn_${name}`, duration);
  return result;
}

// Initialize performance monitoring when this module is imported
if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') {
    initPerformanceMonitoring();
  } else {
    window.addEventListener('load', initPerformanceMonitoring);
  }
}
