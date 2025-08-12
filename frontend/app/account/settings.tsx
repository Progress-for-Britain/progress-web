import { Stack } from "expo-router";
import { View, Text } from "react-native";

export default function Settings() {
  return (
    <View className="flex-1 items-center justify-center">
      <Stack.Screen options={{ title: "Settings" }} />
      <Text>Settings page coming soon.</Text>
    </View>
  );
}
