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

function RootLayoutNav() {
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const commonStyles = getCommonStyles(isDark, isMobile, width);
  
  // Determine if this is a mobile platform (iOS or Android)
  const isMobilePlatform = Platform.OS === 'ios' || Platform.OS === 'android';
  
  // Define unauthenticated routes that should show aurora background
  const unauthenticatedRoutes = ['/', '/about', '/our-approach', '/join', '/login', '/register', '/nda'];
  const shouldShowAurora = !isAuthenticated && unauthenticatedRoutes.includes(pathname) && !isMobilePlatform;
  
  return (
    <View style={[{ flex: 1 }, commonStyles.appContainer]}>
      {/* Background aurora effect - only for unauthenticated routes and non-mobile platforms */}
      {shouldShowAurora && <AuroraBackground />}
      
      <Header />
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}
