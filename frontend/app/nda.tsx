import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  Platform, 
  KeyboardAvoidingView,
  Modal,
  StyleSheet
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Head from 'expo-router/head';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSpring,
  withRepeat
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { getCommonStyles, getColors, getGradients } from '../util/commonStyles';
import { useTheme } from '../util/theme-context';
import useResponsive from '../util/useResponsive';

export default function NDA() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const gradients = getGradients(isDark);
  const commonStyles = getCommonStyles(isDark);
  const { isMobile, width } = useResponsive();
  const styles = getStyles(colors, isMobile, width);
  
  const [name, setName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [showFullNDA, setShowFullNDA] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  // Get current date in DD/MM/YYYY format
  const getCurrentDate = () => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const currentDate = getCurrentDate();

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
  }, []);

  useEffect(() => {
    if (isSuccess) {
      successAnim.value = withSpring(1, { damping: 15 });
      checkmarkScale.value = withSpring(1, { damping: 10 });
    }
  }, [isSuccess]);

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

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!agreed) {
      Alert.alert('Error', 'Please agree to the terms of the NDA to proceed');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call - replace with actual API endpoint
    try {
      // TODO: Send NDA agreement to backend
      console.log('NDA signed by:', name);
      
      // Store NDA signature in local storage for the session
      if (Platform.OS === 'web') {
        localStorage.setItem('NDASignature', JSON.stringify({
          name: name,
          signedAt: new Date().toISOString(),
          agreed: true
        }));
      }
      
      // Show success animation
      setIsLoading(false);
      setIsSuccess(true);
      
      // Auto-redirect after showing success
      setTimeout(() => {
        router.replace('/join');
      }, 2500);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to submit NDA. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <View style={commonStyles.appContainer}>
      <Head>
        <title>NDA - Progress UK</title>
        <meta name="description" content="Confidentiality agreement for Progress UK members. Secure your participation in building Britain's future" />
      </Head>
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
              NDA Signed Successfully!
            </Text>
            
            <Text style={[commonStyles.text, { marginBottom: 24, maxWidth: 400 }]}>
              Thank you {name}! Redirecting you back to complete your application...
            </Text>
            
            <View style={styles.infoContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="information-circle" size={20} color={colors.success} style={{ marginRight: 8 }} />
                <Text style={[commonStyles.text, { fontWeight: '600', color: colors.success }]}>
                  What happens next?
                </Text>
              </View>
              <Text style={[commonStyles.text, { color: colors.success, lineHeight: 20 }]}>
                • You can now complete your volunteer application{'\n'}
                • Your NDA signature is securely stored{'\n'}
                • Redirecting automatically...
              </Text>
            </View>
          </View>
        </Animated.View>
      )}
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {!isSuccess && (
          <ScrollView 
            style={[{ flex: 1 }, styles.scrollView]} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            {/* Main Content */}
            <View style={commonStyles.content}>
              {/* Hero Section */}
              <Animated.View style={[fadeInStyle, styles.heroContainer]}>
                <View style={styles.highlightContainer}>
                  <LinearGradient
                    colors={gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={commonStyles.highlightBackground}
                  >
                    <Text style={commonStyles.highlightText}>Confidentiality Agreement</Text>
                  </LinearGradient>
                </View>
                
                <Text style={[commonStyles.title, { 
                  fontSize: isMobile ? 32 : 48, 
                  marginBottom: 20,
                  textAlign: 'center',
                  paddingHorizontal: isMobile ? 16 : 0
                }]}>
                  Secure Your Access
                </Text>
                
                <Text style={[commonStyles.text, { 
                  fontSize: isMobile ? 16 : 18, 
                  marginBottom: 32, 
                  lineHeight: isMobile ? 24 : 28, 
                  maxWidth: isMobile ? width - 32 : 600,
                  textAlign: 'center',
                  paddingHorizontal: isMobile ? 16 : 0
                }]}>
                  To protect sensitive information and maintain confidentiality within Progress UK, all volunteers must sign our confidentiality agreement.
                </Text>

                <View style={styles.benefitsRow}>
                  <Ionicons name="shield-checkmark" size={20} color={colors.success} />
                  <Text style={[commonStyles.text, { marginLeft: 8 }]}>
                    Secure • Confidential • Legally Binding
                  </Text>
                </View>
              </Animated.View>

              {/* Form Container */}
              <Animated.View style={[fadeInStyle, styles.formContainer]}>
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
                    <MaterialIcons name="security" size={32} color={colors.text} />
                  </LinearGradient>
                  <Text 
                    style={[commonStyles.title, { 
                      fontSize: 28,
                      marginBottom: 8
                    }]}
                  >
                    Confidentiality Agreement
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
                    Bletchley Point Ltd. • Dated {currentDate}
                  </Text>
                </View>

                {/* NDA Content */}
                <View style={{ marginBottom: 32 }}>
                  <Text style={[styles.inputLabel, { fontSize: 18, marginBottom: 16 }]}>
                    Agreement Overview
                  </Text>
                  <Text style={[commonStyles.text, { fontSize: 14, color: colors.textSecondary, marginBottom: 16, textAlign: 'left' }]}>
                    This confidentiality agreement is between Bletchley Point Ltd., and any future entity to which 
                    the venture may be renamed (the "Company"), represented by Maxi Gorynski [General Director], 
                    and you (the "New Member").
                  </Text>

                  <Text style={[styles.inputLabel, { fontSize: 16, marginBottom: 12 }]}>
                    Key Terms:
                  </Text>
                  
                  <View style={{ marginBottom: 16 }}>
                    <View style={styles.termItem}>
                      <View style={styles.termBullet} />
                      <Text style={[commonStyles.text, { fontSize: 14, flex: 1, lineHeight: 22, textAlign: 'left' }]}>
                        <Text style={{ fontWeight: '600' }}>Non-Disclosure:</Text> You agree not to copy, distribute, 
                        or disseminate any Company materials including documents, strategic plans, contact registers, 
                        software products, and financial information.
                      </Text>
                    </View>
                    
                    <View style={styles.termItem}>
                      <View style={styles.termBullet} />
                      <Text style={[commonStyles.text, { fontSize: 14, flex: 1, lineHeight: 22, textAlign: 'left' }]}>
                        <Text style={{ fontWeight: '600' }}>Purpose Limitation:</Text> Confidential information may only 
                        be used for work with Bletchley Point and its subsidiaries, including the Progress party.
                      </Text>
                    </View>
                    
                    <View style={styles.termItem}>
                      <View style={styles.termBullet} />
                      <Text style={[commonStyles.text, { fontSize: 14, flex: 1, lineHeight: 22, textAlign: 'left' }]}>
                        <Text style={{ fontWeight: '600' }}>No Commercial Use:</Text> You shall not use confidential 
                        information for any commercial reason, independently or with third parties.
                      </Text>
                    </View>
                    
                    <View style={styles.termItem}>
                      <View style={styles.termBullet} />
                      <Text style={[commonStyles.text, { fontSize: 14, flex: 1, lineHeight: 22, textAlign: 'left' }]}>
                        <Text style={{ fontWeight: '600' }}>Duration:</Text> Obligations continue for 5 years from 
                        this agreement date, with trade secrets protected as long as they remain confidential.
                      </Text>
                    </View>
                    
                    <View style={styles.termItem}>
                      <View style={styles.termBullet} />
                      <Text style={[commonStyles.text, { fontSize: 14, flex: 1, lineHeight: 22, textAlign: 'left' }]}>
                        <Text style={{ fontWeight: '600' }}>Health & Social Care Exception:</Text> This agreement does 
                        not restrict discussion of matters pertaining solely to health and social care policy.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.warningContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <Ionicons name="warning" size={20} color={colors.warning} style={{ marginRight: 8, marginTop: 2 }} />
                      <Text style={[commonStyles.text, { fontSize: 14, color: colors.warning, flex: 1, lineHeight: 20, textAlign: 'left' }]}>
                        <Text style={{ fontWeight: '600' }}>Important:</Text> This is a legally binding agreement. 
                        Please read the full terms carefully. By signing, you acknowledge understanding and agreement 
                        to all terms and conditions.
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    onPress={() => setShowFullNDA(true)}
                    style={styles.viewFullButton}
                  >
                    <MaterialIcons name="article" size={20} color={colors.accent} style={{ marginRight: 8 }} />
                    <Text style={[commonStyles.text, { color: colors.accent, fontSize: 14, fontWeight: '500' }]}>
                      View Full Legal Document
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Name Input */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={styles.inputLabel}>
                    Your Name *
                  </Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                    placeholder="Enter your full legal name"
                    placeholderTextColor={colors.textSecondary}
                    style={[
                      styles.textInput,
                      nameFocused && styles.textInputFocused
                    ]}
                    autoCapitalize="words"
                    autoComplete="name"
                  />
                </View>

                {/* Agreement Checkbox */}
                <TouchableOpacity 
                  onPress={() => setAgreed(!agreed)}
                  style={[
                    styles.optionCard,
                    agreed && styles.optionCardSelected
                  ]}
                >
                  <View style={[
                    styles.checkbox,
                    agreed && styles.checkboxSelected
                  ]}>
                    {agreed && (
                      <Ionicons name="checkmark" size={16} color={colors.text} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionTitle, agreed && styles.optionTitleSelected]}>
                      I agree to the terms
                    </Text>
                    <Text style={[styles.optionDescription, agreed && styles.optionDescriptionSelected]}>
                      I have read, understood, and agree to be bound by the terms of this Confidentiality Agreement. 
                      I acknowledge that this creates a legally binding obligation.
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isLoading || !name.trim() || !agreed}
                  style={[
                    styles.submitButton,
                    (!name.trim() || !agreed) && styles.submitButtonDisabled
                  ]}
                >
                  <LinearGradient
                    colors={(!name.trim() || !agreed) ? [colors.border, colors.border] : gradients.accent}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButtonGradient}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      {isLoading ? (
                        <>
                          <Animated.View style={[rotateStyle, { marginRight: 8 }]}>
                            <Ionicons name="refresh" size={20} color={colors.text} />
                          </Animated.View>
                          <Text style={styles.submitButtonText}>
                            Signing NDA...
                          </Text>
                        </>
                      ) : (
                        <>
                          <MaterialIcons name="security" size={20} color={colors.text} style={{ marginRight: 8 }} />
                          <Text style={styles.submitButtonText}>
                            Sign NDA Agreement
                          </Text>
                        </>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => router.back()}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
            {/* Bottom spacing */}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {/* Full NDA Modal */}
      <Modal
        visible={showFullNDA}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={styles.modalHeader}>
            <Text style={[commonStyles.title, { fontSize: 18 }]}>
              Confidentiality Agreement - Full Text
            </Text>
            <TouchableOpacity onPress={() => setShowFullNDA(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={[{ flex: 1, padding: 16 }, styles.scrollView]} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            <View style={styles.modalContent}>
              <Text style={[commonStyles.title, { fontSize: 20, marginBottom: 8 }]}>
                Bletchley Point Ltd.
              </Text>
              <Text style={[commonStyles.title, { fontSize: 18, marginBottom: 16 }]}>
                Confidentiality Agreement
              </Text>
              <Text style={[commonStyles.text, { fontSize: 14, color: colors.textSecondary, marginBottom: 24 }]}>
                This confidentiality agreement (the "Agreement") is dated {currentDate}.
              </Text>

              <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 16, textAlign: 'left' }]}>
                The Agreement is to hold between Bletchley Point Ltd., and any future entity to which the venture in question may in future be renamed (the "Company"), represented by Maxi Gorynski [General Director], and <Text style={{ fontWeight: '600' }}>You</Text> (the "New Member").
              </Text>

              <Text style={[styles.inputLabel, { fontSize: 16, marginBottom: 12 }]}>
                Definitions
              </Text>
              <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 8, textAlign: 'left' }]}>
                For the purposes of this Agreement:
              </Text>
              <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 16, textAlign: 'left' }]}>
                "Confidential Information" means any and all non-public information disclosed by the Company to the New Member, including but not limited to:
              </Text>

              <View style={{ marginLeft: 16, marginBottom: 16 }}>
                <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 4, textAlign: 'left' }]}>
                  • Technological products, software, systems, and technical specifications
                </Text>
                <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 4, textAlign: 'left' }]}>
                  • Electoral strategies, campaign plans, and political positioning
                </Text>
                <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 4, textAlign: 'left' }]}>
                  • Communication plans, messaging strategies, and media relations approaches
                </Text>
                <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 4, textAlign: 'left' }]}>
                  • Logistical operational plans, organizational structures, and strategic initiatives
                </Text>
                <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 4, textAlign: 'left' }]}>
                  • Financial information, budgets, and resource allocation plans
                </Text>
                <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 4, textAlign: 'left' }]}>
                  • Donor lists, supporter databases, and contact registers
                </Text>
                <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 4, textAlign: 'left' }]}>
                  • Internal documents, correspondence, and meeting records
                </Text>
                <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 4, textAlign: 'left' }]}>
                  • Any other proprietary information that a political organization would reasonably consider confidential
                </Text>
              </View>

              <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 16, textAlign: 'left' }]}>
                Confidential Information does not include information that falls within the exclusions set forth in Section 1A of this Agreement.
              </Text>

              <Text style={[styles.inputLabel, { fontSize: 16, marginBottom: 8, marginTop: 16 }]}>
                1A. Exclusions
              </Text>
              <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 8, textAlign: 'left' }]}>
                The following information shall not be deemed "Confidential Information":
              </Text>
              <View style={{ marginLeft: 16, marginBottom: 16 }}>
                <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 4, textAlign: 'left' }]}>
                  • Information that is or becomes publicly available through no breach of this Agreement
                </Text>
                <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 4, textAlign: 'left' }]}>
                  • Information that was known to the New Member prior to disclosure by the Company
                </Text>
                <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 4, textAlign: 'left' }]}>
                  • Information independently developed by the New Member without use of Confidential Information
                </Text>
                <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 4, textAlign: 'left' }]}>
                  • Information required to be disclosed by law or court order (with advance notice to Company)
                </Text>
                <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 4, textAlign: 'left' }]}>
                  • Information pertaining solely to health and social care policy
                </Text>
              </View>

              <Text style={[styles.inputLabel, { fontSize: 16, marginBottom: 8, marginTop: 16 }]}>
                1. Non-Disclosure of Confidential Information
              </Text>
              <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 16, textAlign: 'left' }]}>
                By signing this confidentiality agreement, the New Member agrees to maintain strict confidentiality of all information provided by the Company and shall not copy, distribute, or disseminate any Company materials including documents, strategic plans, contact registers, software products, and financial information.
              </Text>

              <Text style={[styles.inputLabel, { fontSize: 16, marginBottom: 8, marginTop: 16 }]}>
                2. Permitted Use
              </Text>
              <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 16, textAlign: 'left' }]}>
                Confidential information may only be used for work with Bletchley Point and its subsidiaries, including the Progress party. The New Member shall not use confidential information for any commercial reason, independently or with third parties.
              </Text>

              <Text style={[styles.inputLabel, { fontSize: 16, marginBottom: 8, marginTop: 16 }]}>
                3. Duration and Return of Information
              </Text>
              <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 8, textAlign: 'left' }]}>
                The obligations under this Agreement shall continue for a period of five (5) years from the date of this Agreement. Trade secrets shall be protected as long as they remain confidential.
              </Text>
              <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 16, textAlign: 'left' }]}>
                Upon termination of the New Member's relationship with the Company, or upon request, all confidential materials must be returned or destroyed, including all copies and derivative works.
              </Text>

              <Text style={[styles.inputLabel, { fontSize: 16, marginBottom: 8, marginTop: 16 }]}>
                4. Legal Remedies
              </Text>
              <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 16, textAlign: 'left' }]}>
                The New Member acknowledges that breach of this Agreement may cause irreparable harm to the Company for which monetary damages would be inadequate. Therefore, the Company shall be entitled to seek injunctive relief and other equitable remedies.
              </Text>

              <Text style={[styles.inputLabel, { fontSize: 16, marginBottom: 8, marginTop: 16 }]}>
                5. Governing Law
              </Text>
              <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 16, textAlign: 'left' }]}>
                This Agreement shall be governed by and construed in accordance with the laws of England and Wales. Any disputes arising under this Agreement shall be subject to the exclusive jurisdiction of the courts of England and Wales.
              </Text>

              <Text style={[styles.inputLabel, { fontSize: 16, marginBottom: 8, marginTop: 16 }]}>
                6. Severability
              </Text>
              <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 16, textAlign: 'left' }]}>
                If any provision of this Agreement is found to be unenforceable, the remainder of the Agreement shall remain in full force and effect.
              </Text>

              <Text style={[styles.inputLabel, { fontSize: 16, marginBottom: 8, marginTop: 16 }]}>
                7. Entire Agreement
              </Text>
              <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 16, textAlign: 'left' }]}>
                This Agreement constitutes the entire agreement between the parties concerning the subject matter hereof and supersedes all prior agreements and understandings.
              </Text>

              <Text style={[styles.inputLabel, { fontSize: 16, marginBottom: 8, marginTop: 16 }]}>
                Agreement and Signature
              </Text>
              <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 16, textAlign: 'left' }]}>
                By signing this Agreement, both parties acknowledge that they have read, understood, and agree to be bound by these terms and conditions.
              </Text>

              <View style={{ backgroundColor: `${colors.warning}20`, borderColor: colors.warning, borderWidth: 1, borderRadius: 8, padding: 16, marginTop: 24 }}>
                <Text style={[commonStyles.text, { fontSize: 14, color: colors.warning, lineHeight: 20, textAlign: 'left', fontWeight: '600' }]}>
                  IMPORTANT LEGAL NOTICE: This is a legally binding confidentiality agreement. Please read all terms carefully before signing. By proceeding with the digital signature, you acknowledge full understanding and acceptance of all obligations outlined herein.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  heroContainer: {
    alignItems: 'center',
    marginBottom: isMobile ? 40 : 60,
    paddingVertical: isMobile ? 20 : 40,
    paddingHorizontal: isMobile ? 16 : 0,
  },
  highlightContainer: {
    marginBottom: 16,
  },
  benefitsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  formContainer: {
    backgroundColor: colors.background === '#ffffff' ? `${colors.surface}95` : `${colors.surface}80`,
    borderRadius: isMobile ? 16 : 24,
    padding: isMobile ? 20 : 40,
    maxWidth: isMobile ? width - 32 : 700,
    alignSelf: 'center',
    width: '100%',
    marginHorizontal: isMobile ? 16 : 0,
    borderWidth: 1,
    borderColor: colors.background === '#ffffff' ? `${colors.text}25` : `${colors.text}20`,
    position: 'relative',
    zIndex: 2,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(10px)',
    } as any),
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
  textInputFocused: {
    borderColor: colors.accent,
  },
  termItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  termBullet: {
    backgroundColor: colors.accent,
    borderRadius: 4,
    width: 8,
    height: 8,
    marginTop: 8,
    marginRight: 12,
  },
  warningContainer: {
    backgroundColor: `${colors.warning}20`,
    borderColor: colors.warning,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  viewFullButton: {
    backgroundColor: colors.background === '#ffffff' ? `${colors.surface}60` : `${colors.surface}40`,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
    ...(Platform.OS === 'web' && { 
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as any)
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background === '#ffffff' ? `${colors.surface}60` : `${colors.surface}40`,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.background === '#ffffff' ? `${colors.text}25` : `${colors.text}20`,
    marginBottom: 32,
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
    marginTop: 2,
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
    lineHeight: 20,
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
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    ...(Platform.OS === 'web' && { 
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as any)
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
    ...(Platform.OS === 'web' && {
      fontFamily: "'Montserrat', sans-serif",
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollView: {
    ...(Platform.OS === 'web' && {
      // Custom scrollbar for web
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: colors.background === '#ffffff' ? '#f1f1f1' : '#2a2a2a',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: colors.accent,
        borderRadius: '4px',
        opacity: 0.7,
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: colors.accent,
        opacity: 1,
      },
    } as any),
  },
  scrollViewContent: {
    paddingBottom: Platform.OS === 'web' ? 20 : 0,
  },
});
