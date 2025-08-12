import { Stack } from "expo-router";
import { View, Text } from "react-native";

export default function AccountHome() {
  return (
    <View className="flex-1 items-center justify-center">
      <Stack.Screen options={{ title: "Account Home" }} />
      <Text>Account dashboard coming soon.</Text>
    </View>
  );
}
