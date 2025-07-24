import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import { useCallback } from 'react';

// Shared Sidebar Component for Admin Pages
export default function Sidebar({ isMobile = false, onClose, role }) {
  const pathname = usePathname();
  const router = useRouter();

  // Role-based sidebar items
  let items = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Manage News', href: '/admin/manage-news', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ];
  if (role !== 'admin') {
    // Writers get Create News
    items.splice(1, 0, { name: 'Create News', href: '/admin', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' });
  }

  // Logout Handler (optional, only if /api/auth/logout exists)
  const handleLogout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/login');
      } else {
        alert('Logout failed. Please try again.');
      }
    } catch (error) {
      alert('An error occurred during logout.');
    }
  }, [router]);

  return (
    <div className={`${isMobile ? 'p-4 h-full bg-white' : 'w-64 min-h-screen bg-white shadow-lg flex flex-col'} transition-all duration-300`}>
      <div className="flex items-center justify-between mb-8 mt-4 px-4">
        <div className="flex items-center">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white mr-3"
            style={{
              boxShadow: '0 4px 12px 0 rgba(1,63,110,0.10), 0 1.5px 6px 0 rgba(1,63,110,0.13), 0 0.5px 2px 0 rgba(1,63,110,0.18)'
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              style={{ color: '#2563eb' }}
            >
              {/* Gear/Cog with star center matching your image */}
              <path d="M12 2l1.09 3.26L16 4.27 14.73 7l3.26 1.09L17 11l3.26 1.09L18.18 16l-1.09 3.26L14 18.18l-1.09 3.26L10 20.18l-3.26-1.09L5.82 16l-1.09-3.26L2 11l1.09-3.26L5.82 8l1.09-3.26L10 3.82 12 2z"/>
              <path d="M12 8l1.5 3h3l-2.5 1.5 1 3L12 14l-3 1.5 1-3L7.5 11h3L12 8z" fill="white"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-800">Admin Panel</span>
        </div>
        {isMobile && (
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <nav className="flex-grow px-4">
        <ul>
          {items.map((item) => (
            <li key={item.name} className="mb-2">
              <Link
                href={item.href}
                onClick={isMobile ? onClose : undefined}
                className={`flex items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  pathname === item.href
                    ? 'neumorphic-inset bg-gray-100 text-gray-800 font-semibold'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.name}
              </Link>
            </li>
          ))}
          <li className="mb-2">
            <Link
              href="/"
              className="flex items-center py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-gray-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Go to Main Website
            </Link>
          </li>
        </ul>
      </nav>
      <div className="mt-auto p-4">
        <button
          onClick={handleLogout}
          className="flex items-center w-full py-2 px-3 rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-700 transition-all duration-200 neumorphic-button-secondary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}

Sidebar.propTypes = {
  isMobile: PropTypes.bool,
  onClose: PropTypes.func,
  role: PropTypes.string,
};