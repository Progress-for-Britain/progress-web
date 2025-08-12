import { Stack } from "expo-router";
import { AuthProvider } from "../util/auth-context";
import "../global.css";

export default function Layout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="donate" />
        <Stack.Screen name="join" />
        <Stack.Screen name="account" />
        <Stack.Screen name="newsroom" />
        <Stack.Screen name="settings" />
      </Stack>
    </AuthProvider>
  );
}
