import React, { useEffect } from "react";
import { View, Platform } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { injectWebAuroraStyles, getGradients } from './commonStyles';
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

// Common animation hook for aurora
export const useAuroraAnimation = () => {
  const animationValue = useSharedValue(0);

  useEffect(() => {
    animationValue.value = withRepeat(
      withTiming(1, { duration: 15000 }),
      -1,
      false
    );
  }, []);

  const auroraAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(animationValue.value, [0, 1], [-50, 50]);
    const translateY = interpolate(animationValue.value, [0, 1], [-25, 25]);
    
    return {
      transform: [
        { translateX },
        { translateY },
      ],
    };
  });

  return { auroraAnimatedStyle };
};

// Common aurora background component
export const AuroraBackground = () => {
  const { isDark } = useTheme();
  const { auroraAnimatedStyle } = useAuroraAnimation();
  const gradients = getGradients(isDark);

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
      
      {/* Mobile-friendly aurora using React Native components */}
      {Platform.OS !== 'web' && (
        <Animated.View style={[{
          position: 'absolute',
          top: -20,
          left: -20,
          right: -20,
          bottom: -20,
        }, auroraAnimatedStyle]}>
          <LinearGradient
            colors={gradients.aurora}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: isDark ? 0.6 : 0.7,
            }}
          />
          <LinearGradient
            colors={isDark 
              ? ['transparent', '#ffffff20', 'transparent', '#ffffff20', 'transparent']
              : ['transparent', '#00000025', 'transparent', '#00000025', 'transparent']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: isDark ? 0.4 : 0.5,
            }}
          />
        </Animated.View>
      )}
    </View>
  );
};
