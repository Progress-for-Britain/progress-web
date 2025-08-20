import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, Animated, ScrollView } from 'react-native';
import { Stack, useRouter, Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Head from 'expo-router/head';
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
  const { login, isStorageReady } = useAuth();
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

    // Check if storage is ready before attempting login
    if (!isStorageReady) {
      Alert.alert(
        'Storage Error', 
        'Device storage is not ready. Please ensure you have sufficient storage space and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      router.replace('/account');
    } catch (error) {
      let errorMessage = 'An error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide more helpful error messages for mobile users
        if (error.message.includes('Network error') || error.message.includes('timeout')) {
          errorMessage = 'Network connection issue. Please check your internet connection and try again.';
        } else if (error.message.includes('Storage not available')) {
          errorMessage = 'Device storage is not accessible. Please ensure you have sufficient storage space.';
        }
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Progress UK</title>
        <meta name="description" content="Login to your Progress UK account to access member resources and participate in building Britain's future" />
      </Head>
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
                borderRadius: 20,
                padding: 40,
                width: '100%',
                maxWidth: 500,
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
              <Text style={[commonStyles.title, { marginBottom: 8, fontSize: 32 }]}>
                Welcome Back
              </Text>
              <Text 
                style={{ 
                  fontSize: 18,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginBottom: 40,
                  ...(Platform.OS === 'web' && {
                    fontFamily: "'Montserrat', sans-serif",
                  }),
                }}
              >
                Sign in to your Progress account
              </Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '500', color: colors.text, marginBottom: 10, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
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
                  borderRadius: 10,
                  paddingHorizontal: 18,
                  paddingVertical: 16,
                  fontSize: 18,
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

            <View style={{ marginBottom: 28 }}>
              <Text style={{ fontSize: 18, fontWeight: '500', color: colors.text, marginBottom: 10, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
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
                    borderRadius: 10,
                    paddingHorizontal: 18,
                    paddingVertical: 16,
                    paddingRight: 55,
                    fontSize: 18,
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
                    right: 15,
                    top: '50%',
                    transform: [{ translateY: -12 }],
                    padding: 6,
                    ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                  }}
                  activeOpacity={0.6}
                >
                  <Ionicons
                    name={isPasswordVisible ? 'eye' : 'eye-off'}
                    size={22}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={{ alignSelf: 'flex-end', marginBottom: 28 }}
            >
              <Text style={{ color: colors.accent, fontSize: 16, fontWeight: '500', ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <View
              style={{
                marginBottom: 20,
                borderRadius: 10,
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
                  borderRadius: 10,
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
                    paddingVertical: 18,
                    alignItems: 'center',
                  }}
                >
                  <Text 
                    style={{ 
                      color: '#ffffff',
                      fontSize: 18,
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
              <Text style={{ color: colors.textSecondary, fontSize: 18, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                Don't have an account?{' '}
              </Text>
              <Link href="/register" style={{ color: colors.accent, fontSize: 18, fontWeight: '500', ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
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
