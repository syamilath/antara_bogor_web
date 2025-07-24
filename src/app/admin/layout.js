export const metadata = {
  title: 'Admin Panel - Antara Bogor',
  description: 'Admin panel for managing Antara Bogor news, articles, and analytics.',
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