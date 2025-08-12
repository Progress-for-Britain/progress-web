import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function Newsroom() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Stack.Screen options={{ title: 'Newsroom' }} />
      <Text>Newsroom content coming soon.</Text>
    </View>
  );
}
