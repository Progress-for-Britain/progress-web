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
        <Animated.View style={[successStyle, {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: `${colors.background}F0`,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          paddingHorizontal: 20,
          ...Platform.OS === 'web' && {
            backdropFilter: 'blur(10px)'
          }
        }]}>
          <View style={{
            backgroundColor: isDark ? `${colors.surface}95` : '#ffffff',
            borderRadius: isMobile ? 20 : 28,
            padding: isMobile ? 32 : 48,
            maxWidth: isMobile ? width - 40 : 500,
            width: '100%',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: isDark ? `${colors.text}15` : '#E5E7EB',
            ...Platform.OS === 'web' && {
              boxShadow: isDark 
                ? '0 20px 60px rgba(0,0,0,0.40), 0 1px 0 rgba(255,255,255,0.05) inset'
                : '0 20px 60px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.9) inset'
            }
          }}>
            <Animated.View style={[checkmarkStyle, {
              backgroundColor: colors.success,
              borderRadius: 40,
              width: 80,
              height: 80,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              ...Platform.OS === 'web' && {
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3), 0 1px 0 rgba(255,255,255,0.2) inset'
              }
            }]}>
              <Ionicons name="checkmark" size={44} color="#ffffff" />
            </Animated.View>
            
            <Text style={[commonStyles.title, { 
              marginBottom: 12,
              fontSize: isMobile ? 24 : 28,
              textAlign: 'center',
              fontWeight: '700'
            }]}>
              NDA Signed Successfully!
            </Text>
            
            <Text style={[commonStyles.text, { 
              marginBottom: 28, 
              maxWidth: 400,
              textAlign: 'center',
              color: colors.textSecondary,
              lineHeight: 24
            }]}>
              Thank you {name}! Redirecting you back to complete your application...
            </Text>
            
            <View style={{
              backgroundColor: isDark ? `${colors.success}15` : '#ECFDF5',
              borderRadius: 16,
              padding: 20,
              width: '100%',
              borderWidth: 1,
              borderColor: isDark ? `${colors.success}30` : '#D1FAE5'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Ionicons name="information-circle" size={20} color={colors.success} style={{ marginRight: 8 }} />
                <Text style={[commonStyles.text, { fontWeight: '600', color: colors.success, fontSize: 15 }]}>
                  What happens next?
                </Text>
              </View>
              <Text style={[commonStyles.text, { color: colors.success, lineHeight: 22, fontSize: 14 }]}>
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
            contentContainerStyle={{ 
              paddingTop: isMobile ? 80 : 100,
              paddingBottom: 100,
              paddingHorizontal: isMobile ? 20 : 40
            }}
          >
            {/* Main Content */}
            <View style={{ maxWidth: 900, marginHorizontal: 'auto', width: '100%' }}>
              {/* Hero Section */}
              <Animated.View style={[fadeInStyle, { 
                alignItems: 'center', 
                marginBottom: isMobile ? 48 : 60,
                paddingHorizontal: isMobile ? 0 : 20
              }]}>
                <View style={{ marginBottom: 20 }}>
                  <View style={{
                    backgroundColor: isDark ? '#001A4F' : '#F0F4FF',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: isDark ? '#123995' : '#E0E7FF'
                  }}>
                    <Text style={{
                      color: isDark ? '#60A5FA' : '#001A4F',
                      fontSize: 13,
                      fontWeight: '600',
                      letterSpacing: 0.5,
                      textTransform: 'uppercase'
                    }}>Confidentiality Agreement</Text>
                  </View>
                </View>
                
                <Text style={[commonStyles.title, { 
                  fontSize: isMobile ? 36 : 56, 
                  marginBottom: 16,
                  textAlign: 'center',
                  fontWeight: '700',
                  letterSpacing: -1,
                  color: colors.text
                }]}>
                  Secure Your Access
                </Text>
                
                <Text style={[commonStyles.text, { 
                  fontSize: isMobile ? 16 : 19, 
                  marginBottom: 32, 
                  lineHeight: isMobile ? 26 : 30, 
                  maxWidth: isMobile ? width - 40 : 680,
                  textAlign: 'center',
                  color: colors.textSecondary,
                  fontWeight: '400'
                }]}>
                  To protect sensitive information and maintain confidentiality within Progress UK, all volunteers must sign our confidentiality agreement.
                </Text>

                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: isDark ? `${colors.success}15` : '#ECFDF5',
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: isDark ? `${colors.success}30` : '#D1FAE5'
                }}>
                  <Ionicons name="shield-checkmark" size={20} color={colors.success} />
                  <Text style={[commonStyles.text, { 
                    fontSize: 14,
                    color: colors.success,
                    fontWeight: '500'
                  }]}>
                    Secure • Confidential • Legally Binding
                  </Text>
                </View>
              </Animated.View>

              {/* Form Container */}
              <Animated.View style={[fadeInStyle, {
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
                    <MaterialIcons name="security" size={36} color={isDark ? '#60A5FA' : '#001A4F'} />
                  </View>
                  <Text 
                    style={[commonStyles.title, { 
                      fontSize: isMobile ? 24 : 32,
                      marginBottom: 8,
                      fontWeight: '700',
                      letterSpacing: -0.5
                    }]}
                  >
                    Confidentiality Agreement
                  </Text>
                  <Text 
                    style={[commonStyles.text, {
                      fontSize: isMobile ? 14 : 16,
                      color: colors.textSecondary,
                      lineHeight: 24,
                      marginBottom: 4,
                      textAlign: 'center',
                      fontWeight: '400'
                    }]}
                  >
                    Progress • Dated {currentDate}
                  </Text>
                  <Text 
                    style={[commonStyles.text, {
                      fontSize: 12,
                      color: colors.textSecondary,
                      marginBottom: 0,
                      textAlign: 'center',
                      fontStyle: 'italic',
                      opacity: 0.7
                    }]}
                  >
                    Electoral Commission Registration: RPP 128-595-401
                  </Text>
                </View>

                {/* NDA Content */}
                <View style={{ marginBottom: 32 }}>
                  <Text style={[styles.inputLabel, { fontSize: 18, marginBottom: 16, fontWeight: '600', letterSpacing: -0.3 }]}>
                    Agreement Overview
                  </Text>
                  <Text style={[commonStyles.text, { fontSize: 14, color: colors.textSecondary, marginBottom: 20, textAlign: 'left', lineHeight: 22 }]}>
                    This confidentiality agreement is between Progress, and any future entity to which 
                    the venture may be renamed (the "Company"), represented by Maxi Gorynski [General Director], 
                    and you (the "New Member").
                  </Text>

                  <Text style={[styles.inputLabel, { fontSize: 16, marginBottom: 14, fontWeight: '600', letterSpacing: -0.2 }]}>
                    Key Terms:
                  </Text>
                  
                  <View style={{ marginBottom: 20 }}>
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
                        be used for work with Progress and its subsidiaries, including the Progress party.
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

                  <View style={{
                    backgroundColor: isDark ? '#78350F' : '#FEF3C7',
                    borderColor: '#F59E0B',
                    borderWidth: 1,
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 24
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <Ionicons name="warning" size={24} color={isDark ? '#FCD34D' : '#F59E0B'} style={{ marginRight: 12, marginTop: 2 }} />
                      <Text style={[commonStyles.text, { fontSize: 14, color: isDark ? '#FCD34D' : '#92400E', flex: 1, lineHeight: 22, textAlign: 'left' }]}>
                        <Text style={{ fontWeight: '600' }}>Important:</Text> This is a legally binding agreement. 
                        Please read the full terms carefully. By signing, you acknowledge understanding and agreement 
                        to all terms and conditions.
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    onPress={() => setShowFullNDA(true)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isDark ? `${colors.primary}15` : '#FEF2F2',
                      paddingVertical: 14,
                      paddingHorizontal: 20,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isDark ? `${colors.primary}30` : '#FEE2E2',
                      ...Platform.OS === 'web' && {
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }
                    }}
                  >
                    <MaterialIcons name="article" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                    <Text style={[commonStyles.text, { color: colors.primary, fontSize: 14, fontWeight: '600' }]}>
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
                      nameFocused && {
                        borderColor: colors.primary,
                        ...Platform.OS === 'web' && {
                          boxShadow: `0 0 0 3px ${colors.primary}20`
                        }
                      }
                    ]}
                    autoCapitalize="words"
                    autoComplete="name"
                  />
                </View>

                {/* Agreement Checkbox */}
                <TouchableOpacity 
                  onPress={() => setAgreed(!agreed)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: agreed 
                      ? (isDark ? `${colors.success}15` : '#ECFDF5')
                      : (isDark ? `${colors.surface}40` : '#F9FAFB'),
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: agreed ? colors.success : (isDark ? `${colors.text}20` : '#E5E7EB'),
                    marginBottom: 24,
                    ...Platform.OS === 'web' && {
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: agreed ? '0 2px 8px rgba(16, 185, 129, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)'
                    }
                  }}
                >
                  <View style={{
                    width: 22,
                    height: 22,
                    borderWidth: 2,
                    borderColor: agreed ? colors.success : (isDark ? `${colors.text}30` : '#D1D5DB'),
                    borderRadius: 6,
                    backgroundColor: agreed ? colors.success : (isDark ? `${colors.surface}20` : '#ffffff'),
                    marginRight: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...Platform.OS === 'web' && agreed && {
                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3), 0 1px 0 rgba(255,255,255,0.2) inset'
                    }
                  }}>
                    {agreed && (
                      <Ionicons name="checkmark" size={16} color="#ffffff" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 15,
                      fontWeight: '600',
                      color: colors.text,
                      marginBottom: 4,
                      letterSpacing: -0.2
                    }}>
                      I agree to the terms
                    </Text>
                    <Text style={{
                      fontSize: 13,
                      color: colors.textSecondary,
                      lineHeight: 20
                    }}>
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
                    {
                      backgroundColor: (name.trim() && agreed) ? colors.primary : (isDark ? '#374151' : '#E5E7EB'),
                      borderRadius: isMobile ? 14 : 16,
                      paddingVertical: isMobile ? 16 : 18,
                      paddingHorizontal: isMobile ? 24 : 32,
                      alignItems: 'center',
                      marginTop: 8,
                      borderWidth: 1,
                      borderColor: (name.trim() && agreed) ? colors.primary : 'transparent'
                    },
                    Platform.OS === 'web' && {
                      cursor: (name.trim() && agreed) ? 'pointer' : 'not-allowed',
                      boxShadow: (name.trim() && agreed)
                        ? '0 10px 30px rgba(177, 0, 36, 0.3), 0 1px 0 rgba(255,255,255,0.1) inset'
                        : 'none',
                      transition: 'all 0.2s ease'
                    } as any
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    {isLoading ? (
                      <>
                        <Animated.View style={[rotateStyle, { marginRight: 8 }]}>
                          <Ionicons name="refresh" size={20} color="#ffffff" />
                        </Animated.View>
                        <Text style={{
                          color: '#ffffff',
                          fontSize: isMobile ? 16 : 18,
                          fontWeight: '600',
                          letterSpacing: -0.2
                        }}>
                          Signing NDA...
                        </Text>
                      </>
                    ) : (
                      <>
                        <MaterialIcons 
                          name="security" 
                          size={20} 
                          color={(name.trim() && agreed) ? '#ffffff' : (isDark ? '#9CA3AF' : '#6B7280')} 
                          style={{ marginRight: 8 }} 
                        />
                        <Text style={{
                          color: (name.trim() && agreed) ? '#ffffff' : (isDark ? '#9CA3AF' : '#6B7280'),
                          fontSize: isMobile ? 16 : 18,
                          fontWeight: '600',
                          letterSpacing: -0.2
                        }}>
                          Sign NDA Agreement
                        </Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => router.back()}
                  style={{
                    alignItems: 'center',
                    paddingVertical: 14,
                    marginTop: 12,
                    ...Platform.OS === 'web' && {
                      cursor: 'pointer'
                    }
                  }}
                >
                  <Text style={{
                    color: colors.textSecondary,
                    fontSize: 15,
                    fontWeight: '500'
                  }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
            {/* Bottom spacing */}
            <View style={{ height: isMobile ? 80 : 100 }} />
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
            style={[{ flex: 1, padding: 16 }]} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View style={styles.modalContent}>
              <Text style={[commonStyles.title, { fontSize: 20, marginBottom: 8 }]}>
                Progress
              </Text>
              <Text style={[commonStyles.title, { fontSize: 18, marginBottom: 16 }]}>
                Confidentiality Agreement
              </Text>
              <Text style={[commonStyles.text, { fontSize: 14, color: colors.textSecondary, marginBottom: 24 }]}>
                This confidentiality agreement (the "Agreement") is dated {currentDate}.
              </Text>

              <Text style={[commonStyles.text, { fontSize: 14, lineHeight: 22, marginBottom: 16, textAlign: 'left' }]}>
                The Agreement is to hold between Progress, and any future entity to which the venture in question may in future be renamed (the "Company"), represented by Maxi Gorynski [General Director], and <Text style={{ fontWeight: '600' }}>You</Text> (the "New Member").
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
                Confidential information may only be used for work with Progress and its subsidiaries, including the Progress party. The New Member shall not use confidential information for any commercial reason, independently or with third parties.
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

              <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16, marginTop: 24 }}>
                <Text style={[commonStyles.text, { fontSize: 12, color: colors.textSecondary, textAlign: 'center', fontStyle: 'italic' }]}>
                  Electoral Commission Registration: RPP 128-595-401
                </Text>
              </View>

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
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    letterSpacing: -0.2,
    ...(Platform.OS === 'web' && {
      fontFamily: "'Montserrat', sans-serif",
    }),
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.background === '#ffffff' ? '#E5E7EB' : `${colors.text}20`,
    borderRadius: isMobile ? 10 : 12,
    paddingHorizontal: isMobile ? 14 : 16,
    paddingVertical: isMobile ? 13 : 15,
    fontSize: isMobile ? 15 : 16,
    backgroundColor: colors.background === '#ffffff' ? '#F9FAFB' : `${colors.surface}50`,
    color: colors.text,
    ...(Platform.OS === 'web' && {
      fontFamily: "'Montserrat', sans-serif",
      backdropFilter: 'blur(10px)',
      boxShadow: colors.background === '#ffffff' 
        ? '0 1px 3px rgba(0,0,0,0.05)' 
        : '0 1px 3px rgba(0,0,0,0.2)',
      transition: 'all 0.15s ease'
    } as any),
  },
  termItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingLeft: 4
  },
  termBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 12,
    marginTop: 8
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.background === '#ffffff' ? '#E5E7EB' : `${colors.text}15`,
    backgroundColor: colors.background === '#ffffff' ? '#ffffff' : colors.surface
  },
  modalContent: {
    paddingBottom: 40
  },
  scrollView: {
    flex: 1
  }
});