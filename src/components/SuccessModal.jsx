'use client';

import { useState, useEffect } from 'react';

export default function SuccessModal({ isOpen, onClose, title, message, encryptionEnabled = false, onContinue }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleContinue = () => {
        handleClose();
        if (onContinue) {
            onContinue();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
        }`}>
            {/* Backdrop */}
            <div 
                className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                    isVisible ? 'opacity-50' : 'opacity-0'
                }`}
                onClick={handleClose}
            ></div>
            
            {/* Modal */}
            <div className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ${
                isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
            }`}>
                
                {/* Header with animation */}
                <div className="text-center pt-8 pb-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
                        {encryptionEnabled ? (
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        ) : (
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                </div>

                {/* Content */}
                <div className="px-8 pb-6">
                    <p className="text-gray-600 text-center mb-6 leading-relaxed">
                        {message}
                    </p>

                    {encryptionEnabled && (
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-4 mb-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.5-2a11 11 0 11-4.5 9" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-semibold text-blue-900 mb-2">🔐 Security Features Activated</h3>
                                    <ul className="text-xs text-blue-800 space-y-1">
                                        <li className="flex items-center">
                                            <span className="w-1 h-1 bg-blue-600 rounded-full mr-2"></span>
                                            End-to-end encryption enabled
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-1 h-1 bg-blue-600 rounded-full mr-2"></span>
                                            Personal data protection active
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-1 h-1 bg-blue-600 rounded-full mr-2"></span>
                                            Secure messaging available
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-1 h-1 bg-blue-600 rounded-full mr-2"></span>
                                            Article draft encryption ready
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleContinue}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
                        >
                            Continue to Login
                        </button>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-t-2xl"></div>
            </div>
        </div>
    );
}