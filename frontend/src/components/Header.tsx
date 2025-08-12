import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <View className="bg-primary p-4">
      {user ? (
        <View className="flex-row space-x-4">
          <Link href="/account" className="text-white font-bold">Account Home</Link>
          <Link href="/newsroom" className="text-white font-bold">Newsroom</Link>
          <Link href="/settings" className="text-white font-bold">Settings</Link>
          <Pressable onPress={logout}>
            <Text className="text-white font-bold">Logout</Text>
          </Pressable>
        </View>
      ) : (
        <View className="flex-row space-x-4">
          <Link href="/" className="text-white font-bold">Home</Link>
          <Link href="/donate" className="text-white font-bold">Donate</Link>
          <Link href="/join-us" className="text-white font-bold">Join Us</Link>
          <Link href="/login" className="text-white font-bold">Login</Link>
        </View>
      )}
    </View>
  );
}
