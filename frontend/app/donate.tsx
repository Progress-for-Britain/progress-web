import { Stack } from "expo-router";
import { View, Text } from "react-native";

export default function Donate() {
  return (
    <View className="flex-1 items-center justify-center">
      <Stack.Screen options={{ title: "Donate" }} />
      <Text>Donate page coming soon.</Text>
    </View>
  );
}
