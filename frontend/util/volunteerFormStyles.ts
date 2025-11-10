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
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 10,
      letterSpacing: -0.2,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    textInput: {
      borderWidth: 1,
      borderColor: colors.background === '#ffffff' ? '#E5E7EB' : `${colors.text}20`,
      borderRadius: isMobile ? 10 : 12,
      paddingHorizontal: isMobile ? 14 : 16,
      paddingVertical: isMobile ? 13 : 15,
      fontSize: isMobile ? 15 : 16,
      backgroundColor: colors.background === '#ffffff' ? '#F9FAFB' : `${colors.surface}50`,
      color: colors.text,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
        backdropFilter: 'blur(10px)',
        boxShadow: colors.background === '#ffffff' 
          ? '0 1px 3px rgba(0,0,0,0.05)' 
          : '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'all 0.15s ease'
      } as any),
    },
    textInputMultiline: {
      minHeight: isMobile ? 80 : 100,
      textAlignVertical: 'top',
    },
    yesNoButton: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 18,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.background === '#ffffff' ? '#E5E7EB' : `${colors.text}20`,
      backgroundColor: colors.background === '#ffffff' ? '#F9FAFB' : `${colors.surface}40`,
      alignItems: 'center',
      ...(Platform.OS === 'web' && {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      } as any)
    },
    yesNoButtonSelected: {
      backgroundColor: '#10B981',
      borderColor: '#10B981',
      ...(Platform.OS === 'web' && {
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3), 0 1px 0 rgba(255,255,255,0.2) inset'
      } as any)
    },
    yesNoButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      letterSpacing: -0.2,
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
      backgroundColor: colors.background === '#ffffff' ? '#F9FAFB' : `${colors.surface}50`,
      borderWidth: 1,
      borderColor: colors.background === '#ffffff' ? '#E5E7EB' : `${colors.text}20`,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      ...(Platform.OS === 'web' && {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      } as any)
    },
    interestTagSelected: {
      backgroundColor: '#B10024',
      borderColor: '#B10024',
      ...(Platform.OS === 'web' && {
        boxShadow: '0 4px 12px rgba(177, 0, 36, 0.25), 0 1px 0 rgba(255,255,255,0.15) inset'
      } as any)
    },
    interestTagText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      letterSpacing: -0.1,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    interestTagTextSelected: {
      color: '#ffffff',
      fontWeight: '600',
    },
    contributionTag: {
      backgroundColor: colors.background === '#ffffff' ? '#F9FAFB' : `${colors.surface}50`,
      borderWidth: 1,
      borderColor: colors.background === '#ffffff' ? '#E5E7EB' : `${colors.text}20`,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      ...(Platform.OS === 'web' && {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      } as any)
    },
    contributionTagSelected: {
      backgroundColor: '#001A4F',
      borderColor: '#001A4F',
      ...(Platform.OS === 'web' && {
        boxShadow: '0 4px 12px rgba(0, 26, 79, 0.3), 0 1px 0 rgba(255,255,255,0.1) inset'
      } as any)
    },
    contributionTagText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      letterSpacing: -0.1,
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
      backgroundColor: colors.background === '#ffffff' ? '#F9FAFB' : `${colors.surface}40`,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.background === '#ffffff' ? '#E5E7EB' : `${colors.text}20`,
      ...(Platform.OS === 'web' && {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      } as any)
    },
    checkboxContainerSelected: {
      backgroundColor: colors.background === '#ffffff' ? '#ECFDF5' : `${colors.success}15`,
      borderColor: colors.success,
      ...(Platform.OS === 'web' && {
        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
      } as any)
    },
    checkboxContainerWarning: {
      backgroundColor: colors.background === '#ffffff' ? '#FEF3C7' : `#78350F`,
      borderColor: '#F59E0B',
      opacity: 1,
    },
    checkboxIcon: {
      width: 22,
      height: 22,
      borderWidth: 2,
      borderColor: colors.background === '#ffffff' ? '#D1D5DB' : `${colors.text}30`,
      borderRadius: 6,
      backgroundColor: colors.background === '#ffffff' ? '#ffffff' : `${colors.surface}20`,
      marginRight: 14,
      alignItems: 'center',
      justifyContent: 'center',
      ...(Platform.OS === 'web' && {
        boxShadow: '0 1px 2px rgba(0,0,0,0.05) inset'
      } as any)
    },
    checkboxIconSelected: {
      backgroundColor: colors.success,
      borderColor: colors.success,
      ...(Platform.OS === 'web' && {
        boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3), 0 1px 0 rgba(255,255,255,0.2) inset'
      } as any)
    },
    checkboxIconWarning: {
      borderColor: '#F59E0B',
      backgroundColor: colors.background === '#ffffff' ? '#FEF3C7' : `#78350F`,
    },
    checkboxLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      flex: 1,
      lineHeight: 20,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    checkboxLabelWarning: {
      color: colors.background === '#ffffff' ? '#92400E' : '#FCD34D',
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