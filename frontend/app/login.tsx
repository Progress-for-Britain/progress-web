import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, Animated, ScrollView } from 'react-native';
import { Stack, useRouter, Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Head from 'expo-router/head';
import { useAuth } from '../util/auth-context';
import { getCommonStyles, getGradients, getColors } from '../util/commonStyles';
import { useTheme } from '../util/theme-context';
import useResponsive from '../util/useResponsive';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login, isStorageReady } = useAuth();
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const router = useRouter();

  const commonStyles = getCommonStyles(isDark, isMobile, width);
  const gradients = getGradients(isDark);
  const colors = getColors(isDark);

  // Only use animations on web to avoid mobile callback issues
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    // Check if storage is ready before attempting login
    if (!isStorageReady) {
      setErrorMessage('Device storage is not ready. Please ensure you have sufficient storage space and try again.');
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
      
      setErrorMessage(errorMessage);
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

        {/* Login Page Content */}
        <ScrollView contentContainerStyle={[commonStyles.content, { justifyContent: 'center', minHeight: '80%' }]} showsVerticalScrollIndicator={false}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Animated.View 
              style={{ 
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                borderRadius: isMobile ? 16 : 20,
                padding: isMobile ? 24 : 40,
                width: '100%',
                maxWidth: 500,
                shadowColor: isDark ? colors.accent : '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 12,
                elevation: 8,
                opacity: Platform.OS === 'web' ? fadeAnim : 1,
                borderWidth: isDark ? 1 : 0,
                borderColor: isDark ? 'rgba(217, 70, 239, 0.3)' : 'transparent',
              }}
            >
              <Text style={[commonStyles.title, { marginBottom: 8, fontSize: isMobile ? 24 : 32 }]}>
                Welcome Back
              </Text>
              <Text 
                style={{ 
                  fontSize: isMobile ? 16 : 18,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginBottom: isMobile ? 32 : 40,
                  ...(Platform.OS === 'web' && {
                    fontFamily: "'Montserrat', sans-serif",
                  }),
                }}
              >
                Sign in to your Progress account
              </Text>

              {errorMessage ? (
                <Text style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>
                  {errorMessage}
                </Text>
              ) : null}

            <View style={{ marginBottom: isMobile ? 16 : 20 }}>
              <Text style={{ fontSize: isMobile ? 16 : 18, fontWeight: '500', color: colors.text, marginBottom: 10, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                style={[
                  commonStyles.textInput,
                  {
                    borderColor: emailFocused || email ? colors.accent : colors.border,
                    fontSize: isMobile ? 16 : 18,
                    paddingVertical: isMobile ? 14 : 16,
                    ...(Platform.OS === 'web' && { 
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: emailFocused ? `0 0 0 3px ${colors.accent}33` : 'none',
                    } as any)
                  }
                ]}
              />
            </View>

            <View style={{ marginBottom: isMobile ? 20 : 28 }}>
              <Text style={{ fontSize: isMobile ? 16 : 18, fontWeight: '500', color: colors.text, marginBottom: 10, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                Password
              </Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!isPasswordVisible}
                  autoComplete="current-password"
                  textContentType="password"
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  onSubmitEditing={() => handleLogin()}
                  style={[
                    commonStyles.textInput,
                    {
                      borderColor: passwordFocused || password ? colors.accent : colors.border,
                      fontSize: isMobile ? 16 : 18,
                      paddingVertical: isMobile ? 14 : 16,
                      paddingRight: 55,
                      ...(Platform.OS === 'web' && { 
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        boxShadow: passwordFocused ? `0 0 0 3px ${colors.accent}33` : 'none',
                      } as any)
                    }
                  ]}
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={{
                    position: 'absolute',
                    right: 15,
                    top: '50%',
                    transform: [{ translateY: -17 }],
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

            {/* <TouchableOpacity
              style={{ alignSelf: 'flex-end', marginBottom: isMobile ? 20 : 28 }}
            >
              <Text style={{ color: colors.accent, fontSize: isMobile ? 14 : 16, fontWeight: '500', ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                Forgot Password?
              </Text>
            </TouchableOpacity> */}

            <View
              style={{
                marginBottom: 20,
                borderRadius: isMobile ? 8 : 10,
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
                  borderRadius: isMobile ? 8 : 10,
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
                    paddingVertical: isMobile ? 16 : 18,
                    alignItems: 'center',
                  }}
                >
                  <Text 
                    style={{ 
                      color: '#ffffff',
                      fontSize: isMobile ? 16 : 18,
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
              <Text style={{ color: colors.textSecondary, fontSize: isMobile ? 14 : 18, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                Don't have an account?{' '}
              </Text>
              <Link href="/register" style={{ color: colors.accent, fontSize: isMobile ? 14 : 18, fontWeight: '500', ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
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
