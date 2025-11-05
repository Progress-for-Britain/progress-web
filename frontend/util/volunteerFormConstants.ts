// Static data for the volunteer form to prevent recreation on every render

export const FORM_INTERESTS = [
  'Innovation Economy',
  'Prosperity Zones',
  'Skills & Education',
  'Cost of Living',
  'Housing Policy',
  'Worker Rights',
  'Open Justice',
  'Healthcare Reform',
  'Climate Action',
  'Digital Rights',
  'Local Government',
  'Economic Development'
] as const;

export const VOLUNTEER_INTERESTS = [
  'Policy Research',
  'Campaign Management',
  'Event Organization',
  'Community Outreach',
  'Digital Marketing',
  'Data Analysis',
  'Fundraising',
  'Content Creation',
  'Local Organizing',
  'Media Relations'
] as const;

export const CONTRIBUTION_AREAS = [
  'Strategic Planning',
  'Writing & Communications',
  'Design & Creative',
  'Technology & Development',
  'Event Management',
  'Research & Analysis',
  'Social Media',
  'Public Speaking',
  'Administrative Support',
  'Leadership & Management'
] as const;

export const HERO_TEXT = {
  title: "Help Unleash Britain's Potential",
  description: `2029 will be the biggest opportunity for regime change in a century. The vote share required to win a majority has never been smaller - in 2024 it only took a 1.6% increase in votes to double Labour's seats.

PROGRESS are building the most serious new party in the country, but we need you to help make this a reality. We've seen the inside of all the other parties - new and old - and believe us, they are not up to the task. The time for sitting on the sidelines has passed.

We need to build out our ground campaign all across the country - now. We need to build the real alternative for 2029 now - and we need you to be a part of it.`
} as const;

export const SUCCESS_INFO = {
  title: "Application Submitted!",
  whatHappensNext: {
    title: "What happens next?",
    items: [
      "An admin will review your application",
      "You'll receive an email notification",
      "If approved, you'll get your access code via email"
    ]
  }
} as const;

// Animation configurations
export const ANIMATION_CONFIG = {
  fadeIn: { duration: 1000 },
  spring: { damping: 15 },
  checkmark: { damping: 10 },
  rotation: { duration: 20000, repeat: -1 },
  success: { duration: 500 }
} as const;

// Form field configurations
export const FORM_SECTIONS = {
  personal: {
    title: "Personal Information",
    fields: ['firstName', 'lastName', 'email', 'phone', 'constituency']
  },
  application: {
    title: "Application Details",
    description: 'Please complete the following fields for your application. Not sure if you should volunteer? ',
    guideText: 'Read this guide'
  }
} as const;