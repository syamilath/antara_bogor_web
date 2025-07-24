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
      // Add this block for randomuser.me
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        port: '',
        pathname: '/uploads/**', // Allow paths starting with /uploads/
      },
      // Add this for images.unsplash.com
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Allow local images from /public directory
    unoptimized: false,
  },
};

export default nextConfig;
