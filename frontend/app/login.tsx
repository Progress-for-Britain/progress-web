import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, Animated, ScrollView } from 'react-native';
import { Stack, useRouter, Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../util/auth-context';
import Header from '../components/Header';
import { AuroraBackground } from '../util/auroraComponents';
import { getCommonStyles, getGradients, getColors } from '../util/commonStyles';
import { useTheme } from '../util/theme-context';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { login } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();

  const commonStyles = getCommonStyles(isDark);
  const gradients = getGradients(isDark);
  const colors = getColors(isDark);

  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

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
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={commonStyles.appContainer}>
        {/* Header Component */}
        <Header />
        
        {/* Background aurora effect */}
        <AuroraBackground />

        {/* Login Page Content */}
        <ScrollView contentContainerStyle={[commonStyles.content, { justifyContent: 'center', minHeight: '80%' }]} showsVerticalScrollIndicator={false}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Animated.View 
              style={{ 
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                borderRadius: 16,
                padding: 32,
                width: '100%',
                maxWidth: 400,
                shadowColor: isDark ? colors.accent : '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 12,
                elevation: 8,
                opacity: fadeAnim,
                borderWidth: isDark ? 1 : 0,
                borderColor: isDark ? 'rgba(217, 70, 239, 0.3)' : 'transparent',
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
              <Text style={[commonStyles.title, { marginBottom: 8, fontSize: 28 }]}>
                Welcome Back
              </Text>
              <Text 
                style={{ 
                  fontSize: 16,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginBottom: 32,
                  ...(Platform.OS === 'web' && {
                    fontFamily: "'Montserrat', sans-serif",
                  }),
                }}
              >
                Sign in to your Progress account
              </Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text, marginBottom: 8, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                style={{
                  borderWidth: 1,
                  borderColor: emailFocused || email ? colors.accent : colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : colors.background,
                  color: colors.text,
                  ...(Platform.OS === 'web' && { 
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: emailFocused ? `0 0 0 3px ${colors.accent}33` : 'none',
                    fontFamily: "'Montserrat', sans-serif"
                  } as any)
                }}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text, marginBottom: 8, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                Password
              </Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!isPasswordVisible}
                  autoComplete="current-password"
                  textContentType="password"
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  style={{
                    borderWidth: 1,
                    borderColor: passwordFocused || password ? colors.accent : colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    paddingRight: 48,
                    fontSize: 16,
                    backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : colors.background,
                    color: colors.text,
                    ...(Platform.OS === 'web' && { 
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: passwordFocused ? `0 0 0 3px ${colors.accent}33` : 'none',
                      fontFamily: "'Montserrat', sans-serif"
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
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={{ alignSelf: 'flex-end', marginBottom: 24 }}
            >
              <Text style={{ color: colors.accent, fontSize: 14, fontWeight: '500', ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <View
              style={{
                marginBottom: 16,
                borderRadius: 8,
                ...(Platform.OS === 'ios' && !isLoading && {
                  shadowColor: colors.accent,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                }),
                ...(Platform.OS === 'android' && !isLoading && {
                  elevation: 8,
                }),
                ...(Platform.OS === 'web' && !isLoading && {
                  filter: `drop-shadow(0 4px 12px ${colors.accent}66)`,
                  transition: 'all 0.2s ease',
                } as any)
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  handleLogin();
                }}
                disabled={isLoading}
                style={{
                  borderRadius: 8,
                  overflow: 'hidden',
                  ...(Platform.OS === 'web' && { 
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                  } as any)
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isLoading ? [colors.textSecondary, colors.textSecondary] : gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    paddingVertical: 16,
                    alignItems: 'center',
                  }}
                >
                  <Text 
                    style={{ 
                      color: '#ffffff',
                      fontSize: 16,
                      fontWeight: '600',
                      textAlign: 'center',
                      ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" })
                    }}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary, fontSize: 16, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                Don't have an account?{' '}
              </Text>
              <Link href="/register" style={{ color: colors.accent, fontSize: 16, fontWeight: '500', ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                Sign up
              </Link>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
        {/* Add extra space at the bottom for mobile scroll */}
        <View style={{ height: 200 }} />
      </ScrollView>
    </View>
    </>
  );
}
