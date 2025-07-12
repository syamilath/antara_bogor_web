export const metadata = {
    title: 'RetroNews Admin - Create Article',
    description: 'Manage and publish articles for RetroNews.',
    robots: 'noindex, nofollow',
    openGraph: {
      title: 'RetroNews Admin Panel',
      description: 'Admin interface for managing RetroNews articles.',
      url: 'https://your-domain.com/admin',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: 'RetroNews Admin Panel',
      description: 'Admin interface for managing RetroNews articles.',
    },
  };
  
  export default function AdminLayout({ children }) {
    return children;
  }