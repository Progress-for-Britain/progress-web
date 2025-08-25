import React, { useEffect } from "react";
import { View, Platform } from "react-native";
import { injectWebAuroraStyles } from './commonStyles';
import { useTheme } from './theme-context';

// Web-specific aurora component
export const WebAurora = ({ isDark = true }: { isDark?: boolean }) => {
  useEffect(() => {
    return injectWebAuroraStyles(isDark);
  }, [isDark]);

  if (Platform.OS === 'web') {
    return (
      <div 
        className="web-aurora" 
        style={{
          position: 'absolute',
          top: -10,
          left: -10,
          right: -10,
          bottom: -10,
        }}
      />
    );
  }
  
  return null;
};

// Common aurora background component
export const AuroraBackground = () => {
  const { isDark } = useTheme();

  return (
    <View style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      overflow: 'hidden', 
      zIndex: 1, 
      opacity: isDark ? 0.3 : 0.4,
      ...(Platform.OS === 'web' && { pointerEvents: 'none' as any }),
    }}>
      {/* Web-specific aurora with original CSS effects */}
      <WebAurora isDark={isDark} />
    </View>
  );
};
