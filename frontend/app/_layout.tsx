import { Stack } from "expo-router";
import { SafeAreaView } from "react-native";
import Header from "../components/Header";
import { AuthProvider } from "../context/AuthContext";

export default function Layout() {
  return (
    <AuthProvider>
      <SafeAreaView className="flex-1">
        <Header />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaView>
    </AuthProvider>
  );
}
