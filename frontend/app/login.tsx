import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Login' }} />
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Pressable onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
