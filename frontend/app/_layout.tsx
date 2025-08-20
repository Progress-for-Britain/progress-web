import { Stack } from "expo-router";
import { AuthProvider } from "../util/auth-context";
import { ThemeProvider } from "../util/theme-context";

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
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
