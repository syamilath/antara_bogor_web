'use client';

import { useState, useEffect } from 'react';

export default function LoadingModal({ isOpen, title = "Creating Account...", steps = [] }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setCurrentStep(0);
            
            // Simulate step progression
            if (steps.length > 0) {
                const interval = setInterval(() => {
                    setCurrentStep(prev => {
                        if (prev < steps.length - 1) {
                            return prev + 1;
                        }
                        clearInterval(interval);
                        return prev;
                    });
                }, 1000);
                
                return () => clearInterval(interval);
            }
        } else {
            setIsVisible(false);
        }
    }, [isOpen, steps.length]);

    if (!isOpen) return null;

    const defaultSteps = [
        "Creating user account...",
        "Generating encryption keys...",
        "Setting up security features...",
        "Finalizing account setup..."
    ];

    const displaySteps = steps.length > 0 ? steps : defaultSteps;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
        }`}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black opacity-60"></div>
            
            {/* Modal */}
            <div className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ${
                isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
            }`}>
                
                {/* Header */}
                <div className="text-center pt-8 pb-6">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
                    <p className="text-gray-600 text-sm">Please wait while we set up your secure account</p>
                </div>

                {/* Progress Steps */}
                <div className="px-8 pb-8">
                    <div className="space-y-4">
                        {displaySteps.map((step, index) => (
                            <div key={index} className="flex items-center">
                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                                    index < currentStep 
                                        ? 'bg-green-500' 
                                        : index === currentStep 
                                        ? 'bg-blue-500 animate-pulse' 
                                        : 'bg-gray-200'
                                }`}>
                                    {index < currentStep ? (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : index === currentStep ? (
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    ) : (
                                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    )}
                                </div>
                                <div className={`ml-3 text-sm transition-colors duration-300 ${
                                    index <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'
                                }`}>
                                    {step}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                            <span>Progress</span>
                            <span>{Math.round(((currentStep + 1) / displaySteps.length) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${((currentStep + 1) / displaySteps.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Security Features Info */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center">
                            <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="text-xs text-blue-800 font-medium">Setting up end-to-end encryption for maximum security</span>
                        </div>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl"></div>
            </div>
        </div>
    );
}