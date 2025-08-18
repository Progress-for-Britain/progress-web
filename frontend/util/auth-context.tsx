import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = '@progress_auth_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        api.setToken(token);
        // We'll need to store the user ID to fetch profile, or use a different approach
        // For now, let's try to decode the user ID from the token or store it separately
        const userDataString = await AsyncStorage.getItem('@progress_user_data');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem('@progress_user_data');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await api.login(credentials);
      await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
      
      // Convert auth response user to full User type
      const fullUser: User = {
        ...response.data.user,
        address: response.data.user.address || null,
        createdAt: response.data.user.createdAt || new Date().toISOString(),
        role: response.data.user.role as 'ADMIN' | 'MEMBER' | 'VOLUNTEER'
      };
      
      await AsyncStorage.setItem('@progress_user_data', JSON.stringify(fullUser));
      api.setToken(response.data.token);
      setUser(fullUser);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      const response = await api.register(userData);
      await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
      
      // Convert auth response user to full User type
      const fullUser: User = {
        ...response.data.user,
        address: response.data.user.address || null,
        createdAt: response.data.user.createdAt || new Date().toISOString(),
        role: response.data.user.role as 'ADMIN' | 'MEMBER' | 'VOLUNTEER'
      };
      
      await AsyncStorage.setItem('@progress_user_data', JSON.stringify(fullUser));
      api.setToken(response.data.token);
      setUser(fullUser);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem('@progress_user_data');
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
      await AsyncStorage.setItem('@progress_user_data', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      await logout();
    }
  };

  const getToken = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
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
