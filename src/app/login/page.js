'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Please enter both username and password.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', data.role);

        if (data.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - News Portal</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-[#f4f4f4] p-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-[#013f6e] text-white text-3xl font-bold">
              <span>N</span>
            </div>
            <h1 className="text-2xl font-semibold text-[#013f6e] mt-4">Admin & User Login</h1>
            <p className="text-sm text-[#a9a9a9] mt-2">Access your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm text-[#013f6e] font-medium mb-1">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-[#a9a9a9] focus:outline-none focus:ring-2 focus:ring-[#013f6e]"
                placeholder="yourusername"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-[#013f6e] font-medium mb-1">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-[#a9a9a9] focus:outline-none focus:ring-2 focus:ring-[#013f6e]"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-100 text-red-700 text-center text-sm rounded-md p-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 bg-[#013f6e] text-white rounded-lg hover:bg-[#012d50] transition-colors duration-300"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="#" className="text-sm text-[#013f6e] hover:underline">Forgot password?</Link>
            <p className="text-sm text-[#a9a9a9] mt-4">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#013f6e] font-medium hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
