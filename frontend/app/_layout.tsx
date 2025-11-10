import { Stack } from "expo-router";
import Head from "expo-router/head";
import { View, Platform, Animated, StyleSheet } from "react-native";
import { usePathname } from "expo-router";
import { AuthProvider, useAuth } from "../util/auth-context";
import { ThemeProvider, useTheme } from "../util/theme-context";
import { getCommonStyles, getColors } from "../util/commonStyles";
import { useResponsive } from "../util/useResponsive";
import Header from "../components/Header";
import Nav from "../components/nav";
import { useFonts } from "expo-font";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { AuroraBackground } from "../util/auroraComponents";

// Space-themed loading spinner component
function SpaceSpinner({ isDark }: { isDark: boolean }) {
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
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Orbit 1 - faster
    Animated.loop(
      Animated.timing(orbit1, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Orbit 2 - slower, opposite direction
    Animated.loop(
      Animated.timing(orbit2, {
        toValue: 1,
        duration: 3500,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
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
      width: 120,
      height: 120,
      justifyContent: 'center',
      alignItems: 'center',
    },
    centerStar: {
      position: 'absolute',
      fontSize: 24,
    },
    orbitRing: {
      position: 'absolute',
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 2,
      borderColor: isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(99, 102, 241, 0.3)',
      borderStyle: 'dashed',
    },
    orbit: {
      position: 'absolute',
      width: 80,
      height: 80,
    },
    planet: {
      position: 'absolute',
      width: 12,
      height: 12,
      borderRadius: 6,
      top: -6,
      left: 34,
    },
    planet1: {
      backgroundColor: isDark ? '#8B5CF6' : '#6366F1',
      ...(Platform.OS === 'web' && {
        boxShadow: isDark 
          ? '0 0 12px rgba(139, 92, 246, 0.8)' 
          : '0 0 12px rgba(99, 102, 241, 0.8)',
      } as any),
    },
    planet2: {
      backgroundColor: isDark ? '#EC4899' : '#F59E0B',
      ...(Platform.OS === 'web' && {
        boxShadow: isDark 
          ? '0 0 12px rgba(236, 72, 153, 0.8)' 
          : '0 0 12px rgba(245, 158, 11, 0.8)',
      } as any),
    },
    outerRing: {
      position: 'absolute',
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(99, 102, 241, 0.2)',
    },
  });

  return (
    <View style={spinnerStyles.container}>
      {/* Outer decorative ring */}
      <Animated.View style={[spinnerStyles.outerRing, { transform: [{ rotate: spin }] }]} />
      
      {/* Orbit ring */}
      <View style={spinnerStyles.orbitRing} />
      
      {/* Orbit 1 */}
      <Animated.View style={[spinnerStyles.orbit, { transform: [{ rotate: orbit1Spin }] }]}>
        <View style={[spinnerStyles.planet, spinnerStyles.planet1]} />
      </Animated.View>
      
      {/* Orbit 2 */}
      <Animated.View style={[spinnerStyles.orbit, { transform: [{ rotate: orbit2Spin }] }]}>
        <View style={[spinnerStyles.planet, spinnerStyles.planet2]} />
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

function RootLayoutNav() {
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const commonStyles = getCommonStyles(isDark, isMobile, width);
  
  // Display ASCII art console log for web platform - only once
  useEffect(() => {
    if (Platform.OS === 'web') {
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3005';
      const websiteUrl = API_BASE_URL.replace(':3005', '').replace('http://', '').replace('https://', '');
      
        console.log(`
█░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓
░                                        ░
░              ████████                  ░
░              ██     ██                 ░
░              ██     ██                 ░
░              ████████                  ░
░              ██                        ░
░              ██                        ░
░              ██                        ░
░                                        ░
░             PROGRESS UK                ░
░        Building a Better Future        ░
░                                        ░
█░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓

Curious? Join us at ${websiteUrl}
        `);
    }
  }, []); // Empty dependency array ensures this runs only once
  
  const unauthenticatedRoutes = ['']; //This is if we ever want to re-intergrate aurora on unauthed routes
  const isEditorRoute = /^\/policy\/[^/]+\/edit(\?.*)?$/.test(pathname || '');
  const shouldShowAurora = (unauthenticatedRoutes.includes(pathname) && !isMobile && !isEditorRoute);
  
  // Show loading state while authentication is being initialized
  if (isLoading) {
    return (
      <View style={[
        { flex: 1 }, 
        commonStyles.appContainer,
        { justifyContent: 'center', alignItems: 'center' }
      ]}>
        <SpaceSpinner isDark={isDark} />
      </View>
    );
  }
  
  return (
    <View style={[{ flex: 1 }, commonStyles.appContainer]}>
      {/* Global web analytics */}
      {Platform.OS === 'web' && (
        <Head>
          {/* Cloudflare Web Analytics */}
          <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "38c4f7c92a6f4feeb11e928a81207ea8"}'></script>
        </Head>
      )}
      {/* Background aurora effect - only for unauthenticated routes and non-mobile platforms */}
      {shouldShowAurora && <AuroraBackground />} 
      
      {!isEditorRoute && (
        isAuthenticated ? <Header /> : <Nav />
      )}
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}

export default function Layout() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialIcons.font,
    ...FontAwesome5.font,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}
