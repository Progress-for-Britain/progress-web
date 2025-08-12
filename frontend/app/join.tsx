import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, ScrollView, KeyboardAvoidingView, ImageBackground } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withRepeat,
  interpolate,
  Extrapolate
} from "react-native-reanimated";
import { useAuth } from '../util/auth-context';
import Header from '../components/Header';

export default function Join() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    constituency: '',
    interests: [] as string[],
    volunteer: false,
    newsletter: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const rotateAnim = useSharedValue(0);

  useEffect(() => {
    // Animate elements on mount
    fadeAnim.value = withTiming(1, { duration: 1000 });
    slideAnim.value = withSpring(0, { damping: 15 });

    // Rotation animation for decorative elements
    rotateAnim.value = withRepeat(
      withTiming(360, { duration: 20000 }),
      -1
    );
  }, []);

  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnim.value}deg` }],
  }));

  const interests = [
    'Innovation Economy',
    'Prosperity Zones',
    'Skills & Education',
    'Cost of Living',
    'Housing Policy',
    'Worker Rights',
    'Open Justice',
    'Healthcare Reform',
    'Climate Action',
    'Digital Rights',
    'Local Government',
    'Economic Development'
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
        'Welcome to Progress UK!', 
        'Your membership application has been submitted. You\'ll receive a confirmation email shortly with your membership details and next steps.',
        [{ text: 'Brilliant!', onPress: () => router.push('/') }]
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
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Hero Section with Background Image */}
          <ImageBackground
            source={{ 
              uri: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
            }}
            style={{ 
              paddingVertical: 80,
              paddingHorizontal: 20,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
            resizeMode="cover"
          >
            {/* Dark overlay for better text readability */}
            <View 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(30, 41, 59, 0.8)', // Dark overlay
              }}
            />
            
            {/* Animated Background Elements */}
            <Animated.View 
              style={[
                {
                  position: 'absolute',
                  top: 30,
                  right: 40,
                  width: 80,
                  height: 80,
                  backgroundColor: 'rgba(217, 70, 239, 0.2)',
                  borderRadius: 40,
                },
                rotateStyle
              ]}
            />
            <Animated.View 
              style={[
                {
                  position: 'absolute',
                  bottom: 50,
                  left: 30,
                  width: 60,
                  height: 60,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 30,
                },
                rotateStyle
              ]}
            />

            <Animated.View style={fadeInStyle}>
              <View style={{ alignItems: 'center', maxWidth: 800 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <FontAwesome5 name="flag" size={28} color="#ffffff" style={{ marginRight: 12 }} />
                  <Text 
                    style={{ 
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#f0f9ff',
                      letterSpacing: 1.5,
                      textTransform: 'uppercase'
                    }}
                  >
                    Join Progress UK
                  </Text>
                </View>
                
                <Text 
                  style={{ 
                    fontSize: Platform.OS === 'web' ? 48 : 32,
                    fontWeight: 'bold',
                    color: '#ffffff',
                    textAlign: 'center',
                    marginBottom: 20,
                    lineHeight: Platform.OS === 'web' ? 56 : 38,
                    textShadowColor: 'rgba(0, 0, 0, 0.3)',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 4,
                  }}
                >
                  Help Unleash Britain's Potential
                </Text>
                
                <Text 
                  style={{ 
                    fontSize: 18,
                    color: '#e0f2fe',
                    textAlign: 'center',
                    marginBottom: 32,
                    lineHeight: 28,
                    maxWidth: 600,
                    fontWeight: '400'
                  }}
                >
                  Join thousands of progressives building the innovation economy, creating prosperity zones, and making Britain work for everyone, everywhere.
                </Text>

                {/* Quick Stats */}
                <View style={{ 
                  flexDirection: Platform.OS === 'web' ? 'row' : 'column',
                  alignItems: 'center',
                  gap: 24,
                  marginBottom: 32
                }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ffffff' }}>50K+</Text>
                    <Text style={{ fontSize: 14, color: '#cbd5e1' }}>Active Members</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ffffff' }}>650+</Text>
                    <Text style={{ fontSize: 14, color: '#cbd5e1' }}>Constituencies</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ffffff' }}>100+</Text>
                    <Text style={{ fontSize: 14, color: '#cbd5e1' }}>Local Groups</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text style={{ color: '#e0f2fe', fontSize: 16 }}>
                    Free membership • No hidden fees • Unsubscribe anytime
                  </Text>
                </View>
              </View>
            </Animated.View>
          </ImageBackground>

          {/* Membership Benefits */}
          <View style={{ paddingVertical: 60, paddingHorizontal: 20, backgroundColor: '#f8fafc' }}>
            <Animated.View style={fadeInStyle}>
              <View style={{ alignItems: 'center', marginBottom: 50 }}>
                <MaterialIcons name="card-membership" size={48} color="#d946ef" style={{ marginBottom: 16 }} />
                <Text 
                  style={{ 
                    fontSize: 36,
                    fontWeight: 'bold',
                    color: '#111827',
                    textAlign: 'center',
                    marginBottom: 16
                  }}
                >
                  Why Join Progress UK?
                </Text>
                <Text 
                  style={{ 
                    fontSize: 18,
                    color: '#6B7280',
                    textAlign: 'center',
                    lineHeight: 28,
                    maxWidth: 600
                  }}
                >
                  As a member, you'll have real influence in shaping Britain's progressive future
                </Text>
              </View>
            </Animated.View>
            
            <View style={{ maxWidth: 1000, alignSelf: 'center' }}>
              <View style={{ 
                flexDirection: Platform.OS === 'web' ? 'row' : 'column', 
                gap: 24, 
                marginBottom: 40,
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <Animated.View style={[
                  {
                    flex: 1,
                    minWidth: 280,
                    backgroundColor: '#ffffff',
                    borderRadius: 20,
                    padding: 32,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.1,
                    shadowRadius: 20,
                    elevation: 10,
                    borderLeftWidth: 4,
                    borderLeftColor: '#d946ef',
                  },
                  fadeInStyle
                ]}>
                  <View 
                    style={{
                      backgroundColor: '#d946ef20',
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 20,
                    }}
                  >
                    <Ionicons name="people" size={32} color="#d946ef" />
                  </View>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 12, textAlign: 'center' }}>
                    Policy Influence
                  </Text>
                  <Text style={{ color: '#6B7280', textAlign: 'center', lineHeight: 24, fontSize: 16 }}>
                    Vote on party positions, candidate selections, and key policies that shape Britain's future
                  </Text>
                </Animated.View>
                
                <Animated.View style={[
                  {
                    flex: 1,
                    minWidth: 280,
                    backgroundColor: '#ffffff',
                    borderRadius: 20,
                    padding: 32,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.1,
                    shadowRadius: 20,
                    elevation: 10,
                    borderLeftWidth: 4,
                    borderLeftColor: '#10b981',
                  },
                  fadeInStyle
                ]}>
                  <View 
                    style={{
                      backgroundColor: '#10b98120',
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 20,
                    }}
                  >
                    <Ionicons name="newspaper" size={32} color="#10b981" />
                  </View>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 12, textAlign: 'center' }}>
                    Insider Access
                  </Text>
                  <Text style={{ color: '#6B7280', textAlign: 'center', lineHeight: 24, fontSize: 16 }}>
                    Exclusive member events, policy briefings, and early access to campaign developments
                  </Text>
                </Animated.View>
                
                <Animated.View style={[
                  {
                    flex: 1,
                    minWidth: 280,
                    backgroundColor: '#ffffff',
                    borderRadius: 20,
                    padding: 32,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.1,
                    shadowRadius: 20,
                    elevation: 10,
                    borderLeftWidth: 4,
                    borderLeftColor: '#f59e0b',
                  },
                  fadeInStyle
                ]}>
                  <View 
                    style={{
                      backgroundColor: '#f59e0b20',
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 20,
                    }}
                  >
                    <Ionicons name="location" size={32} color="#f59e0b" />
                  </View>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 12, textAlign: 'center' }}>
                    Local Community
                  </Text>
                  <Text style={{ color: '#6B7280', textAlign: 'center', lineHeight: 24, fontSize: 16 }}>
                    Connect with progressive activists in your constituency and across the UK
                  </Text>
                </Animated.View>
              </View>
            </View>
          </View>

          {/* Membership Form */}
          <View style={{ paddingVertical: 60, paddingHorizontal: 20, backgroundColor: '#ffffff' }}>
            <Animated.View style={fadeInStyle}>
              <View 
                style={{ 
                  backgroundColor: '#ffffff',
                  borderRadius: 24,
                  padding: 40,
                  maxWidth: 700,
                  alignSelf: 'center',
                  width: '100%',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.15,
                  shadowRadius: 24,
                  elevation: 16,
                  borderWidth: 1,
                  borderColor: '#f1f5f9',
                }}
              >
                <View style={{ alignItems: 'center', marginBottom: 32 }}>
                  <View 
                    style={{
                      backgroundColor: '#d946ef20',
                      borderRadius: 20,
                      padding: 16,
                      marginBottom: 16,
                    }}
                  >
                    <FontAwesome5 name="user-plus" size={32} color="#d946ef" />
                  </View>
                  <Text 
                    style={{ 
                      fontSize: 28,
                      fontWeight: 'bold',
                      color: '#111827',
                      textAlign: 'center',
                      marginBottom: 8
                    }}
                  >
                    Join Progress UK
                  </Text>
                  <Text 
                    style={{ 
                      fontSize: 16,
                      color: '#6B7280',
                      textAlign: 'center',
                      lineHeight: 24
                    }}
                  >
                    Become part of Britain's progressive movement
                  </Text>
                </View>

                {/* Personal Information */}
                <View style={{ flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: 16, marginBottom: 20 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                      First Name *
                    </Text>
                    <TextInput
                      value={formData.firstName}
                      onChangeText={(value) => updateField('firstName', value)}
                      placeholder="Enter your first name"
                      style={{
                        borderWidth: 2,
                        borderColor: '#e5e7eb',
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        fontSize: 16,
                        backgroundColor: '#fafbfc',
                        color: '#111827',
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                      Last Name *
                    </Text>
                    <TextInput
                      value={formData.lastName}
                      onChangeText={(value) => updateField('lastName', value)}
                      placeholder="Enter your last name"
                      style={{
                        borderWidth: 2,
                        borderColor: '#e5e7eb',
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        fontSize: 16,
                        backgroundColor: '#fafbfc',
                        color: '#111827',
                      }}
                    />
                  </View>
                </View>

                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                    Email Address *
                  </Text>
                  <TextInput
                    value={formData.email}
                    onChangeText={(value) => updateField('email', value)}
                    placeholder="Enter your email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={{
                      borderWidth: 2,
                      borderColor: '#e5e7eb',
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 16,
                      backgroundColor: '#fafbfc',
                      color: '#111827',
                    }}
                  />
                </View>

                <View style={{ flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: 16, marginBottom: 24 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                      Phone Number
                    </Text>
                    <TextInput
                      value={formData.phone}
                      onChangeText={(value) => updateField('phone', value)}
                      placeholder="07XXX XXXXXX"
                      keyboardType="phone-pad"
                      style={{
                        borderWidth: 2,
                        borderColor: '#e5e7eb',
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        fontSize: 16,
                        backgroundColor: '#fafbfc',
                        color: '#111827',
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                      Constituency
                    </Text>
                    <TextInput
                      value={formData.constituency}
                      onChangeText={(value) => updateField('constituency', value)}
                      placeholder="e.g. Manchester Central"
                      style={{
                        borderWidth: 2,
                        borderColor: '#e5e7eb',
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        fontSize: 16,
                        backgroundColor: '#fafbfc',
                        color: '#111827',
                      }}
                    />
                  </View>
                </View>

                {/* Interests */}
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 16 }}>
                  Policy Areas of Interest
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
                  Select the areas where you'd like to stay informed and get involved
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
                  {interests.map((interest) => (
                    <TouchableOpacity
                      key={interest}
                      onPress={() => toggleInterest(interest)}
                      style={{
                        backgroundColor: formData.interests.includes(interest) ? '#d946ef' : '#ffffff',
                        borderWidth: 2,
                        borderColor: formData.interests.includes(interest) ? '#d946ef' : '#e5e7eb',
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                      }}
                    >
                      <Text 
                        style={{ 
                          fontSize: 14,
                          fontWeight: '500',
                          color: formData.interests.includes(interest) ? '#ffffff' : '#374151'
                        }}
                      >
                        {interest}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Engagement Options */}
                <View style={{ gap: 16, marginBottom: 32 }}>
                  <TouchableOpacity
                    onPress={() => updateField('volunteer', !formData.volunteer)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#f8fafc',
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 2,
                      borderColor: formData.volunteer ? '#d946ef' : '#e5e7eb',
                      ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                    }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderWidth: 2,
                        borderColor: formData.volunteer ? '#d946ef' : '#d1d5db',
                        borderRadius: 6,
                        backgroundColor: formData.volunteer ? '#d946ef' : '#ffffff',
                        marginRight: 12,
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {formData.volunteer && (
                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 }}>
                        I want to volunteer
                      </Text>
                      <Text style={{ fontSize: 14, color: '#6B7280' }}>
                        Help with campaigns, events, and local organizing
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => updateField('newsletter', !formData.newsletter)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#f8fafc',
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 2,
                      borderColor: formData.newsletter ? '#d946ef' : '#e5e7eb',
                      ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                    }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderWidth: 2,
                        borderColor: formData.newsletter ? '#d946ef' : '#d1d5db',
                        borderRadius: 6,
                        backgroundColor: formData.newsletter ? '#d946ef' : '#ffffff',
                        marginRight: 12,
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {formData.newsletter && (
                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 }}>
                        Weekly newsletter
                      </Text>
                      <Text style={{ fontSize: 14, color: '#6B7280' }}>
                        Stay updated with policy developments and campaign news
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleJoin}
                  disabled={isLoading}
                  style={{
                    backgroundColor: isLoading ? '#9CA3AF' : '#d946ef',
                    borderRadius: 16,
                    paddingVertical: 18,
                    marginBottom: 20,
                    shadowColor: '#d946ef',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                    ...(Platform.OS === 'web' && { cursor: isLoading ? 'not-allowed' : 'pointer' } as any)
                  }}
                >
                  <Text 
                    style={{ 
                      color: '#ffffff',
                      fontSize: 18,
                      fontWeight: '700',
                      textAlign: 'center'
                    }}
                  >
                    {isLoading ? 'Joining Progress UK...' : 'Join Progress UK'}
                  </Text>
                </TouchableOpacity>

                <Text style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 }}>
                  By joining, you agree to our terms of service and privacy policy. Membership is completely free and you can unsubscribe at any time. We'll never share your data with third parties.
                </Text>
              </View>
            </Animated.View>
          </View>

          {/* Bottom CTA Section */}
          <View 
            style={{ 
              backgroundColor: '#1e293b',
              paddingVertical: 60,
              paddingHorizontal: 20,
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Animated background elements */}
            <Animated.View 
              style={[
                {
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 150,
                  height: 150,
                  backgroundColor: 'rgba(217, 70, 239, 0.1)',
                  borderRadius: 75,
                },
                rotateStyle
              ]}
            />
            
            <View style={{ maxWidth: 600, alignItems: 'center' }}>
              <FontAwesome5 name="users" size={40} color="#d946ef" style={{ marginBottom: 20 }} />
              <Text 
                style={{ 
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  textAlign: 'center',
                  marginBottom: 16
                }}
              >
                Join the Movement
              </Text>
              <Text 
                style={{ 
                  fontSize: 18,
                  color: '#cbd5e1',
                  textAlign: 'center',
                  marginBottom: 32,
                  lineHeight: 28
                }}
              >
                Together, we're building an innovation economy that works for everyone, everywhere. From unicorn farms to prosperity zones - the future of Britain starts with us.
              </Text>
              
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 12
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#e0f2fe', fontSize: 14 }}>Free membership</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#e0f2fe', fontSize: 14 }}>No commitments</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#e0f2fe', fontSize: 14 }}>Real influence</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}
