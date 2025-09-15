export interface SEOData {
  title: string;
  description: string;
  url: string;
  image?: string;
  keywords?: string;
  type?: string;
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3005';
const DEFAULT_IMAGE = `${BASE_URL}/public/assets/favicon.png`;
const SITE_NAME = 'Progress UK';

export const SEO_DATA: Record<string, SEOData> = {
  home: {
    title: 'Progress UK',
    description: 'A progressive political movement unleashing potential across the UK. Join ordinary people doing extraordinary things to build Britain\'s future.',
    url: `${BASE_URL}/`,
    image: `${BASE_URL}/public/assets/favicon.png`,
    keywords: 'Progress UK, British politics, political party, progressive movement, British democracy, political reform',
    type: 'website'
  },
  
  policy: {
    title: 'Policies - Progress UK',
    description: "Explore Progress UK's policies and guiding principles shaping Britain's future.",
    url: `${BASE_URL}/policy`,
    image: `${BASE_URL}/public/assets/favicon.png`,
    type: 'website'
  },

  'privacy-policy': {
    title: 'Privacy Policy - Progress UK',
    description: 'Read how Progress UK collects, uses, and protects your personal information.',
    url: `${BASE_URL}/privacy-policy`,
    image: `${BASE_URL}/public/assets/favicon.png`,
    type: 'website'
  },

  'terms-of-service': {
    title: 'Terms of Service - Progress UK',
    description: 'Read the terms that govern your use of the Progress UK website and apps.',
    url: `${BASE_URL}/terms-of-service`,
    image: `${BASE_URL}/public/assets/favicon.png`,
    type: 'website'
  },

  eula: {
    title: 'End User License Agreement - Progress UK',
    description: 'The terms governing your use of the Progress UK app and services.',
    url: `${BASE_URL}/eula`,
    image: `${BASE_URL}/public/assets/favicon.png`,
    type: 'website'
  },

  about: {
    title: 'About Us - Progress UK',
    description: 'Learn about Progress UK\'s mission to revitalize Britain. Formed by engineers, founders, NHS professionals, and more - united by the belief that Britain\'s decline can be stopped.',
    url: `${BASE_URL}/about`,
    image: `${BASE_URL}/public/assets/favicon.png`,
    type: 'website'
  },
  
  'our-approach': {
    title: 'Our Approach - Progress UK',
    description: '2029 is an historic opportunity for regime change. Discover how Progress UK plans to seize this moment with the most talented team in the country.',
    url: `${BASE_URL}/our-approach`,
    image: `${BASE_URL}/public/assets/favicon.png`,
    type: 'website'
  },
  
  join: {
    title: 'Join Us - Progress UK',
    description: 'Join Progress UK and help build the most serious new party in the country. Be part of the 2029 opportunity to transform British politics.',
    url: `${BASE_URL}/join`,
    image: `${BASE_URL}/public/assets/favicon.png`,
    type: 'website'
  },
  
  login: {
    title: 'Login - Progress UK',
    description: 'Login to your Progress UK account to access member resources and participate in building Britain\'s future',
    url: `${BASE_URL}/login`,
    type: 'website'
  },
  
  register: {
    title: 'Register - Progress UK',
    description: 'Register for Progress UK and join thousands building the future of British politics',
    url: `${BASE_URL}/register`,
    type: 'website'
  },
  
  events: {
    title: 'Events - Progress UK',
    description: 'Discover Progress UK events, meetings, and activities in your area. Join us in building the future of British politics',
    url: `${BASE_URL}/events`,
    type: 'website'
  },
  
  newsroom: {
    title: 'Newsroom - Progress UK',
    description: 'Stay updated with Progress UK news, press releases, and latest developments in our political movement',
    url: `${BASE_URL}/newsroom`,
    type: 'website'
  },
  
  account: {
    title: 'Account - Progress UK',
    description: 'Manage your Progress UK account, update your profile, and access member resources',
    url: `${BASE_URL}/account`,
    type: 'website'
  },
  
  settings: {
    title: 'Settings - Progress UK',
    description: 'Configure your Progress UK account settings, notifications, and privacy preferences',
    url: `${BASE_URL}/settings`,
    type: 'website'
  },
  
  donate: {
    title: 'Donate - Progress UK',
    description: 'Support Progress UK\'s mission to transform British politics. Help fund the movement for change',
    url: `${BASE_URL}/donate`,
    type: 'website'
  },
  
  nda: {
    title: 'NDA - Progress UK',
    description: 'Confidentiality agreement for Progress UK members. Secure your participation in building Britain\'s future',
    url: `${BASE_URL}/nda`,
    type: 'website'
  },
  
  'user-management': {
    title: 'User Management - Progress UK',
    description: 'Admin panel for managing Progress UK members, pending users, and member verification',
    url: `${BASE_URL}/user-management`,
    type: 'website'
  },
  
  '404': {
    title: 'Page Not Found - Progress UK',
    description: 'The page you\'re looking for doesn\'t exist. Return to Progress UK\'s homepage to continue exploring',
    url: `${BASE_URL}/404`,
    type: 'website'
  }
};

export function generateSEOTags(pageKey: string, customData?: Partial<SEOData>) {
  const data = { ...SEO_DATA[pageKey], ...customData };
  const image = data.image || DEFAULT_IMAGE;
  
  return {
    title: data.title,
    description: data.description,
    
    // Open Graph / Facebook
    'og:type': data.type || 'website',
    'og:url': data.url,
    'og:title': data.title,
    'og:description': data.description,
    'og:image': image,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:site_name': SITE_NAME,
    
    // Twitter
    'twitter:card': 'summary_large_image',
    'twitter:url': data.url,
    'twitter:title': data.title,
    'twitter:description': data.description,
    'twitter:image': image,
    
    // Additional
    ...(data.keywords && { keywords: data.keywords }),
    author: SITE_NAME,
    canonical: data.url
  };
}

// Helper component for easier usage in React components
export function SEOHead({ pageKey, customData }: { pageKey: string; customData?: Partial<SEOData> }) {
  const tags = generateSEOTags(pageKey, customData);
  
  // This would be used with the Head component
  return tags;
}
