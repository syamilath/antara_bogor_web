'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export const Notification = ({ message, type = 'info', onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match this with the CSS transition duration
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-400 text-green-700';
      case 'error':
        return 'bg-red-100 border-red-400 text-red-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      default:
        return 'bg-blue-100 border-blue-400 text-blue-700';
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed bottom-4 right-4 p-4 rounded-lg border shadow-lg z-50 transition-opacity duration-300 ${getTypeStyles()}`}
      role="alert"
    >
      <div className="flex items-center">
        <div className="flex-1 pr-4">
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close notification"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export const useNotification = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info', duration = 5000) => {
    setNotification({ message, type, duration });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const NotificationComponent = () => {
    if (!notification) return null;
    
    return (
      <Notification
        message={notification.message}
        type={notification.type}
        duration={notification.duration}
        onClose={clearNotification}
      />
    );
  };

  return { showNotification, NotificationComponent };
};
