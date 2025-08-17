import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, Animated } from 'react-native';
import { Stack, useRouter, Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../util/auth-context';
import Header from '../components/Header';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      router.replace('/account');
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <Header />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}
        >
          <Animated.View 
            style={{ 
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: 32,
              width: '100%',
              maxWidth: 400,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 8,
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                }
              ]
            }}
          >
            <Text 
              style={{ 
                fontSize: 28,
                fontWeight: 'bold',
                color: '#111827',
                textAlign: 'center',
                marginBottom: 8
              }}
            >
              Welcome Back
            </Text>
            <Text 
              style={{ 
                fontSize: 16,
                color: '#6B7280',
                textAlign: 'center',
                marginBottom: 32
              }}
            >
              Sign in to your Progress account
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                style={{
                  borderWidth: 1,
                  borderColor: emailFocused || email ? '#d946ef' : '#D1D5DB',
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  backgroundColor: '#ffffff',
                  ...(Platform.OS === 'web' && { 
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: emailFocused ? '0 0 0 3px rgba(217, 70, 239, 0.1)' : 'none'
                  } as any)
                }}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                Password
              </Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry={!isPasswordVisible}
                  autoComplete="current-password"
                  textContentType="password"
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  style={{
                    borderWidth: 1,
                    borderColor: passwordFocused || password ? '#d946ef' : '#D1D5DB',
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    paddingRight: 48,
                    fontSize: 16,
                    backgroundColor: '#ffffff',
                    ...(Platform.OS === 'web' && { 
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: passwordFocused ? '0 0 0 3px rgba(217, 70, 239, 0.1)' : 'none'
                    } as any)
                  }}
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: [{ translateY: -12 }],
                    padding: 4,
                    ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                  }}
                  activeOpacity={0.6}
                >
                  <Ionicons
                    name={isPasswordVisible ? 'eye' : 'eye-off'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={{ alignSelf: 'flex-end', marginBottom: 24 }}
            >
              <Text style={{ color: '#d946ef', fontSize: 14, fontWeight: '500' }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                handleLogin();
              }}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? '#9CA3AF' : '#d946ef',
                borderRadius: 8,
                paddingVertical: 16,
                marginBottom: 16,
                shadowColor: isLoading ? 'transparent' : '#d946ef',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: isLoading ? 0 : 6,
                ...(Platform.OS === 'web' && { 
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                } as any)
              }}
              activeOpacity={0.8}
            >
              <Text 
                style={{ 
                  color: '#ffffff',
                  fontSize: 16,
                  fontWeight: '600',
                  textAlign: 'center'
                }}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#6B7280', fontSize: 16 }}>
                Don't have an account?{' '}
              </Text>
              <Link href="/register" style={{ color: '#d946ef', fontSize: 16, fontWeight: '500' }}>
                Sign up
              </Link>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}
