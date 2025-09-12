import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';

// Detect if running on mobile web
const isMobileWeb = typeof window !== 'undefined' && 
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL || 'http://localhost:3005';

// Mobile web optimizations
const MOBILE_CONFIG = {
  timeout: isMobileWeb ? 15000 : 30000, // Shorter timeout for mobile
  retryDelay: isMobileWeb ? 500 : 1000,
  maxRetries: isMobileWeb ? 2 : 3,
  enableCompression: true,
  enableCaching: true,
};

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

// Request deduplication for mobile efficiency
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();

  async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }
}

const requestDeduplicator = new RequestDeduplicator();

// Connection quality detection for mobile
const getConnectionQuality = (): 'slow' | 'fast' | 'unknown' => {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow';
      if (effectiveType === '3g') return 'slow';
      if (effectiveType === '4g') return 'fast';
    }
  }
  return 'unknown';
};

// Offline detection
const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

// Network status monitoring for mobile
class NetworkMonitor {
  private listeners: Array<(online: boolean) => void> = [];
  private isOnline: boolean;

  constructor() {
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  private handleOnline() {
    this.isOnline = true;
    this.listeners.forEach(listener => listener(true));
  }

  private handleOffline() {
    this.isOnline = false;
    this.listeners.forEach(listener => listener(false));
  }

  getStatus(): boolean {
    return this.isOnline;
  }

  addListener(callback: (online: boolean) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }
}

const networkMonitor = new NetworkMonitor();

// Enhanced caching for mobile
class MobileCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

const mobileCache = new MobileCache();

// Request batching for mobile efficiency
class RequestBatcher {
  private batchQueue: Array<{
    id: string;
    request: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private batchTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly BATCH_DELAY = 50; // 50ms batch window

  add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.batchQueue.push({ id, request, resolve, reject });

      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => this.processBatch(), this.BATCH_DELAY);
      }
    });
  }

  private async processBatch(): Promise<void> {
    const batch = [...this.batchQueue];
    this.batchQueue = [];
    this.batchTimeout = null;

    // Process batch in parallel with concurrency limit
    const concurrencyLimit = 3;
    const results = [];

    for (let i = 0; i < batch.length; i += concurrencyLimit) {
      const chunk = batch.slice(i, i + concurrencyLimit);
      const chunkPromises = chunk.map(async (item) => {
        try {
          const result = await item.request();
          item.resolve(result);
          return { success: true, id: item.id };
        } catch (error) {
          item.reject(error);
          return { success: false, id: item.id, error };
        }
      });

      results.push(...await Promise.all(chunkPromises));
    }
  }
}

const requestBatcher = new RequestBatcher();

