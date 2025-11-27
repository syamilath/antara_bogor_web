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
      // Add localhost for uploaded images
      {
        protocol: 'http', // or 'https' if served over HTTPS locally
        hostname: 'localhost',
        port: '3000', // Your app's port (adjust if different)
        pathname: '/uploads/**', // Allow paths starting with /uploads/
      },
    ],
  },
};

export default nextConfig;
