import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Alert, KeyboardAvoidingView, StyleSheet, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import SEOHead from '../components/SEOHead';
import { api } from '../util/api';
import Footer from '../components/Footer';
import { getCommonStyles, getColors, getGradients } from '../util/commonStyles';
import { useTheme } from '../util/theme-context';
import useResponsive from '../util/useResponsive';

export default function Join() {
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const colors = getColors(isDark);
  const gradients = getGradients(isDark);
  const commonStyles = getCommonStyles(isDark, isMobile, width);
  const styles = getStyles(colors, isMobile, width);

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
    <View style={commonStyles.appContainer}>
      <SEOHead pageKey="join" />
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Success State */}
      {isSuccess && (
        <Animated.View style={[successStyle, styles.successContainer]}>
          <View style={styles.successContent}>
            <Animated.View style={[checkmarkStyle, styles.checkmarkContainer]}>
              <Ionicons name="checkmark" size={40} color="#ffffff" />
            </Animated.View>

            <Text style={[commonStyles.title, { marginBottom: 12 }]}>
              Application Submitted!
            </Text>

            <Text style={[commonStyles.text, { marginBottom: 24, maxWidth: 400 }]}>
              {successMessage}
            </Text>

            <View style={styles.infoContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="information-circle" size={20} color={colors.success} style={{ marginRight: 8 }} />
                <Text style={[commonStyles.text, { fontWeight: '600', color: colors.success }]}>
                  What happens next?
                </Text>
              </View>
              <Text style={[commonStyles.text, { color: colors.success, lineHeight: 20 }]}>
                • An admin will review your application{'\n'}
                • You'll receive an email notification{'\n'}
                • If approved, you'll get your access code via email
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleContinue}
              style={styles.continueButton}
            >
              <Text style={styles.continueButtonText}>
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
            {/* Main Content */}
            <View style={commonStyles.content}>
              {/* Hero Section */}
              <View style={commonStyles.heroContainer}>
                <Text style={[commonStyles.title, {
                  fontSize: isMobile ? 32 : 48,
                  marginBottom: 20,
                  textAlign: 'center'
                }]}>
                  Help Unleash Britain's Potential
                </Text>

                <Text style={[commonStyles.text, {
                  fontSize: isMobile ? 16 : 18,
                  marginBottom: 32,
                  lineHeight: isMobile ? 24 : 28,
                  maxWidth: isMobile ? width - 32 : 800,
                  textAlign: isMobile ? 'left' : 'justify'
                }]}>
                  2029 will be the biggest opportunity for regime change in a century. The vote share required to win a majority has never been smaller - in 2024 it only took a 1.6% increase in votes to double Labour's seats.{'\n\n'}
                  
                  PROGRESS are building the most serious new party in the country, but we need you to help make this a reality. We've seen the inside of all the other parties - new and old - and believe us, they are not up to the task. The time for sitting on the sidelines has passed.{'\n\n'}
                  
                  We need to build out our ground campaign all across the country - now. We need to build the real alternative for 2029 now - and we need you to be a part of it.
                </Text>
              </View>

              {/* Form Container */}
              <View style={commonStyles.cardContainer}>
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
                  <LinearGradient
                    colors={gradients.accent}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 20,
                      padding: 16,
                      marginBottom: 16,
                    }}
                  >
                    <FontAwesome5 name="user-plus" size={32} color={colors.text} />
                  </LinearGradient>
                  <Text
                    style={[commonStyles.title, {
                      fontSize: 28,
                      marginBottom: 8
                    }]}
                  >
                    Join Progress UK
                  </Text>
                  <Text
                    style={[commonStyles.text, {
                      fontSize: 16,
                      color: colors.textSecondary,
                      lineHeight: 24,
                      marginBottom: 8,
                      textAlign: 'center'
                    }]}
                  >
                    Become part of Britain's progressive movement
                  </Text>

                  {/* Draft saved indicator */}
                  {hasSavedData && (
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 }}>
                      <Ionicons name="cloud-done" size={16} color={colors.success} style={{ marginRight: 6 }} />
                      <Text style={{ fontSize: 12, color: colors.success, fontWeight: '500' }}>
                        Draft automatically saved
                      </Text>
                    </View>
                  )}
                </View>

                {/* Personal Information */}
                <View style={commonStyles.formRow}>
                  <View style={commonStyles.formField}>
                    <Text style={styles.inputLabel}>
                      First Name *
                    </Text>
                    <TextInput
                      value={formData.firstName}
                      onChangeText={(value) => updateField('firstName', value)}
                      placeholder="Enter your first name"
                      placeholderTextColor={colors.textSecondary}
                      style={styles.textInput}
                    />
                  </View>
                  <View style={commonStyles.formField}>
                    <Text style={styles.inputLabel}>
                      Last Name *
                    </Text>
                    <TextInput
                      value={formData.lastName}
                      onChangeText={(value) => updateField('lastName', value)}
                      placeholder="Enter your last name"
                      placeholderTextColor={colors.textSecondary}
                      style={styles.textInput}
                    />
                  </View>
                </View>

                <View style={{ marginBottom: 20 }}>
                  <Text style={styles.inputLabel}>
                    Email Address *
                  </Text>
                  <TextInput
                    value={formData.email}
                    onChangeText={(value) => updateField('email', value)}
                    placeholder="Enter your email address"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.textInput}
                  />
                </View>

                <View style={commonStyles.formRowLarge}>
                  <View style={commonStyles.formField}>
                    <Text style={styles.inputLabel}>
                      Phone Number
                    </Text>
                    <TextInput
                      value={formData.phone}
                      onChangeText={(value) => updateField('phone', value)}
                      placeholder="07XXX XXXXXX"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="phone-pad"
                      style={styles.textInput}
                    />
                  </View>
                  <View style={commonStyles.formField}>
                    <Text style={styles.inputLabel}>
                      Constituency
                    </Text>
                    <TextInput
                      value={formData.constituency}
                      onChangeText={(value) => updateField('constituency', value)}
                      placeholder="e.g. Manchester Central"
                      placeholderTextColor={colors.textSecondary}
                      style={styles.textInput}
                    />
                  </View>
                </View>

                {/* Engagement Options */}
                <View style={{ gap: 16, marginBottom: 32 }}>
                  <TouchableOpacity
                    onPress={() => updateField('volunteer', !formData.volunteer)}
                    style={[
                      styles.optionCard,
                      formData.volunteer && styles.optionCardSelected
                    ]}
                  >
                    <View style={[
                      styles.checkbox,
                      formData.volunteer && styles.checkboxSelected
                    ]}>
                      {formData.volunteer && (
                        <Ionicons name="checkmark" size={16} color={colors.text} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.optionTitle, formData.volunteer && styles.optionTitleSelected]}>
                        I want to volunteer
                      </Text>
                      <Text style={[styles.optionDescription, formData.volunteer && styles.optionDescriptionSelected]}>
                        Help with campaigns, events, and local organizing
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => updateField('newsletter', !formData.newsletter)}
                    style={[
                      styles.optionCard,
                      formData.newsletter && styles.optionCardSelected
                    ]}
                  >
                    <View style={[
                      styles.checkbox,
                      formData.newsletter && styles.checkboxSelected
                    ]}>
                      {formData.newsletter && (
                        <Ionicons name="checkmark" size={16} color={colors.text} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.optionTitle, formData.newsletter && styles.optionTitleSelected]}>
                        Weekly newsletter
                      </Text>
                      <Text style={[styles.optionDescription, formData.newsletter && styles.optionDescriptionSelected]}>
                        Stay updated with policy developments and campaign news
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Volunteer-Specific Fields */}
                {formData.volunteer && (
                  <View style={[commonStyles.specialSection, {
                    backgroundColor: `${colors.secondary}20`,
                    borderLeftColor: colors.secondary,
                    borderColor: `${colors.secondary}30`,
                  }]}>
                    <Text style={[commonStyles.title, { fontSize: 18, marginBottom: 16 }]}>
                      Volunteer Application Details
                    </Text>
                    <Text style={[commonStyles.text, { fontSize: 14, color: colors.textSecondary, marginBottom: 20, textAlign: 'left' }]}>
                      Please complete the following fields for your volunteer application. Not sure if you should volunteer? {' '}
                      <TouchableOpacity
                        onPress={() => {
                          const pdfUrl = `${process.env.EXPO_PUBLIC_BACKEND_API_URL}/public/should-i-join-progress.pdf`;
                          if (Platform.OS === 'web') {
                            window.open(pdfUrl, '_blank');
                          } else {
                            Linking.openURL(pdfUrl);
                          }
                        }}
                        style={{ marginTop: 4 }}
                      >
                        <Text style={[commonStyles.text, { fontSize: 14, color: colors.accent, textDecorationLine: 'underline' }]}>
                          Read this guide
                        </Text>
                      </TouchableOpacity>
                    </Text>

                    {/* Social Media Handle */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={styles.inputLabel}>
                        Social Media Handle *
                      </Text>
                      <Text style={[commonStyles.text, { fontSize: 14, color: colors.textSecondary, marginBottom: 8, textAlign: 'left' }]}>
                        Please provide at least one public social media handle (e.g. X, Instagram, LinkedIn)
                      </Text>
                      <TextInput
                        value={formData.socialMediaHandle}
                        onChangeText={(value) => updateField('socialMediaHandle', value)}
                        placeholder="e.g. @yourhandle, linkedin.com/in/yourname"
                        placeholderTextColor={colors.textSecondary}
                        style={styles.textInput}
                      />
                    </View>

                    {/* British Citizen */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={styles.inputLabel}>
                        Are you a British Citizen? *
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity
                          onPress={() => updateField('isBritishCitizen', true)}
                          style={[
                            styles.yesNoButton,
                            formData.isBritishCitizen === true && styles.yesNoButtonSelected
                          ]}
                        >
                          <Text style={[
                            styles.yesNoButtonText,
                            formData.isBritishCitizen === true && styles.yesNoButtonTextSelected
                          ]}>
                            Yes
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => updateField('isBritishCitizen', false)}
                          style={[
                            styles.yesNoButton,
                            formData.isBritishCitizen === false && styles.yesNoButtonSelected
                          ]}
                        >
                          <Text style={[
                            styles.yesNoButtonText,
                            formData.isBritishCitizen === false && styles.yesNoButtonTextSelected
                          ]}>
                            No
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Lives in UK */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={styles.inputLabel}>
                        Do you live in the United Kingdom? *
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity
                          onPress={() => updateField('livesInUK', true)}
                          style={[
                            styles.yesNoButton,
                            formData.livesInUK === true && styles.yesNoButtonSelected
                          ]}
                        >
                          <Text style={[
                            styles.yesNoButtonText,
                            formData.livesInUK === true && styles.yesNoButtonTextSelected
                          ]}>
                            Yes
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => updateField('livesInUK', false)}
                          style={[
                            styles.yesNoButton,
                            formData.livesInUK === false && styles.yesNoButtonSelected
                          ]}
                        >
                          <Text style={[
                            styles.yesNoButtonText,
                            formData.livesInUK === false && styles.yesNoButtonTextSelected
                          ]}>
                            No
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Brief Bio */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={styles.inputLabel}>
                        Brief Bio *
                      </Text>
                      <TextInput
                        value={formData.briefBio}
                        onChangeText={(value) => updateField('briefBio', value)}
                        placeholder="Tell us about yourself, your background, and interests..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={4}
                        style={[styles.textInput, styles.textArea]}
                      />
                    </View>

                    {/* Brief CV */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={styles.inputLabel}>
                        Brief CV *
                      </Text>
                      <TextInput
                        value={formData.briefCV}
                        onChangeText={(value) => updateField('briefCV', value)}
                        placeholder="Summarize your relevant experience, education, and skills..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={4}
                        style={[styles.textInput, styles.textArea]}
                      />
                    </View>

                    {/* Other Affiliations */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={styles.inputLabel}>
                        Other Affiliations
                      </Text>
                      <Text style={[commonStyles.text, { fontSize: 14, color: colors.textSecondary, marginBottom: 8, textAlign: 'left' }]}>
                        List any other political parties, organizations, or groups you're affiliated with
                      </Text>
                      <TextInput
                        value={formData.otherAffiliations}
                        onChangeText={(value) => updateField('otherAffiliations', value)}
                        placeholder="e.g. Trade unions, advocacy groups, political parties..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={3}
                        style={[styles.textInput, { minHeight: 80, textAlignVertical: 'top' }]}
                      />
                    </View>

                    {/* I am interested in... */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={styles.inputLabel}>
                        I am interested in...
                      </Text>
                      <Text style={[commonStyles.text, { fontSize: 14, color: colors.textSecondary, marginBottom: 12, textAlign: 'left' }]}>
                        Select the volunteer activities that interest you
                      </Text>
                      <View style={commonStyles.tagContainerSmall}>
                        {volunteerInterests.map((interest) => (
                          <TouchableOpacity
                            key={interest}
                            onPress={() => toggleVolunteerInterest(interest)}
                            style={[
                              styles.volunteerInterestTag,
                              formData.interestedIn.includes(interest) && styles.volunteerInterestTagSelected
                            ]}
                          >
                            <Text
                              style={[
                                styles.volunteerInterestTagText,
                                formData.interestedIn.includes(interest) && styles.volunteerInterestTagTextSelected
                              ]}
                            >
                              {interest}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* I can contribute... */}
                    <View style={{ marginBottom: 20 }}>
                      <Text style={styles.inputLabel}>
                        I can contribute...
                      </Text>
                      <Text style={[commonStyles.text, { fontSize: 14, color: colors.textSecondary, marginBottom: 12, textAlign: 'left' }]}>
                        Select the skills and areas where you can contribute
                      </Text>
                      <View style={commonStyles.tagContainerSmall}>
                        {contributionAreas.map((area) => (
                          <TouchableOpacity
                            key={area}
                            onPress={() => toggleContribution(area)}
                            style={[
                              styles.contributionTag,
                              formData.canContribute.includes(area) && styles.contributionTagSelected
                            ]}
                          >
                            <Text
                              style={[
                                styles.contributionTagText,
                                formData.canContribute.includes(area) && styles.contributionTagTextSelected
                              ]}
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
                        style={[
                          styles.checkboxContainer,
                          !hasSignedNDA && styles.checkboxContainerWarning,
                          hasSignedNDA && formData.signedNDA && styles.checkboxContainerSelected
                        ]}
                      >
                        <View style={[
                          styles.checkboxIcon,
                          !hasSignedNDA && styles.checkboxIconWarning,
                          hasSignedNDA && formData.signedNDA && styles.checkboxIconSelected
                        ]}>
                          {hasSignedNDA && formData.signedNDA && (
                            <Ionicons name="checkmark" size={14} color={colors.text} />
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[
                            styles.checkboxLabel,
                            !hasSignedNDA && styles.checkboxLabelWarning
                          ]}>
                            I have signed the Progress NDA *
                          </Text>
                          {hasSignedNDA ? (
                            <Text style={[styles.checkboxSubtext, { color: colors.success }]}>
                              ✓ Signed by {ndaSignerName}
                            </Text>
                          ) : (
                            <TouchableOpacity
                              onPress={() => {
                                saveFormData(); // Save form data before navigating
                                router.replace('/nda');
                              }}
                              style={{ marginTop: 4 }}
                            >
                              <Text style={styles.checkboxLink}>
                                View and sign NDA →
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => updateField('gdprConsent', !formData.gdprConsent)}
                        style={[
                          styles.checkboxContainer,
                          formData.gdprConsent && styles.checkboxContainerSelected
                        ]}
                      >
                        <View style={[
                          styles.checkboxIcon,
                          formData.gdprConsent && styles.checkboxIconSelected
                        ]}>
                          {formData.gdprConsent && (
                            <Ionicons name="checkmark" size={14} color={colors.text} />
                          )}
                        </View>
                        <Text style={styles.checkboxLabel}>
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
                  style={[
                    styles.submitButton,
                    !isFormValid() && styles.submitButtonDisabled
                  ]}
                >
                  <LinearGradient
                    colors={isFormValid() ? gradients.accent : [colors.border, colors.border]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButtonGradient}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      {!isFormValid() && !isLoading && (
                        <Ionicons
                          name="warning-outline"
                          size={20}
                          color={colors.textSecondary}
                          style={{ marginRight: 8 }}
                        />
                      )}
                      <Text
                        style={[
                          styles.submitButtonText,
                          !isFormValid() && styles.submitButtonTextDisabled
                        ]}
                      >
                        {isLoading ? 'Joining Progress UK...' :
                          !isFormValid() ? 'Complete Required Fields' : 'Join Progress UK'}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Helper text when form is invalid */}
                {!isFormValid() && !isLoading && (
                  <View style={styles.helperContainer}>
                    <Ionicons name="information-circle" size={20} color={colors.warning} style={{ marginRight: 8, marginTop: 1 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.helperTitle}>
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
                          <Text key={index} style={styles.helperItem}>
                            • {item}
                          </Text>
                        ));
                      })()}
                    </View>
                  </View>
                )}

                <Text style={[commonStyles.text, { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 }]}>
                  By joining, you agree to our terms of service and privacy policy. Membership is completely free and you can unsubscribe at any time. We'll never share your data with third parties.
                </Text>
              </View>
            </View>
            {/* Add extra space at the bottom for mobile scroll */}
            <View style={{ height: 200 }} />

            {/* Footer */}
            <Footer />

          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const getStyles = (colors: any, isMobile: boolean, width: number) => StyleSheet.create({
  successContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: isMobile ? 16 : 20,
    marginTop: 20,
    borderRadius: isMobile ? 16 : 20,
    padding: isMobile ? 24 : 32,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    position: 'relative',
    zIndex: 3,
  },
  successContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  checkmarkContainer: {
    backgroundColor: colors.success,
    borderRadius: 40,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: `${colors.success}20`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    maxWidth: 400,
  },
  continueButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
  },
  continueButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    ...(Platform.OS === 'web' && {
      fontFamily: "'Montserrat', sans-serif",
    }),
  },
  textInput: {
    borderWidth: 2,
    borderColor: colors.background === '#ffffff' ? `${colors.text}40` : `${colors.text}30`,
    borderRadius: isMobile ? 8 : 12,
    paddingHorizontal: isMobile ? 12 : 16,
    paddingVertical: isMobile ? 12 : 14,
    fontSize: isMobile ? 14 : 16,
    backgroundColor: colors.background === '#ffffff' ? `${colors.surface}80` : `${colors.surface}60`,
    color: colors.text,
    ...(Platform.OS === 'web' && {
      fontFamily: "'Montserrat', sans-serif",
      backdropFilter: 'blur(10px)',
    } as any),
  },
  highlightContainer: {
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    ...(Platform.OS === 'web' && {
      fontFamily: "'Montserrat', sans-serif",
    }),
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    ...(Platform.OS === 'web' && {
      fontFamily: "'Montserrat', sans-serif",
    }),
  },
  benefitsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitCard: {
    flex: 1,
    minWidth: isMobile ? width - 64 : 300,
    maxWidth: isMobile ? width - 64 : 350,
    borderRadius: isMobile ? 16 : 20,
    borderWidth: 1,
    borderColor: `${colors.text}20`,
    overflow: 'hidden',
    marginHorizontal: isMobile ? 0 : 8,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    } as any),
  },
  benefitGradient: {
    padding: isMobile ? 24 : 32,
    alignItems: 'center',
    borderRadius: isMobile ? 16 : 20,
    flex: 1,
    justifyContent: 'center',
    minHeight: isMobile ? 200 : 250,
  },
  benefitIconContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  benefitTitle: {
    fontSize: isMobile ? 18 : 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
    ...(Platform.OS === 'web' && {
      fontFamily: "'Montserrat', sans-serif",
    }),
  },
  benefitDescription: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: isMobile ? 20 : 24,
    fontSize: isMobile ? 14 : 16,
    ...(Platform.OS === 'web' && {
      fontFamily: "'Montserrat', sans-serif",
    }),
  },
  ctaFeatures: {
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  ctaFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  interestTag: {
    backgroundColor: colors.background === '#ffffff' ? `${colors.text}08` : `${colors.surface}40`,
    borderWidth: 2,
    borderColor: colors.background === '#ffffff' ? `${colors.text}25` : `${colors.text}30`,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as any)
  },
  interestTagSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  interestTagText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background === '#ffffff' ? colors.text : colors.text,
    ...(Platform.OS === 'web' && {
      fontFamily: "'Montserrat', sans-serif",
    }),
  },
  interestTagTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background === '#ffffff' ? `${colors.surface}60` : `${colors.surface}40`,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.background === '#ffffff' ? `${colors.text}25` : `${colors.text}20`,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as any)
  },
  optionCardSelected: {
    backgroundColor: `${colors.accent}20`,
    borderColor: colors.accent,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: `${colors.text}40`,
    borderRadius: 6,
    backgroundColor: `${colors.surface}20`,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkboxSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    ...(Platform.OS === 'web' && {
      fontFamily: "'Montserrat', sans-serif",
    }),
  },
  optionTitleSelected: {
    color: colors.text,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    ...(Platform.OS === 'web' && {
      fontFamily: "'Montserrat', sans-serif",
    }),
  },
  optionDescriptionSelected: {
    color: colors.textSecondary,
  },
  submitButton: {
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as any)
  },
  submitButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    ...(Platform.OS === 'web' && {
      cursor: 'not-allowed'
    } as any)
  },
  submitButtonGradient: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    ...(Platform.OS === 'web' && {
      fontFamily: "'Montserrat', sans-serif",
    }),
  },
  submitButtonTextDisabled: {
    color: colors.textSecondary,
  },
  helperContainer: {
    backgroundColor: `${colors.warning}20`,
    borderColor: colors.warning,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  helperTitle: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 8,
    ...(Platform.OS === 'web' && {
      fontFamily: "'Montserrat', sans-serif",
    }),
  },
  helperItem: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
    ...(Platform.OS === 'web' && {
      fontFamily: "'Montserrat', sans-serif",
    }),
  },
  yesNoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background === '#ffffff' ? `${colors.surface}60` : `${colors.surface}40`,
    borderWidth: 2,
    borderColor: colors.background === '#ffffff' ? `${colors.text}40` : `${colors.text}30`,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as any)
  },
  yesNoButtonSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  yesNoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    ...(Platform.OS === 'web' && {
      fontFamily: "'Montserrat', sans-serif",
    }),
  },
  yesNoButtonTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  volunteerInterestTag: {
    backgroundColor: colors.background === '#ffffff' ? `${colors.text}08` : `${colors.surface}40`,
    borderWidth: 2,
    borderColor: colors.background === '#ffffff' ? `${colors.text}25` : `${colors.text}30`,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as any)
  },
  volunteerInterestTagSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  volunteerInterestTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    ...(Platform.OS === 'web' && {
      fontFamily: "'Montserrat', sans-serif",
    }),
  },
  volunteerInterestTagTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  contributionTag: {
    backgroundColor: colors.background === '#ffffff' ? `${colors.text}08` : `${colors.surface}40`,
    borderWidth: 2,
    borderColor: colors.background === '#ffffff' ? `${colors.text}25` : `${colors.text}30`,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as any)
  },
  contributionTagSelected: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  contributionTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    ...(Platform.OS === 'web' && {
      fontFamily: "'Montserrat', sans-serif",
    }),
  },
  contributionTagTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.surface}40`,
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: `${colors.text}30`,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as any)
  },
  checkboxContainerSelected: {
    backgroundColor: `${colors.success}20`,
    borderColor: colors.success,
  },
  checkboxContainerWarning: {
    backgroundColor: `${colors.warning}20`,
    borderColor: colors.warning,
    opacity: 0.7,
  },
  checkboxIcon: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: `${colors.text}40`,
    borderRadius: 4,
    backgroundColor: `${colors.surface}20`,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkboxIconSelected: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkboxIconWarning: {
    borderColor: colors.warning,
    backgroundColor: `${colors.warning}20`,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
    ...(Platform.OS === 'web' && {
      fontFamily: "'Montserrat', sans-serif",
    }),
  },
  checkboxLabelWarning: {
    color: colors.warning,
  },
  checkboxSubtext: {
    fontSize: 12,
    marginTop: 2,
    ...(Platform.OS === 'web' && {
      fontFamily: "'Montserrat', sans-serif",
    }),
  },
  checkboxLink: {
    fontSize: 12,
    color: colors.accent,
    textDecorationLine: 'underline',
    ...(Platform.OS === 'web' && {
      fontFamily: "'Montserrat', sans-serif",
    }),
  },
});
