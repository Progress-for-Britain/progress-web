import { View, Text } from "react-native";
import { Link, Stack } from "expo-router";

export default function Settings() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Stack.Screen
        options={{
          title: "Settings",
        }}
      />
      <Text>Settings</Text>
      <Link href="/">Go to Home</Link>
    </View>
  );
}
