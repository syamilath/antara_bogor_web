// Admin configuration with environment-based security
export const ADMIN_CONFIG = {
  // Use environment variable for admin path, fallback to default
  adminPath: process.env.ADMIN_PATH || '/admin',
};

export function isAdminPath(pathname) {
  return pathname.startsWith(ADMIN_CONFIG.adminPath);
}

export function getAdminPath(subPath = '') {
  return `${ADMIN_CONFIG.adminPath}${subPath}`;
}