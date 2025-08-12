import { View, Text, TextInput, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { useState, useContext } from 'react';
import AuthContext from '../src/context/AuthContext';

export default function Register() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    login({ username, email });
    router.replace('/account');
  };

  return (
    <View className="flex-1 p-6">
      <Stack.Screen options={{ title: 'Register' }} />
      <Text className="text-xl mb-4">Register</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        className="border p-2 mb-4"
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        className="border p-2 mb-4"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="border p-2 mb-4"
      />
      <Pressable onPress={handleRegister} className="bg-primary p-2">
        <Text className="text-white text-center">Register</Text>
      </Pressable>
    </View>
  );
}
