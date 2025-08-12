import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function Donate() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Donate' }} />
      <Text>Donation page coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
