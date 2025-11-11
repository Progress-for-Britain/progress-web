import { Platform, Dimensions, StyleSheet } from "react-native";

// Cache for injected styles to avoid redundant operations
let currentInjectedTheme: boolean | null = null;
let currentStyleElement: HTMLStyleElement | null = null;

// Function to inject web aurora styles - optimized with caching
export const injectWebAuroraStyles = (isDark: boolean = true) => {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    // Skip injection if the same theme is already active
    if (currentInjectedTheme === isDark && currentStyleElement && document.head.contains(currentStyleElement)) {
      return () => {
        if (currentStyleElement && document.head.contains(currentStyleElement)) {
          document.head.removeChild(currentStyleElement);
          currentStyleElement = null;
          currentInjectedTheme = null;
        }
      };
    }

    // Remove existing aurora styles
    const existingStyle = document.getElementById('aurora-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'aurora-styles';
    
    // Update cache references
    currentStyleElement = style;
    currentInjectedTheme = isDark;
    
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
      // Clear cache when cleanup is called
      if (currentStyleElement === style) {
        currentStyleElement = null;
        currentInjectedTheme = null;
      }
    };
  }
  return undefined;
};

// Theme-aware color schemes
export const lightColors = {
  primary: '#B10024',
  secondary: '#001A4F',
  accent: '#000000',
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
      textAlign: 'left',
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
    
    // Homepage specific styles
    homePage: {
      flex: 1,
      // backgroundColor removed - now handled by CelestialBackground
    },
    homeCanvas: {
      minHeight: "100%",
      paddingTop: isMobile ? 80 : 120,
      paddingBottom: isMobile ? 80 : 120,
      paddingHorizontal: isMobile ? 20 : 28,
      alignItems: "stretch",
      justifyContent: "center",
    },
    homeHeroRow: {
      width: "100%",
      flexDirection: isMobile ? "column" : "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: isMobile ? 32 : 60,
    },
    homeImageSection: {
      flex: isMobile ? undefined : 1.4,
      width: isMobile ? "100%" : undefined,
      alignItems: "center",
      justifyContent: "center",
    },
    homeProductWrap: {
      width: "100%",
      maxWidth: isMobile ? "100%" : 650,
      aspectRatio: 1.55,
      alignItems: "center",
      justifyContent: "center",
      ...(Platform.OS === "web" && {
        filter: isDark 
          ? "drop-shadow(0px 26px 60px rgba(255,255,255,0.15))" 
          : "drop-shadow(0px 26px 60px rgba(0,0,0,0.10))",
      }),
    },
    homeTextSection: {
      flex: isMobile ? undefined : 1,
      width: isMobile ? "100%" : undefined,
      alignItems: "flex-start",
      justifyContent: "center",
      paddingLeft: isMobile ? 0 : (Platform.OS === "web" ? 40 : 0),
      paddingTop: isMobile ? 0 : 0,
    },
    homeTextContent: {
      maxWidth: isMobile ? "100%" : 480,
      width: "100%",
    },
    homeWelcomeTitle: {
      fontSize: isMobile ? 28 : 42,
      fontWeight: "700",
      color: themeColors.text,
      marginBottom: 8,
      letterSpacing: -0.8,
      ...(Platform.OS === "web" && {
        fontFamily: "ui-sans-serif, -apple-system, Segoe UI, Helvetica, Arial",
      }),
    },
    homeSubtitle: {
      fontSize: isMobile ? 16 : 18,
      color: themeColors.textSecondary,
      marginBottom: isMobile ? 16 : 24,
      fontWeight: "500",
      letterSpacing: -0.2,
      ...(Platform.OS === "web" && {
        fontFamily: "ui-sans-serif, -apple-system, Segoe UI, Helvetica, Arial",
      }),
    },
    homeDescription: {
      fontSize: isMobile ? 14 : 16,
      lineHeight: isMobile ? 22 : 26,
      color: themeColors.textSecondary,
      marginBottom: isMobile ? 12 : 16,
      fontWeight: "400",
      ...(Platform.OS === "web" && {
        fontFamily: "ui-sans-serif, -apple-system, Segoe UI, Helvetica, Arial",
      }),
    },
    homeSeparator: {
      height: isMobile ? 12 : 20,
    },
    homeClosingText: {
      fontSize: isMobile ? 15 : 17,
      lineHeight: isMobile ? 24 : 28,
      color: themeColors.textSecondary,
      marginBottom: isMobile ? 24 : 32,
      fontWeight: "600",
      letterSpacing: -0.1,
      ...(Platform.OS === "web" && {
        fontFamily: "ui-sans-serif, -apple-system, Segoe UI, Helvetica, Arial",
      }),
    },
    homeProductImage: {
      width: "100%",
      height: "100%",
    },
    homeMockCube: {
      width: "86%",
      height: "86%",
      borderRadius: 22,
      backgroundColor: isDark ? "#374151" : "#F3F4F6",
      borderWidth: 1,
      borderColor: isDark ? "#4B5563" : "#E5E7EB",
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      ...(Platform.OS === "web" && {
        boxShadow: isDark 
          ? "0 20px 60px rgba(0,0,0,0.30), 0 1px 0 rgba(255,255,255,0.1) inset, 0 0 0 1px rgba(255,255,255,0.1)"
          : "0 20px 60px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.9) inset, 0 0 0 1px rgba(0,0,0,0.03)",
      }),
    },
    homeMockFace: {
      position: "absolute",
      left: "8%",
      width: "48%",
      height: "54%",
      borderRadius: 18,
      backgroundColor: isDark ? "#1F2937" : "#0B0F19",
      ...(Platform.OS === "web" && { 
        boxShadow: isDark 
          ? "0 10px 20px rgba(0,0,0,0.40)" 
          : "0 10px 20px rgba(0,0,0,0.25)" 
      }),
    },
    homeMockDial: {
      position: "absolute",
      right: "8%",
      width: 78,
      height: 78,
      borderRadius: 999,
      backgroundColor: isDark ? "#6B7280" : "#D1D5DB",
      borderWidth: 1,
      borderColor: isDark ? "#9CA3AF" : "#E5E7EB",
      ...(Platform.OS === "web" && { 
        boxShadow: isDark 
          ? "0 10px 20px rgba(0,0,0,0.25)" 
          : "0 10px 20px rgba(0,0,0,0.12)" 
      }),
    },
    homeMockTime: {
      position: "absolute",
      left: "13%",
      top: "35%",
      fontSize: 52,
      letterSpacing: 4,
      color: "#FFFFFF",
      fontVariant: ["tabular-nums"],
      fontWeight: "500",
    },
    homeBottomLeft: {
      position: "absolute",
      left: isMobile ? 20 : 28,
      bottom: isMobile ? 24 : 32,
      maxWidth: 360,
    },
    homeCta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: isDark ? "#FFFFFF" : "#0A0A0A",
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 999,
      ...(Platform.OS === "web" && {
        boxShadow: isDark 
          ? "0 8px 20px rgba(255,255,255,0.12)" 
          : "0 8px 20px rgba(0,0,0,0.12)",
        cursor: "pointer",
      }),
    },
    homeCtaText: { 
      color: isDark ? "#0A0A0A" : "#FFFFFF", 
      fontSize: 14, 
      fontWeight: "600" 
    },
    homeCtaArrow: { 
      color: isDark ? "#0A0A0A" : "#FFFFFF", 
      fontSize: 16, 
      top: -1 
    },
    homeScrollCue: {
      position: "absolute",
      right: 24,
      bottom: 24,
      width: 28,
      height: 46,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: isDark ? "#6B7280" : "#D1D5DB",
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: 6,
    },
    homeScrollDot: {
      width: 6,
      height: 6,
      borderRadius: 999,
      backgroundColor: isDark ? "#9CA3AF" : "#9CA3AF",
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

// Homepage-specific styles with dark mode support
export const getHomepageStyles = (isDark: boolean, isMobile: boolean = false) => {
  const themeColors = getColors(isDark);
  
  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: themeColors.background,
    },

    /* CANVAS */
    canvas: {
      minHeight: "100%",
      paddingTop: 120,
      paddingBottom: 120,
      paddingHorizontal: 28,
      alignItems: "stretch",
      justifyContent: "center",
    },

    /* HERO */
    heroRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 60,
      ...(Platform.OS !== "web" && {
        flexDirection: "column",
        gap: 40,
      }),
    },
    imageSection: {
      flex: 1.4,
      alignItems: "center",
      justifyContent: "center",
    },
    productWrap: {
      width: "100%",
      maxWidth: 650,
      aspectRatio: 1.55,
      alignItems: "center",
      justifyContent: "center",
      ...(Platform.OS === "web" && {
        filter: isDark 
          ? "drop-shadow(0px 26px 60px rgba(255,255,255,0.15))" 
          : "drop-shadow(0px 26px 60px rgba(0,0,0,0.10))",
      }),
    },
    textSection: {
      flex: 1,
      alignItems: "flex-start",
      justifyContent: "center",
      paddingLeft: Platform.OS === "web" ? 40 : 0,
      paddingTop: Platform.OS !== "web" ? 20 : 0,
    },
    textContent: {
      maxWidth: 480,
    },
    welcomeTitle: {
      fontSize: 42,
      fontWeight: "700",
      color: themeColors.text,
      marginBottom: 8,
      letterSpacing: -0.8,
      ...(Platform.OS === "web" && {
        fontFamily: "ui-sans-serif, -apple-system, Segoe UI, Helvetica, Arial",
      }),
    },
    subtitle: {
      fontSize: 18,
      color: themeColors.textSecondary,
      marginBottom: 24,
      fontWeight: "500",
      letterSpacing: -0.2,
      ...(Platform.OS === "web" && {
        fontFamily: "ui-sans-serif, -apple-system, Segoe UI, Helvetica, Arial",
      }),
    },
    description: {
      fontSize: 16,
      lineHeight: 26,
      color: themeColors.textSecondary,
      marginBottom: 16,
      fontWeight: "400",
      ...(Platform.OS === "web" && {
        fontFamily: "ui-sans-serif, -apple-system, Segoe UI, Helvetica, Arial",
      }),
    },
    separator: {
      height: 20,
    },
    closingText: {
      fontSize: 17,
      lineHeight: 28,
      color: themeColors.textSecondary,
      marginBottom: 32,
      fontWeight: "600",
      letterSpacing: -0.1,
      ...(Platform.OS === "web" && {
        fontFamily: "ui-sans-serif, -apple-system, Segoe UI, Helvetica, Arial",
      }),
    },
    productImage: {
      width: "100%",
      height: "100%",
    },

    /* Fallback mock product (subtle 3D accents) */
    mockCube: {
      width: "86%",
      height: "86%",
      borderRadius: 22,
      backgroundColor: isDark ? "#374151" : "#F3F4F6",
      borderWidth: 1,
      borderColor: isDark ? "#4B5563" : "#E5E7EB",
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      ...(Platform.OS === "web" && {
        boxShadow: isDark 
          ? "0 20px 60px rgba(0,0,0,0.30), 0 1px 0 rgba(255,255,255,0.1) inset, 0 0 0 1px rgba(255,255,255,0.1)"
          : "0 20px 60px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.9) inset, 0 0 0 1px rgba(0,0,0,0.03)",
      }),
    },
    mockFace: {
      position: "absolute",
      left: "8%",
      width: "48%",
      height: "54%",
      borderRadius: 18,
      backgroundColor: isDark ? "#1F2937" : "#0B0F19",
      ...(Platform.OS === "web" && { 
        boxShadow: isDark 
          ? "0 10px 20px rgba(0,0,0,0.40)" 
          : "0 10px 20px rgba(0,0,0,0.25)" 
      }),
    },
    mockDial: {
      position: "absolute",
      right: "8%",
      width: 78,
      height: 78,
      borderRadius: 999,
      backgroundColor: isDark ? "#6B7280" : "#D1D5DB",
      borderWidth: 1,
      borderColor: isDark ? "#9CA3AF" : "#E5E7EB",
      ...(Platform.OS === "web" && { 
        boxShadow: isDark 
          ? "0 10px 20px rgba(0,0,0,0.25)" 
          : "0 10px 20px rgba(0,0,0,0.12)" 
      }),
    },
    mockTime: {
      position: "absolute",
      left: "13%",
      top: "35%",
      fontSize: 52,
      letterSpacing: 4,
      color: "#FFFFFF",
      fontVariant: ["tabular-nums"],
      fontWeight: "500",
    },

    /* BOTTOM LEFT */
    bottomLeft: {
      position: "absolute",
      left: 28,
      bottom: 32,
      maxWidth: 360,
    },
    cta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: isDark ? "#FFFFFF" : "#0A0A0A",
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 999,
      ...(Platform.OS === "web" && {
        boxShadow: isDark 
          ? "0 8px 20px rgba(255,255,255,0.12)" 
          : "0 8px 20px rgba(0,0,0,0.12)",
        cursor: "pointer",
      }),
    },
    ctaText: { 
      color: isDark ? "#0A0A0A" : "#FFFFFF", 
      fontSize: 14, 
      fontWeight: "600" 
    },
    ctaArrow: { 
      color: isDark ? "#0A0A0A" : "#FFFFFF", 
      fontSize: 16, 
      top: -1 
    },

    /* SCROLL CUE */
    scrollCue: {
      position: "absolute",
      right: 24,
      bottom: 24,
      width: 28,
      height: 46,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: isDark ? "#6B7280" : "#D1D5DB",
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: 6,
    },
    scrollDot: {
      width: 6,
      height: 6,
      borderRadius: 999,
      backgroundColor: isDark ? "#9CA3AF" : "#9CA3AF",
    },
  });
};

// Common styles (backward compatibility - dark theme)
export const commonStyles = getCommonStyles(true, false, 800);
