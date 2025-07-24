'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [profilePhoto, setProfilePhoto] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      if (profilePhoto) {
        formData.append('profile_photo', profilePhoto);
      }
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        alert('Signup successful! Please log in.');
        router.push('/login');
      } else {
        setError(data.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('An error occurred during signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] p-4 font-[Poppins]">
      <Head>
        <title>Sign Up - News Portal</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet" />
      </Head>
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <div className="w-16 h-16 rounded-full bg-[#013f6e] flex items-center justify-center shadow-md mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          </Link>
          <h1 className="text-2xl font-semibold text-[#013f6e]">Create Account</h1>
          <p className="text-[#a9a9a9] text-sm mt-1">Join our news portal</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5" encType="multipart/form-data">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-[#013f6e] mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yourusername"
              className="w-full px-4 py-2 border border-[#a9a9a9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013f6e]"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#013f6e] mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-[#a9a9a9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013f6e]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#013f6e] mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-[#a9a9a9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013f6e]"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#013f6e] mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-[#a9a9a9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013f6e]"
            />
          </div>

          <div>
            <label htmlFor="profilePhoto" className="block text-sm font-medium text-[#013f6e] mb-1">
              Profile Photo (optional)
            </label>
            <input
              id="profilePhoto"
              name="profile_photo"
              type="file"
              accept="image/*"
              onChange={e => setProfilePhoto(e.target.files[0])}
              className="w-full px-4 py-2 border border-[#a9a9a9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013f6e]"
            />
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded-lg text-center text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#013f6e] text-white py-2 rounded-lg hover:bg-[#02508f] transition-colors duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <p className="text-sm text-center text-[#a9a9a9] mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-[#013f6e] font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
