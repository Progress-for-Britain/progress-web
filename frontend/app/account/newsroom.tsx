import { Stack } from "expo-router";
import { View, Text } from "react-native";

export default function Newsroom() {
  return (
    <View className="flex-1 items-center justify-center">
      <Stack.Screen options={{ title: "Newsroom" }} />
      <Text>Newsroom page coming soon.</Text>
    </View>
  );
}
