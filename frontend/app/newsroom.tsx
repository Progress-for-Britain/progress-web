import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function Newsroom() {
  return (
    <View className="flex-1 items-center justify-center">
      <Stack.Screen options={{ title: 'Newsroom' }} />
      <Text>Newsroom content coming soon.</Text>
    </View>
  );
}
