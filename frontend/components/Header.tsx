import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../lib/auth-context';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const NavButton = ({ href, children, onPress }: { href?: string; children: React.ReactNode; onPress?: () => void }) => (
    <TouchableOpacity
      onPress={onPress || (() => href && router.push(href as any))}
      className="px-4 py-2 rounded-lg hover:bg-magenta-50 transition-colors duration-200"
      style={{ 
        paddingHorizontal: 16, 
        paddingVertical: 8, 
        borderRadius: 8,
        ...(Platform.OS === 'web' && { cursor: 'pointer' })
      }}
    >
      <Text className="text-gray-700 hover:text-magenta-600 font-medium" style={{ color: '#374151', fontWeight: '500' }}>
        {children}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="bg-white shadow-sm border-b border-gray-100" style={{ backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
      <View className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 1280, marginHorizontal: 'auto', paddingHorizontal: 16 }}>
        <View className="flex flex-row justify-between items-center h-16" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
          {/* Logo */}
          <TouchableOpacity onPress={() => router.push('/')} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View className="w-8 h-8 bg-magenta-500 rounded-full flex items-center justify-center" style={{ width: 32, height: 32, backgroundColor: '#d946ef', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
              <Text className="text-white font-bold text-lg" style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 18 }}>P</Text>
            </View>
            <Text className="text-xl font-bold text-gray-900" style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>Progress</Text>
          </TouchableOpacity>

          {/* Navigation */}
          <View className="flex flex-row space-x-1" style={{ flexDirection: 'row' }}>
            {!isAuthenticated ? (
              // Unauthenticated navigation
              <>
                <NavButton href="/">Home</NavButton>
                <NavButton href="/donate">Donate</NavButton>
                <NavButton href="/join">Join Us</NavButton>
                <NavButton href="/login">Login</NavButton>
              </>
            ) : (
              // Authenticated navigation
              <>
                <NavButton href="/account">Account Home</NavButton>
                <NavButton href="/newsroom">Newsroom</NavButton>
                <NavButton href="/settings">Settings</NavButton>
                <NavButton onPress={handleLogout}>Logout</NavButton>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
