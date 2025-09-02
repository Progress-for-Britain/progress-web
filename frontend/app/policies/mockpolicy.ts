// Type definitions
export interface DiffChange {
  type: 'addition' | 'deletion' | 'modification';
  line: number;
  content: string;
  oldContent?: string;
}

export interface Commit {
  id: string;
  message: string;
  author: string;
  date: string;
  changes: string;
  diff: DiffChange[];
}

export interface PullRequest {
  id: string;
  title: string;
  author: string;
  status: 'open' | 'merged' | 'closed';
  createdAt: string;
  mergedAt?: string;
  reviewers: string[];
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
  author: string;
  status: string;
  version: string;
  content: string;
  commits: Commit[];
  pullRequests: PullRequest[];
}

// Mock data for policies
export const mockPolicies: Policy[] = [
  {
    id: '1',
    name: 'Privacy Policy',
    description: 'Our commitment to protecting user privacy and data rights',
    lastUpdated: '2024-09-01T10:30:00Z',
    author: 'Admin User',
    status: 'published',
    version: '2.1.0',
    content: `# Privacy Policy
  
  ## 1. Introduction
  
  This Privacy Policy describes how Progress UK ("we," "us," or "our") collects, uses, and protects your personal information when you use our website and services.
  
  ## 2. Information We Collect
  
  ### 2.1 Personal Information
  We may collect the following types of personal information:
  - Name and contact information
  - Account credentials
  - Communication preferences
  - Usage data and analytics
  
  ### 2.2 Automatically Collected Information
  We automatically collect certain information when you visit our website:
  - IP address and location data
  - Browser type and version
  - Device information
  - Pages visited and time spent
  
  ## 3. How We Use Your Information
  
  We use the collected information to:
  - Provide and maintain our services
  - Communicate with you about updates and features
  - Improve our website and user experience
  - Ensure security and prevent fraud
  - Comply with legal obligations
  
  ## 4. Information Sharing
  
  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
  
  ## 5. Data Security
  
  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
  
  ## 6. Your Rights
  
  You have the right to:
  - Access your personal information
  - Correct inaccurate information
  - Request deletion of your data
  - Object to processing
  - Data portability
  
  ## 7. Contact Us
  
  If you have any questions about this Privacy Policy, please contact us at privacy@progress.uk.
  
  *Last updated: September 1, 2024*`,
    commits: [
      {
        id: 'c1',
        message: 'Update privacy policy for GDPR compliance',
        author: 'Admin User',
        date: '2024-09-01T10:30:00Z',
        changes: '+15 -3 lines',
        diff: [
          {
            type: 'addition',
            line: 45,
            content: '## 6. Your Rights',
          },
          {
            type: 'addition',
            line: 46,
            content: '',
          },
          {
            type: 'addition',
            line: 47,
            content: 'You have the right to:',
          },
          {
            type: 'addition',
            line: 48,
            content: '- Access your personal information',
          },
          {
            type: 'addition',
            line: 49,
            content: '- Correct inaccurate information',
          },
          {
            type: 'addition',
            line: 50,
            content: '- Request deletion of your data',
          },
          {
            type: 'addition',
            line: 51,
            content: '- Object to processing',
          },
          {
            type: 'addition',
            line: 52,
            content: '- Data portability',
          },
          {
            type: 'addition',
            line: 53,
            content: '',
          },
          {
            type: 'modification',
            line: 54,
            content: '## 7. Contact Us',
            oldContent: '## 6. Contact Us',
          },
          {
            type: 'modification',
            line: 58,
            content: '*Last updated: September 1, 2024*',
            oldContent: '*Last updated: August 28, 2024*',
          },
        ],
      },
      {
        id: 'c2',
        message: 'Add section on data retention',
        author: 'Legal Team',
        date: '2024-08-28T14:20:00Z',
        changes: '+12 -0 lines',
        diff: [
          {
            type: 'addition',
            line: 35,
            content: '## 5. Data Security',
          },
          {
            type: 'addition',
            line: 36,
            content: '',
          },
          {
            type: 'addition',
            line: 37,
            content: 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
          },
          {
            type: 'addition',
            line: 38,
            content: '',
          },
          {
            type: 'addition',
            line: 39,
            content: '## 6. Your Rights',
          },
          {
            type: 'addition',
            line: 40,
            content: '',
          },
          {
            type: 'addition',
            line: 41,
            content: 'You have the right to:',
          },
          {
            type: 'addition',
            line: 42,
            content: '- Access your personal information',
          },
          {
            type: 'addition',
            line: 43,
            content: '- Correct inaccurate information',
          },
          {
            type: 'addition',
            line: 44,
            content: '- Request deletion of your data',
          },
          {
            type: 'addition',
            line: 45,
            content: '- Object to processing',
          },
          {
            type: 'addition',
            line: 46,
            content: '- Data portability',
          },
        ],
      },
      {
        id: 'c3',
        message: 'Clarify cookie usage and tracking',
        author: 'Security Team',
        date: '2024-08-25T09:15:00Z',
        changes: '+8 -5 lines',
        diff: [
          {
            type: 'modification',
            line: 12,
            content: '- Browser type and version',
            oldContent: '- Browser type, version, and cookies',
          },
          {
            type: 'addition',
            line: 13,
            content: '- Device information',
          },
          {
            type: 'addition',
            line: 14,
            content: '- Cookie preferences and usage',
          },
          {
            type: 'addition',
            line: 15,
            content: '- Pages visited and time spent',
          },
          {
            type: 'modification',
            line: 16,
            content: '- Usage analytics and tracking data',
            oldContent: '- Pages visited and time spent',
          },
          {
            type: 'deletion',
            line: 17,
            content: '',
            oldContent: '- Device information',
          },
          {
            type: 'deletion',
            line: 18,
            content: '',
            oldContent: '- Usage analytics',
          },
        ],
      },
      {
        id: 'c4',
        message: 'Initial privacy policy draft',
        author: 'Admin User',
        date: '2024-08-20T16:45:00Z',
        changes: '+45 -0 lines',
        diff: [
          {
            type: 'addition',
            line: 1,
            content: '# Privacy Policy',
          },
          {
            type: 'addition',
            line: 2,
            content: '',
          },
          {
            type: 'addition',
            line: 3,
            content: '## 1. Introduction',
          },
          {
            type: 'addition',
            line: 4,
            content: '',
          },
          {
            type: 'addition',
            line: 5,
            content: 'This Privacy Policy describes how Progress UK ("we," "us," or "our") collects, uses, and protects your personal information when you use our website and services.',
          },
          {
            type: 'addition',
            line: 6,
            content: '',
          },
          {
            type: 'addition',
            line: 7,
            content: '## 2. Information We Collect',
          },
          {
            type: 'addition',
            line: 8,
            content: '',
          },
          {
            type: 'addition',
            line: 9,
            content: '### 2.1 Personal Information',
          },
          {
            type: 'addition',
            line: 10,
            content: 'We may collect the following types of personal information:',
          },
          {
            type: 'addition',
            line: 11,
            content: '- Name and contact information',
          },
          {
            type: 'addition',
            line: 12,
            content: '- Account credentials',
          },
          {
            type: 'addition',
            line: 13,
            content: '- Communication preferences',
          },
          {
            type: 'addition',
            line: 14,
            content: '- Usage data and analytics',
          },
          {
            type: 'addition',
            line: 15,
            content: '',
          },
          {
            type: 'addition',
            line: 16,
            content: '### 2.2 Automatically Collected Information',
          },
          {
            type: 'addition',
            line: 17,
            content: 'We automatically collect certain information when you visit our website:',
          },
          {
            type: 'addition',
            line: 18,
            content: '- IP address and location data',
          },
          {
            type: 'addition',
            line: 19,
            content: '- Browser type and version',
          },
          {
            type: 'addition',
            line: 20,
            content: '- Device information',
          },
          {
            type: 'addition',
            line: 21,
            content: '- Pages visited and time spent',
          },
          {
            type: 'addition',
            line: 22,
            content: '',
          },
          {
            type: 'addition',
            line: 23,
            content: '## 3. How We Use Your Information',
          },
          {
            type: 'addition',
            line: 24,
            content: '',
          },
          {
            type: 'addition',
            line: 25,
            content: 'We use the collected information to:',
          },
          {
            type: 'addition',
            line: 26,
            content: '- Provide and maintain our services',
          },
          {
            type: 'addition',
            line: 27,
            content: '- Communicate with you about updates and features',
          },
          {
            type: 'addition',
            line: 28,
            content: '- Improve our website and user experience',
          },
          {
            type: 'addition',
            line: 29,
            content: '- Ensure security and prevent fraud',
          },
          {
            type: 'addition',
            line: 30,
            content: '- Comply with legal obligations',
          },
          {
            type: 'addition',
            line: 31,
            content: '',
          },
          {
            type: 'addition',
            line: 32,
            content: '## 4. Information Sharing',
          },
          {
            type: 'addition',
            line: 33,
            content: '',
          },
          {
            type: 'addition',
            line: 34,
            content: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.',
          },
          {
            type: 'addition',
            line: 35,
            content: '',
          },
          {
            type: 'addition',
            line: 36,
            content: '## 5. Contact Us',
          },
          {
            type: 'addition',
            line: 37,
            content: '',
          },
          {
            type: 'addition',
            line: 38,
            content: 'If you have any questions about this Privacy Policy, please contact us at privacy@progress.uk.',
          },
          {
            type: 'addition',
            line: 39,
            content: '',
          },
          {
            type: 'addition',
            line: 40,
            content: '*Last updated: August 20, 2024*',
          },
        ],
      },
    ],
    pullRequests: [
      {
        id: 'pr1',
        title: 'Update privacy policy for GDPR compliance',
        author: 'Legal Team',
        status: 'merged',
        createdAt: '2024-08-30T10:00:00Z',
        mergedAt: '2024-09-01T10:30:00Z',
        reviewers: ['Admin User'],
      },
      {
        id: 'pr2',
        title: 'Add cookie consent section',
        author: 'Developer',
        status: 'open',
        createdAt: '2024-09-02T14:00:00Z',
        reviewers: ['Admin User', 'Legal Team'],
      },
    ],
  },
  {
    id: '2',
    name: 'Terms of Service',
    description: 'Legal terms and conditions for using our platform',
    lastUpdated: '2024-08-28T14:20:00Z',
    author: 'Legal Team',
    status: 'draft',
    version: '1.0.0',
    content: `# Terms of Service
  
  ## 1. Acceptance of Terms
  
  By accessing and using Progress UK ("we," "us," or "our"), you accept and agree to be bound by the terms and provision of this agreement.
  
  ## 2. Use License
  
  Permission is granted to temporarily download one copy of the materials on Progress UK's website for personal, non-commercial transitory viewing only.
  
  ## 3. Disclaimer
  
  The materials on Progress UK's website are provided on an 'as is' basis. Progress UK makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
  
  ## 4. Limitations
  
  In no event shall Progress UK or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Progress UK's website, even if Progress UK or a Progress UK authorized representative has been notified orally or in writing of the possibility of such damage.
  
  ## 5. Accuracy of Materials
  
  The materials appearing on Progress UK's website could include technical, typographical, or photographic errors. Progress UK does not warrant that any of the materials on its website are accurate, complete, or current.
  
  ## 6. Links
  
  Progress UK has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site.
  
  ## 7. Modifications
  
  Progress UK may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
  
  ## 8. Governing Law
  
  These terms and conditions are governed by and construed in accordance with the laws of England and Wales and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
  
  *Last updated: August 28, 2024*`,
    commits: [
      {
        id: 'c5',
        message: 'Initial terms of service draft',
        author: 'Legal Team',
        date: '2024-08-28T14:20:00Z',
        changes: '+50 -0 lines',
        diff: [
          // Diff for Terms of Service
        ],
      },
    ],
    pullRequests: [
      {
        id: 'pr3',
        title: 'Review terms of service',
        author: 'Legal Team',
        status: 'open',
        createdAt: '2024-08-28T14:20:00Z',
        reviewers: ['Admin User'],
      },
    ],
  },
  {
    id: '3',
    name: 'Community Guidelines',
    description: 'Rules and guidelines for community participation',
    lastUpdated: '2024-08-25T09:15:00Z',
    author: 'Community Manager',
    status: 'published',
    version: '1.2.0',
    content: `# Community Guidelines
  
  ## 1. Introduction
  
  Welcome to the Progress UK community! These guidelines help ensure our community remains a safe, respectful, and productive space for all members.
  
  ## 2. Respect and Inclusion
  
  - Treat all community members with respect and kindness
  - Embrace diversity and inclusion
  - Avoid discriminatory language or behavior
  - Listen actively and engage constructively
  
  ## 3. Content Standards
  
  - Share accurate and truthful information
  - Respect intellectual property rights
  - Avoid spam and promotional content
  - Use appropriate language and tone
  
  ## 4. Community Participation
  
  - Contribute meaningfully to discussions
  - Support and encourage fellow members
  - Report inappropriate behavior
  - Follow platform-specific rules
  
  ## 5. Moderation and Enforcement
  
  Community moderators will enforce these guidelines to maintain a positive environment. Violations may result in warnings, temporary suspension, or permanent removal from the community.
  
  ## 6. Contact Us
  
  If you have questions about these guidelines, please contact our community team at community@progress.uk.
  
  *Last updated: August 25, 2024*`,
    commits: [
      {
        id: 'c6',
        message: 'Update community guidelines',
        author: 'Community Manager',
        date: '2024-08-25T09:15:00Z',
        changes: '+10 -5 lines',
        diff: [
          // Diff for Community Guidelines
        ],
      },
    ],
    pullRequests: [],
  },
  {
    id: '4',
    name: 'Data Retention Policy',
    description: 'How long we keep user data and deletion procedures',
    lastUpdated: '2024-08-20T16:45:00Z',
    author: 'Security Team',
    status: 'review',
    version: '1.0.0',
    content: `# Data Retention Policy
  
  ## 1. Purpose
  
  This policy outlines how long Progress UK retains different types of user data and the procedures for data deletion.
  
  ## 2. Personal Data Retention
  
  ### 2.1 Account Data
  - Active accounts: Retained indefinitely
  - Inactive accounts (no login for 2 years): Deleted after 30 days notice
  
  ### 2.2 Communication Data
  - Email communications: Retained for 3 years
  - Chat logs: Retained for 1 year
  
  ## 3. Usage Data Retention
  
  - Analytics data: Retained for 2 years
  - Log files: Retained for 6 months
  - Cookies: Session cookies expire on browser close
  
  ## 4. Data Deletion Procedures
  
  Users can request data deletion through their account settings or by contacting support. We will respond within 30 days.
  
  ## 5. Legal Obligations
  
  Some data may be retained longer if required by law or for legitimate business purposes.
  
  ## 6. Contact Information
  
  For questions about data retention, contact privacy@progress.uk.
  
  *Last updated: August 20, 2024*`,
    commits: [
      {
        id: 'c7',
        message: 'Initial data retention policy',
        author: 'Security Team',
        date: '2024-08-20T16:45:00Z',
        changes: '+30 -0 lines',
        diff: [
          // Diff for Data Retention Policy
        ],
      },
    ],
    pullRequests: [
      {
        id: 'pr4',
        title: 'Review data retention policy',
        author: 'Security Team',
        status: 'open',
        createdAt: '2024-08-20T16:45:00Z',
        reviewers: ['Legal Team'],
      },
    ],
  },
];

// Export individual policy for backward compatibility
export const mockPolicy = mockPolicies[0];

// Function to get policy by ID
export const getPolicyById = (id: string): Policy | undefined => {
  return mockPolicies.find(policy => policy.id === id);
};