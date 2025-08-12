import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function JoinUs() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Join Us' }} />
      <Text>Information on joining will appear here.</Text>
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
