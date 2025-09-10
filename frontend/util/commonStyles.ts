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

        @media (prefers-reduced-motion: reduce) {
          .web-aurora {
            animation: none !important;
          }
          .web-aurora::after {
            background-attachment: initial !important;
          }
        }
      `;
    } else {
      // Light mode aurora
      style.textContent = `
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

        @media (prefers-reduced-motion: reduce) {
          .web-aurora {
            animation: none !important;
          }
          .web-aurora::after {
            background-attachment: initial !important;
          }
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
  accent: '#660033',
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
  accent: '#660033',
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
  accent: ['#660033', '#880044'] as const,
};

export const darkGradients = {
  primary: ['#B10024', '#001A4F'] as const,
  aurora: ['#012168', '#123995', '#2854b0', '#3a66c5', '#012168'] as const,
  accent: ['#660033', '#880044'] as const,
};

// Function to get gradients based on theme
export const getGradients = (isDark: boolean) => isDark ? darkGradients : lightGradients;

// Common gradients (backward compatibility)
export const gradients = darkGradients;

// Theme-aware common styles function
export const getCommonStyles = (isDark: boolean, isMobile: boolean = false, width: number = 800) => {
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
      maxWidth: isMobile ? width : 800,
      marginTop: 50,
      marginHorizontal: isMobile ? 0 : 'auto',
      paddingHorizontal: isMobile ? 16 : 20,
      position: 'relative',
      zIndex: 2,
      ...(Platform.OS === 'web' && {
        marginLeft: isMobile ? 0 : 'auto',
        marginRight: isMobile ? 0 : 'auto',
      }),
    },
    title: {
      fontSize: isMobile ? 32 : 48,
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
    // Common container for forms/cards
    cardContainer: {
      backgroundColor: themeColors.background === '#ffffff' ? `${themeColors.surface}95` : `${themeColors.surface}80`,
      borderRadius: isMobile ? 16 : 24,
      padding: isMobile ? 20 : 40,
      maxWidth: isMobile ? width - 32 : 700,
      alignSelf: 'center',
      width: '100%',
      marginHorizontal: isMobile ? 0 : 'auto',
      borderWidth: 1,
      borderColor: themeColors.background === '#ffffff' ? `${themeColors.text}25` : `${themeColors.text}20`,
      position: 'relative',
      zIndex: 2,
      ...(Platform.OS === 'web' && {
        backdropFilter: 'blur(10px)',
      } as any),
    },
    // Wide container for sections like benefits/causes
    wideCardContainer: {
      backgroundColor: themeColors.background === '#ffffff' ? `${themeColors.surface}95` : `${themeColors.surface}80`,
      borderRadius: isMobile ? 16 : 24,
      padding: isMobile ? 24 : 40,
      maxWidth: isMobile ? width - 32 : 1000,
      alignSelf: 'center',
      width: '100%',
      marginHorizontal: isMobile ? 0 : 'auto',
      borderWidth: 1,
      borderColor: themeColors.background === '#ffffff' ? `${themeColors.text}25` : `${themeColors.text}20`,
      position: 'relative',
      zIndex: 2,
      ...(Platform.OS === 'web' && {
        backdropFilter: 'blur(10px)',
      } as any),
    },
    // Common item card style (for benefits, causes, etc.)
    itemCard: {
      flex: 1,
      minWidth: isMobile ? width - 64 : 280,
      maxWidth: isMobile ? width - 64 : undefined,
      borderRadius: isMobile ? 16 : 20,
      borderWidth: 1,
      borderColor: `${themeColors.text}20`,
      overflow: 'hidden',
      ...(Platform.OS === 'web' && {
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      } as any),
    },
    // Common button style
    button: {
      backgroundColor: themeColors.background === '#ffffff' ? `${themeColors.text}08` : `${themeColors.surface}40`,
      borderWidth: 2,
      borderColor: themeColors.background === '#ffffff' ? `${themeColors.text}25` : `${themeColors.text}30`,
      borderRadius: isMobile ? 12 : 16,
      paddingVertical: isMobile ? 14 : 16,
      paddingHorizontal: isMobile ? 16 : 24,
      ...(Platform.OS === 'web' && { 
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      } as any)
    },
    // Primary action button
    primaryButton: {
      borderRadius: isMobile ? 12 : 16,
      ...getOptimizedShadow('heavy', isDark, themeColors.primary),
      ...(Platform.OS === 'web' && { 
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      } as any)
    },
    // Hero container
    heroContainer: {
      alignItems: 'center',
      marginBottom: isMobile ? 40 : 60,
      paddingVertical: isMobile ? 20 : 40,
      paddingHorizontal: isMobile ? 16 : 0,
    },
    // Stats container
    statsContainer: {
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-around',
      gap: 20,
      marginBottom: 60,
      paddingHorizontal: isMobile ? 16 : 20,
    },
    // Individual stat item
    statItem: {
      alignItems: 'center',
      backgroundColor: themeColors.background === '#ffffff' ? `${themeColors.surface}95` : `${themeColors.surface}80`,
      borderRadius: 16,
      padding: 20,
      minWidth: 140,
      borderWidth: 1,
      borderColor: themeColors.background === '#ffffff' ? `${themeColors.text}25` : `${themeColors.text}20`,
      ...(Platform.OS === 'web' && {
        backdropFilter: 'blur(10px)',
      } as any),
    },
    // Section header styling
    sectionHeader: {
      alignItems: 'center',
      marginBottom: 40,
    },
    // Grid container for cards
    cardGrid: {
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? 16 : 24,
      marginBottom: 40,
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    // Common form layouts
    formRow: {
      flexDirection: isMobile ? 'column' : 'row',
      gap: 16,
      marginBottom: 20,
    },
    formRowLarge: {
      flexDirection: isMobile ? 'column' : 'row',
      gap: 16,
      marginBottom: 24,
    },
    formField: {
      flex: 1,
    },
    // Tag/chip layouts
    tagContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 32,
    },
    tagContainerSmall: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    // Common button layouts
    buttonRow: {
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? 12 : 10,
    },
    // Special sections (like volunteer forms)
    specialSection: {
      marginBottom: 32,
      padding: isMobile ? 16 : 20,
      borderRadius: isMobile ? 12 : 16,
      borderLeftWidth: 4,
      borderWidth: 1,
    },
    // Common text input styling
    textInput: {
      borderWidth: 2,
      borderColor: themeColors.background === '#ffffff' ? `${themeColors.text}40` : `${themeColors.text}30`,
      borderRadius: isMobile ? 8 : 12,
      paddingHorizontal: isMobile ? 12 : 16,
      paddingVertical: isMobile ? 12 : 14,
      fontSize: isMobile ? 14 : 16,
      backgroundColor: themeColors.background === '#ffffff' ? `${themeColors.surface}80` : `${themeColors.surface}60`,
      color: themeColors.text,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
        backdropFilter: 'blur(10px)',
      } as any),
    },
    // Input label styling
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: 8,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
  });
};

