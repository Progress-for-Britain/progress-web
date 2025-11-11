import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, StyleSheet, Platform, Animated, Dimensions } from 'react-native';
import { useTheme } from '../util/theme-context';
import { getColors } from '../util/commonStyles';

interface CelestialBackgroundProps {
  children: React.ReactNode;
}

interface Star {
  x: number;
  y: number;
  size: number;
}

export default function CelestialBackground({ children }: CelestialBackgroundProps) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const [screen, setScreen] = useState(() => Dimensions.get('window'));
  const fadeAnim = useRef(new Animated.Value(isDark ? 0 : 1)).current;
  const positionAnim = useRef(new Animated.Value(isDark ? 0 : 1)).current;
  const twinkle = useRef(new Animated.Value(0)).current;

  // Calculate scaling factors for responsive design
  const celestialScale = Math.min(screen.width / 1200, 1); // Slower scaling than image
  const celestialSize = 100 * celestialScale;

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => setScreen(window));
    return () => {
      // RN >=0.65: remove() exists; on web older types may differ
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sub as any)?.remove?.();
    };
  }, []);

  useEffect(() => {
    // Animate the transition when theme changes
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: isDark ? 0 : 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(positionAnim, {
        toValue: isDark ? 0 : 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isDark, fadeAnim, positionAnim]);

  useEffect(() => {
    // Subtle twinkle loop for stars in dark mode
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkle, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(twinkle, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    );
    if (isDark) loop.start();
    return () => loop.stop();
  }, [isDark, twinkle]);

  // Generate 20 stars randomly positioned with minimum distance constraint
  const stars = useMemo(() => {
    const starArray: Star[] = [];
    const minDistance = 20 * Math.max(0.5, celestialScale); // Scale minimum distance but keep reasonable bounds
    const areaWidth = screen.width < 600 ? Math.min(screen.width * 0.5, 350) : Math.min(screen.width * 0.4, 300);
    const areaHeight = screen.width < 600 ? Math.min(screen.height * 0.1, 80) : Math.min(screen.height * 0.15, 120);
    const maxAttempts = 100; // Prevent infinite loops

    for (let i = 0; i < 20; i++) {
      let attempts = 0;
      let x: number = 0, y: number = 0;
      let valid = false;

      while (!valid && attempts < maxAttempts) {
        x = Math.random() * areaWidth || 0;
        y = Math.random() * areaHeight || 0;
        valid = starArray.every(star => {
          const dx = star.x - x;
          const dy = star.y - y;
          return Math.sqrt(dx * dx + dy * dy) >= minDistance;
        });
        attempts++;
      }

      if (valid) {
        const baseSize = 2 + Math.random() * 2; // Base size between 2-4px
        const size = baseSize * Math.max(0.5, Math.min(1, screen.width / 1200)); // Scale with screen but keep reasonable bounds
        starArray.push({ x, y, size });
      }
    }

    return starArray;
  }, [screen.width]); // Regenerate when screen width changes

  const sunOpacity = fadeAnim;
  const moonOpacity = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  // Motion distances scale with screen width to feel tied to layout/hero scale
  const dx = Math.max(120, Math.min(320, screen.width * 0.28));
  const dy = Math.max(60, Math.min(180, screen.width * 0.14));

  const sunTranslateX = positionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-dx, 0], // Sun comes in from left-up
  });

  const sunTranslateY = positionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-dy, 0], // Sun comes in from above
  });

  const moonTranslateX = positionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, dx], // Moon goes out to right-down
  });

  const moonTranslateY = positionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, dy], // Moon goes out downward
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sun */}
      <Animated.View
        style={[
          styles.celestialContainer,
          styles.sunPosition,
          {
            opacity: sunOpacity,
            transform: [{ translateX: sunTranslateX }, { translateY: sunTranslateY }],
          },
        ]}
      >
        <View style={[styles.celestialBody, styles.sun, { width: celestialSize, height: celestialSize, borderRadius: celestialSize / 2 }]}>
          {/* Sun texture spots */}
          <View style={[styles.sunSpot, {
            width: 14 * celestialScale,
            height: 14 * celestialScale,
            borderRadius: 7 * celestialScale,
            top: 18 * celestialScale,
            left: 22 * celestialScale
          }]} />
          <View style={[styles.sunSpot, {
            width: 10 * celestialScale,
            height: 10 * celestialScale,
            borderRadius: 5 * celestialScale,
            top: 44 * celestialScale,
            right: 18 * celestialScale
          }]} />
          <View style={[styles.sunSpot, {
            width: 8 * celestialScale,
            height: 8 * celestialScale,
            borderRadius: 4 * celestialScale,
            bottom: 20 * celestialScale,
            left: 48 * celestialScale
          }]} />
        </View>
      </Animated.View>

      {/* Moon */}
      <Animated.View
        style={[
          styles.celestialContainer,
          styles.moonPosition,
          {
            opacity: moonOpacity,
            transform: [{ translateX: moonTranslateX }, { translateY: moonTranslateY }],
          },
        ]}
      >
        {/* Stars cluster (dark mode only) */}
        {isDark && (
          <Animated.View
            style={[
              styles.starCluster,
              {
                opacity: twinkle.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.6, 1, 0.6],
                }),
                top: '8%', // Match moon vertical position
                left: screen.width < 600 ? '22%' : '25%', // Closer to moon on small screens for better spacing
                width: screen.width < 600 ? Math.min(screen.width * 0.5, 350) : Math.min(screen.width * 0.4, 300), // More width on small screens
                height: screen.width < 600 ? Math.min(screen.height * 0.1, 80) : Math.min(screen.height * 0.15, 120), // Less height on small screens
              },
            ]}
          >
            {stars.map((star, index) => (
              <View
                key={index}
                style={[
                  styles.star,
                  {
                    top: star.y,
                    left: star.x,
                    width: star.size,
                    height: star.size,
                    borderRadius: star.size / 2,
                  },
                ]}
              />
            ))}
          </Animated.View>
        )}

        <View style={[styles.celestialBody, styles.moon, { width: celestialSize, height: celestialSize, borderRadius: celestialSize / 2 }]}>
          {/* Moon craters */}
          <View style={[styles.crater, styles.crater1, { 
            width: 18 * celestialScale, 
            height: 18 * celestialScale, 
            borderRadius: 9 * celestialScale,
            top: 18 * celestialScale,
            left: 20 * celestialScale
          }]}>
            <View style={[styles.craterHighlight, {
              top: 2 * celestialScale,
              left: 2 * celestialScale,
              width: '60%',
              height: '60%',
              borderRadius: 999 * celestialScale
            }]} />
          </View>
          <View style={[styles.crater, styles.crater2, { 
            width: 12 * celestialScale, 
            height: 12 * celestialScale, 
            borderRadius: 6 * celestialScale,
            top: 46 * celestialScale,
            right: 22 * celestialScale
          }]}>
            <View style={[styles.craterHighlight, {
              top: 2 * celestialScale,
              left: 2 * celestialScale,
              width: '60%',
              height: '60%',
              borderRadius: 999 * celestialScale
            }]} />
          </View>
          <View style={[styles.crater, styles.crater3, { 
            width: 10 * celestialScale, 
            height: 10 * celestialScale, 
            borderRadius: 5 * celestialScale,
            bottom: 18 * celestialScale,
            left: 50 * celestialScale
          }]}>
            <View style={[styles.craterHighlight, {
              top: 2 * celestialScale,
              left: 2 * celestialScale,
              width: '60%',
              height: '60%',
              borderRadius: 999 * celestialScale
            }]} />
          </View>
        </View>
      </Animated.View>

      {/* Content */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  celestialContainer: {
    position: 'absolute',
    zIndex: 0,
  },
  sunPosition: {
    top: '8%',
    left: '12%',
  },
  moonPosition: {
    top: '8%',
    left: '12%',
  },
  celestialBody: {
    position: 'absolute',
    top: 40,
    left: 40,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  sun: {
    backgroundColor: '#FFD700',
    ...(Platform.OS === 'web' && {
      background: `
        radial-gradient(circle at 30% 30%, #FFF8DC 0%, #FFD700 30%, #FFA500 60%, #FF8C00 100%),
        radial-gradient(circle at 70% 70%, rgba(255, 215, 0, 0.8) 0%, transparent 50%),
        radial-gradient(circle at 20% 80%, rgba(255, 165, 0, 0.6) 0%, transparent 40%)
      `,
      boxShadow: `
        0 0 20px rgba(255, 215, 0, 0.8),
        0 0 40px rgba(255, 165, 0, 0.4),
        inset -10px -10px 20px rgba(255, 140, 0, 0.3)
      `,
    }),
  },
  moon: {
    backgroundColor: '#F5F5F5',
    ...(Platform.OS === 'web' && {
      background: `
        radial-gradient(circle at 25% 25%, #FFFFFF 0%, #E8E8E8 40%, #C0C0C0 70%, #A0A0A0 100%),
        radial-gradient(circle at 60% 40%, rgba(160, 160, 160, 0.8) 0%, rgba(120, 120, 120, 0.6) 30%, transparent 60%),
        radial-gradient(circle at 30% 70%, rgba(140, 140, 140, 0.7) 0%, rgba(100, 100, 100, 0.5) 25%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(130, 130, 130, 0.6) 0%, rgba(90, 90, 90, 0.4) 20%, transparent 40%)
      `,
      boxShadow: `
        inset -15px -15px 0 rgba(0,0,0,0.1),
        inset 10px 10px 20px rgba(255,255,255,0.2),
        0 0 15px rgba(200, 200, 200, 0.3)
      `,
    }),
  },
  // Stars cluster: wide horizontal spread from moon to decent distance
  starCluster: {
    position: 'absolute',
    zIndex: -1, // behind the moon body so it feels distant
  },
  star: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#ffffff',
    opacity: 0.9,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 0 6px rgba(255,255,255,0.6)',
    }),
  },
  /* Sun texture spots */
  sunSpot: {
    position: 'absolute',
    backgroundColor: '#FFB347',
    opacity: 0.5,
    borderRadius: 999,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 0 8px rgba(255,165,0,0.4)'
    }),
  },
  sunSpot1: {
    top: 18,
    left: 22,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  sunSpot2: {
    top: 44,
    right: 18,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sunSpot3: {
    bottom: 20,
    left: 48,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  /* Moon craters */
  crater: {
    position: 'absolute',
    backgroundColor: '#D6D6D6',
    opacity: 0.7,
    borderRadius: 999,
    ...(Platform.OS === 'web' && {
      boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.25), inset -2px -2px 4px rgba(255,255,255,0.25)'
    }),
  },
  crater1: {
    top: 18,
    left: 20,
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  crater2: {
    top: 46,
    right: 22,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  crater3: {
    bottom: 18,
    left: 50,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  craterHighlight: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: '60%',
    height: '60%',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 999,
  },
});