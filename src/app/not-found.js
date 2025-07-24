"use client";
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-lg w-full bg-white/90 rounded-3xl shadow-2xl p-10 flex flex-col items-center">
        <Image
          src="/uploads/logo-removebg-preview.png"
          alt="Antara Bogor Logo"
          width={80}
          height={80}
          className="mb-6"
        />
        <h1 className="text-5xl font-extrabold text-blue-700 mb-4 drop-shadow-lg">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-6 text-center">
          Oops! The page you are looking for does not exist or has been moved.<br />
          Please check the URL or return to the homepage.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:bg-blue-700 transition"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
} 