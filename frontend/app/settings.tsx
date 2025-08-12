import { View, Text } from "react-native";
import { Stack } from "expo-router";

export default function Settings() {
  return (
    <View className="flex-1 items-center justify-center">
      <Stack.Screen options={{ title: "Settings" }} />
      <Text>Account settings coming soon.</Text>
    </View>
  );
}