// Shadow optimization utilities
export const getOptimizedShadow = (
  shadowIntensity: 'light' | 'medium' | 'heavy' = 'medium',
  isDark: boolean = false,
  backgroundColor?: string
) => {
  const shadowConfigs = {
    light: {
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.6 : 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.7 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    heavy: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.8 : 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
  };

  const config = shadowConfigs[shadowIntensity];
  
  // Ensure solid background color for shadow optimization
  const solidBackgroundColor = backgroundColor || (isDark ? '#000000' : '#ffffff');
  
  if (Platform.OS === 'web') {
    // For web, use boxShadow instead of deprecated shadow properties
    return {
      backgroundColor: solidBackgroundColor,
      boxShadow: `0 ${config.shadowOffset.height}px ${config.shadowRadius * 2}px rgba(0, 0, 0, ${config.shadowOpacity})`,
    };
  }
  
  // For native platforms, use the traditional shadow properties
  return {
    backgroundColor: solidBackgroundColor,
    shadowColor: '#000000',
    shadowOffset: config.shadowOffset,
    shadowOpacity: config.shadowOpacity,
    shadowRadius: config.shadowRadius,
    elevation: config.elevation,
  };
};

// Common styles (backward compatibility - dark theme)
export const commonStyles = getCommonStyles(true, false, 800);
