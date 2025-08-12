import { View, Text, TextInput, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { useState, useContext } from 'react';
import AuthContext from '../src/context/AuthContext';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    login({ username });
    router.replace('/account');
  };

  return (
    <View className="flex-1 p-6">
      <Stack.Screen options={{ title: 'Login' }} />
      <Text className="text-xl mb-4">Login</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        className="border p-2 mb-4"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="border p-2 mb-4"
      />
      <Pressable onPress={handleLogin} className="bg-primary p-2">
        <Text className="text-white text-center">Login</Text>
      </Pressable>
    </View>
  );
}
