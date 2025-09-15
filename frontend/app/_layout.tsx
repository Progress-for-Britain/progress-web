import { Stack } from "expo-router";
import Head from "expo-router/head";
import { View, Platform } from "react-native";
import { usePathname } from "expo-router";
import { AuthProvider } from "../util/auth-context";
import { ThemeProvider, useTheme } from "../util/theme-context";
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
  const unauthenticatedRoutes = ['/', '/about', '/our-approach', '/join', '/login', '/register', '/nda', '/settings', '/eula', '/privacy-policy', '/terms-of-service'];
  const isEditorRoute = /^\/policy\/[^/]+\/edit(\?.*)?$/.test(pathname || '');
  const shouldShowAurora = (unauthenticatedRoutes.includes(pathname) || pathname.startsWith('/policy')) && !isMobilePlatform && !isEditorRoute;
  
  return (
    <View style={[{ flex: 1 }, commonStyles.appContainer]}>
      {/* Global web font links */}
      {Platform.OS === 'web' && (
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />
          {/* Cloudflare Web Analytics */}
          <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "38c4f7c92a6f4feeb11e928a81207ea8"}'></script>
        </Head>
      )}
      {/* Background aurora effect - only for unauthenticated routes and non-mobile platforms */}
      {shouldShowAurora && <AuroraBackground />}
      
      {/* Removed offscreen icon preloading to avoid extra work */}
      
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