class ApiClient {
  private client: AxiosInstance;
  private onUnauthorized?: () => Promise<void>;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        // Enable compression for mobile
      },
      // Improved timeout settings for mobile
      timeout: MOBILE_CONFIG.timeout,
      timeoutErrorMessage: 'Request timed out - please check your connection',
      // Enable keep-alive for connection reuse on mobile
      withCredentials: false,
    });

    // Add request interceptor for mobile optimizations
    this.client.interceptors.request.use(
      (config) => {
        // Add cache headers for mobile efficiency
        if (config.method === 'get' && MOBILE_CONFIG.enableCaching) {
          config.headers['Cache-Control'] = 'public, max-age=300'; // 5 minutes cache
        }
        
        // Add connection quality hints
        const connectionQuality = getConnectionQuality();
        if (connectionQuality === 'slow') {
          // Reduce payload size for slow connections
          config.headers['X-Connection-Quality'] = 'slow';
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling with mobile-specific handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          throw new Error('Connection timeout - please check your network and try again');
        }
        
        if (error.response) {
          // Server responded with error status
          const errorMessage = error.response.data?.message || 
                              error.response.data?.error || 
                              error.response.data || 
                              `HTTP ${error.response.status}`;
          
          // Handle expired token
          if (error.response.status === 403 && errorMessage.includes('Invalid or expired token')) {
            if (this.onUnauthorized) {
              await this.onUnauthorized();
            }
          }
          
          throw new Error(errorMessage);
        } else if (error.request) {
          // Request was made but no response received - common on mobile
          throw new Error('Network error - please check your connection and try again');
        } else {
          // Something else happened
          throw new Error(error.message || 'An unexpected error occurred');
        }
      }
    );
  }

  setOnUnauthorized(callback: () => Promise<void>) {
    this.onUnauthorized = callback;
  }

  setToken(token: string | null) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  // Retry mechanism for mobile networks
  private async retryRequest<T>(
    requestFn: () => Promise<T>, 
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on authentication errors or client errors (4xx)
        if (error instanceof Error && 
            (error.message.includes('401') || 
             error.message.includes('403') ||
             error.message.includes('400'))) {
          throw error;
        }
        
        if (attempt < maxRetries) {
          // Exponential backoff with jitter for mobile networks
          const backoffDelay = delay * Math.pow(2, attempt) + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
      }
    }
    
    throw lastError!;
  }

  // Background sync for offline requests
  private backgroundSyncQueue: Array<{
    id: string;
    request: () => Promise<any>;
    priority: 'high' | 'medium' | 'low';
    timestamp: number;
  }> = [];

  // Add request to background sync queue
  private addToBackgroundSync(
    request: () => Promise<any>, 
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): string {
    const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.backgroundSyncQueue.push({
      id,
      request,
      priority,
      timestamp: Date.now()
    });
    
    // Sort by priority (high first, then by timestamp)
    this.backgroundSyncQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp;
    });
    
    return id;
  }

  // Process background sync queue when online
  async processBackgroundSync(): Promise<void> {
    if (!isOnline() || this.backgroundSyncQueue.length === 0) return;

    const queueCopy = [...this.backgroundSyncQueue];
    this.backgroundSyncQueue = [];

    for (const item of queueCopy) {
      try {
        await item.request();
      } catch (error) {
        console.warn(`Background sync failed for ${item.id}:`, error);
        // Re-queue failed requests with lower priority
        this.addToBackgroundSync(item.request, 'low');
      }
    }
  }

  // Enhanced request method with mobile optimizations
  private async makeRequest<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: any,
    options?: {
      priority?: 'high' | 'medium' | 'low';
      dedupeKey?: string;
      backgroundSync?: boolean;
      cache?: boolean;
    }
  ): Promise<T> {
    const { priority = 'medium', dedupeKey, backgroundSync = false, cache = true } = options || {};

    // Check if offline and handle accordingly
    if (!isOnline()) {
      if (backgroundSync) {
        return new Promise((resolve, reject) => {
          this.addToBackgroundSync(async () => {
            try {
              const result = await this.makeRequest(method, url, data, { ...options, backgroundSync: false });
              resolve(result as T);
            } catch (error) {
              reject(error);
            }
          }, priority);
        });
      }
      throw new Error('You appear to be offline. Please check your connection and try again.');
    }

    // Request deduplication
    if (dedupeKey && method === 'get') {
      return requestDeduplicator.dedupe(dedupeKey, async () => {
        return this.performRequest<T>(method, url, data, cache);
      });
    }

    return this.performRequest<T>(method, url, data, cache);
  }

  private async performRequest<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: any,
    cache: boolean = true
  ): Promise<T> {
    const connectionQuality = getConnectionQuality();
    
    // Adjust request based on connection quality
    const requestConfig: any = {
      method,
      url,
      headers: {}
    };

    if (data && (method === 'post' || method === 'put')) {
      requestConfig.data = data;
    }

    // Add cache control based on connection quality
    if (method === 'get' && cache) {
      if (connectionQuality === 'slow') {
        requestConfig.headers['Cache-Control'] = 'max-age=3600'; // 1 hour cache for slow connections
      } else {
        requestConfig.headers['Cache-Control'] = 'max-age=300'; // 5 minutes cache for fast connections
      }
    }

    // Add connection quality hint to server
    if (connectionQuality !== 'unknown') {
      requestConfig.headers['X-Connection-Quality'] = connectionQuality;
    }

    const response = await this.client.request(requestConfig);
    return response.data.data || response.data;
  }

  // Auth endpoints with mobile retry support
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.retryRequest(async () => {
      const response = await this.client.post<AuthResponse>('/api/users/login', credentials);
      return response.data;
    });
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.retryRequest(async () => {
      const response = await this.client.post<AuthResponse>('/api/users/register', userData);
      return response.data;
    });
  }

  async logout(data?: { refreshToken: string }): Promise<void> {
    await this.client.post('/api/users/logout', data);
    this.setToken(null);
  }

  async refresh(refreshToken: string): Promise<{ token: string }> {
    const response = await this.client.post('/api/users/refresh', { refreshToken });
    return response.data.data;
  }

  async getProfile(): Promise<User> {
    // This would need to be implemented with GET /api/users/:id
    // For now, we'll need the user ID from the token or stored user data
    throw new Error('getProfile not implemented - use getUserById instead');
  }

  // User management endpoints with mobile optimization
  async getAllUsers(): Promise<User[]> {
    return this.retryRequest(async () => {
      const response = await this.client.get<{success: boolean; data: User[]}>('/api/users');
      return response.data.data;
    });
  }

  async getUserById(id: string): Promise<User> {
    return this.retryRequest(async () => {
      const response = await this.client.get<{success: boolean; data: User}>(`/api/users/${id}`);
      return response.data.data;
    });
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

  // Health check endpoint with mobile optimization
  async healthCheck(): Promise<{success: boolean; message: string; timestamp: string}> {
    return this.retryRequest(async () => {
      const response = await this.client.get<{success: boolean; message: string; timestamp: string}>('/api/health');
      return response.data;
    }, 2, 500); // Reduced retries for health check
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

  // News/Posts endpoints with mobile retry support
  async getAllPosts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    featured?: boolean;
  }): Promise<PostsResponse> {
    return this.retryRequest(async () => {
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
    });
  }

  async getPostById(id: string): Promise<Post> {
    return this.retryRequest(async () => {
      const response = await this.client.get<{success: boolean; data: Post}>(`/api/news/${id}`);
      return response.data.data;
    });
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

  // Events endpoints with mobile optimization
  async getAllEvents(params?: {
    page?: number;
    limit?: number;
    eventType?: string;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<EventsResponse> {
    return this.retryRequest(async () => {
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
    });
  }

  async getEventById(id: string): Promise<Event> {
    return this.retryRequest(async () => {
      const response = await this.client.get<{success: boolean; data: Event}>(`/api/events/${id}`);
      return response.data.data;
    });
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

  // Pending User endpoints
  async submitApplication(applicationData: SubmitApplicationRequest): Promise<{
    success: boolean;
    message: string;
    data: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      status: string;
    };
  }> {
    const response = await this.client.post<{
      success: boolean;
      message: string;
      data: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        status: string;
      };
    }>('/api/pending-users/apply', applicationData);
    return response.data;
  }

  async validateAccessCode(codeData: ValidateAccessCodeRequest): Promise<ValidateAccessCodeResponse> {
    const response = await this.client.post<ValidateAccessCodeResponse>(
      '/api/pending-users/validate-access-code', 
      codeData
    );
    return response.data;
  }

  async getAllPendingApplications(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    applications: PendingUser[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await this.client.get<{
      success: boolean;
      data: {
        applications: PendingUser[];
        pagination: {
          total: number;
          limit: number;
          offset: number;
          hasMore: boolean;
        };
      };
    }>(`/api/pending-users?${queryParams.toString()}`);
    return response.data.data;
  }

  async getPendingApplicationById(id: string): Promise<PendingUser> {
    const response = await this.client.get<{success: boolean; data: PendingUser}>(
      `/api/pending-users/${id}`
    );
    return response.data.data;
  }

  async approveApplication(id: string, reviewData: ApproveApplicationRequest): Promise<{
    success: boolean;
    message: string;
    data: {
      id: string;
      status: string;
      accessCode: string;
      approvedAt: string;
    };
  }> {
    const response = await this.client.post<{
      success: boolean;
      message: string;
      data: {
        id: string;
        status: string;
        accessCode: string;
        approvedAt: string;
      };
    }>(`/api/pending-users/${id}/approve`, reviewData);
    return response.data;
  }

  async rejectApplication(id: string, reviewData: RejectApplicationRequest): Promise<{
    success: boolean;
    message: string;
    data: {
      id: string;
      status: string;
      approvedAt: string;
    };
  }> {
    const response = await this.client.post<{
      success: boolean;
      message: string;
      data: {
        id: string;
        status: string;
        approvedAt: string;
      };
    }>(`/api/pending-users/${id}/reject`, reviewData);
    return response.data;
  }

  async updateApplicationStatus(id: string, statusData: UpdateApplicationStatusRequest): Promise<{
    success: boolean;
    message: string;
    data: {
      id: string;
      status: string;
      reviewedBy?: string;
      reviewNotes?: string;
      accessCode?: string;
      approvedAt?: string;
      updatedAt: string;
    };
  }> {
    const response = await this.client.put<{
      success: boolean;
      message: string;
      data: {
        id: string;
        status: string;
        reviewedBy?: string;
        reviewNotes?: string;
        accessCode?: string;
        approvedAt?: string;
        updatedAt: string;
      };
    }>(`/api/pending-users/${id}/status`, statusData);
    return response.data;
  }

  async updatePendingUserVolunteerDetails(id: string, volunteerData: {
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
  }): Promise<{
    success: boolean;
    message: string;
    data: PendingUser;
  }> {
    const response = await this.client.put<{
      success: boolean;
      message: string;
      data: PendingUser;
    }>(`/api/pending-users/${id}/volunteer-details`, volunteerData);
    return response.data;
  }

  async getApplicationStats(): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    volunteerApplications: number;
    recentApplications: number;
  }> {
    const response = await this.client.get<{
      success: boolean;
      data: {
        pending: number;
        approved: number;
        rejected: number;
        volunteerApplications: number;
        recentApplications: number;
      };
    }>('/api/pending-users/stats');
    return response.data.data;
  }

  // User Management endpoints (admin only)
  async assignUserToEvent(userId: string, eventId: string, status?: string): Promise<{
    success: boolean;
    message: string;
    data: EventParticipant;
  }> {
    const response = await this.client.post<{
      success: boolean;
      message: string;
      data: EventParticipant;
    }>('/api/users/assign-event', { userId, eventId, status });
    return response.data;
  }

  async unassignUserFromEvent(userId: string, eventId: string): Promise<{
    success: boolean;
    message: string;
    data: {
      user: any;
      event: any;
    };
  }> {
    const response = await this.client.post<{
      success: boolean;
      message: string;
      data: {
        user: any;
        event: any;
      };
    }>('/api/users/unassign-event', { userId, eventId });
    return response.data;
  }

  async updateUserRole(userId: string, role: Role | Role[]): Promise<{
    success: boolean;
    message: string;
    data: User;
  }> {
    const body = Array.isArray(role) ? { roles: role } : { role };
    const response = await this.client.put<{
      success: boolean;
      message: string;
      data: User;
    }>(`/api/users/${userId}/role`, body);
    return response.data;
  }

  async getUserEventAssignments(userId: string): Promise<{
    id: string;
    status: string;
    registeredAt: string;
    event: {
      id: string;
      title: string;
      eventType: string;
      status: string;
      location: string;
      startDate: string;
      endDate: string;
    };
  }[]> {
    const response = await this.client.get<{
      success: boolean;
      data: {
        id: string;
        status: string;
        registeredAt: string;
        event: {
          id: string;
          title: string;
          eventType: string;
          status: string;
          location: string;
          startDate: string;
          endDate: string;
        };
      }[];
    }>(`/api/users/${userId}/events`);
    return response.data.data;
  }

  async getUserManagementStats(): Promise<{
    usersByRole: { [role: string]: number };
    recentRegistrations: number;
    activeUsers: number;
    monthlyVolunteerHours: number;
  }> {
    const response = await this.client.get<{
      success: boolean;
      data: {
        usersByRole: { [role: string]: number };
        recentRegistrations: number;
        activeUsers: number;
        monthlyVolunteerHours: number;
      };
    }>('/api/users/management/stats');
    return response.data.data;
  }

  // Method to enable performance monitoring
  enablePerformanceMonitoring(): void {
    const originalRequest = this.client.request;
    this.client.request = async <T = any, R = AxiosResponse<T, any>, D = any>(
      config: AxiosRequestConfig<D>
    ): Promise<R> => {
      const startTime = Date.now();
      try {
        const response = await originalRequest.call(this.client, config);
        const duration = Date.now() - startTime;
        
        // Log slow requests (> 3 seconds on mobile)
        if (duration > 3000) {
          console.warn(`Slow API request: ${config.method?.toUpperCase()} ${config.url} took ${duration}ms`);
        }
        
        return response as R;
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`API request failed: ${config.method?.toUpperCase()} ${config.url} after ${duration}ms`, error);
        throw error;
      }
    };
  }

  async createSubscriptionCheckout(planId: string, billingInterval: string, metadata?: any): Promise<{url: string}> {
    const response = await this.client.post('/api/subscriptions/create-checkout', { planId, billingInterval, metadata });
    return response.data.data;
  }

  // Policy endpoints
  async getPolicyRepos(): Promise<any[]> {
    const response = await this.client.get('/api/policies');
    return response.data;
  }

  async getPolicyContent(repo: string, path: string, branch?: string): Promise<{content: string; sha: string}> {
    const queryParams = new URLSearchParams();
    if (branch) queryParams.append('ref', branch);
    
    const response = await this.client.get(`/api/policies/${repo}/${path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    return response.data;
  }

  async getPolicyBranches(repo: string): Promise<any[]> {
    const response = await this.client.get(`/api/policies/${repo}/branches`);
    return response.data;
  }

  async getPolicyPRs(repo: string): Promise<any[]> {
    const response = await this.client.get(`/api/policies/${repo}/pulls`);
    return response.data;
  }

  async getPolicyPR(repo: string, id: string): Promise<any> {
    const response = await this.client.get(`/api/policies/${repo}/pulls/${id}`);
    return response.data;
  }

  async getPolicyPRReviews(repo: string, id: string): Promise<any[]> {
    const response = await this.client.get(`/api/policies/${repo}/pulls/${id}/reviews`);
    return response.data;
  }

  async getPolicyPRComments(repo: string, id: string): Promise<any[]> {
    const response = await this.client.get(`/api/policies/${repo}/pulls/${id}/comments`);
    return response.data;
  }

  async postPolicyPRComment(repo: string, id: string, body: string): Promise<any> {
    const response = await this.client.post(`/api/policies/${repo}/pulls/${id}/comments`, { body });
    return response.data;
  }

  async editPolicy(repo: string, path: string, content: string, message: string, branchName?: string, draft?: boolean): Promise<any> {
    const response = await this.client.post(`/api/policies/${repo}/edit`, { path, content, message, branchName, draft });
    return response.data;
  }

  async createPolicyRepo(name: string, description?: string): Promise<any> {
    const response = await this.client.post('/api/policies', { name, description });
    return response.data;
  }

  async getPolicyPRFiles(repo: string, id: string): Promise<any[]> {
    const response = await this.client.get(`/api/policies/${repo}/pulls/${id}/files`);
    return response.data;
  }

  async updatePolicyPR(repo: string, id: string, updates: { draft?: boolean }): Promise<any> {
    const response = await this.client.patch(`/api/policies/${repo}/pulls/${id}`, updates);
    return response.data;
  }

  async setPolicyTags(repo: string, tags: string[]): Promise<any> {
    const response = await this.client.post(`/api/policies/${repo}/tags`, { tags });
    return response.data;
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

// Initialize network monitoring and background sync
if (typeof window !== 'undefined') {
  // Start background sync processing when coming online
  networkMonitor.addListener((online) => {
    if (online) {
      api.processBackgroundSync();
    }
  });

  // Periodic cache cleanup
  setInterval(() => {
    mobileCache.cleanup();
  }, 300000); // Clean every 5 minutes
}

// Enhanced API methods with mobile optimizations
export const getEventsOptimized = (params?: {
  page?: number;
  limit?: number;
  eventType?: string;
  status?: string;
  search?: string;
}) => {
  const cacheKey = `events_${JSON.stringify(params)}`;
  const cached = mobileCache.get(cacheKey);
  if (cached) return Promise.resolve(cached);

  return api.getAllEvents(params).then(data => {
    mobileCache.set(cacheKey, data);
    return data;
  });
};

export const getPostsOptimized = (params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  featured?: boolean;
}) => {
  const cacheKey = `posts_${JSON.stringify(params)}`;
  const cached = mobileCache.get(cacheKey);
  if (cached) return Promise.resolve(cached);

  return api.getAllPosts(params).then(data => {
    mobileCache.set(cacheKey, data);
    return data;
  });
};

// Batch multiple API calls for better mobile performance
export const batchApiCalls = async <T>(
  calls: Array<() => Promise<T>>
): Promise<T[]> => {
  return requestBatcher.add(async () => {
    return Promise.all(calls.map(call => call()));
  });
};

// Service Worker integration hints
export const registerServiceWorker = async () => {
  const enableSW = (typeof process !== 'undefined' && (process.env as any)?.EXPO_PUBLIC_ENABLE_SW) === 'true';
  if ('serviceWorker' in navigator && isMobileWeb && enableSW) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, notify user
              console.log('New content available, please refresh');
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Performance monitoring for mobile
export const monitorApiPerformance = () => {
  if (!isMobileWeb) return;

  api.enablePerformanceMonitoring();
};

// Initialize mobile optimizations
if (isMobileWeb) {
  monitorApiPerformance();
  registerServiceWorker();
}
