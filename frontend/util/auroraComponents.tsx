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
import { injectWebAuroraStyles } from './commonStyles';

// Web-specific aurora component
export const WebAurora = () => {
  useEffect(() => {
    return injectWebAuroraStyles();
  }, []);

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
  const { auroraAnimatedStyle } = useAuroraAnimation();

  return (
    <View style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      overflow: 'hidden', 
      zIndex: 1, 
      opacity: 0.3,
      ...(Platform.OS === 'web' && { pointerEvents: 'none' as any }),
    }}>
      {/* Web-specific aurora with original CSS effects */}
      <WebAurora />
      
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
            colors={['#012168', '#123995', '#2854b0', '#3a66c5', '#012168']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.6,
            }}
          />
          <LinearGradient
            colors={['transparent', '#ffffff20', 'transparent', '#ffffff20', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.4,
            }}
          />
        </Animated.View>
      )}
    </View>
  );
};
