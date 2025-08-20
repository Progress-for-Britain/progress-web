import { Platform, Dimensions, StyleSheet } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Function to inject web aurora styles
export const injectWebAuroraStyles = () => {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const style = document.createElement('style');
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
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }
  return undefined;
};

// Common styles
export const commonStyles = StyleSheet.create({
  appContainer: {
    backgroundColor: '#000',
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
    color: 'white',
    textAlign: 'center',
    ...(Platform.OS === 'web' && {
      fontFamily: "'Montserrat', sans-serif",
    }),
  },
  text: {
    lineHeight: 24,
    fontSize: 16,
    color: 'white',
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

// Common color schemes
export const colors = {
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

// Common gradients
export const gradients = {
  primary: ['#B10024', '#001A4F'] as const,
  aurora: ['#012168', '#123995', '#2854b0', '#3a66c5', '#012168'] as const,
  accent: ['#d946ef', '#a855f7'] as const,
};
