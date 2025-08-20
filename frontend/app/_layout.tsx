import { Stack } from "expo-router";
import { AuthProvider } from "../util/auth-context";
import { ThemeProvider } from "../util/theme-context";

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
        name="about" 
        options={{ 
          title: "About Us - Progress UK",
          headerTitle: "About Us"
        }} 
      />
      <Stack.Screen 
        name="nda" 
        options={{ 
          title: "NDA - Progress UK",
          headerTitle: "Confidentiality Agreement"
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
    </Stack>
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
