import { Stack } from "expo-router";
import Head from "expo-router/head";
import { View, Platform } from "react-native";
import { usePathname } from "expo-router";
import { AuthProvider, useAuth } from "../util/auth-context";
import { ThemeProvider, useTheme } from "../util/theme-context";
import { getCommonStyles } from "../util/commonStyles";
import { useResponsive } from "../util/useResponsive";
import Header from "../components/Header";
import Nav from "../components/nav";
import { useFonts } from "expo-font";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useEffect } from "react";
import { AuroraBackground } from "../util/auroraComponents";

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
  
  const unauthenticatedRoutes = ['']
  const isEditorRoute = /^\/policy\/[^/]+\/edit(\?.*)?$/.test(pathname || '');
  const shouldShowAurora = (unauthenticatedRoutes.includes(pathname) && !isMobile && !isEditorRoute);
  
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
