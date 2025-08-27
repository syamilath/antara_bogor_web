/**
 * Format a date string into a readable format
 * @param {string} dateString - The date string to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const getFormattedDate = (dateString, options = { month: 'short', day: 'numeric' }) => {
  if (!dateString) return 'Unknown Date';
  const date = new Date(dateString);
  return !isNaN(date.getTime()) ? date.toLocaleDateString('en-US', options) : 'Invalid Date';
};

/**
 * Calculate time since the given date
 * @param {string} dateString - The date string to calculate from
 * @returns {string} Time ago string (e.g., "2 days ago")
 */
export const timeAgo = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const seconds = Math.floor((new Date() - date) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `${interval} ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  
  return 'Just now';
};
