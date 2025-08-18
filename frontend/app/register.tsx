import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Stack, useRouter, Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../util/auth-context';
import { api } from '../util/api';
import Header from '../components/Header';

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
  const { register } = useAuth();
  const router = useRouter();

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
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to validate access code. Please try again.');
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
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <Header />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 32 }}>
            <View 
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
                elevation: 8
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
                Complete Registration
              </Text>
              <Text 
                style={{ 
                  fontSize: 16,
                  color: '#6B7280',
                  textAlign: 'center',
                  marginBottom: 32
                }}
              >
                Use your access code to create your account
              </Text>

              <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                    First Name
                  </Text>
                  <TextInput
                    value={formData.firstName}
                    onChangeText={(value) => updateField('firstName', value)}
                    placeholder="First name"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      backgroundColor: '#ffffff'
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                    Last Name
                  </Text>
                  <TextInput
                    value={formData.lastName}
                    onChangeText={(value) => updateField('lastName', value)}
                    placeholder="Last name"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      backgroundColor: '#ffffff'
                    }}
                  />
                </View>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                  Email
                </Text>
                <TextInput
                  value={formData.email}
                  onChangeText={(value) => updateField('email', value)}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    backgroundColor: '#ffffff'
                  }}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                  Password
                </Text>
                <TextInput
                  value={formData.password}
                  onChangeText={(value) => updateField('password', value)}
                  placeholder="Create a password"
                  secureTextEntry
                  style={{
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    backgroundColor: '#ffffff'
                  }}
                />
              </View>

              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                  Confirm Password
                </Text>
                <TextInput
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateField('confirmPassword', value)}
                  placeholder="Confirm your password"
                  secureTextEntry
                  style={{
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    backgroundColor: '#ffffff'
                  }}
                />
              </View>
              {/* Access Code Section */}
              <View style={{ 
                backgroundColor: '#fef3c7', 
                padding: 16, 
                borderRadius: 8, 
                marginBottom: 24,
                borderWidth: 1,
                borderColor: '#f59e0b'
              }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                  Access Code (Required)
                </Text>
                <Text style={{ fontSize: 14, color: '#7c2d12', marginBottom: 12 }}>
                  You need an access code that was sent to your email after your membership application was approved. Please check your email and enter the code below.
                </Text>
                
                <View style={{ marginBottom: 12 }}>
                  <TextInput
                    value={formData.accessCode}
                    onChangeText={(value) => updateField('accessCode', value.toUpperCase())}
                    placeholder="Enter your access code (required)"
                    autoCapitalize="characters"
                    style={{
                      borderWidth: 2,
                      borderColor: codeValidated ? '#10b981' : (formData.accessCode ? '#f59e0b' : '#dc2626'),
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      backgroundColor: '#ffffff'
                    }}
                  />
                </View>
                
                {formData.accessCode && !codeValidated && (
                  <TouchableOpacity
                    onPress={validateAccessCode}
                    disabled={isValidatingCode || !formData.email}
                    style={{
                      backgroundColor: (!formData.email || isValidatingCode) ? '#9ca3af' : '#f59e0b',
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 6,
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 14 }}>
                      {isValidatingCode ? 'Validating...' : 'Validate Code'}
                    </Text>
                  </TouchableOpacity>
                )}
                
                {!formData.accessCode && (
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    backgroundColor: '#fecaca',
                    padding: 12,
                    borderRadius: 6
                  }}>
                    <Text style={{ color: '#991b1b', fontSize: 14, fontWeight: '600' }}>
                      ⚠ Access code is required to create an account
                    </Text>
                  </View>
                )}
                
                {codeValidated && (
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    backgroundColor: '#dcfce7',
                    padding: 12,
                    borderRadius: 6
                  }}>
                    <Text style={{ color: '#166534', fontSize: 14, fontWeight: '600' }}>
                      ✓ Access code validated! Role: {suggestedRole}
                    </Text>
                  </View>
                )}
                
                {!codeValidated && formData.accessCode && (
                  <Text style={{ fontSize: 12, color: '#7c2d12', marginTop: 8 }}>
                    You need to enter your email address first to validate the access code.
                  </Text>
                )}
                
                {!formData.accessCode && (
                  <Text style={{ fontSize: 12, color: '#991b1b', marginTop: 8 }}>
                    Don't have an access code? You need to submit a membership application first at our join page.
                  </Text>
                )}
              </View>

              <TouchableOpacity
                onPress={handleRegister}
                disabled={isLoading || !codeValidated || !formData.accessCode}
                style={{
                  backgroundColor: (isLoading || !codeValidated || !formData.accessCode) ? '#9CA3AF' : '#d946ef',
                  borderRadius: 8,
                  paddingVertical: 16,
                  marginBottom: 16,
                  ...(Platform.OS === 'web' && { cursor: (isLoading || !codeValidated || !formData.accessCode) ? 'not-allowed' : 'pointer' } as any)
                }}
              >
                <Text 
                  style={{ 
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: '600',
                    textAlign: 'center'
                  }}
                >
                  {isLoading ? 'Creating Account...' : !formData.accessCode ? 'Access Code Required' : !codeValidated ? 'Validate Access Code First' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ color: '#6B7280', fontSize: 14 }}>
                  Don't have an access code?{' '}
                </Text>
                <Link href="/join" style={{ color: '#d946ef', fontSize: 14, fontWeight: '500' }}>
                  Apply for membership
                </Link>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#6B7280', fontSize: 16 }}>
                  Already have an account?{' '}
                </Text>
                <Link href="/login" style={{ color: '#d946ef', fontSize: 16, fontWeight: '500' }}>
                  Sign in
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}
