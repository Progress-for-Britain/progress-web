import React, { useEffect, memo, useMemo } from "react";
import { View, Platform } from "react-native";
import { injectWebAuroraStyles } from './commonStyles';
import { useTheme } from './theme-context';

// Web-specific aurora component - memoized to prevent unnecessary re-renders
export const WebAurora = memo(({ isDark = true }: { isDark?: boolean }) => {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    return injectWebAuroraStyles(isDark);
  }, [isDark]);

  // Memoize the style object to prevent recreation on every render
  const auroraStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
  }), []);

  if (Platform.OS === 'web') {
    return (
      <div 
        className="web-aurora" 
        style={auroraStyle}
      />
    );
  }
  
  return null;
});

WebAurora.displayName = 'WebAurora';

// Common aurora background component - memoized and optimized
export const AuroraBackground = memo(() => {
  const { isDark } = useTheme();

  // Memoize the container style to prevent recreation
  const containerStyle = useMemo(() => ({ 
    position: 'absolute' as const, 
    top: 0, 
    left: 0, 
    width: '100%' as const, 
    height: '100%' as const, 
    overflow: 'hidden' as const, 
    zIndex: 1, 
    opacity: isDark ? 0.3 : 0.4,
    ...(Platform.OS === 'web' && { pointerEvents: 'none' as any }),
  }), [isDark]);

  return (
    <View style={containerStyle}>
      {/* Web-specific aurora with original CSS effects */}
      <WebAurora isDark={isDark} />
    </View>
  );
});

AuroraBackground.displayName = 'AuroraBackground';
