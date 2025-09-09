import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { api, User, LoginRequest, RegisterRequest } from './api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getToken: () => Promise<string | null>;
  isStorageReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'progress-auth-token';
const USER_DATA_KEY = 'progress-user-data';

// Hybrid storage helper that uses SecureStore on mobile, AsyncStorage on web
const isSecureStoreSupported = Platform.OS !== 'web';

// Check if SecureStore is available on the current platform
const checkSecureStoreAvailability = async (): Promise<boolean> => {
  if (!isSecureStoreSupported) return false;
  try {
    return await SecureStore.isAvailableAsync();
  } catch (error) {
    console.warn('SecureStore availability check failed:', error);
    return false;
  }
};

// Enhanced storage helper functions with SecureStore for sensitive data
const secureStorageSet = async (key: string, value: string, isSecure: boolean = false): Promise<void> => {
  let retries = 3;
  while (retries > 0) {
    try {
      if (isSecure && isSecureStoreSupported && await checkSecureStoreAvailability()) {
        // Use SecureStore for sensitive data on mobile
        await SecureStore.setItemAsync(key, value);
      } else {
        // Fallback to AsyncStorage on web or non-secure data
        await AsyncStorage.setItem(key, value);
      }
      return;
    } catch (error) {
      console.warn(`Storage set failed for ${key}, retries left: ${retries - 1}`, error);
      retries--;
      if (retries === 0) throw error;
      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, 500 * (4 - retries)));
    }
  }
};

const secureStorageGet = async (key: string, isSecure: boolean = false): Promise<string | null> => {
  let retries = 3;
  while (retries > 0) {
    try {
      if (isSecure && isSecureStoreSupported && await checkSecureStoreAvailability()) {
        // Use SecureStore for sensitive data on mobile
        return await SecureStore.getItemAsync(key);
      } else {
        // Fallback to AsyncStorage on web or non-secure data
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.warn(`Storage get failed for ${key}, retries left: ${retries - 1}`, error);
      retries--;
      if (retries === 0) {
        console.error(`Failed to get ${key} after all retries`, error);
        return null;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 300 * (4 - retries)));
    }
  }
  return null;
};

const secureStorageRemove = async (key: string, isSecure: boolean = false): Promise<void> => {
  try {
    if (isSecure && isSecureStoreSupported && await checkSecureStoreAvailability()) {
      // Use SecureStore for sensitive data on mobile
      await SecureStore.deleteItemAsync(key);
    } else {
      // Fallback to AsyncStorage on web or non-secure data
      await AsyncStorage.removeItem(key);
    }
  } catch (error) {
    console.warn(`Failed to remove ${key}`, error);
    // Don't throw on remove failures, just log
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStorageReady, setIsStorageReady] = useState(false);

  const isAuthenticated = !!user;

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      setIsLoading(true);
      
      // Test storage availability first
      try {
        await AsyncStorage.setItem('@test_key', 'test');
        await AsyncStorage.removeItem('@test_key');
        setIsStorageReady(true);
      } catch (storageError) {
        console.error('Storage not available:', storageError);
        setIsStorageReady(false);
        setIsLoading(false);
        return;
      }

      const [token, userDataString] = await Promise.all([
        secureStorageGet(TOKEN_KEY, true), // Use SecureStore for token (sensitive)
        secureStorageGet(USER_DATA_KEY, false) // Use AsyncStorage for user data (not sensitive)
      ]);

      if (token && userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          api.setToken(token);
          // If roles are missing in stored data, refresh from API to get roles[]
          if (!userData.roles || !Array.isArray(userData.roles)) {
            try {
              const fresh = await api.getUserById(userData.id);
              const merged = { ...userData, roles: fresh.roles || [fresh.role] };
              setUser(merged);
              await secureStorageSet(USER_DATA_KEY, JSON.stringify(merged), false);
            } catch (e) {
              // Fall back to inferring roles from legacy role
              const merged = { ...userData, roles: [userData.role] };
              setUser(merged);
              await secureStorageSet(USER_DATA_KEY, JSON.stringify(merged), false);
            }
          } else {
            setUser(userData);
          }
        } catch (parseError) {
          console.error('Failed to parse stored user data:', parseError);
          // Clear corrupted data
          await Promise.all([
            secureStorageRemove(TOKEN_KEY, true),
            secureStorageRemove(USER_DATA_KEY, false)
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
      // Clear potentially corrupted data
      await Promise.all([
        secureStorageRemove(TOKEN_KEY, true),
        secureStorageRemove(USER_DATA_KEY, false)
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      if (!isStorageReady) {
        throw new Error('Storage not available - please try again');
      }

      const response = await api.login(credentials);
      
      // Convert auth response user to full User type
      const fullUser: User = {
        ...response.data.user,
        address: response.data.user.address || null,
        createdAt: response.data.user.createdAt || new Date().toISOString(),
        role: response.data.user.role as any,
        roles: (response.data.user as any).roles || [response.data.user.role]
      };
      
      // Store token and user data with mobile-optimized storage
      await Promise.all([
        secureStorageSet(TOKEN_KEY, response.data.token, true), // Secure storage for token
        secureStorageSet(USER_DATA_KEY, JSON.stringify(fullUser), false) // Regular storage for user data
      ]);

      api.setToken(response.data.token);
      setUser(fullUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      if (!isStorageReady) {
        throw new Error('Storage not available - please try again');
      }

      const response = await api.register(userData);
      
      // Convert auth response user to full User type
      const fullUser: User = {
        ...response.data.user,
        address: response.data.user.address || null,
        createdAt: response.data.user.createdAt || new Date().toISOString(),
        role: response.data.user.role as any,
        roles: (response.data.user as any).roles || [response.data.user.role]
      };
      
      // Store token and user data with mobile-optimized storage
      await Promise.all([
        secureStorageSet(TOKEN_KEY, response.data.token, true), // Secure storage for token
        secureStorageSet(USER_DATA_KEY, JSON.stringify(fullUser), false) // Regular storage for user data
      ]);

      api.setToken(response.data.token);
      setUser(fullUser);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local data regardless of API call result
      await Promise.all([
        secureStorageRemove(TOKEN_KEY, true),
        secureStorageRemove(USER_DATA_KEY, false)
      ]);
      api.setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      if (!user?.id) {
        throw new Error('No user ID available for refresh');
      }
      
      const userData = await api.getUserById(user.id);
      setUser(userData);
      
      if (isStorageReady) {
        await secureStorageSet(USER_DATA_KEY, JSON.stringify(userData), false);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // On refresh failure, logout to maintain consistency
      await logout();
      throw error;
    }
  };

  const getToken = async (): Promise<string | null> => {
    try {
      return await secureStorageGet(TOKEN_KEY, true); // Use secure storage for token
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    isStorageReady,
    login,
    register,
    logout,
    refreshUser,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
