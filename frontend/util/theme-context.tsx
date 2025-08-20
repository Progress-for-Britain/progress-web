import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Appearance } from 'react-native';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  isLight: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark'; // The resolved theme (what's actually being used)
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = '@progress_theme';

// Get system theme preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (Platform.OS === 'web') {
    // // For web, check browser's preferred color scheme
    // if (typeof window !== 'undefined' && window.matchMedia) {
    //   return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    // }
    return 'dark'; // Default to dark theme for web
  } else {
    // For native, use React Native's Appearance API
    return Appearance.getColorScheme() || 'light';
  }
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => getSystemTheme());
  const [isLoading, setIsLoading] = useState(true);

  // Calculate the actual theme being used
  const actualTheme = theme === 'system' ? systemTheme : theme as 'light' | 'dark';

  // Load theme from storage on mount
  useEffect(() => {
    loadTheme();
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (Platform.OS === 'web') {
      // For web, listen to media query changes
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
          setSystemTheme(e.matches ? 'dark' : 'light');
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    } else {
      // For native, listen to Appearance changes
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        setSystemTheme(colorScheme || 'light');
      });
      return () => subscription?.remove();
    }
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
        setThemeState(savedTheme as Theme);
      } else {
        // If no saved theme, default to system
        setThemeState('system');
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(THEME_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const toggleTheme = () => {
    if (theme === 'system') {
      // If currently on system, toggle to the opposite of current system theme
      const newTheme = systemTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: actualTheme === 'dark',
        isLight: actualTheme === 'light',
        toggleTheme,
        setTheme,
        actualTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
