/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**', // Allow any path under this hostname
      },
      // Add localhost for uploaded images (works in both dev and production)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/uploads/**', // Allow paths starting with /uploads/
      },
      // Add this block for randomuser.me
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
