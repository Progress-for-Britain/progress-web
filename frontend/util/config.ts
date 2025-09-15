// Detect if running on mobile web
export const isMobileWeb = typeof window !== 'undefined' && 
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL || 'http://localhost:3005';

export const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL || 'https://yourdomain.com';

// Mobile web optimizations
export const MOBILE_CONFIG = {
  timeout: isMobileWeb ? 15000 : 30000, // Shorter timeout for mobile
  retryDelay: isMobileWeb ? 500 : 1000,
  maxRetries: isMobileWeb ? 2 : 3,
  enableCompression: true,
  enableCaching: true,
};