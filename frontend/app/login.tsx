import { Stack, router, Link } from "expo-router";
import { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        login(data.user);
        router.replace("/account");
      } else {
        setError("Login failed");
      }
    } catch (e) {
      setError("Login failed");
    }
  };

  return (
    <View className="flex-1 p-6">
      <Stack.Screen options={{ title: "Login" }} />
      {error ? <Text className="text-red-500">{error}</Text> : null}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        className="border p-2 my-2"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="border p-2 my-2"
      />
      <Button title="Login" onPress={handleLogin} />
      <Link href="/register" className="text-primary mt-4">
        Register
      </Link>
    </View>
  );
}
