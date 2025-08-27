'use client';

import { useState, useEffect } from 'react';

export default function Notification({ 
    isOpen, 
    onClose, 
    type = 'info', // 'success', 'error', 'warning', 'info'
    title, 
    message, 
    autoClose = true, 
    duration = 5000 
}) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            
            if (autoClose) {
                const timer = setTimeout(() => {
                    handleClose();
                }, duration);
                
                return () => clearTimeout(timer);
            }
        }
    }, [isOpen, autoClose, duration]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-50 border-green-200',
                    icon: 'text-green-600',
                    title: 'text-green-800',
                    message: 'text-green-700',
                    iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                };
            case 'error':
                return {
                    bg: 'bg-red-50 border-red-200',
                    icon: 'text-red-600',
                    title: 'text-red-800',
                    message: 'text-red-700',
                    iconPath: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-50 border-yellow-200',
                    icon: 'text-yellow-600',
                    title: 'text-yellow-800',
                    message: 'text-yellow-700',
                    iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z'
                };
            default:
                return {
                    bg: 'bg-blue-50 border-blue-200',
                    icon: 'text-blue-600',
                    title: 'text-blue-800',
                    message: 'text-blue-700',
                    iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 transform ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
            <div className={`${styles.bg} border rounded-lg shadow-lg p-4`}>
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className={`w-5 h-5 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={styles.iconPath} />
                        </svg>
                    </div>
                    <div className="ml-3 flex-1">
                        {title && (
                            <h3 className={`text-sm font-medium ${styles.title} mb-1`}>
                                {title}
                            </h3>
                        )}
                        <p className={`text-sm ${styles.message}`}>
                            {message}
                        </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                        <button
                            onClick={handleClose}
                            className={`inline-flex rounded-md p-1.5 ${styles.icon} hover:bg-opacity-20 hover:bg-current focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                
                {/* Progress bar for auto-close */}
                {autoClose && (
                    <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                                className={`h-1 rounded-full transition-all ease-linear ${
                                    type === 'success' ? 'bg-green-500' :
                                    type === 'error' ? 'bg-red-500' :
                                    type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                                }`}
                                style={{ 
                                    width: '100%',
                                    animation: `shrink ${duration}ms linear forwards`
                                }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
            
            <style jsx>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
}