import { View, Text } from "react-native";
import { Link, Stack } from "expo-router";

export default function Home() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Stack.Screen
        options={{
          title: "Home",
        }}
      />
      <Text>Home</Text>
      <Link href="/settings">Go to Settings</Link>
    </View>
  );
}
