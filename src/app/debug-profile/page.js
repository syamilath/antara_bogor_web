'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function DebugProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('🔍 Fetching user data...');
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
          const userData = await response.json();
          console.log('✅ User data received:', userData);
          setUser(userData);
          
          if (userData.profile_picture) {
            console.log('📸 Profile picture path:', userData.profile_picture);
            
            // Test if the image URL is accessible
            const img = new Image();
            img.onload = () => console.log('✅ Image loaded successfully');
            img.onerror = (e) => console.error('❌ Image failed to load:', e);
            img.src = userData.profile_picture;
          } else {
            console.log('❌ No profile_picture in user data');
          }
        } else {
          const errorText = await response.text();
          console.error('❌ API Error:', errorText);
          setError(`API Error: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        console.error('❌ Fetch error:', error);
        setError(`Fetch Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <h1 className="text-2xl font-bold mb-4">Debug Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Not Logged In</h1>
          <p>Please log in to see your profile data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Data</h2>
          <div className="mb-4">
            <p><strong>Profile Picture Field:</strong> {user.profile_picture || 'null'}</p>
            <p><strong>Profile Photo Field:</strong> {user.profile_photo || 'null'}</p>
          </div>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile Picture Tests</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Test 1: Next.js Image component */}
            <div className="text-center">
              <h3 className="font-medium mb-2">Next.js Image Component</h3>
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {(user.profile_picture || user.profile_photo) ? (
                  <Image
                    src={user.profile_picture || user.profile_photo}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Next.js Image error:', e);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-gray-500">No Image</span>
                )}
              </div>
            </div>

            {/* Test 2: Regular img tag */}
            <div className="text-center">
              <h3 className="font-medium mb-2">Regular IMG Tag</h3>
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {(user.profile_picture || user.profile_photo) ? (
                  <img
                    src={user.profile_picture || user.profile_photo}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Regular img error:', e);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-gray-500">No Image</span>
                )}
              </div>
            </div>

            {/* Test 3: Direct URL test */}
            <div className="text-center">
              <h3 className="font-medium mb-2">Direct URL</h3>
              <div className="text-sm">
                {(user.profile_picture || user.profile_photo) ? (
                  <a 
                    href={user.profile_picture || user.profile_photo} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {user.profile_picture || user.profile_photo}
                  </a>
                ) : (
                  <span className="text-gray-500">No URL</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Browser Console</h2>
          <p className="text-sm text-gray-600">
            Check your browser's developer console (F12) for any error messages.
            Look for network errors, CORS issues, or image loading failures.
          </p>
        </div>
      </div>
    </div>
  );
}