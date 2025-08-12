import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function AccountHome() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Stack.Screen options={{ title: 'Account Home' }} />
      <Text>Welcome to your account.</Text>
    </View>
  );
}
