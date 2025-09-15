import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, Animated, ScrollView } from 'react-native';
import { Stack, useRouter, Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Head from 'expo-router/head';
import { useAuth } from '../util/auth-context';
import { api } from '../util/api';
import { getCommonStyles, getGradients, getColors } from '../util/commonStyles';
import { useTheme } from '../util/theme-context';
import useResponsive from '../util/useResponsive';
import { Turnstile } from '@marsidev/react-turnstile';
import Constants from 'expo-constants';

export default function Register() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    accessCode: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [codeValidated, setCodeValidated] = useState(false);
  const [validatedUserData, setValidatedUserData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    constituency?: string;
    role: string;
  } | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [accessCodeFocused, setAccessCodeFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const { register, isStorageReady } = useAuth();
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const router = useRouter();

  const commonStyles = getCommonStyles(isDark, isMobile, width);
  const gradients = getGradients(isDark);
  const colors = getColors(isDark);

  // Only use animations on web to avoid mobile callback issues
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

  const validateAccessCode = async () => {
    const { accessCode } = formData;
    
    if (!accessCode) {
      setErrorMessage('Please enter your access code');
      return;
    }

    // Validate captcha before validating access code
    if (!captchaToken) {
      setErrorMessage('Please complete the security verification before validating your access code.');
      return;
    }

    // For now, we'll need to ask for email temporarily to validate
    // In a future update, we could modify the backend to validate code without email
    const email = prompt('Please enter your email address to validate the access code:');
    if (!email) {
      setErrorMessage('Email is required to validate access code');
      return;
    }

    setIsValidatingCode(true);
    try {
      const response = await api.validateAccessCode({ code: accessCode, email, captchaToken });
      
      if (response.success) {
        setCodeValidated(true);
        setValidatedUserData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          role: response.data.role
        });
        setErrorMessage(''); // Clear any previous error
      } else {
        setErrorMessage(response.message || 'Invalid access code');
      }
    } catch (error) {
      let errorMessage = 'Failed to validate access code. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Network error') || error.message.includes('timeout')) {
          errorMessage = 'Network connection issue. Please check your internet connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrorMessage(errorMessage);
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleRegister = async () => {
    const { password, confirmPassword, accessCode } = formData;
    
    if (!accessCode) {
      setErrorMessage('Access code is required to create an account');
      return;
    }

    if (!codeValidated || !validatedUserData) {
      setErrorMessage('Please validate your access code before proceeding');
      return;
    }
    
    if (!password || !confirmPassword) {
      setErrorMessage('Please fill in all password fields');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    // Check if storage is ready before attempting registration
    if (!isStorageReady) {
      setErrorMessage('Device storage is not ready. Please ensure you have sufficient storage space and try again.');
      return;
    }

    // Validate captcha
    if (!captchaToken) {
      setErrorMessage('Please complete the security verification to continue.');
      return;
    }

    setIsLoading(true);
    try {
      await register({ 
        email: validatedUserData.email, 
        password, 
        firstName: validatedUserData.firstName, 
        lastName: validatedUserData.lastName,
        accessCode
      });
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

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage('');
  };

  return (
    <>
      <Head>
        <title>Register - Progress UK</title>
        <meta name="description" content="Register for Progress UK and join thousands building the future of British politics" />
      </Head>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={commonStyles.appContainer}>

        {/* Register Page Content */}
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
                Complete Registration
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
                Use your access code to create your account
              </Text>

              {errorMessage ? (
                <Text style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>
                  {errorMessage}
                </Text>
              ) : null}

              {/* Cloudflare Turnstile Captcha */}
              <View style={{ marginBottom: isMobile ? 20 : 28, alignItems: 'center' }}>
                <Turnstile
                  siteKey={Constants.expoConfig?.extra?.cloudflareTurnstileSiteKey || "YOUR_CLOUDFLARE_SITE_KEY"}
                  onSuccess={(token: string) => setCaptchaToken(token)}
                  onError={(error) => console.error('Captcha error:', error)}
                  onExpire={() => setCaptchaToken(null)}
                  options={{
                    theme: isDark ? 'dark' : 'light',
                    size: 'normal'
                  }}
                />
              </View>

              {/* Access Code Section */}
              <View style={{ 
                backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : '#fef3c7', 
                padding: isMobile ? 16 : 20, 
                borderRadius: 8, 
                marginBottom: isMobile ? 24 : 32,
                borderWidth: 1,
                borderColor: isDark ? 'rgba(245, 158, 11, 0.5)' : '#f59e0b'
              }}>
                <Text style={[commonStyles.inputLabel, { marginBottom: 8, color: isDark ? '#fbbf24' : '#7c2d12' }]}>
                  Access Code (Required)
                </Text>
                <Text style={{ fontSize: isMobile ? 14 : 16, color: isDark ? '#fbbf24' : '#7c2d12', marginBottom: 12, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                  You need an access code that was sent to your email after your membership application was approved. Please check your email and enter the code below.
                </Text>
                
                <View style={{ marginBottom: 12 }}>
                  <TextInput
                    value={formData.accessCode}
                    onChangeText={(value) => updateField('accessCode', value.toUpperCase())}
                    placeholder="Enter your access code (required)"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="characters"
                    onFocus={() => setAccessCodeFocused(true)}
                    onBlur={() => setAccessCodeFocused(false)}
                    style={{
                      borderWidth: 2,
                      borderColor: codeValidated ? '#10b981' : (formData.accessCode ? '#f59e0b' : '#dc2626'),
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: isMobile ? 14 : 16,
                      fontSize: isMobile ? 16 : 18,
                      backgroundColor: isDark ? 'rgba(55, 65, 81, 0.7)' : '#ffffff',
                      color: colors.text,
                      ...(Platform.OS === 'web' && { 
                        fontFamily: "'Montserrat', sans-serif",
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        boxShadow: accessCodeFocused ? `0 0 0 3px ${colors.accent}33` : 'none',
                      } as any)
                    }}
                  />
                </View>
                
                {formData.accessCode && !codeValidated && (
                  <View
                    style={{
                      marginBottom: 12,
                      borderRadius: 6,
                      overflow: 'hidden',
                      ...(Platform.OS === 'ios' && !isValidatingCode && {
                        shadowColor: '#f59e0b',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                      }),
                      ...(Platform.OS === 'android' && !isValidatingCode && {
                        elevation: 3,
                      }),
                      ...(Platform.OS === 'web' && !isValidatingCode && {
                        filter: 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.4))',
                      } as any)
                    }}
                  >
                    <TouchableOpacity
                      onPress={validateAccessCode}
                      disabled={isValidatingCode}
                      style={{
                        borderRadius: 6,
                        overflow: 'hidden',
                        ...(Platform.OS === 'web' && { 
                          cursor: isValidatingCode ? 'not-allowed' : 'pointer'
                        } as any)
                      }}
                    >
                      <LinearGradient
                        colors={isValidatingCode ? [colors.textSecondary, colors.textSecondary] : ['#f59e0b', '#d97706']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 16,
                          alignItems: 'center'
                        }}
                      >
                        <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 14, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                          {isValidatingCode ? 'Validating...' : 'Validate Code'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
                
                {!formData.accessCode && (
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fecaca',
                    padding: 12,
                    borderRadius: 6
                  }}>
                    <Text style={{ color: isDark ? '#f87171' : '#991b1b', fontSize: 14, fontWeight: '600', ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                      ⚠ Access code is required to create an account
                    </Text>
                  </View>
                )}
                
                {codeValidated && validatedUserData && (
                  <View style={{ 
                    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7',
                    padding: 12,
                    borderRadius: 6,
                    marginTop: 12
                  }}>
                    <Text style={{ color: isDark ? '#4ade80' : '#166534', fontSize: 14, fontWeight: '600', marginBottom: 8, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                      ✓ Access code validated!
                    </Text>
                    <View style={{ marginTop: 8 }}>
                      <Text style={{ color: colors.text, fontSize: 14, marginBottom: 4, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                        <Text style={{ fontWeight: '600' }}>Name:</Text> {validatedUserData.firstName} {validatedUserData.lastName}
                      </Text>
                      <Text style={{ color: colors.text, fontSize: 14, marginBottom: 4, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                        <Text style={{ fontWeight: '600' }}>Email:</Text> {validatedUserData.email}
                      </Text>
                      {validatedUserData.constituency && (
                        <Text style={{ color: colors.text, fontSize: 14, marginBottom: 4, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                          <Text style={{ fontWeight: '600' }}>Constituency:</Text> {validatedUserData.constituency}
                        </Text>
                      )}
                      <Text style={{ color: colors.text, fontSize: 14, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                        <Text style={{ fontWeight: '600' }}>Role:</Text> {validatedUserData.role}
                      </Text>
                    </View>
                  </View>
                )}
                
                {!codeValidated && formData.accessCode && (
                  <Text style={{ fontSize: 12, color: isDark ? '#fbbf24' : '#7c2d12', marginTop: 8, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                    Click "Validate Code" to verify your access code and see your account details.
                  </Text>
                )}
                
                {!formData.accessCode && (
                  <Text style={{ fontSize: 12, color: isDark ? '#f87171' : '#991b1b', marginTop: 8, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                    Don't have an access code? You need to submit a membership application first at our join page.
                  </Text>
                )}
              </View>

              <View style={{ marginBottom: isMobile ? 16 : 20 }}>
                <Text style={[commonStyles.inputLabel, { fontSize: isMobile ? 16 : 18, marginBottom: 10 }]}>
                  Password
                </Text>
                <View style={{ position: 'relative' }}>
                  <TextInput
                    value={formData.password}
                    onChangeText={(value) => updateField('password', value)}
                    placeholder="Create a password"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={!isPasswordVisible}
                    autoComplete="current-password"
                    textContentType="password"
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    style={[
                      commonStyles.textInput,
                      {
                        borderColor: passwordFocused || formData.password ? colors.accent : colors.border,
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

              <View style={{ marginBottom: isMobile ? 20 : 28 }}>
                <Text style={[commonStyles.inputLabel, { fontSize: isMobile ? 16 : 18, marginBottom: 10 }]}>
                  Confirm Password
                </Text>
                <View style={{ position: 'relative' }}>
                  <TextInput
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateField('confirmPassword', value)}
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={!isConfirmPasswordVisible}
                    autoComplete="current-password"
                    textContentType="password"
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                    onSubmitEditing={() => handleRegister()}
                    style={[
                      commonStyles.textInput,
                      {
                        borderColor: confirmPasswordFocused || formData.confirmPassword ? colors.accent : colors.border,
                        fontSize: isMobile ? 16 : 18,
                        paddingVertical: isMobile ? 14 : 16,
                        paddingRight: 55,
                        ...(Platform.OS === 'web' && { 
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          boxShadow: confirmPasswordFocused ? `0 0 0 3px ${colors.accent}33` : 'none',
                        } as any)
                      }
                    ]}
                  />
                  <TouchableOpacity
                    onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
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
                      name={isConfirmPasswordVisible ? 'eye' : 'eye-off'}
                      size={22}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View
                style={{
                  marginBottom: 20,
                  borderRadius: isMobile ? 8 : 10,
                  ...(Platform.OS === 'ios' && !isLoading && codeValidated && formData.accessCode && {
                    shadowColor: colors.accent,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                  }),
                  ...(Platform.OS === 'android' && !isLoading && codeValidated && formData.accessCode && {
                    elevation: 8,
                  }),
                  ...(Platform.OS === 'web' && !isLoading && codeValidated && formData.accessCode && {
                    filter: `drop-shadow(0 4px 12px ${colors.accent}66)`,
                    transition: 'all 0.2s ease',
                  } as any)
                }}
              >
                <TouchableOpacity
                  onPress={handleRegister}
                  disabled={isLoading || !codeValidated || !formData.accessCode}
                  style={{
                    borderRadius: isMobile ? 8 : 10,
                    overflow: 'hidden',
                    ...(Platform.OS === 'web' && { 
                      cursor: (isLoading || !codeValidated || !formData.accessCode) ? 'not-allowed' : 'pointer',
                    } as any)
                  }}
                >
                  <LinearGradient
                    colors={(isLoading || !codeValidated || !formData.accessCode) ? [colors.textSecondary, colors.textSecondary] : gradients.primary}
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
                      {isLoading ? 'Creating Account...' : !formData.accessCode ? 'Access Code Required' : !codeValidated ? 'Validate Access Code First' : 'Create Account'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ color: colors.textSecondary, fontSize: isMobile ? 14 : 18, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                  Don't have an access code?{' '}
                </Text>
                <Link href="/join" style={{ color: colors.accent, fontSize: isMobile ? 14 : 18, fontWeight: '500', ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                  Apply for membership
                </Link>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary, fontSize: isMobile ? 14 : 18, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                  Already have an account?{' '}
                </Text>
                <Link href="/login" style={{ color: colors.accent, fontSize: isMobile ? 14 : 18, fontWeight: '500', ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                  Sign in
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
