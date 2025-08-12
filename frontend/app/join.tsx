import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../lib/auth-context';
import Header from '../components/Header';

export default function Join() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    interests: [] as string[],
    volunteer: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const interests = [
    'Environmental Justice',
    'Social Equality',
    'Healthcare Reform',
    'Education Policy',
    'Economic Justice',
    'Immigration Rights',
    'LGBTQ+ Rights',
    'Criminal Justice Reform',
    'Voting Rights',
    'Workers Rights'
  ];

  const handleJoin = async () => {
    const { firstName, lastName, email } = formData;
    
    if (!firstName || !lastName || !email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, this would call the API
      Alert.alert(
        'Welcome to Progress!', 
        'Your membership application has been submitted. You will receive a confirmation email shortly.',
        [{ text: 'OK', onPress: () => router.push('/') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
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
          <ScrollView style={{ flex: 1 }}>
            {/* Hero Section */}
            <View 
              style={{ 
                backgroundColor: '#d946ef',
                paddingVertical: 60,
                paddingHorizontal: 16,
                alignItems: 'center'
              }}
            >
              <Text 
                style={{ 
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  textAlign: 'center',
                  marginBottom: 16
                }}
              >
                Join Our Movement
              </Text>
              <Text 
                style={{ 
                  fontSize: 18,
                  color: '#f5d0fe',
                  textAlign: 'center',
                  lineHeight: 28,
                  maxWidth: 600
                }}
              >
                Become a member of Progress and help us build a more equitable, sustainable, and just future for all.
              </Text>
            </View>

            {/* Membership Benefits */}
            <View style={{ paddingVertical: 40, paddingHorizontal: 16, backgroundColor: '#ffffff' }}>
              <Text 
                style={{ 
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#111827',
                  textAlign: 'center',
                  marginBottom: 32
                }}
              >
                Membership Benefits
              </Text>
              
              <View style={{ maxWidth: 800, alignSelf: 'center' }}>
                <View style={{ flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: 24, marginBottom: 40 }}>
                  <View style={{ flex: 1, alignItems: 'center', padding: 16 }}>
                    <Text style={{ fontSize: 40, marginBottom: 12 }}>🗳️</Text>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8, textAlign: 'center' }}>
                      Voting Power
                    </Text>
                    <Text style={{ color: '#6B7280', textAlign: 'center', lineHeight: 22 }}>
                      Vote on party positions, candidate endorsements, and policy priorities
                    </Text>
                  </View>
                  
                  <View style={{ flex: 1, alignItems: 'center', padding: 16 }}>
                    <Text style={{ fontSize: 40, marginBottom: 12 }}>📰</Text>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8, textAlign: 'center' }}>
                      Exclusive Access
                    </Text>
                    <Text style={{ color: '#6B7280', textAlign: 'center', lineHeight: 22 }}>
                      Member-only events, newsletters, and early access to campaign updates
                    </Text>
                  </View>
                  
                  <View style={{ flex: 1, alignItems: 'center', padding: 16 }}>
                    <Text style={{ fontSize: 40, marginBottom: 12 }}>🤝</Text>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8, textAlign: 'center' }}>
                      Community
                    </Text>
                    <Text style={{ color: '#6B7280', textAlign: 'center', lineHeight: 22 }}>
                      Connect with like-minded progressives in your area and beyond
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Membership Form */}
            <View style={{ paddingVertical: 40, paddingHorizontal: 16 }}>
              <View 
                style={{ 
                  backgroundColor: '#ffffff',
                  borderRadius: 16,
                  padding: 32,
                  maxWidth: 600,
                  alignSelf: 'center',
                  width: '100%',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 8
                }}
              >
                <Text 
                  style={{ 
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: '#111827',
                    textAlign: 'center',
                    marginBottom: 24
                  }}
                >
                  Membership Application
                </Text>

                {/* Personal Information */}
                <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                      First Name *
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
                      Last Name *
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
                    Email *
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
                    Phone Number
                  </Text>
                  <TextInput
                    value={formData.phone}
                    onChangeText={(value) => updateField('phone', value)}
                    placeholder="(555) 123-4567"
                    keyboardType="phone-pad"
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

                {/* Address */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                    Address
                  </Text>
                  <TextInput
                    value={formData.address}
                    onChangeText={(value) => updateField('address', value)}
                    placeholder="Street address"
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

                <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
                  <View style={{ flex: 2 }}>
                    <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                      City
                    </Text>
                    <TextInput
                      value={formData.city}
                      onChangeText={(value) => updateField('city', value)}
                      placeholder="City"
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
                      State
                    </Text>
                    <TextInput
                      value={formData.state}
                      onChangeText={(value) => updateField('state', value)}
                      placeholder="ST"
                      maxLength={2}
                      autoCapitalize="characters"
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
                      ZIP
                    </Text>
                    <TextInput
                      value={formData.zipCode}
                      onChangeText={(value) => updateField('zipCode', value)}
                      placeholder="12345"
                      keyboardType="numeric"
                      maxLength={5}
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

                {/* Interests */}
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 12 }}>
                  Areas of Interest (select all that apply)
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                  {interests.map((interest) => (
                    <TouchableOpacity
                      key={interest}
                      onPress={() => toggleInterest(interest)}
                      style={{
                        backgroundColor: formData.interests.includes(interest) ? '#d946ef' : '#ffffff',
                        borderWidth: 1,
                        borderColor: formData.interests.includes(interest) ? '#d946ef' : '#D1D5DB',
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                      }}
                    >
                      <Text 
                        style={{ 
                          fontSize: 14,
                          color: formData.interests.includes(interest) ? '#ffffff' : '#374151'
                        }}
                      >
                        {interest}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Volunteer Option */}
                <TouchableOpacity
                  onPress={() => updateField('volunteer', !formData.volunteer)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 24,
                    ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderWidth: 2,
                      borderColor: formData.volunteer ? '#d946ef' : '#D1D5DB',
                      borderRadius: 4,
                      backgroundColor: formData.volunteer ? '#d946ef' : '#ffffff',
                      marginRight: 12,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {formData.volunteer && (
                      <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                    )}
                  </View>
                  <Text style={{ fontSize: 16, color: '#374151', flex: 1 }}>
                    I'm interested in volunteering for campaigns and events
                  </Text>
                </TouchableOpacity>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleJoin}
                  disabled={isLoading}
                  style={{
                    backgroundColor: isLoading ? '#9CA3AF' : '#d946ef',
                    borderRadius: 12,
                    paddingVertical: 16,
                    marginBottom: 16,
                    ...(Platform.OS === 'web' && { cursor: isLoading ? 'not-allowed' : 'pointer' } as any)
                  }}
                >
                  <Text 
                    style={{ 
                      color: '#ffffff',
                      fontSize: 18,
                      fontWeight: '600',
                      textAlign: 'center'
                    }}
                  >
                    {isLoading ? 'Submitting Application...' : 'Join Progress Party'}
                  </Text>
                </TouchableOpacity>

                <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 18 }}>
                  By joining, you agree to our terms of service and privacy policy. Membership is free and you can unsubscribe at any time.
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}
