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
import { api } from '../util/api';
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
    // Volunteer-specific fields
    socialMediaHandle: '',
    isBritishCitizen: undefined as boolean | undefined,
    livesInUK: undefined as boolean | undefined,
    briefBio: '',
    briefCV: '',
    otherAffiliations: '',
    interestedIn: [] as string[],
    canContribute: [] as string[],
    signedNDA: false,
    gdprConsent: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [hasSignedNDA, setHasSignedNDA] = useState(false);
  const [ndaSignerName, setNdaSignerName] = useState('');
  const [showNDASuccess, setShowNDASuccess] = useState(false);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showApiError, setShowApiError] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const rotateAnim = useSharedValue(0);
  const successAnim = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);

  useEffect(() => {
    // Animate elements on mount
    fadeAnim.value = withTiming(1, { duration: 1000 });
    slideAnim.value = withSpring(0, { damping: 15 });

    // Rotation animation for decorative elements
    rotateAnim.value = withRepeat(
      withTiming(360, { duration: 20000 }),
      -1
    );

    // Check for NDA signature status
    checkNDASignature();
    
    // Restore any saved form data
    restoreFormData();
  }, []);

  // Auto-save form data whenever it changes
  useEffect(() => {
    saveFormData();
  }, [formData]);

  useEffect(() => {
    if (isSuccess) {
      successAnim.value = withSpring(1, { damping: 15 });
      checkmarkScale.value = withSpring(1, { damping: 10 });
    }
  }, [isSuccess]);

  // Check NDA signature status
  const checkNDASignature = () => {
    if (Platform.OS === 'web') {
      try {
        const ndaData = localStorage.getItem('NDASignature');
        if (ndaData) {
          const parsed = JSON.parse(ndaData);
          if (parsed.agreed && parsed.name) {
            const wasAlreadySigned = hasSignedNDA;
            setHasSignedNDA(true);
            setNdaSignerName(parsed.name);
            setFormData(prev => ({ ...prev, signedNDA: true }));
            
            // Show success notification if this is a new signature
            if (!wasAlreadySigned) {
              setShowNDASuccess(true);
              
              // Scroll to top to show the notification
              if (Platform.OS === 'web') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
              
              // Auto-hide after 5 seconds
              setTimeout(() => {
                setShowNDASuccess(false);
              }, 5000);
            }
          }
        }
      } catch (error) {
        console.error('Error checking NDA signature:', error);
      }
    }
  };

  // Clear cached form data and NDA signature
  const clearCachedData = () => {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem('progressFormData');
        localStorage.removeItem('NDASignature');
        setHasSavedData(false);
        console.log('Cached application data cleared');
      } catch (error) {
        console.error('Error clearing cached data:', error);
      }
    }
  };

  // Save form data to localStorage
  const saveFormData = () => {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem('progressFormData', JSON.stringify(formData));
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    }
  };

  // Restore form data from localStorage
  const restoreFormData = () => {
    if (Platform.OS === 'web') {
      try {
        const savedData = localStorage.getItem('progressFormData');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setFormData(parsed);
          setHasSavedData(true);
        } else {
          setHasSavedData(false);
        }
      } catch (error) {
        console.error('Error restoring form data:', error);
        setHasSavedData(false);
      }
    }
  };

  // Listen for focus events to check NDA status when returning from NDA page
  useEffect(() => {
    const handleFocus = () => {
      checkNDASignature();
      restoreFormData(); // Restore form data when page regains focus
    };

    if (Platform.OS === 'web') {
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, []);

  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnim.value}deg` }],
  }));

  const successStyle = useAnimatedStyle(() => ({
    opacity: successAnim.value,
    transform: [{ translateY: withTiming(isSuccess ? 0 : -50, { duration: 500 }) }],
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
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

  const volunteerInterests = [
    'Policy Research',
    'Campaign Management',
    'Event Organization',
    'Community Outreach',
    'Digital Marketing',
    'Data Analysis',
    'Fundraising',
    'Content Creation',
    'Local Organizing',
    'Media Relations'
  ];

  const contributionAreas = [
    'Strategic Planning',
    'Writing & Communications',
    'Design & Creative',
    'Technology & Development',
    'Event Management',
    'Research & Analysis',
    'Social Media',
    'Public Speaking',
    'Administrative Support',
    'Leadership & Management'
  ];

  // Function to check if form is valid for submission
  const isFormValid = () => {
    const { firstName, lastName, email, volunteer } = formData;
    
    // Basic required fields
    if (!firstName || !lastName || !email) {
      return false;
    }

    // If volunteering, check volunteer-specific requirements
    if (volunteer) {
      const { 
        socialMediaHandle, 
        isBritishCitizen, 
        livesInUK, 
        briefBio, 
        briefCV, 
        signedNDA, 
        gdprConsent 
      } = formData;
      
      if (!socialMediaHandle || 
          isBritishCitizen === undefined || 
          livesInUK === undefined || 
          !briefBio || 
          !briefCV || 
          !signedNDA || 
          !hasSignedNDA || 
          !gdprConsent) {
        return false;
      }
    }

    return true;
  };

  const handleJoin = async () => {
    const { firstName, lastName, email, volunteer } = formData;
    
    if (!firstName || !lastName || !email) {
      setApiError('Please fill in all required fields: First Name, Last Name, and Email Address.');
      setShowApiError(true);
      
      // Scroll to top to show error
      if (Platform.OS === 'web') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      // Auto-hide error after 6 seconds
      setTimeout(() => {
        setShowApiError(false);
      }, 6000);
      return;
    }

    // Validate volunteer-specific fields if volunteer is selected
    if (volunteer) {
      const { 
        socialMediaHandle, 
        isBritishCitizen, 
        livesInUK, 
        briefBio, 
        briefCV, 
        signedNDA, 
        gdprConsent 
      } = formData;
      
      const missingFields = [];
      
      if (!socialMediaHandle) missingFields.push('Social media handle');
      if (isBritishCitizen === undefined) missingFields.push('British citizenship status');
      if (livesInUK === undefined) missingFields.push('UK residence status');
      if (!briefBio) missingFields.push('Brief bio');
      if (!briefCV) missingFields.push('Brief CV');
      if (!signedNDA || !hasSignedNDA) {
        setApiError('You must sign the Progress NDA before submitting your volunteer application. Please use the "View and sign NDA" link below.');
        setShowApiError(true);
        
        // Scroll to top to show error
        if (Platform.OS === 'web') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // Auto-hide error after 8 seconds
        setTimeout(() => {
          setShowApiError(false);
        }, 8000);
        return;
      }
      if (!gdprConsent) missingFields.push('GDPR consent');
      
      if (missingFields.length > 0) {
        setApiError(`Please complete the following volunteer fields: ${missingFields.join(', ')}`);
        setShowApiError(true);
        
        // Scroll to top to show error
        if (Platform.OS === 'web') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // Auto-hide error after 8 seconds
        setTimeout(() => {
          setShowApiError(false);
        }, 8000);
        return;
      }
    }

    setIsLoading(true);
    setApiError(null); // Clear any previous errors
    setShowApiError(false);
    
    try {
      const response = await api.submitApplication(formData);

      if (response.success) {
        // Clear cached form data and NDA signature since application was successful
        clearCachedData();
        
        setSuccessMessage(response.message || 'Your membership application has been submitted successfully. An admin will review your application and you\'ll receive an access code via email if approved.');
        setIsSuccess(true);
        // Scroll to top to show success message
        if (Platform.OS === 'web') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        // Handle API errors with inline display
        setApiError(response.message || 'Failed to submit application. Please try again.');
        setShowApiError(true);
        
        // Scroll to top to show error
        if (Platform.OS === 'web') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // Auto-hide error after 10 seconds
        setTimeout(() => {
          setShowApiError(false);
        }, 10000);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      // Handle network/unexpected errors
      setApiError(error instanceof Error ? error.message : 'Network error. Please check your connection and try again.');
      setShowApiError(true);
      
      // Scroll to top to show error
      if (Platform.OS === 'web') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      // Auto-hide error after 10 seconds
      setTimeout(() => {
        setShowApiError(false);
      }, 10000);
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

  const toggleVolunteerInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interestedIn: prev.interestedIn.includes(interest)
        ? prev.interestedIn.filter(i => i !== interest)
        : [...prev.interestedIn, interest]
    }));
  };

  const toggleContribution = (contribution: string) => {
    setFormData(prev => ({
      ...prev,
      canContribute: prev.canContribute.includes(contribution)
        ? prev.canContribute.filter(c => c !== contribution)
        : [...prev.canContribute, contribution]
    }));
  };

  const handleContinue = () => {
    router.push('/');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <Header />
        
        {/* Success State */}
        {isSuccess && (
          <Animated.View style={[successStyle, {
            backgroundColor: '#ffffff',
            marginHorizontal: 20,
            marginTop: 20,
            borderRadius: 20,
            padding: 32,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 10,
            borderLeftWidth: 4,
            borderLeftColor: '#10b981',
          }]}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <Animated.View style={[checkmarkStyle, {
                backgroundColor: '#10b981',
                borderRadius: 40,
                width: 80,
                height: 80,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }]}>
                <Ionicons name="checkmark" size={40} color="#ffffff" />
              </Animated.View>
              
              <Text style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: '#111827',
                textAlign: 'center',
                marginBottom: 12,
              }}>
                Application Submitted!
              </Text>
              
              <Text style={{
                fontSize: 16,
                color: '#6B7280',
                textAlign: 'center',
                lineHeight: 24,
                marginBottom: 24,
                maxWidth: 400,
              }}>
                {successMessage}
              </Text>
              
              <View style={{
                backgroundColor: '#f0fdf4',
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
                width: '100%',
                maxWidth: 400,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="information-circle" size={20} color="#10b981" style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#065f46' }}>
                    What happens next?
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: '#047857', lineHeight: 20 }}>
                  • An admin will review your application{'\n'}
                  • You'll receive an email notification{'\n'}
                  • If approved, you'll get your access code via email
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={handleContinue}
                style={{
                  backgroundColor: '#d946ef',
                  borderRadius: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 32,
                  shadowColor: '#d946ef',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                  ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                }}
              >
                <Text style={{
                  color: '#ffffff',
                  fontSize: 16,
                  fontWeight: '600',
                  textAlign: 'center',
                }}>
                  Continue to Home
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
        {!isSuccess && (
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
                {/* NDA Success Notification */}
                {showNDASuccess && (
                  <Animated.View 
                    style={{
                      backgroundColor: '#D1FAE5',
                      borderColor: '#10B981',
                      borderWidth: 2,
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 24,
                      flexDirection: 'row',
                      alignItems: 'center',
                      shadowColor: '#10B981',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    <View style={{
                      backgroundColor: '#10B981',
                      borderRadius: 20,
                      padding: 8,
                      marginRight: 12
                    }}>
                      <Ionicons name="checkmark" size={20} color="#ffffff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        fontSize: 16, 
                        fontWeight: '600', 
                        color: '#065F46',
                        marginBottom: 4 
                      }}>
                        ✅ NDA Successfully Signed!
                      </Text>
                      <Text style={{ 
                        fontSize: 14, 
                        color: '#047857',
                        lineHeight: 20 
                      }}>
                        Thank you {ndaSignerName}! Your confidentiality agreement is now on file. You can complete your volunteer application below.
                      </Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => setShowNDASuccess(false)}
                      style={{ padding: 8 }}
                    >
                      <Ionicons name="close" size={20} color="#065F46" />
                    </TouchableOpacity>
                  </Animated.View>
                )}

                {/* API Error Notification */}
                {showApiError && apiError && (
                  <Animated.View 
                    style={{
                      backgroundColor: '#FEE2E2',
                      borderColor: '#DC2626',
                      borderWidth: 2,
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 24,
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      shadowColor: '#DC2626',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    <View style={{
                      backgroundColor: '#DC2626',
                      borderRadius: 20,
                      padding: 8,
                      marginRight: 12,
                      marginTop: 2
                    }}>
                      <Ionicons name="alert-circle" size={20} color="#ffffff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        fontSize: 16, 
                        fontWeight: '600', 
                        color: '#991B1B',
                        marginBottom: 4 
                      }}>
                        Application Error
                      </Text>
                      <Text style={{ 
                        fontSize: 14, 
                        color: '#B91C1C',
                        lineHeight: 20 
                      }}>
                        {apiError}
                      </Text>
                      {apiError.includes('email is already pending') && (
                        <View style={{ 
                          backgroundColor: '#FEF3C7', 
                          borderRadius: 8, 
                          padding: 12, 
                          marginTop: 8,
                          borderLeftWidth: 4,
                          borderLeftColor: '#F59E0B'
                        }}>
                          <Text style={{ fontSize: 13, color: '#92400E', fontWeight: '500', marginBottom: 4 }}>
                            💡 What can you do?
                          </Text>
                          <Text style={{ fontSize: 13, color: '#92400E', lineHeight: 18 }}>
                            • Check your email for any previous application confirmations{'\n'}
                            • Contact our support team if you need to update your application{'\n'}
                            • Use a different email address if this was submitted in error
                          </Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity 
                      onPress={() => setShowApiError(false)}
                      style={{ padding: 8, marginTop: -4 }}
                    >
                      <Ionicons name="close" size={20} color="#991B1B" />
                    </TouchableOpacity>
                  </Animated.View>
                )}

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
                      lineHeight: 24,
                      marginBottom: 8
                    }}
                  >
                    Become part of Britain's progressive movement
                  </Text>
                  
                  {/* Draft saved indicator */}
                  {hasSavedData && (
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 }}>
                      <Ionicons name="cloud-done" size={16} color="#10B981" style={{ marginRight: 6 }} />
                      <Text style={{ fontSize: 12, color: '#10B981', fontWeight: '500' }}>
                        Draft automatically saved
                      </Text>
                    </View>
                  )}
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

                {/* Volunteer-Specific Fields */}
                {formData.volunteer && (
                  <View style={{ marginBottom: 32, padding: 20, backgroundColor: '#f0f9ff', borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#0ea5e9' }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 }}>
                      Volunteer Application Details
                    </Text>
                    <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>
                      Please complete the following fields for your volunteer application
                    </Text>

                    {/* Social Media Handle */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                        Social Media Handle *
                      </Text>
                      <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>
                        Please provide at least one public social media handle (e.g. X, Instagram, LinkedIn)
                      </Text>
                      <TextInput
                        value={formData.socialMediaHandle}
                        onChangeText={(value) => updateField('socialMediaHandle', value)}
                        placeholder="e.g. @yourhandle, linkedin.com/in/yourname"
                        style={{
                          borderWidth: 2,
                          borderColor: '#e5e7eb',
                          borderRadius: 12,
                          paddingHorizontal: 16,
                          paddingVertical: 14,
                          fontSize: 16,
                          backgroundColor: '#ffffff',
                          color: '#111827',
                        }}
                      />
                    </View>

                    {/* British Citizen */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                        Are you a British Citizen? *
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity
                          onPress={() => updateField('isBritishCitizen', true)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: formData.isBritishCitizen === true ? '#d946ef' : '#ffffff',
                            borderWidth: 2,
                            borderColor: formData.isBritishCitizen === true ? '#d946ef' : '#e5e7eb',
                            borderRadius: 8,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                          }}
                        >
                          <Text style={{ 
                            fontSize: 14, 
                            fontWeight: '500',
                            color: formData.isBritishCitizen === true ? '#ffffff' : '#374151'
                          }}>
                            Yes
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => updateField('isBritishCitizen', false)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: formData.isBritishCitizen === false ? '#d946ef' : '#ffffff',
                            borderWidth: 2,
                            borderColor: formData.isBritishCitizen === false ? '#d946ef' : '#e5e7eb',
                            borderRadius: 8,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                          }}
                        >
                          <Text style={{ 
                            fontSize: 14, 
                            fontWeight: '500',
                            color: formData.isBritishCitizen === false ? '#ffffff' : '#374151'
                          }}>
                            No
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Lives in UK */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                        Do you live in the United Kingdom? *
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity
                          onPress={() => updateField('livesInUK', true)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: formData.livesInUK === true ? '#d946ef' : '#ffffff',
                            borderWidth: 2,
                            borderColor: formData.livesInUK === true ? '#d946ef' : '#e5e7eb',
                            borderRadius: 8,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                          }}
                        >
                          <Text style={{ 
                            fontSize: 14, 
                            fontWeight: '500',
                            color: formData.livesInUK === true ? '#ffffff' : '#374151'
                          }}>
                            Yes
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => updateField('livesInUK', false)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: formData.livesInUK === false ? '#d946ef' : '#ffffff',
                            borderWidth: 2,
                            borderColor: formData.livesInUK === false ? '#d946ef' : '#e5e7eb',
                            borderRadius: 8,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                          }}
                        >
                          <Text style={{ 
                            fontSize: 14, 
                            fontWeight: '500',
                            color: formData.livesInUK === false ? '#ffffff' : '#374151'
                          }}>
                            No
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Brief Bio */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                        Brief Bio *
                      </Text>
                      <TextInput
                        value={formData.briefBio}
                        onChangeText={(value) => updateField('briefBio', value)}
                        placeholder="Tell us about yourself, your background, and interests..."
                        multiline
                        numberOfLines={4}
                        style={{
                          borderWidth: 2,
                          borderColor: '#e5e7eb',
                          borderRadius: 12,
                          paddingHorizontal: 16,
                          paddingVertical: 14,
                          fontSize: 16,
                          backgroundColor: '#ffffff',
                          color: '#111827',
                          minHeight: 100,
                          textAlignVertical: 'top',
                        }}
                      />
                    </View>

                    {/* Brief CV */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                        Brief CV *
                      </Text>
                      <TextInput
                        value={formData.briefCV}
                        onChangeText={(value) => updateField('briefCV', value)}
                        placeholder="Summarize your relevant experience, education, and skills..."
                        multiline
                        numberOfLines={4}
                        style={{
                          borderWidth: 2,
                          borderColor: '#e5e7eb',
                          borderRadius: 12,
                          paddingHorizontal: 16,
                          paddingVertical: 14,
                          fontSize: 16,
                          backgroundColor: '#ffffff',
                          color: '#111827',
                          minHeight: 100,
                          textAlignVertical: 'top',
                        }}
                      />
                    </View>

                    {/* Other Affiliations */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                        Other Affiliations
                      </Text>
                      <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>
                        List any other political parties, organizations, or groups you're affiliated with
                      </Text>
                      <TextInput
                        value={formData.otherAffiliations}
                        onChangeText={(value) => updateField('otherAffiliations', value)}
                        placeholder="e.g. Trade unions, advocacy groups, political parties..."
                        multiline
                        numberOfLines={3}
                        style={{
                          borderWidth: 2,
                          borderColor: '#e5e7eb',
                          borderRadius: 12,
                          paddingHorizontal: 16,
                          paddingVertical: 14,
                          fontSize: 16,
                          backgroundColor: '#ffffff',
                          color: '#111827',
                          minHeight: 80,
                          textAlignVertical: 'top',
                        }}
                      />
                    </View>

                    {/* I am interested in... */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                        I am interested in...
                      </Text>
                      <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 12 }}>
                        Select the volunteer activities that interest you
                      </Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {volunteerInterests.map((interest) => (
                          <TouchableOpacity
                            key={interest}
                            onPress={() => toggleVolunteerInterest(interest)}
                            style={{
                              backgroundColor: formData.interestedIn.includes(interest) ? '#0ea5e9' : '#ffffff',
                              borderWidth: 2,
                              borderColor: formData.interestedIn.includes(interest) ? '#0ea5e9' : '#e5e7eb',
                              borderRadius: 8,
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                              ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                            }}
                          >
                            <Text 
                              style={{ 
                                fontSize: 12,
                                fontWeight: '500',
                                color: formData.interestedIn.includes(interest) ? '#ffffff' : '#374151'
                              }}
                            >
                              {interest}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* I can contribute... */}
                    <View style={{ marginBottom: 20 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                        I can contribute...
                      </Text>
                      <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 12 }}>
                        Select the skills and areas where you can contribute
                      </Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {contributionAreas.map((area) => (
                          <TouchableOpacity
                            key={area}
                            onPress={() => toggleContribution(area)}
                            style={{
                              backgroundColor: formData.canContribute.includes(area) ? '#059669' : '#ffffff',
                              borderWidth: 2,
                              borderColor: formData.canContribute.includes(area) ? '#059669' : '#e5e7eb',
                              borderRadius: 8,
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                              ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                            }}
                          >
                            <Text 
                              style={{ 
                                fontSize: 12,
                                fontWeight: '500',
                                color: formData.canContribute.includes(area) ? '#ffffff' : '#374151'
                              }}
                            >
                              {area}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Checkboxes */}
                    <View style={{ gap: 12, marginBottom: 16 }}>
                      <TouchableOpacity
                        onPress={() => {
                          if (!hasSignedNDA) {
                            Alert.alert(
                              'Sign NDA Required',
                              'Please sign the NDA first using the link below before checking this box.',
                              [{ text: 'OK' }]
                            );
                          } else {
                            updateField('signedNDA', !formData.signedNDA);
                          }
                        }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: hasSignedNDA ? '#ffffff' : '#f9fafb',
                          borderRadius: 8,
                          padding: 12,
                          borderWidth: 2,
                          borderColor: hasSignedNDA && formData.signedNDA ? '#059669' : hasSignedNDA ? '#e5e7eb' : '#fbbf24',
                          opacity: hasSignedNDA ? 1 : 0.7,
                          ...(Platform.OS === 'web' && { cursor: hasSignedNDA ? 'pointer' : 'not-allowed' } as any)
                        }}
                      >
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderWidth: 2,
                            borderColor: hasSignedNDA && formData.signedNDA ? '#059669' : hasSignedNDA ? '#d1d5db' : '#fbbf24',
                            borderRadius: 4,
                            backgroundColor: hasSignedNDA && formData.signedNDA ? '#059669' : '#ffffff',
                            marginRight: 12,
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {hasSignedNDA && formData.signedNDA && (
                            <Ionicons name="checkmark" size={14} color="#ffffff" />
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ 
                            fontSize: 14, 
                            fontWeight: '500', 
                            color: hasSignedNDA ? '#111827' : '#92400e' 
                          }}>
                            I have signed the Progress NDA *
                          </Text>
                          {hasSignedNDA ? (
                            <Text style={{ fontSize: 12, color: '#059669', marginTop: 2 }}>
                              ✓ Signed by {ndaSignerName}
                            </Text>
                          ) : (
                            <TouchableOpacity
                              onPress={() => {
                                saveFormData(); // Save form data before navigating
                                router.push('/nda');
                              }}
                              style={{ marginTop: 4 }}
                            >
                              <Text style={{ fontSize: 12, color: '#d946ef', textDecorationLine: 'underline' }}>
                                View and sign NDA →
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => updateField('gdprConsent', !formData.gdprConsent)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: '#ffffff',
                          borderRadius: 8,
                          padding: 12,
                          borderWidth: 2,
                          borderColor: formData.gdprConsent ? '#059669' : '#e5e7eb',
                          ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                        }}
                      >
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderWidth: 2,
                            borderColor: formData.gdprConsent ? '#059669' : '#d1d5db',
                            borderRadius: 4,
                            backgroundColor: formData.gdprConsent ? '#059669' : '#ffffff',
                            marginRight: 12,
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {formData.gdprConsent && (
                            <Ionicons name="checkmark" size={14} color="#ffffff" />
                          )}
                        </View>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: '#111827', flex: 1 }}>
                          I consent to GDPR & Data Privacy requirements *
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleJoin}
                  disabled={isLoading || !isFormValid()}
                  style={{
                    backgroundColor: isLoading ? '#9CA3AF' : 
                                   !isFormValid() ? '#D1D5DB' : '#d946ef',
                    borderRadius: 16,
                    paddingVertical: 18,
                    marginBottom: 20,
                    shadowColor: isFormValid() ? '#d946ef' : '#000',
                    shadowOffset: { width: 0, height: isFormValid() ? 4 : 2 },
                    shadowOpacity: isFormValid() ? 0.3 : 0.1,
                    shadowRadius: isFormValid() ? 8 : 4,
                    elevation: isFormValid() ? 8 : 2,
                    opacity: isFormValid() ? 1 : 0.6,
                    ...(Platform.OS === 'web' && { 
                      cursor: (isLoading || !isFormValid()) ? 'not-allowed' : 'pointer' 
                    } as any)
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    {!isFormValid() && !isLoading && (
                      <Ionicons 
                        name="warning-outline" 
                        size={20} 
                        color="#6B7280" 
                        style={{ marginRight: 8 }} 
                      />
                    )}
                    <Text 
                      style={{ 
                        color: isFormValid() ? '#ffffff' : '#6B7280',
                        fontSize: 18,
                        fontWeight: '700',
                        textAlign: 'center'
                      }}
                    >
                      {isLoading ? 'Joining Progress UK...' : 
                       !isFormValid() ? 'Complete Required Fields' : 'Join Progress UK'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Helper text when form is invalid */}
                {!isFormValid() && !isLoading && (
                  <View style={{ 
                    backgroundColor: '#FEF3C7', 
                    borderColor: '#F59E0B', 
                    borderWidth: 1, 
                    borderRadius: 8, 
                    padding: 12, 
                    marginBottom: 20,
                    flexDirection: 'row',
                    alignItems: 'flex-start'
                  }}>
                    <Ionicons name="information-circle" size={20} color="#F59E0B" style={{ marginRight: 8, marginTop: 1 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, color: '#92400E', fontWeight: '600', marginBottom: 4 }}>
                        Please complete the following:
                      </Text>
                      {(() => {
                        const missing = [];
                        const { firstName, lastName, email, volunteer } = formData;
                        
                        if (!firstName) missing.push('First name');
                        if (!lastName) missing.push('Last name');
                        if (!email) missing.push('Email address');
                        
                        if (volunteer) {
                          const { 
                            socialMediaHandle, 
                            isBritishCitizen, 
                            livesInUK, 
                            briefBio, 
                            briefCV, 
                            signedNDA, 
                            gdprConsent 
                          } = formData;
                          
                          if (!socialMediaHandle) missing.push('Social media handle');
                          if (isBritishCitizen === undefined) missing.push('British citizenship status');
                          if (livesInUK === undefined) missing.push('UK residence status');
                          if (!briefBio) missing.push('Brief bio');
                          if (!briefCV) missing.push('Brief CV');
                          if (!signedNDA || !hasSignedNDA) missing.push('Sign the NDA (use link above)');
                          if (!gdprConsent) missing.push('GDPR consent');
                        }
                        
                        return missing.map((item, index) => (
                          <Text key={index} style={{ fontSize: 13, color: '#92400E', marginBottom: 2 }}>
                            • {item}
                          </Text>
                        ));
                      })()}
                    </View>
                  </View>
                )}

                <Text style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 }}>
                  By joining, you agree to our terms of service and privacy policy. Membership is completely free and you can unsubscribe at any time. We'll never share your data with third parties.
                </Text>
              </View>
            </Animated.View>
          </View>
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
        )}
        </KeyboardAvoidingView>
      </View>
    </>
  );
}
