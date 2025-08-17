import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3005';

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'ADMIN' | 'WRITER' | 'MEMBER' | 'VOLUNTEER';
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
  role?: 'ADMIN' | 'WRITER' | 'MEMBER' | 'VOLUNTEER';
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  role?: 'ADMIN' | 'WRITER' | 'MEMBER' | 'VOLUNTEER';
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
  eventsAttended: number;
  totalVolunteerHours: number;
  totalDonated: number;
  thisMonth: {
    eventsAttended: number;
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
      role: 'ADMIN' | 'WRITER' | 'MEMBER' | 'VOLUNTEER';
      firstName: string | null;
      lastName: string | null;
      address?: string | null;
      createdAt?: string;
    };
    token: string;
  };
}

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response) {
          // Server responded with error status
          const errorMessage = error.response.data?.message || 
                              error.response.data?.error || 
                              error.response.data || 
                              `HTTP ${error.response.status}`;
          throw new Error(errorMessage);
        } else if (error.request) {
          // Request was made but no response received
          throw new Error('Network error - no response from server');
        } else {
          // Something else happened
          throw new Error(error.message || 'An unexpected error occurred');
        }
      }
    );
  }

  setToken(token: string | null) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/api/users/login', credentials);
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/api/users/register', userData);
    return response.data;
  }

  async logout(): Promise<void> {
    // Note: Backend doesn't have logout endpoint, just clear token locally
    this.setToken(null);
  }

  async getProfile(): Promise<User> {
    // This would need to be implemented with GET /api/users/:id
    // For now, we'll need the user ID from the token or stored user data
    throw new Error('getProfile not implemented - use getUserById instead');
  }

  // User management endpoints
  async getAllUsers(): Promise<User[]> {
    const response = await this.client.get<{success: boolean; data: User[]}>('/api/users');
    return response.data.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await this.client.get<{success: boolean; data: User}>(`/api/users/${id}`);
    return response.data.data;
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const response = await this.client.put<{success: boolean; message: string; data: User}>(`/api/users/${id}`, userData);
    return response.data.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.client.delete<{success: boolean; message: string}>(`/api/users/${id}`);
  }

  // Notification preferences endpoints
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    const response = await this.client.get<{success: boolean; data: NotificationPreferences}>(`/api/users/${userId}/notifications`);
    return response.data.data;
  }

  async updateNotificationPreferences(userId: string, preferences: UpdateNotificationPreferencesRequest): Promise<NotificationPreferences> {
    const response = await this.client.put<{success: boolean; message: string; data: NotificationPreferences}>(`/api/users/${userId}/notifications`, preferences);
    return response.data.data;
  }

  // Privacy settings endpoints
  async getPrivacySettings(userId: string): Promise<PrivacySettings> {
    const response = await this.client.get<{success: boolean; data: PrivacySettings}>(`/api/users/${userId}/privacy`);
    return response.data.data;
  }

  async updatePrivacySettings(userId: string, settings: UpdatePrivacySettingsRequest): Promise<PrivacySettings> {
    const response = await this.client.put<{success: boolean; message: string; data: PrivacySettings}>(`/api/users/${userId}/privacy`, settings);
    return response.data.data;
  }

  // Health check endpoint
  async healthCheck(): Promise<{success: boolean; message: string; timestamp: string}> {
    const response = await this.client.get<{success: boolean; message: string; timestamp: string}>('/api/health');
    return response.data;
  }

  // Donation endpoints
  async createDonation(amount: number, frequency: 'one-time' | 'monthly'): Promise<any> {
    const response = await this.client.post('/donations', { amount, frequency });
    return response.data;
  }

  // Membership endpoints
  async joinParty(membershipData: any): Promise<any> {
    const response = await this.client.post('/membership/join', membershipData);
    return response.data;
  }

  // News/Posts endpoints
  async getAllPosts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    featured?: boolean;
  }): Promise<PostsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString());

    const response = await this.client.get<{success: boolean; data: PostsResponse}>(
      `/api/news?${queryParams.toString()}`
    );
    return response.data.data;
  }

  async getPostById(id: string): Promise<Post> {
    const response = await this.client.get<{success: boolean; data: Post}>(`/api/news/${id}`);
    return response.data.data;
  }

  async createPost(postData: CreatePostRequest): Promise<Post> {
    const response = await this.client.post<{success: boolean; data: Post; message: string}>(
      '/api/news', 
      postData
    );
    return response.data.data;
  }

  async updatePost(id: string, postData: UpdatePostRequest): Promise<Post> {
    const response = await this.client.put<{success: boolean; data: Post; message: string}>(
      `/api/news/${id}`, 
      postData
    );
    return response.data.data;
  }

  async deletePost(id: string): Promise<void> {
    await this.client.delete<{success: boolean; message: string}>(`/api/news/${id}`);
  }

  async getMyPosts(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PostsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await this.client.get<{success: boolean; data: PostsResponse}>(
      `/api/news/author/my-posts?${queryParams.toString()}`
    );
    return response.data.data;
  }

  async toggleReaction(postId: string, emoji: string): Promise<{
    success: boolean;
    data?: Reaction;
    message: string;
    action: 'added' | 'updated' | 'removed';
  }> {
    const response = await this.client.post<{
      success: boolean;
      data?: Reaction;
      message: string;
      action: 'added' | 'updated' | 'removed';
    }>(`/api/news/${postId}/reactions`, { emoji });
    return response.data;
  }

  async getPostReactions(postId: string): Promise<{
    reactions: Reaction[];
    summary: ReactionSummary[];
  }> {
    const response = await this.client.get<{
      success: boolean;
      data: {
        reactions: Reaction[];
        summary: ReactionSummary[];
      };
    }>(`/api/news/${postId}/reactions`);
    return response.data.data;
  }

  // User dashboard endpoints
  async getUserStats(): Promise<UserStats> {
    const response = await this.client.get<{success: boolean; data: UserStats}>('/api/users/me/stats');
    return response.data.data;
  }

  async getUserActivity(limit?: number): Promise<UserActivity[]> {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());

    const response = await this.client.get<{success: boolean; data: UserActivity[]}>(
      `/api/users/me/activity?${queryParams.toString()}`
    );
    return response.data.data;
  }

  async getUserUpcomingEvents(limit?: number): Promise<Event[]> {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());

    const response = await this.client.get<{success: boolean; data: Event[]}>(
      `/api/users/me/upcoming-events?${queryParams.toString()}`
    );
    return response.data.data;
  }

  // Events endpoints
  async getAllEvents(params?: {
    page?: number;
    limit?: number;
    eventType?: string;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<EventsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.eventType) queryParams.append('eventType', params.eventType);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await this.client.get<{success: boolean; data: EventsResponse}>(
      `/api/events?${queryParams.toString()}`
    );
    return response.data.data;
  }

  async getEventById(id: string): Promise<Event> {
    const response = await this.client.get<{success: boolean; data: Event}>(`/api/events/${id}`);
    return response.data.data;
  }

  async createEvent(eventData: CreateEventRequest): Promise<Event> {
    const response = await this.client.post<{success: boolean; data: Event; message: string}>(
      '/api/events', 
      eventData
    );
    return response.data.data;
  }

  async updateEvent(eventId: string, eventData: Partial<CreateEventRequest>): Promise<Event> {
    const response = await this.client.put<{success: boolean; data: Event; message: string}>(
      `/api/events/${eventId}`, 
      eventData
    );
    return response.data.data;
  }

  async deleteEvent(eventId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.delete<{ success: boolean; message: string }>(
      `/api/events/${eventId}`
    );
    return response.data;
  }

  async registerForEvent(eventId: string): Promise<{
    success: boolean;
    message: string;
    data: EventParticipant;
  }> {
    const response = await this.client.post<{
      success: boolean;
      message: string;
      data: EventParticipant;
    }>(`/api/events/${eventId}/register`);
    return response.data;
  }

  async cancelEventRegistration(eventId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await this.client.delete<{
      success: boolean;
      message: string;
    }>(`/api/events/${eventId}/register`);
    return response.data;
  }

  async getEvent(eventId: string): Promise<Event> {
    const response = await this.client.get<{success: boolean; data: Event; message: string}>(
      `/api/events/${eventId}`
    );
    return response.data.data;
  }

  async logVolunteerHours(hoursData: LogVolunteerHoursRequest): Promise<VolunteerHours> {
    const response = await this.client.post<{success: boolean; data: VolunteerHours; message: string}>(
      '/api/events/volunteer-hours', 
      hoursData
    );
    return response.data.data;
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;

// Export convenience functions
export const getEvents = (params?: {
  page?: number;
  limit?: number;
  eventType?: string;
  status?: string;
  search?: string;
}) => api.getAllEvents(params);

export const getEvent = (eventId: string) => api.getEvent(eventId);
export const createEvent = (eventData: CreateEventRequest) => api.createEvent(eventData);
export const registerForEvent = (eventId: string) => api.registerForEvent(eventId);
export const unregisterFromEvent = (eventId: string) => api.cancelEventRegistration(eventId);
export const logVolunteerHours = (hoursData: LogVolunteerHoursRequest) => api.logVolunteerHours(hoursData);

// Export type alias for compatibility
export type EventType = Event['eventType'];
