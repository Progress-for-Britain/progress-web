import { Stack } from "expo-router";
import { AuthProvider } from "../util/auth-context";

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Progress UK - Unleashing Potential",
          headerTitle: "Home"
        }} 
      />
      <Stack.Screen 
        name="login" 
        options={{ 
          title: "Login - Progress UK",
          headerTitle: "Login"
        }} 
      />
      <Stack.Screen 
        name="register" 
        options={{ 
          title: "Register - Progress UK",
          headerTitle: "Register"
        }} 
      />
      <Stack.Screen 
        name="donate" 
        options={{ 
          title: "Donate - Progress UK",
          headerTitle: "Donate"
        }} 
      />
      <Stack.Screen 
        name="join" 
        options={{ 
          title: "Join Us - Progress UK",
          headerTitle: "Join Us"
        }} 
      />
      <Stack.Screen 
        name="account" 
        options={{ 
          title: "Account - Progress UK",
          headerTitle: "Account"
        }} 
      />
      <Stack.Screen 
        name="newsroom" 
        options={{ 
          title: "Newsroom - Progress UK",
          headerTitle: "Newsroom"
        }} 
      />
      <Stack.Screen 
        name="events" 
        options={{ 
          title: "Events - Progress UK",
          headerTitle: "Events"
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: "Settings - Progress UK",
          headerTitle: "Settings"
        }} 
      />
      <Stack.Screen
        name="user-management"
        options={{
          title: "User Management - Progress UK",
          headerTitle: "User Management",
        }}
      />
      </Stack>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
