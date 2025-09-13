import { isMobileWeb } from './config';

// Request deduplication for mobile efficiency
export class RequestDeduplicator {
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
export const getConnectionQuality = (): 'slow' | 'fast' | 'unknown' => {
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
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

// Network status monitoring for mobile
export class NetworkMonitor {
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
export class MobileCache {
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
export class RequestBatcher {
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

  // This will be called from the ApiClient
};

// Initialize network monitoring and background sync
if (typeof window !== 'undefined') {
  // Start background sync processing when coming online
  networkMonitor.addListener((online) => {
    if (online) {
      // api.processBackgroundSync(); // This will be handled in api.ts
    }
  });

  // Periodic cache cleanup
  setInterval(() => {
    mobileCache.cleanup();
  }, 300000); // Clean every 5 minutes
}

// Initialize mobile optimizations
if (isMobileWeb) {
  // monitorApiPerformance(); // This will be called from api.ts
  registerServiceWorker();
}

export { requestDeduplicator, networkMonitor, mobileCache };