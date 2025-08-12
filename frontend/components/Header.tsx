import { Link } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <View className="bg-primary p-4 flex-row justify-between items-center">
      <Text className="text-white text-xl font-bold">Progress Party</Text>
      <View className="flex-row space-x-4">
        {user ? (
          <>
            <NavLink href="/account" label="Account Home" />
            <NavLink href="/account/newsroom" label="Newsroom" />
            <NavLink href="/account/settings" label="Settings" />
            <TouchableOpacity onPress={logout}>
              <Text className="text-white">Logout</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <NavLink href="/" label="Home" />
            <NavLink href="/donate" label="Donate" />
            <NavLink href="/join" label="Join Us" />
            <NavLink href="/login" label="Login" />
          </>
        )}
      </View>
    </View>
  );
}

const NavLink = ({ href, label }: { href: string; label: string }) => (
  <Link href={href} asChild>
    <TouchableOpacity>
      <Text className="text-white">{label}</Text>
    </TouchableOpacity>
  </Link>
);
