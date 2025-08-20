import { Platform, Dimensions, StyleSheet } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Function to inject web aurora styles
export const injectWebAuroraStyles = (isDark: boolean = true) => {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    // Remove existing aurora styles
    const existingStyle = document.getElementById('aurora-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'aurora-styles';
    
    if (isDark) {
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');
        
        @keyframes aurora {
          0%, 100% {
            background-position: 0% 50%, 0% 50%;
          }
          50% {
            background-position: 100% 100%, 100% 100%;
          }
        }
        
        .web-aurora {
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          background-image: 
            repeating-linear-gradient(100deg, #fff 0%, #fff 7%, transparent 10%, transparent 12%, #fff 16%),
            repeating-linear-gradient(100deg, #012168 10%, #123995 15%, #2854b0 20%, #3a66c5 25%, #012168 30%);
          background-size: 300%, 200%;
          background-position: 50% 50%, 50% 50%;
          filter: blur(10px);
          mix-blend-mode: overlay;
          animation: aurora 15s infinite;
          mask-image: radial-gradient(ellipse at 100% 0%, black 10%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at 100% 0%, black 10%, transparent 70%);
        }
        
        .web-aurora::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(100deg, #fff 0%, #fff 7%, transparent 10%, transparent 12%, #fff 16%),
            repeating-linear-gradient(100deg, #012168 10%, #123995 15%, #2854b0 20%, #3a66c5 25%, #012168 30%);
          background-size: 200%, 100%;
          background-attachment: fixed;
          mix-blend-mode: difference;
        }
      `;
    } else {
      // Light mode aurora
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');
        
        @keyframes aurora-light {
          0%, 100% {
            background-position: 0% 50%, 0% 50%;
          }
          50% {
            background-position: 100% 100%, 100% 100%;
          }
        }
        
        .web-aurora {
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          background-image: 
            repeating-linear-gradient(100deg, #e0f2fe 0%, #bfdbfe 7%, transparent 10%, transparent 12%, #e0f2fe 16%),
            repeating-linear-gradient(100deg, #0369a1 10%, #0284c7 15%, #0ea5e9 20%, #38bdf8 25%, #0369a1 30%);
          background-size: 300%, 200%;
          background-position: 50% 50%, 50% 50%;
          filter: blur(6px);
          mix-blend-mode: normal;
          animation: aurora-light 12s infinite;
          mask-image: radial-gradient(ellipse at 100% 0%, black 20%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at 100% 0%, black 20%, transparent 70%);
          opacity: 0.9;
        }
        
        .web-aurora::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(100deg, #e0f2fe 0%, #bfdbfe 7%, transparent 10%, transparent 12%, #e0f2fe 16%),
            repeating-linear-gradient(100deg, #0369a1 10%, #0284c7 15%, #0ea5e9 20%, #38bdf8 25%, #0369a1 30%);
          background-size: 200%, 100%;
          background-attachment: fixed;
          mix-blend-mode: overlay;
          opacity: 0.7;
        }
      `;
    }
    
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }
  return undefined;
};

// Theme-aware color schemes
export const lightColors = {
  primary: '#B10024',
  secondary: '#001A4F',
  accent: '#d946ef',
  success: '#10b981',
  error: '#DC2626',
  warning: '#F59E0B',
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
};

export const darkColors = {
  primary: '#B10024',
  secondary: '#001A4F',
  accent: '#d946ef',
  success: '#10b981',
  error: '#DC2626',
  warning: '#F59E0B',
  background: '#000',
  surface: '#1e293b',
  text: '#ffffff',
  textSecondary: '#e0f2fe',
  border: '#374151',
};

// Function to get colors based on theme
export const getColors = (isDark: boolean) => isDark ? darkColors : lightColors;

// Common color schemes (backward compatibility)
export const colors = darkColors;

// Theme-aware gradients
export const lightGradients = {
  primary: ['#B10024', '#001A4F'] as const,
  aurora: ['#0369a1', '#0284c7', '#0ea5e9', '#38bdf8', '#0369a1'] as const,
  accent: ['#d946ef', '#a855f7'] as const,
};

export const darkGradients = {
  primary: ['#B10024', '#001A4F'] as const,
  aurora: ['#012168', '#123995', '#2854b0', '#3a66c5', '#012168'] as const,
  accent: ['#d946ef', '#a855f7'] as const,
};

// Function to get gradients based on theme
export const getGradients = (isDark: boolean) => isDark ? darkGradients : lightGradients;

// Common gradients (backward compatibility)
export const gradients = darkGradients;

// Theme-aware common styles function
export const getCommonStyles = (isDark: boolean) => {
  const themeColors = getColors(isDark);
  
  return StyleSheet.create({
    appContainer: {
      backgroundColor: themeColors.background,
      minHeight: '100%',
      width: '100%',
      position: 'relative',
      flex: 1,
    },
    content: {
      maxWidth: 800,
      marginTop: 50,
      marginHorizontal: 'auto',
      paddingHorizontal: 20,
      position: 'relative',
      zIndex: 2,
      ...(Platform.OS === 'web' && {
        marginLeft: 'auto',
        marginRight: 'auto',
      }),
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      marginBottom: 20,
      color: themeColors.text,
      textAlign: 'center',
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    text: {
      lineHeight: 24,
      fontSize: 16,
      color: themeColors.text,
      textAlign: 'center',
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    highlightBackground: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    highlightText: {
      color: 'white',
      fontSize: 18,
      textAlign: 'center',
      fontWeight: '600',
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
  });
};

// Common styles (backward compatibility - dark theme)
export const commonStyles = getCommonStyles(true);
