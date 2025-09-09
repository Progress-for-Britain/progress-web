import { Stack } from "expo-router";
import { View, Platform } from "react-native";
import { usePathname } from "expo-router";
import { AuthProvider } from "../util/auth-context";
import { ThemeProvider, useTheme } from "../util/theme-context";
import { useAuth } from "../util/auth-context";
import { AuroraBackground } from "../util/auroraComponents";
import { getCommonStyles } from "../util/commonStyles";
import { useResponsive } from "../util/useResponsive";
import Header from "../components/Header";
import { useFonts } from "expo-font";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useEffect } from "react";

function RootLayoutNav() {
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const { isAuthenticated } = useAuth();
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
  
  // Determine if this is a mobile platform (iOS or Android)
  const isMobilePlatform = Platform.OS === 'ios' || Platform.OS === 'android';
  
  // Define unauthenticated routes that should show aurora background
  const unauthenticatedRoutes = ['/', '/about', '/our-approach', '/join', '/login', '/register', '/nda', '/settings', '/eula', '/privacy-policy'];
  const isEditorRoute = /^\/policy\/[^/]+\/edit(\?.*)?$/.test(pathname || '');
  const shouldShowAurora = (unauthenticatedRoutes.includes(pathname) || pathname.startsWith('/policy')) && !isMobilePlatform && !isEditorRoute;
  
  return (
    <View style={[{ flex: 1 }, commonStyles.appContainer]}>
      {/* Background aurora effect - only for unauthenticated routes and non-mobile platforms */}
      {shouldShowAurora && <AuroraBackground />}
      
      {/* Preload icons by rendering them invisibly - this forces the font files to download */}
      {Platform.OS === 'web' && (
        <View style={{ position: 'absolute', left: -9999, top: -9999, opacity: 0 }}>
          {/* Our Approach Page Icons */}
          <MaterialIcons name="timeline" size={1} />
          <MaterialIcons name="psychology" size={1} />
          <MaterialIcons name="policy" size={1} />
          <FontAwesome5 name="users" size={1} />
          
          {/* About Page Icons */}
          <MaterialIcons name="trending-up" size={1} />
          <MaterialIcons name="people" size={1} />
          <MaterialIcons name="account-balance" size={1} />
          <FontAwesome5 name="flag" size={1} />
          
          {/* Join Page Icons */}
          <Ionicons name="checkmark" size={1} />
          <Ionicons name="information-circle" size={1} />
          <Ionicons name="close" size={1} />
          <Ionicons name="alert-circle" size={1} />
          <FontAwesome5 name="user-plus" size={1} />
          <Ionicons name="cloud-done" size={1} />
          <Ionicons name="warning-outline" size={1} />
          
          {/* Events Page Icons */}
          <Ionicons name="calendar-outline" size={1} />
          <Ionicons name="time-outline" size={1} />
          <Ionicons name="people-outline" size={1} />
          <Ionicons name="close-circle" size={1} />
          <Ionicons name="create-outline" size={1} />
          <Ionicons name="calendar" size={1} />
          <Ionicons name="add" size={1} />
          
          {/* Newsroom Page Icons */}
          <MaterialIcons name="star" size={1} />
          <Ionicons name="newspaper" size={1} />
          <Ionicons name="search" size={1} />
          <Ionicons name="newspaper-outline" size={1} />
          <Ionicons name="time" size={1} />
          
          {/* Account Page Icons */}
          <Ionicons name="chevron-forward" size={1} />
          <Ionicons name="person-circle" size={1} />
          <MaterialIcons name="analytics" size={1} />
          <Ionicons name="rocket" size={1} />
        </View>
      )}
      
      {!isEditorRoute && <Header />}
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
