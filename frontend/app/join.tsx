import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Linking, Modal, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Footer from '../components/Footer';
import { getCommonStyles, getColors, getGradients } from '../util/commonStyles';
import { useTheme } from '../util/theme-context';
import useResponsive from '../util/useResponsive';
import { Turnstile } from '@marsidev/react-turnstile';
import Constants from 'expo-constants';

// Optimized imports
import { useVolunteerForm } from '../util/useVolunteerForm';
import { useVolunteerFormAnimations } from '../util/useVolunteerFormAnimations';
import { getVolunteerFormStyles } from '../util/volunteerFormStyles';
import { 
  HERO_TEXT, 
  VOLUNTEER_INTERESTS, 
  CONTRIBUTION_AREAS 
} from '../util/volunteerFormConstants';
import { SuccessState } from '../components/volunteer/SuccessState';
import { PersonalInfoFields } from '../components/volunteer/PersonalInfoFields';
import { TagSelector } from '../components/volunteer/TagSelector';

export default function JoinVolunteer() {
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const colors = getColors(isDark);
  const gradients = getGradients(isDark);
  const commonStyles = getCommonStyles(isDark, isMobile, width);
  const styles = getVolunteerFormStyles(colors, isMobile, width);
  const router = useRouter();

  // Optimized form state management
  const {
    formData,
    updateField,
    toggleVolunteerInterest,
    toggleContribution,
    isFormValid,
    isLoading,
    isSuccess,
    successMessage,
    apiError,
    showApiError,
    handleJoin,
    hasSignedNDA,
    ndaSignerName,
    showNDASuccess,
    setShowNDASuccess,
    hasSavedData,
    dismissApiError,
  } = useVolunteerForm();

  // Optimized animations
  const {
    fadeAnim,
    slideAnim,
    rotateAnim,
    successAnim,
    checkmarkScale,
  } = useVolunteerFormAnimations(isSuccess);

  // Captcha state (kept local as it's UI-specific)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const successStyle = useAnimatedStyle(() => ({
    opacity: successAnim.value,
    transform: [{ translateY: withTiming(isSuccess ? 0 : -50, { duration: 500 }) }],
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  // Handle form submission with captcha
  const handleSubmit = () => {
    handleJoin(captchaToken);
  };

  // Handle continue after success
  const handleContinue = () => {
    router.push('/');
  };

  return (
    <View style={commonStyles.appContainer}>
      <Head>
        <title>Join Us - Progress UK</title>
        <meta name="description" content="Volunteer with Progress UK and help build a fairer future. Join our campaigns, contribute your skills, and make a difference in your community." />
      </Head>
      <Stack.Screen options={{ 
        headerShown: false,
        title: 'Volunteer with Progress UK'
      }} />
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Optimized Success State */}
      {isSuccess && (
        <SuccessState
          successMessage={successMessage}
          successStyle={successStyle}
          checkmarkStyle={checkmarkStyle}
          onContinue={handleContinue}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {!isSuccess && (
          <ScrollView 
            style={{ flex: 1 }} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ 
              paddingTop: isMobile ? 80 : 100,
              paddingBottom: 100,
              paddingHorizontal: isMobile ? 20 : 40
            }}
          >
            {/* Main Content */}
            <View style={{ maxWidth: 900, marginHorizontal: 'auto', width: '100%' }}>
              {/* Hero Section */}
              <View style={{ 
                alignItems: 'center', 
                marginBottom: isMobile ? 48 : 60,
                paddingHorizontal: isMobile ? 0 : 20
              }}>
                <Text style={[commonStyles.title, {
                  fontSize: isMobile ? 36 : 56,
                  marginBottom: 16,
                  textAlign: 'center',
                  fontWeight: '700',
                  letterSpacing: -1,
                  color: colors.text
                }]}>
                  {HERO_TEXT.title}
                </Text>

                <Text style={[commonStyles.text, {
                  fontSize: isMobile ? 16 : 19,
                  marginBottom: 0,
                  lineHeight: isMobile ? 26 : 30,
                  maxWidth: isMobile ? width - 40 : 680,
                  textAlign: 'center',
                  color: colors.textSecondary,
                  fontWeight: '400'
                }]}>
                  {HERO_TEXT.description}
                </Text>
              </View>

              {/* Form Container */}
              <View style={[commonStyles.cardContainer, {
                backgroundColor: isDark ? `${colors.surface}95` : '#ffffff',
                borderRadius: isMobile ? 20 : 28,
                padding: isMobile ? 28 : 48,
                borderWidth: 1,
                borderColor: isDark ? `${colors.text}15` : '#E5E7EB',
                ...Platform.OS === 'web' && {
                  boxShadow: isDark 
                    ? '0 20px 60px rgba(0,0,0,0.30), 0 1px 0 rgba(255,255,255,0.05) inset'
                    : '0 20px 60px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9) inset'
                }
              }]}>
                {/* NDA Success Notification */}
                {showNDASuccess && (
                  <Animated.View
                    style={{
                      backgroundColor: '#ECFDF5',
                      borderColor: '#10B981',
                      borderWidth: 1,
                      borderRadius: 16,
                      padding: 20,
                      marginBottom: 32,
                      flexDirection: 'row',
                      alignItems: 'center',
                      ...Platform.OS === 'web' && {
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
                      }
                    }}
                  >
                    <View style={{
                      backgroundColor: '#10B981',
                      borderRadius: 12,
                      width: 40,
                      height: 40,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16
                    }}>
                      <Ionicons name="checkmark" size={24} color="#ffffff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: '#065F46',
                        marginBottom: 4
                      }}>
                        NDA Successfully Signed
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        color: '#047857',
                        lineHeight: 20
                      }}>
                        Thank you {ndaSignerName}! Your confidentiality agreement is on file.
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setShowNDASuccess(false)}
                      style={{ 
                        padding: 8,
                        marginLeft: 8,
                        ...Platform.OS === 'web' && { cursor: 'pointer' }
                      }}
                    >
                      <Ionicons name="close" size={22} color="#065F46" />
                    </TouchableOpacity>
                  </Animated.View>
                )}

                <View style={{ alignItems: 'center', marginBottom: 40 }}>
                  <View
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 20,
                      backgroundColor: isDark ? '#001A4F' : '#F0F4FF',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 20,
                      borderWidth: 1,
                      borderColor: isDark ? '#123995' : '#E0E7FF',
                      ...Platform.OS === 'web' && {
                        boxShadow: isDark
                          ? '0 10px 30px rgba(1, 33, 104, 0.3), 0 1px 0 rgba(255,255,255,0.1) inset'
                          : '0 10px 30px rgba(0, 26, 79, 0.15), 0 1px 0 rgba(255,255,255,0.9) inset'
                      }
                    }}
                  >
                    <FontAwesome5 name="user-plus" size={32} color={isDark ? '#60A5FA' : '#001A4F'} />
                  </View>
                  <Text
                    style={[commonStyles.title, {
                      fontSize: isMobile ? 24 : 32,
                      marginBottom: 8,
                      textAlign: 'center',
                      fontWeight: '700',
                      letterSpacing: -0.5
                    }]}
                  >
                    Volunteer Application
                  </Text>
                  <Text
                    style={[commonStyles.text, {
                      fontSize: isMobile ? 15 : 17,
                      color: colors.textSecondary,
                      lineHeight: 26,
                      marginBottom: 0,
                      textAlign: 'center',
                      fontWeight: '400'
                    }]}
                  >
                    Join our team and help build a better Britain
                  </Text>

                  {/* Draft saved indicator */}
                  {hasSavedData && (
                    <View style={{ 
                      flexDirection: 'row', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      marginTop: 16,
                      backgroundColor: isDark ? `${colors.success}15` : '#ECFDF5',
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: isDark ? `${colors.success}30` : '#D1FAE5'
                    }}>
                      <Ionicons name="cloud-done" size={16} color={colors.success} style={{ marginRight: 6 }} />
                      <Text style={{ fontSize: 13, color: colors.success, fontWeight: '500' }}>
                        Draft saved automatically
                      </Text>
                    </View>
                  )}
                </View>

                {/* Optimized Personal Information Fields */}
                <PersonalInfoFields
                  formData={formData}
                  onUpdateField={updateField}
                />

                {/* Application Details */}
                <View style={[commonStyles.specialSection, {
                    backgroundColor: isDark ? `${colors.secondary}10` : '#F8FAFC',
                    borderLeftColor: colors.secondary,
                    borderLeftWidth: 3,
                    borderColor: isDark ? `${colors.secondary}20` : '#E2E8F0',
                    borderRadius: 16,
                    padding: isMobile ? 20 : 28,
                    marginBottom: 32
                  }]}>
                    <Text style={[commonStyles.title, { 
                      fontSize: isMobile ? 18 : 20, 
                      marginBottom: 12,
                      fontWeight: '600',
                      letterSpacing: -0.3
                    }]}>
                      Application Details
                    </Text>
                    <Text style={[commonStyles.text, { 
                      fontSize: 14, 
                      color: colors.textSecondary, 
                      marginBottom: 24, 
                      textAlign: 'left',
                      lineHeight: 22
                    }]}>
                      Please complete the following fields for your application. Not sure if you should volunteer? {' '}
                      <TouchableOpacity
                        onPress={() => {
                          const pdfUrl = `${process.env.EXPO_PUBLIC_BACKEND_API_URL}/should-i-join-progress.pdf`;
                          if (Platform.OS === 'web') {
                            window.open(pdfUrl, '_blank');
                          } else {
                            Linking.openURL(pdfUrl);
                          }
                        }}
                        style={{ marginTop: 2 }}
                      >
                        <Text style={[commonStyles.text, { 
                          fontSize: 14, 
                          color: colors.primary, 
                          textDecorationLine: 'underline',
                          fontWeight: '500'
                        }]}>
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
                    {/* Optimized Tag Selectors */}
                    <TagSelector
                      title="I am interested in..."
                      items={VOLUNTEER_INTERESTS}
                      selectedItems={formData.interestedIn}
                      onToggleItem={toggleVolunteerInterest}
                      variant="primary"
                    />

                    <TagSelector
                      title="I can contribute..."
                      items={CONTRIBUTION_AREAS}
                      selectedItems={formData.canContribute}
                      onToggleItem={toggleContribution}
                      variant="success"
                    />

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
                            I have signed the Progress NDA*
                          </Text>
                          {hasSignedNDA ? (
                            <Text style={[styles.checkboxSubtext, { color: colors.success }]}>
                              ✓ Signed by {ndaSignerName}
                            </Text>
                          ) : (
                            <TouchableOpacity
                              onPress={() => {
                                // Form data is auto-saved by the custom hook
                                router.replace('/nda');
                              }}
                              style={{ marginTop: 4 }}
                            >
                              <Text style={[styles.checkboxLink, { 
                                color: isDark ? '#60A5FA' : colors.accent 
                              }]}>
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
                          I consent to GDPR & Data Privacy requirements*
                        </Text>
                      </TouchableOpacity>
                    </View>
                </View>

                {/* Cloudflare Turnstile Captcha */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={styles.inputLabel}>
                    Security Verification
                  </Text>
                  <Text style={[commonStyles.text, { fontSize: 14, color: colors.textSecondary, marginBottom: 12, textAlign: 'left' }]}>
                    Please complete the security check to verify you're human.
                  </Text>
                  <View style={{ alignItems: 'center' }}>
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
                </View>

                {/* API Error Notification */}
                {showApiError && apiError && (
                  <Animated.View
                    style={{
                      backgroundColor: isDark ? '#7F1D1D' : '#FEF2F2',
                      borderColor: '#DC2626',
                      borderWidth: 1,
                      borderRadius: 16,
                      padding: 20,
                      marginBottom: 32,
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      ...Platform.OS === 'web' && {
                        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)'
                      }
                    }}
                  >
                    <View style={{
                      backgroundColor: '#DC2626',
                      borderRadius: 12,
                      width: 40,
                      height: 40,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16,
                      marginTop: 2
                    }}>
                      <Ionicons name="alert-circle" size={24} color="#ffffff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: isDark ? '#FCA5A5' : '#991B1B',
                        marginBottom: 4
                      }}>
                        Application Error
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        color: isDark ? '#FCA5A5' : '#B91C1C',
                        lineHeight: 20
                      }}>
                        {apiError}
                      </Text>
                      {apiError.includes('email is already pending') && (
                        <View style={{
                          backgroundColor: isDark ? '#78350F' : '#FEF3C7',
                          borderRadius: 12,
                          padding: 16,
                          marginTop: 12,
                          borderLeftWidth: 3,
                          borderLeftColor: '#F59E0B'
                        }}>
                          <Text style={{ fontSize: 13, color: isDark ? '#FCD34D' : '#92400E', fontWeight: '600', marginBottom: 6 }}>
                            💡 What can you do?
                          </Text>
                          <Text style={{ fontSize: 13, color: isDark ? '#FCD34D' : '#92400E', lineHeight: 20 }}>
                            • Check your email for previous confirmations{'\n'}
                            • Contact support to update your application{'\n'}
                            • Use a different email if submitted in error
                          </Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={dismissApiError}
                      style={{ 
                        padding: 8, 
                        marginTop: -4,
                        ...Platform.OS === 'web' && { cursor: 'pointer' }
                      }}
                    >
                      <Ionicons name="close" size={22} color={isDark ? '#FCA5A5' : '#991B1B'} />
                    </TouchableOpacity>
                  </Animated.View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isLoading || !isFormValid()}
                  style={[
                    {
                      backgroundColor: isFormValid() ? colors.primary : isDark ? '#374151' : '#E5E7EB',
                      borderRadius: isMobile ? 14 : 16,
                      paddingVertical: isMobile ? 16 : 18,
                      paddingHorizontal: isMobile ? 24 : 32,
                      alignItems: 'center',
                      marginTop: 32,
                      borderWidth: 1,
                      borderColor: isFormValid() ? colors.primary : 'transparent'
                    },
                    Platform.OS === 'web' && {
                      cursor: isFormValid() ? 'pointer' : 'not-allowed',
                      boxShadow: isFormValid()
                        ? '0 10px 30px rgba(177, 0, 36, 0.3), 0 1px 0 rgba(255,255,255,0.1) inset'
                        : 'none',
                      transition: 'all 0.2s ease'
                    } as any
                  ]}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      {!isFormValid() && !isLoading && (
                        <Ionicons
                          name="warning-outline"
                          size={20}
                          color={isDark ? '#9CA3AF' : '#6B7280'}
                          style={{ marginRight: 8 }}
                        />
                      )}
                      <Text
                        style={{
                          color: isFormValid() ? '#ffffff' : (isDark ? '#9CA3AF' : '#6B7280'),
                          fontSize: isMobile ? 16 : 18,
                          fontWeight: '600',
                          letterSpacing: -0.2
                        }}
                      >
                        {isLoading ? 'Submitting Application...' :
                          !isFormValid() ? 'Complete Required Fields' : 'Submit Application'}
                      </Text>
                    </View>
                </TouchableOpacity>

                <View style={{ height: 32 }} />

                {/* Helper text when form is invalid */}
                {!isFormValid() && !isLoading && (
                  <View style={{
                    backgroundColor: isDark ? '#78350F' : '#FEF3C7',
                    borderColor: '#F59E0B',
                    borderWidth: 1,
                    borderRadius: 16,
                    padding: 20,
                    marginTop: 24,
                    marginBottom: 16,
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    ...Platform.OS === 'web' && {
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.12)'
                    }
                  }}>
                    <Ionicons 
                      name="information-circle" 
                      size={24} 
                      color={isDark ? '#FCD34D' : '#F59E0B'} 
                      style={{ marginRight: 12, marginTop: 1 }} 
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 15,
                        fontWeight: '600',
                        color: isDark ? '#FCD34D' : '#92400E',
                        marginBottom: 8
                      }}>
                        Please complete the following:
                      </Text>
                      {(() => {
                        const missing = [];
                        const {
                          firstName,
                          lastName,
                          email,
                          constituency,
                          socialMediaHandle,
                          isBritishCitizen,
                          livesInUK,
                          briefBio,
                          briefCV,
                          signedNDA,
                          gdprConsent
                        } = formData;

                        if (!firstName) missing.push('First name');
                        if (!lastName) missing.push('Last name');
                        if (!email) missing.push('Email address');
                        if (!constituency) missing.push('Constituency');
                        if (!socialMediaHandle) missing.push('Social media handle');
                        if (isBritishCitizen === undefined) missing.push('British citizenship status');
                        if (livesInUK === undefined) missing.push('UK residence status');
                        if (!briefBio) missing.push('Brief bio');
                        if (!briefCV) missing.push('Brief CV');
                        if (!signedNDA || !hasSignedNDA) missing.push('Sign the NDA (use link above)');
                        if (!gdprConsent) missing.push('GDPR consent');

                        return missing.map((item, index) => (
                          <Text 
                            key={index} 
                            style={{
                              fontSize: 14,
                              color: isDark ? '#FCD34D' : '#92400E',
                              marginBottom: 4,
                              lineHeight: 20
                            }}
                          >
                            • {item}
                          </Text>
                        ));
                      })()}
                    </View>
                  </View>
                )}

                <Text style={[commonStyles.text, { 
                  fontSize: 13, 
                  color: colors.textSecondary, 
                  textAlign: 'center', 
                  lineHeight: 20,
                  marginTop: 24,
                  opacity: 0.8
                }]}>
                  By volunteering with Progress UK, you agree to our terms of service and privacy policy. 
                  Volunteering is completely free and you can unsubscribe at any time.
                </Text>
              </View>
            </View>
            {/* Add extra space at the bottom for mobile scroll */}
            <View style={{ height: isMobile ? 100 : 150 }} />

            {/* Footer */}
            <Footer />

          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {/* Custom Modal */}

    </View>
  );
}


