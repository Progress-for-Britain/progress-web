import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function JoinUs() {
  return (
    <View className="flex-1 items-center justify-center">
      <Stack.Screen options={{ title: 'Join Us' }} />
      <Text>Information on joining will appear here.</Text>
    </View>
  );
}
