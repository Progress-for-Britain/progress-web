import { Stack } from "expo-router";
import { View } from "react-native";
import Header from "../src/components/Header";
import { AuthProvider } from "../src/context/AuthContext";

export default function Layout() {
  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <Header />
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </AuthProvider>
  );
}
