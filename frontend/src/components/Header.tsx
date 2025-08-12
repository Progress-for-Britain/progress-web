import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.header}>
      {user ? (
        <View style={styles.row}>
          <Link href="/account" style={styles.link}>Account Home</Link>
          <Link href="/newsroom" style={styles.link}>Newsroom</Link>
          <Link href="/settings" style={styles.link}>Settings</Link>
          <Pressable onPress={logout}>
            <Text style={styles.link}>Logout</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.row}>
          <Link href="/" style={styles.link}>Home</Link>
          <Link href="/donate" style={styles.link}>Donate</Link>
          <Link href="/join-us" style={styles.link}>Join Us</Link>
          <Link href="/login" style={styles.link}>Login</Link>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#007bff', // Replace with your primary color
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  link: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 16,
  },
});
