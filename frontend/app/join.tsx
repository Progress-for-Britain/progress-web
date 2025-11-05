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

  // Memoized animated styles to prevent recreation
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
                  {HERO_TEXT.title}
                </Text>

                <Text style={[commonStyles.text, {
                  fontSize: isMobile ? 16 : 18,
                  marginBottom: 32,
                  lineHeight: isMobile ? 24 : 28,
                  maxWidth: isMobile ? width - 32 : 800,
                  textAlign: isMobile ? 'left' : 'justify'
                }]}>
                  {HERO_TEXT.description}
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
                    Volunteer with Progress UK
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
                    Help with campaigns, events, and local organizing
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

                {/* Optimized Personal Information Fields */}
                <PersonalInfoFields
                  formData={formData}
                  onUpdateField={updateField}
                />

                {/* Application Details */}
                <View style={[commonStyles.specialSection, {
                    backgroundColor: `${colors.secondary}20`,
                    borderLeftColor: colors.secondary,
                    borderColor: `${colors.secondary}30`,
                  }]}>
                    <Text style={[commonStyles.title, { fontSize: 18, marginBottom: 16 }]}>
                      Application Details
                    </Text>
                    <Text style={[commonStyles.text, { fontSize: 14, color: colors.textSecondary, marginBottom: 20, textAlign: 'left' }]}>
                      Please complete the following fields for your application. Not sure if you should volunteer? {' '}
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
                            I have signed the Progress NDA *
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
                      onPress={dismissApiError}
                      style={{ padding: 8, marginTop: -4 }}
                    >
                      <Ionicons name="close" size={20} color="#991B1B" />
                    </TouchableOpacity>
                  </Animated.View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleSubmit}
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
                        {isLoading ? 'Submitting Volunteer Application...' :
                          !isFormValid() ? 'Complete Required Fields' : 'Submit Volunteer Application'}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={{ height: 32 }} />

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
                          <Text key={index} style={styles.helperItem}>
                            • {item}
                          </Text>
                        ));
                      })()}
                    </View>
                  </View>
                )}

                <Text style={[commonStyles.text, { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 }]}>
                  By volunteering with Progress UK, you agree to our terms of service and privacy policy. Volunteering is completely free and you can unsubscribe at any time. We'll never share your data with third parties.
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

      {/* Custom Modal */}

    </View>
  );
}


