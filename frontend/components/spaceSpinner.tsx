import { View, Platform, Animated, StyleSheet } from "react-native";
import { useEffect, useRef } from "react";
import { getColors } from "../util/commonStyles";


// Space-themed loading spinner component
export function SpaceSpinner({ isDark, size = 120 }: { isDark: boolean; size?: number }) {
  const rotation = useRef(new Animated.Value(0)).current;
  const orbit1 = useRef(new Animated.Value(0)).current;
  const orbit2 = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const colors = getColors(isDark);

  useEffect(() => {
    // Main rotation animation
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 4500,
        useNativeDriver: true,
      })
    ).start();

    // Orbit 1 - faster
    Animated.loop(
      Animated.timing(orbit1, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Orbit 2 - slower, opposite direction
    Animated.loop(
      Animated.timing(orbit2, {
        toValue: 1,
        duration: 5250,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const orbit1Spin = orbit1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const orbit2Spin = orbit2.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const spinnerStyles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    },
    centerStar: {
      position: 'absolute',
      fontSize: size / 5,
      color: isDark ? '#FFFFFF' : '#000000',
    },
    orbitRing: {
      position: 'absolute',
      width: size / 2,
      height: size / 2,
      borderRadius: size / 4,
      borderWidth: 2,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
      borderStyle: 'dashed',
    },
    orbit: {
      position: 'absolute',
      width: size / 2,
      height: size / 2,
    },
    marsOrbit: {
      position: 'absolute',
      width: (size * 5) / 6,
      height: (size * 5) / 6,
    },
    marsRing: {
      position: 'absolute',
      width: (size * 5) / 6,
      height: (size * 5) / 6,
      borderRadius: (size * 5) / 12,
      borderWidth: 2,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
      borderStyle: 'dashed',
    },
    planet: {
      position: 'absolute',
      width: size / 10,
      height: size / 10,
      borderRadius: size / 20,
      top: -size / 20,
      left: size / 5,
    },
    marsPlanet: {
      position: 'absolute',
      width: size / 10,
      height: size / 10,
      borderRadius: size / 20,
      top: -size / 20,
      left: (size * 11) / 30, // Adjusted for mars orbit
    },
    planet1: {
      backgroundColor: isDark ? '#FFFFFF' : '#000000',
      ...(Platform.OS === 'web' && {
        boxShadow: isDark 
          ? '0 0 12px rgba(255, 255, 255, 0.8)' 
          : '0 0 12px rgba(0, 0, 0, 0.8)',
      } as any),
    },
    planet2: {
      backgroundColor: isDark ? '#F5F5F5' : '#333333',
      ...(Platform.OS === 'web' && {
        boxShadow: isDark 
          ? '0 0 12px rgba(245, 245, 245, 0.8)' 
          : '0 0 12px rgba(51, 51, 51, 0.8)',
      } as any),
    },
    outerRing: {
      position: 'absolute',
      width: (size * 5) / 6,
      height: (size * 5) / 6,
      borderRadius: (size * 5) / 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
    },
  });

  return (
    <View style={spinnerStyles.container}>
      {/* Outer decorative ring */}
      <Animated.View style={[spinnerStyles.outerRing, { transform: [{ rotate: spin }] }]} />
      
      {/* Orbit ring */}
      <View style={spinnerStyles.orbitRing} />
      
      {/* Mars orbit ring */}
      <View style={spinnerStyles.marsRing} />
      
      {/* Orbit 1 */}
      <Animated.View style={[spinnerStyles.orbit, { transform: [{ rotate: orbit1Spin }] }]}>
        <View style={[spinnerStyles.planet, spinnerStyles.planet1]} />
      </Animated.View>
      
      {/* Orbit 2 */}
      <Animated.View style={[spinnerStyles.marsOrbit, { transform: [{ rotate: orbit2Spin }] }]}>
        <View style={[spinnerStyles.marsPlanet, spinnerStyles.planet2]} />
      </Animated.View>
      
      {/* Center star with pulse */}
      <Animated.Text 
        style={[
          spinnerStyles.centerStar, 
          { 
            transform: [{ scale: pulse }],
            opacity: pulse.interpolate({
              inputRange: [1, 1.2],
              outputRange: [0.8, 1],
            })
          }
        ]}
      >
        ✨
      </Animated.Text>
    </View>
  );
}