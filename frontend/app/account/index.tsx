import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function AccountHome() {
  return (
    <View className="flex-1 items-center justify-center">
      <Stack.Screen options={{ title: 'Account Home' }} />
      <Text>Welcome to your account.</Text>
    </View>
  );
}
