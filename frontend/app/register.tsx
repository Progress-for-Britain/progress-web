import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Stack, useRouter, Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Head from 'expo-router/head';
import { useAuth } from '../util/auth-context';
import { api } from '../util/api';;
import { getCommonStyles, getGradients, getColors } from '../util/commonStyles';
import { useTheme } from '../util/theme-context';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    accessCode: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [codeValidated, setCodeValidated] = useState(false);
  const [suggestedRole, setSuggestedRole] = useState('');
  const { register, isStorageReady } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();

  const commonStyles = getCommonStyles(isDark);
  const gradients = getGradients(isDark);
  const colors = getColors(isDark);

  const validateAccessCode = async () => {
    const { accessCode, email } = formData;
    
    if (!accessCode || !email) {
      Alert.alert('Error', 'Please enter both access code and email address');
      return;
    }

    setIsValidatingCode(true);
    try {
      const response = await api.validateAccessCode({ code: accessCode, email });
      
      if (response.success) {
        setCodeValidated(true);
        setSuggestedRole(response.data.role);
        // Pre-fill form with approved data
        setFormData(prev => ({
          ...prev,
          firstName: response.data.firstName,
          lastName: response.data.lastName
        }));
        Alert.alert('Success', 'Access code validated! You can now complete your registration.');
      } else {
        Alert.alert('Invalid Code', response.message);
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
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleRegister = async () => {
    const { email, password, confirmPassword, firstName, lastName, accessCode } = formData;
    
    if (!accessCode) {
      Alert.alert('Error', 'Access code is required to create an account');
      return;
    }

    if (!codeValidated) {
      Alert.alert('Error', 'Please validate your access code before proceeding');
      return;
    }
    
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    // Check if storage is ready before attempting registration
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
      await register({ 
        email, 
        password, 
        firstName, 
        lastName,
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
      
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            <View 
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
                borderWidth: isDark ? 1 : 0,
                borderColor: isDark ? 'rgba(217, 70, 239, 0.3)' : 'transparent',
              }}
            >
              <Text style={[commonStyles.title, { marginBottom: 8, fontSize: 28 }]}>
                Complete Registration
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
                Use your access code to create your account
              </Text>

              <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text, marginBottom: 8, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                    First Name
                  </Text>
                  <TextInput
                    value={formData.firstName}
                    onChangeText={(value) => updateField('firstName', value)}
                    placeholder="First name"
                    placeholderTextColor={colors.textSecondary}
                    style={{
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : colors.background,
                      color: colors.text,
                      ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" })
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text, marginBottom: 8, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                    Last Name
                  </Text>
                  <TextInput
                    value={formData.lastName}
                    onChangeText={(value) => updateField('lastName', value)}
                    placeholder="Last name"
                    placeholderTextColor={colors.textSecondary}
                    style={{
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : colors.background,
                      color: colors.text,
                      ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" })
                    }}
                  />
                </View>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text, marginBottom: 8, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                  Email
                </Text>
                <TextInput
                  value={formData.email}
                  onChangeText={(value) => updateField('email', value)}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : colors.background,
                    color: colors.text,
                    ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" })
                  }}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text, marginBottom: 8, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                  Password
                </Text>
                <TextInput
                  value={formData.password}
                  onChangeText={(value) => updateField('password', value)}
                  placeholder="Create a password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : colors.background,
                    color: colors.text,
                    ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" })
                  }}
                />
              </View>

              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text, marginBottom: 8, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                  Confirm Password
                </Text>
                <TextInput
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateField('confirmPassword', value)}
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : colors.background,
                    color: colors.text,
                    ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" })
                  }}
                />
              </View>
              {/* Access Code Section */}
              <View style={{ 
                backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : '#fef3c7', 
                padding: 16, 
                borderRadius: 8, 
                marginBottom: 24,
                borderWidth: 1,
                borderColor: isDark ? 'rgba(245, 158, 11, 0.5)' : '#f59e0b'
              }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                  Access Code (Required)
                </Text>
                <Text style={{ fontSize: 14, color: isDark ? '#fbbf24' : '#7c2d12', marginBottom: 12, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                  You need an access code that was sent to your email after your membership application was approved. Please check your email and enter the code below.
                </Text>
                
                <View style={{ marginBottom: 12 }}>
                  <TextInput
                    value={formData.accessCode}
                    onChangeText={(value) => updateField('accessCode', value.toUpperCase())}
                    placeholder="Enter your access code (required)"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="characters"
                    style={{
                      borderWidth: 2,
                      borderColor: codeValidated ? '#10b981' : (formData.accessCode ? '#f59e0b' : '#dc2626'),
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      backgroundColor: isDark ? 'rgba(55, 65, 81, 0.7)' : '#ffffff',
                      color: colors.text,
                      ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" })
                    }}
                  />
                </View>
                
                {formData.accessCode && !codeValidated && (
                  <View
                    style={{
                      marginBottom: 12,
                      borderRadius: 6,
                      overflow: 'hidden',
                      ...(Platform.OS === 'ios' && !isValidatingCode && !formData.email && {
                        shadowColor: '#f59e0b',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                      }),
                      ...(Platform.OS === 'android' && !isValidatingCode && !formData.email && {
                        elevation: 3,
                      }),
                      ...(Platform.OS === 'web' && !isValidatingCode && !formData.email && {
                        filter: 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.4))',
                      } as any)
                    }}
                  >
                    <TouchableOpacity
                      onPress={validateAccessCode}
                      disabled={isValidatingCode || !formData.email}
                      style={{
                        borderRadius: 6,
                        overflow: 'hidden',
                        ...(Platform.OS === 'web' && { 
                          cursor: (isValidatingCode || !formData.email) ? 'not-allowed' : 'pointer'
                        } as any)
                      }}
                    >
                      <LinearGradient
                        colors={(!formData.email || isValidatingCode) ? [colors.textSecondary, colors.textSecondary] : ['#f59e0b', '#d97706']}
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
                
                {codeValidated && (
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7',
                    padding: 12,
                    borderRadius: 6
                  }}>
                    <Text style={{ color: isDark ? '#4ade80' : '#166534', fontSize: 14, fontWeight: '600', ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                      ✓ Access code validated! Role: {suggestedRole}
                    </Text>
                  </View>
                )}
                
                {!codeValidated && formData.accessCode && (
                  <Text style={{ fontSize: 12, color: isDark ? '#fbbf24' : '#7c2d12', marginTop: 8, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                    You need to enter your email address first to validate the access code.
                  </Text>
                )}
                
                {!formData.accessCode && (
                  <Text style={{ fontSize: 12, color: isDark ? '#f87171' : '#991b1b', marginTop: 8, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                    Don't have an access code? You need to submit a membership application first at our join page.
                  </Text>
                )}
              </View>

              <View
                style={{
                  marginBottom: 16,
                  borderRadius: 8,
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
                    borderRadius: 8,
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
                      {isLoading ? 'Creating Account...' : !formData.accessCode ? 'Access Code Required' : !codeValidated ? 'Validate Access Code First' : 'Create Account'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 14, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                  Don't have an access code?{' '}
                </Text>
                <Link href="/join" style={{ color: colors.accent, fontSize: 14, fontWeight: '500', ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                  Apply for membership
                </Link>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 16, ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                  Already have an account?{' '}
                </Text>
                <Link href="/login" style={{ color: colors.accent, fontSize: 16, fontWeight: '500', ...(Platform.OS === 'web' && { fontFamily: "'Montserrat', sans-serif" }) }}>
                  Sign in
                </Link>
              </View>
            </View>
          </KeyboardAvoidingView>
          {/* Add extra space at the bottom for mobile scroll */}
          <View style={{ height: 200 }} />
        </ScrollView>
      </View>
    </>
  );
}
