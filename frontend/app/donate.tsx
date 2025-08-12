import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function Donate() {
  return (
    <View className="flex-1 items-center justify-center">
      <Stack.Screen options={{ title: 'Donate' }} />
      <Text>Donation page coming soon.</Text>
    </View>
  );
}
