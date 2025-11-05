import { StyleSheet, Platform } from 'react-native';
import { getOptimizedShadow } from './commonStyles';

// Memoized style creation function - moved outside component to prevent recreation
export const createVolunteerFormStyles = (colors: any, isMobile: boolean, width: number) => {
  return StyleSheet.create({
    successContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: `${colors.background}E6`,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      paddingHorizontal: 20,
      ...(Platform.OS === 'web' && {
        backdropFilter: 'blur(10px)',
      } as any),
    },
    successContent: {
      borderRadius: isMobile ? 16 : 24,
      padding: isMobile ? 24 : 40,
      maxWidth: isMobile ? width - 40 : 500,
      width: '100%',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: `${colors.text}20`,
      ...getOptimizedShadow('heavy', colors.background === '#000', colors.surface),
    },
    checkmarkContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      ...getOptimizedShadow('medium', colors.background === '#000', colors.success),
    },
    infoContainer: {
      backgroundColor: `${colors.success}20`,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      width: '100%',
      borderWidth: 1,
      borderColor: `${colors.success}40`,
    },
    continueButton: {
      borderRadius: isMobile ? 12 : 16,
      paddingVertical: isMobile ? 14 : 16,
      paddingHorizontal: isMobile ? 20 : 32,
      width: '100%',
      alignItems: 'center',
      ...getOptimizedShadow('medium', colors.background === '#000', colors.primary),
    },
    continueButtonText: {
      color: '#ffffff',
      fontSize: isMobile ? 16 : 18,
      fontWeight: '600',
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    errorContainer: {
      backgroundColor: `${colors.error}20`,
      borderColor: colors.error,
      borderWidth: 2,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      flexDirection: 'row',
      alignItems: 'center',
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    textInput: {
      borderWidth: 2,
      borderColor: colors.background === '#ffffff' ? `${colors.text}40` : `${colors.text}30`,
      borderRadius: isMobile ? 8 : 12,
      paddingHorizontal: isMobile ? 12 : 16,
      paddingVertical: isMobile ? 12 : 14,
      fontSize: isMobile ? 14 : 16,
      backgroundColor: colors.background === '#ffffff' ? `${colors.surface}80` : `${colors.surface}60`,
      color: colors.text,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
        backdropFilter: 'blur(10px)',
      } as any),
    },
    textInputMultiline: {
      minHeight: isMobile ? 80 : 100,
      textAlignVertical: 'top',
    },
    yesNoButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: `${colors.text}30`,
      backgroundColor: `${colors.surface}40`,
      alignItems: 'center',
      ...(Platform.OS === 'web' && {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      } as any)
    },
    yesNoButtonSelected: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    yesNoButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    yesNoButtonTextSelected: {
      color: '#ffffff',
    },
    submitButton: {
      borderRadius: isMobile ? 12 : 16,
      paddingVertical: isMobile ? 16 : 18,
      paddingHorizontal: isMobile ? 24 : 32,
      alignItems: 'center',
      marginTop: 24,
      ...getOptimizedShadow('heavy', colors.background === '#000', colors.primary),
      ...(Platform.OS === 'web' && {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      } as any)
    },
    submitButtonDisabled: {
      backgroundColor: `${colors.text}20`,
      ...(Platform.OS === 'web' && {
        cursor: 'not-allowed',
      } as any)
    },
    submitButtonText: {
      color: '#ffffff',
      fontSize: isMobile ? 16 : 18,
      fontWeight: '600',
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    interestTag: {
      backgroundColor: colors.background === '#ffffff' ? `${colors.surface}80` : `${colors.surface}60`,
      borderWidth: 2,
      borderColor: colors.background === '#ffffff' ? `${colors.text}25` : `${colors.text}30`,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      ...(Platform.OS === 'web' && {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      } as any)
    },
    interestTagSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    interestTagText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    interestTagTextSelected: {
      color: '#ffffff',
      fontWeight: '600',
    },
    contributionTag: {
      backgroundColor: colors.background === '#ffffff' ? `${colors.surface}80` : `${colors.surface}60`,
      borderWidth: 2,
      borderColor: colors.background === '#ffffff' ? `${colors.text}25` : `${colors.text}30`,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      ...(Platform.OS === 'web' && {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      } as any)
    },
    contributionTagSelected: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    contributionTagText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    contributionTagTextSelected: {
      color: '#ffffff',
      fontWeight: '600',
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${colors.surface}40`,
      borderRadius: 8,
      padding: 12,
      borderWidth: 2,
      borderColor: `${colors.text}30`,
      ...(Platform.OS === 'web' && {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      } as any)
    },
    checkboxContainerSelected: {
      backgroundColor: `${colors.success}20`,
      borderColor: colors.success,
    },
    checkboxContainerWarning: {
      backgroundColor: `${colors.warning}20`,
      borderColor: colors.warning,
      opacity: 0.7,
    },
    checkboxIcon: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: `${colors.text}40`,
      borderRadius: 4,
      backgroundColor: `${colors.surface}20`,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center'
    },
    checkboxIconSelected: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    checkboxIconWarning: {
      borderColor: colors.warning,
      backgroundColor: `${colors.warning}20`,
    },
    checkboxLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      flex: 1,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    checkboxLabelWarning: {
      color: colors.warning,
    },
    checkboxSubtext: {
      fontSize: 12,
      marginTop: 2,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    checkboxLink: {
      fontSize: 12,
      color: colors.accent,
      textDecorationLine: 'underline',
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    textArea: {
      minHeight: isMobile ? 80 : 100,
      textAlignVertical: 'top',
    },
    submitButtonGradient: {
      paddingVertical: isMobile ? 16 : 18,
      borderRadius: isMobile ? 12 : 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitButtonTextDisabled: {
      color: `${colors.text}40`,
      opacity: 0.6,
    },
    helperContainer: {
      backgroundColor: `${colors.warning}20`,
      borderColor: colors.warning,
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      flexDirection: 'row',
      alignItems: 'flex-start'
    },
    helperTitle: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
      marginBottom: 8,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    helperItem: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 4,
      lineHeight: 18,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
  });
};

// Cache styles to prevent recreation
let cachedStyles: ReturnType<typeof createVolunteerFormStyles> | null = null;
let cacheKey = '';

export const getVolunteerFormStyles = (colors: any, isMobile: boolean, width: number) => {
  const newCacheKey = `${JSON.stringify(colors)}-${isMobile}-${width}`;
  
  if (cachedStyles && cacheKey === newCacheKey) {
    return cachedStyles;
  }
  
  cachedStyles = createVolunteerFormStyles(colors, isMobile, width);
  cacheKey = newCacheKey;
  
  return cachedStyles;
};