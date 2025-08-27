import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import { useCallback, useMemo } from 'react';

// Shared Sidebar Component for Admin Pages
export default function Sidebar({ isMobile = false, onClose, role }) {
  const pathname = usePathname();
  const router = useRouter();

  // Memoized navigation items to prevent flickering
  const navItems = useMemo(() => {
    const baseItems = [
      { name: 'Dashboard', href: '/admin/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { name: 'Manage News', href: '/admin/manage-news', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      { name: 'Encryption', href: '/admin/encryption', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    ];

    // Always show Create News for now to prevent layout shifts
    // We can hide it later based on permissions if needed
    const allItems = [
      baseItems[0], // Dashboard
      { name: 'Create News', href: '/admin', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
      baseItems[1], // Manage News
    ];

    return allItems;
  }, [role]);

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
    <div className={`${isMobile ? 'p-4 h-full bg-white' : 'w-64 h-screen bg-white shadow-lg flex flex-col'}`}>
      <div className="flex items-center justify-between mb-8 mt-4 px-4">
        <div className="flex items-center">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center mr-3 shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
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
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <Link
                href={item.href}
                onClick={isMobile ? onClose : undefined}
                className={`flex items-center py-2 px-3 rounded-lg transition-colors duration-150 ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
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
              className="flex items-center py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors duration-150"
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
          className="flex items-center w-full py-2 px-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
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