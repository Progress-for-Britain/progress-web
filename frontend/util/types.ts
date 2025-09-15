export type Role = 'ADMIN' | 'WRITER' | 'MEMBER' | 'VOLUNTEER' | 'ONBOARDING' | 'EVENT_MANAGER';

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  constituency: string | null;
  role: Role;
  roles?: Role[];
  address: string | null;
  createdAt: string;
  updatedAt?: string;
  payments?: Payment[];
  notificationPreferences?: NotificationPreferences;
  privacySettings?: PrivacySettings;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailNewsletter: boolean;
  eventNotifications: boolean;
  donationReminders: boolean;
  pushNotifications: boolean;
  smsUpdates: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PrivacySettings {
  id: string;
  userId: string;
  publicProfile: boolean;
  shareActivity: boolean;
  allowMessages: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNotificationPreferencesRequest {
  emailNewsletter?: boolean;
  eventNotifications?: boolean;
  donationReminders?: boolean;
  pushNotifications?: boolean;
  smsUpdates?: boolean;
}

export interface UpdatePrivacySettingsRequest {
  publicProfile?: boolean;
  shareActivity?: boolean;
  allowMessages?: boolean;
}

export interface Payment {
  id: string;
  customerId: string | null;
  subscriptionId: string | null;
  billingCycle: string | null;
  status: string;
  amount: number;
  currency: string;
  startDate: string | null;
  endDate: string | null;
  nextBillingDate: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  role?: Role;
  accessCode?: string;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  role?: Role;
  roles?: Role[];
  constituency?: string;
}

// Pending User interfaces
export interface PendingUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  constituency?: string;
  interests: string[];
  volunteer: boolean;
  newsletter: boolean;
  status: 'UNREVIEWED' | 'CONTACTED' | 'APPROVED' | 'REJECTED';
  accessCode?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Volunteer-specific fields
  socialMediaHandle?: string;
  isBritishCitizen?: boolean;
  livesInUK?: boolean;
  briefBio?: string;
  briefCV?: string;
  otherAffiliations?: string;
  interestedIn?: string[];
  canContribute?: string[];
  signedNDA?: boolean;
  gdprConsent?: boolean;
}

export interface SubmitApplicationRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  constituency?: string;
  interests?: string[];
  volunteer?: boolean;
  newsletter?: boolean;
  
  // Volunteer-specific fields (only required if volunteer = true)
  socialMediaHandle?: string;
  isBritishCitizen?: boolean;
  livesInUK?: boolean;
  briefBio?: string;
  briefCV?: string;
  otherAffiliations?: string;
  interestedIn?: string[];
  canContribute?: string[];
  signedNDA?: boolean;
  gdprConsent?: boolean;
  
  // Captcha token for verification
  captchaToken?: string;
}

export interface ValidateAccessCodeRequest {
  code: string;
  email: string;
}

export interface ValidateAccessCodeResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    firstName: string;
    lastName: string;
    volunteer: boolean;
    role: string;
  };
}

export interface ApproveApplicationRequest {
  reviewNotes?: string;
}

export interface RejectApplicationRequest {
  reviewNotes?: string;
}

export interface UpdateApplicationStatusRequest {
  status: 'UNREVIEWED' | 'CONTACTED' | 'APPROVED' | 'REJECTED';
  reviewNotes?: string;
}

// News/Posts interfaces
export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  category: 'NEWS' | 'POLICY' | 'CAMPAIGNS' | 'EVENTS' | 'VICTORIES' | 'PRESS';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
  readTime: number | null;
  imageUrl: string | null;
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
  reactionCounts: { [emoji: string]: number };
  _count: {
    reactions: number;
  };
}

export interface Reaction {
  id: string;
  emoji: string;
  createdAt: string;
  userId: string;
  postId: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export interface CreatePostRequest {
  title: string;
  content: string;
  excerpt?: string;
  category?: 'NEWS' | 'POLICY' | 'CAMPAIGNS' | 'EVENTS' | 'VICTORIES' | 'PRESS';
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured?: boolean;
  readTime?: number;
  imageUrl?: string;
  tags?: string[];
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  category?: 'NEWS' | 'POLICY' | 'CAMPAIGNS' | 'EVENTS' | 'VICTORIES' | 'PRESS';
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured?: boolean;
  readTime?: number;
  imageUrl?: string;
  tags?: string[];
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReactionSummary {
  emoji: string;
  count: number;
  users: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  }[];
}

// Events interfaces
export interface Event {
  id: string;
  title: string;
  description: string;
  eventType: 'RALLY' | 'MEETING' | 'FUNDRAISER' | 'CAMPAIGN' | 'VOLUNTEER' | 'TRAINING' | 'CONFERENCE' | 'SOCIAL';
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  location: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  capacity: number | null;
  isVirtual: boolean;
  virtualLink: string | null;
  startDate: string;
  endDate: string;
  imageUrl: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
  participants?: EventParticipant[];
  _count?: {
    participants: number;
  };
  participationStatus?: 'REGISTERED' | 'CONFIRMED' | 'ATTENDED' | 'NO_SHOW' | 'CANCELLED';
  registeredAt?: string;
}

export interface EventParticipant {
  id: string;
  status: 'REGISTERED' | 'CONFIRMED' | 'ATTENDED' | 'NO_SHOW' | 'CANCELLED';
  notes: string | null;
  registeredAt: string;
  checkedInAt: string | null;
  userId: string;
  eventId: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export interface VolunteerHours {
  id: string;
  hours: number;
  description: string | null;
  date: string;
  approved: boolean;
  approvedBy: string | null;
  notes: string | null;
  userId: string;
  eventId: string | null;
  event: {
    title: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  eventType: 'RALLY' | 'MEETING' | 'FUNDRAISER' | 'CAMPAIGN' | 'VOLUNTEER' | 'TRAINING' | 'CONFERENCE' | 'SOCIAL';
  status?: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  isVirtual?: boolean;
  virtualLink?: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  tags?: string[];
}

export interface LogVolunteerHoursRequest {
  hours: number;
  description?: string;
  date: string;
  eventId?: string;
}

export interface UserStats {
  eventsParticipated: number;
  totalVolunteerHours: number;
  totalDonated: number;
  thisMonth: {
    eventsParticipated: number;
    volunteerHours: number;
    donationAmount: number;
  };
}

export interface UserActivity {
  type: 'event' | 'donation' | 'volunteer';
  title: string;
  description: string;
  date: string;
  icon: string;
  color: string;
}

export interface EventsResponse {
  events: Event[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      role: Role;
      roles?: Role[];
      firstName: string | null;
      lastName: string | null;
      address?: string | null;
      createdAt?: string;
    };
    token: string;
    refreshToken: string;
  };
}