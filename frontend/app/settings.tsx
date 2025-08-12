import { View, Text, StyleSheet } from "react-native";
import { Stack } from "expo-router";

export default function Settings() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Settings" }} />
      <Text>Account settings coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
