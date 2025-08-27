import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PersonalizationIndicator() {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        if (userData && (userData.role === 'member' || userData.role === 'writer' || userData.role === 'admin')) {
          fetchPreferences();
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences || []);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  if (!user || (user.role !== 'member' && user.role !== 'writer' && user.role !== 'admin')) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        <span>Guest Mode</span>
        <span className="text-xs">(Chronological)</span>
      </div>
    );
  }

  const hasPreferences = preferences.length > 0;
  const topCategory = preferences.length > 0 ? preferences[0] : null;

  return (
    <Link href="/preferences" className="flex items-center space-x-2 text-sm hover:text-blue-600 transition-colors">
      <div className={`w-2 h-2 rounded-full ${hasPreferences ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
      <span className="font-medium">
        {hasPreferences ? 'Personalized' : 'Learning'}
      </span>
      {topCategory && (
        <span className="text-xs text-gray-600">
          (Loves {topCategory.category_name})
        </span>
      )}
    </Link>
  );
}