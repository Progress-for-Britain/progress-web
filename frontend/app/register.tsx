import { Stack, router, Link } from "expo-router";
import { useState } from "react";
import { View, TextInput, Button } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        login(data);
        router.replace("/account");
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <View className="flex-1 p-6">
      <Stack.Screen options={{ title: "Register" }} />
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        className="border p-2 my-2"
      />
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
      <Button title="Register" onPress={handleRegister} />
      <Link href="/login" className="text-primary mt-4">
        Back to Login
      </Link>
    </View>
  );
}
