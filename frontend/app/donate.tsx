import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat
} from "react-native-reanimated";
import Head from 'expo-router/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AuroraBackground } from '../util/auroraComponents';
import { getCommonStyles, getColors, getGradients } from '../util/commonStyles';
import { useTheme } from '../util/theme-context';
import useResponsive from '../util/useResponsive';

export default function Donate() {
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const colors = getColors(isDark);
  const gradients = getGradients(isDark);
  const commonStyles = getCommonStyles(isDark, isMobile, width);
  const styles = getStyles(colors, isMobile, width);

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<'one-time' | 'monthly'>('one-time');
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(30);

  useEffect(() => {
    // Animate elements on mount
    fadeAnim.value = withTiming(1, { duration: 800 });
    slideAnim.value = withSpring(0, { damping: 15 });
  }, []);

  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const donationAmounts = [25, 50, 100, 250, 500, 1000];

  const handleDonate = async () => {
    if (!selectedAmount) {
      Alert.alert('Error', 'Please select a donation amount');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, this would integrate with a payment processor
      Alert.alert(
        'Thank You!',
        `Your ${frequency} donation of £${selectedAmount} is being processed. You will be redirected to our secure payment processor.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process donation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const AmountButton = ({ amount }: { amount: number }) => {
    const buttonAnim = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: buttonAnim.value }],
    }));

    const handlePressIn = () => {
      buttonAnim.value = withSpring(0.95);
    };

    const handlePressOut = () => {
      buttonAnim.value = withSpring(1);
    };

    const isSelected = selectedAmount === amount;

    return (
      <TouchableOpacity
        onPress={() => setSelectedAmount(amount)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.amountButton,
          isSelected && styles.amountButtonSelected
        ]}
      >
        <Animated.View style={[styles.amountButtonContent, animatedStyle]}>
          <Text style={[
            styles.amountButtonText,
            isSelected && styles.amountButtonTextSelected
          ]}>
            £{amount}
          </Text>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const FrequencyButton = ({ freq, label, icon }: { freq: 'one-time' | 'monthly'; label: string; icon: string }) => {
    const buttonAnim = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: buttonAnim.value }],
    }));

    const handlePressIn = () => {
      buttonAnim.value = withSpring(0.95);
    };

    const handlePressOut = () => {
      buttonAnim.value = withSpring(1);
    };

    const isSelected = frequency === freq;

    return (
      <TouchableOpacity
        onPress={() => setFrequency(freq)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.frequencyButton,
          isSelected && styles.frequencyButtonSelected
        ]}
      >
        <Animated.View style={[styles.frequencyButtonContent, animatedStyle]}>
          <Ionicons
            name={icon as any}
            size={20}
            color={isSelected ? '#ffffff' : colors.textSecondary}
            style={{ marginRight: 8 }}
          />
          <Text style={[
            styles.frequencyButtonText,
            isSelected && styles.frequencyButtonTextSelected
          ]}>
            {label}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Head>
        <title>Donate - Progress UK</title>
        <meta name="description" content="Support Progress UK's mission to transform British politics. Your donation helps build the future of governance" />
      </Head>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={commonStyles.appContainer}>
        {/* Header Component */}
        <Header />

        {/* Background aurora effect */}
        <AuroraBackground />

        {/* Donate Page Content */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={commonStyles.content}>
            <Animated.View style={fadeInStyle}>
              {/* Hero Section */}
              <View style={commonStyles.heroContainer}>
                <View style={styles.highlightContainer}>
                  <LinearGradient
                    colors={gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={commonStyles.highlightBackground}
                  >
                    <Text style={commonStyles.highlightText}>Support Progress UK</Text>
                  </LinearGradient>
                </View>

                <Text style={[commonStyles.title, {
                  fontSize: isMobile ? 32 : 48,
                  marginBottom: 20,
                  textAlign: 'center'
                }]}>
                  Invest in Britain's Future
                </Text>

                <Text style={[commonStyles.text, {
                  fontSize: isMobile ? 16 : 18,
                  marginBottom: 32,
                  lineHeight: isMobile ? 24 : 28,
                  maxWidth: isMobile ? width - 32 : 600,
                  textAlign: 'center'
                }]}>
                  Power our campaigns for unicorn farms, prosperity zones, and policies that unleash innovation across every region of Britain. Every contribution fuels progress across the UK.
                </Text>

                <View style={styles.benefitsRow}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={[commonStyles.text, { marginLeft: 8 }]}>
                    Secure donations • Full transparency • 98% direct impact
                  </Text>
                </View>
              </View>

              {/* Key Impact Stats */}
              <View style={commonStyles.statsContainer}>
                <View style={commonStyles.statItem}>
                  <Text style={styles.statNumber}>£2.1M</Text>
                  <Text style={styles.statLabel}>Raised to Date</Text>
                </View>
                <View style={commonStyles.statItem}>
                  <Text style={styles.statNumber}>15K+</Text>
                  <Text style={styles.statLabel}>Active Donors</Text>
                </View>
                <View style={commonStyles.statItem}>
                  <Text style={styles.statNumber}>98%</Text>
                  <Text style={styles.statLabel}>Direct Impact</Text>
                </View>
              </View>

              {/* Donation Form */}
              <View style={[commonStyles.cardContainer, { marginBottom: 60 }]}>
                <View style={commonStyles.sectionHeader}>
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
                    <MaterialIcons name="volunteer-activism" size={32} color={colors.text} />
                  </LinearGradient>
                  <Text style={styles.formTitle}>Make Your Contribution</Text>
                  <Text style={styles.formSubtitle}>Choose your donation frequency and amount below</Text>
                </View>

                {/* Frequency Selection */}
                <Text style={styles.sectionTitle}>
                  <Ionicons name="time" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
                  Donation Frequency
                </Text>
                <View style={commonStyles.buttonRow}>
                  <FrequencyButton freq="one-time" label="One-time" icon="flash" />
                  <FrequencyButton freq="monthly" label="Monthly" icon="refresh" />
                </View>

                {/* Amount Selection */}
                <Text style={styles.sectionTitle}>
                  <Ionicons name="card" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
                  Select Amount
                </Text>
                <View style={commonStyles.tagContainer}>
                  {donationAmounts.map((amount) => (
                    <View key={amount} style={styles.amountButtonWrapper}>
                      <AmountButton amount={amount} />
                    </View>
                  ))}
                </View>

                {/* Impact Description */}
                {selectedAmount && (
                  <View style={styles.impactContainer}>
                    <View style={styles.impactHeader}>
                      <View style={styles.impactIconContainer}>
                        <Ionicons name="analytics" size={20} color="#ffffff" />
                      </View>
                      <Text style={styles.impactTitle}>
                        Your Impact: £{selectedAmount} {frequency}
                      </Text>
                    </View>
                    <Text style={styles.impactDescription}>
                      {selectedAmount >= 500 ?
                        "Powers a full innovation hub deployment in a prosperity zone for one month" :
                        selectedAmount >= 250 ?
                          "Funds skills training programs for 50+ workers in emerging technologies" :
                          selectedAmount >= 100 ?
                            "Supports unicorn farm startup incubation and mentorship programs" :
                            "Helps fund community engagement events and digital infrastructure"
                      }
                    </Text>
                  </View>
                )}

                {/* Donate Button */}
                <TouchableOpacity
                  onPress={handleDonate}
                  disabled={!selectedAmount || isLoading}
                  style={[
                    styles.donateButton,
                    (!selectedAmount || isLoading) && styles.donateButtonDisabled
                  ]}
                >
                  <LinearGradient
                    colors={(!selectedAmount || isLoading) ? [colors.textSecondary, colors.textSecondary] : gradients.accent}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.donateButtonGradient}
                  >
                    <View style={styles.donateButtonContent}>
                      {!isLoading && (
                        <FontAwesome5 name="heart" size={18} color="#ffffff" style={{ marginRight: 12 }} />
                      )}
                      <Text style={styles.donateButtonText}>
                        {isLoading ? 'Processing...' : `Donate £${selectedAmount || 0} ${frequency}`}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.securityNote}>
                  <Ionicons name="shield-checkmark" size={16} color={colors.success} style={{ marginRight: 8 }} />
                  <Text style={styles.securityText}>
                    Secure, encrypted, and GDPR compliant processing
                  </Text>
                </View>
              </View>

              {/* Why Donate Section */}
              <View style={[commonStyles.cardContainer, { marginBottom: 40 }]}>
                <View style={commonStyles.sectionHeader}>
                  <View style={styles.highlightContainer}>
                    <LinearGradient
                      colors={gradients.primary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={commonStyles.highlightBackground}
                    >
                      <Text style={commonStyles.highlightText}>Your Investment Matters</Text>
                    </LinearGradient>
                  </View>
                  <Text style={styles.whyDonateTitle}>Power Britain's Progressive Future</Text>
                  <Text style={styles.whyDonateSubtitle}>
                    Every pound you contribute directly powers Britain's innovation economy and progressive policies
                  </Text>
                </View>

                <View style={commonStyles.cardGrid}>
                  <View style={[styles.causeItem, { borderLeftColor: colors.accent }]}>
                    <LinearGradient
                      colors={[`${colors.accent}20`, `${colors.accent}10`]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ borderRadius: 20, padding: 24, margin: -24, flex: 1, justifyContent: 'space-between' }}
                    >
                      <View>
                        <View style={styles.causeHeader}>
                          <View style={[styles.causeIconContainer, { backgroundColor: `${colors.accent}30` }]}>
                            <Ionicons name="rocket" size={24} color={colors.accent} />
                          </View>
                          <Text style={styles.causeTitle}>Innovation Economy</Text>
                        </View>
                        <Text style={styles.causeDescription}>
                          Fund unicorn farms, tech incubators, and startup ecosystems that position Britain as the global leader in innovation and entrepreneurship.
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>

                  <View style={[styles.causeItem, { borderLeftColor: colors.success }]}>
                    <LinearGradient
                      colors={[`${colors.success}20`, `${colors.success}10`]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ borderRadius: 20, padding: 24, margin: -24, flex: 1, justifyContent: 'space-between' }}
                    >
                      <View>
                        <View style={styles.causeHeader}>
                          <View style={[styles.causeIconContainer, { backgroundColor: `${colors.success}30` }]}>
                            <Ionicons name="business" size={24} color={colors.success} />
                          </View>
                          <Text style={styles.causeTitle}>Prosperity Zones</Text>
                        </View>
                        <Text style={styles.causeDescription}>
                          Power Special Economic Zones that give the North its own back, creating high-skilled jobs and rebalancing Britain's economy.
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>

                  <View style={[styles.causeItem, { borderLeftColor: colors.warning }]}>
                    <LinearGradient
                      colors={[`${colors.warning}20`, `${colors.warning}10`]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ borderRadius: 20, padding: 24, margin: -24, flex: 1, justifyContent: 'space-between' }}
                    >
                      <View>
                        <View style={styles.causeHeader}>
                          <View style={[styles.causeIconContainer, { backgroundColor: `${colors.warning}30` }]}>
                            <Ionicons name="school" size={24} color={colors.warning} />
                          </View>
                          <Text style={styles.causeTitle}>Skills Capital</Text>
                        </View>
                        <Text style={styles.causeDescription}>
                          Invest in deep skills training, apprenticeships, and lifelong learning programs that build Britain's human capital for the future economy.
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>
                </View>

                {/* Transparency Section */}
                <View style={styles.transparencySection}>
                  <Ionicons name="bar-chart" size={32} color={colors.success} style={{ marginBottom: 16 }} />
                  <Text style={styles.transparencyTitle}>Full Financial Transparency</Text>
                  <Text style={styles.transparencyDescription}>
                    98% of donations go directly to programs and campaigns. View our detailed financial reports and impact metrics online.
                  </Text>
                </View>
              </View>
            </Animated.View>
          </View>
          
          {/* Footer */}
          <Footer />

        </ScrollView>
      </View>
    </>
  );
}

const getStyles = (colors: any, isMobile: boolean, width: number) => {
  return StyleSheet.create({
    highlightContainer: {
      marginBottom: 16,
    },
    heroText: {
      lineHeight: 28,
      fontSize: 18,
      textAlign: 'center',
    },
    benefitsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    statLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    iconContainer: {
      backgroundColor: `${colors.accent}20`,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },
    formTitle: {
      fontSize: isMobile ? 24 : 28,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    formSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    sectionTitle: {
      fontSize: isMobile ? 16 : 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    frequencyButton: {
      backgroundColor: colors.background === '#ffffff' ? `${colors.text}08` : `${colors.surface}40`,
      borderWidth: 2,
      borderColor: colors.background === '#ffffff' ? `${colors.text}25` : `${colors.text}30`,
      borderRadius: isMobile ? 12 : 16,
      paddingVertical: isMobile ? 14 : 16,
      paddingHorizontal: isMobile ? 16 : 24,
      flex: 1,
      ...(Platform.OS === 'web' && {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      } as any)
    },
    frequencyButtonSelected: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    frequencyButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    frequencyButtonText: {
      fontSize: isMobile ? 14 : 16,
      fontWeight: '600',
      textAlign: 'center',
      color: colors.text,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    frequencyButtonTextSelected: {
      color: '#ffffff',
    },
    amountButtonWrapper: {
      width: isMobile ? '48%' : '32%',
      marginBottom: isMobile ? 8 : 0,
    },
    amountButton: {
      backgroundColor: colors.background === '#ffffff' ? `${colors.text}08` : `${colors.surface}40`,
      borderWidth: 2,
      borderColor: colors.background === '#ffffff' ? `${colors.text}25` : `${colors.text}30`,
      borderRadius: isMobile ? 12 : 16,
      paddingVertical: isMobile ? 16 : 20,
      paddingHorizontal: 16,
      marginBottom: isMobile ? 8 : 12,
      ...(Platform.OS === 'web' && {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      } as any)
    },
    amountButtonSelected: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    amountButtonContent: {
      alignItems: 'center',
    },
    amountButtonText: {
      fontSize: isMobile ? 20 : 24,
      fontWeight: '700',
      textAlign: 'center',
      color: colors.text,
      marginBottom: 4,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    amountButtonTextSelected: {
      color: '#ffffff',
    },
    impactContainer: {
      backgroundColor: colors.background === '#ffffff' ? `${colors.success}15` : `${colors.success}20`,
      borderLeftWidth: 4,
      borderLeftColor: colors.success,
      borderRadius: isMobile ? 12 : 16,
      padding: isMobile ? 16 : 20,
      marginBottom: 32,
      borderWidth: 1,
      borderColor: `${colors.success}30`,
    },
    impactHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    impactIconContainer: {
      backgroundColor: colors.success,
      borderRadius: 12,
      padding: 8,
      marginRight: 12,
    },
    impactTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.success,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    impactDescription: {
      fontSize: 15,
      color: colors.success,
      lineHeight: 22,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    donateButton: {
      borderRadius: isMobile ? 12 : 16,
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
    donateButtonDisabled: {
      opacity: 0.6,
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      ...(Platform.OS === 'web' && {
        cursor: 'not-allowed'
      } as any)
    },
    donateButtonGradient: {
      paddingVertical: isMobile ? 16 : 18,
      borderRadius: isMobile ? 12 : 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    donateButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    donateButtonText: {
      color: '#ffffff',
      fontSize: isMobile ? 16 : 18,
      fontWeight: '700',
      textAlign: 'center',
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    securityNote: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    securityText: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    whyDonateSection: {
      backgroundColor: colors.background === '#ffffff' ? `${colors.surface}95` : `${colors.surface}80`,
      borderRadius: isMobile ? 16 : 24,
      padding: isMobile ? 24 : 40,
      maxWidth: isMobile ? width - 32 : 1000,
      alignSelf: 'center',
      width: '100%',
      marginHorizontal: isMobile ? 16 : 0,
      marginBottom: 40,
      borderWidth: 1,
      borderColor: colors.background === '#ffffff' ? `${colors.text}25` : `${colors.text}20`,
      position: 'relative',
      zIndex: 2,
      ...(Platform.OS === 'web' && {
        backdropFilter: 'blur(10px)',
      } as any),
    },
    whyDonateHeader: {
      alignItems: 'center',
      marginBottom: 40,
    },
    // Custom section titles for the donate page
    whyDonateTitle: {
      fontSize: isMobile ? 24 : 28,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 16,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    whyDonateSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      maxWidth: 600,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    // Custom cause item styling (extends itemCard)
    causeItem: {
      flex: 1,
      minWidth: isMobile ? width - 64 : 280,
      maxWidth: isMobile ? width - 64 : 350,
      minHeight: isMobile ? 200 : 280,
      backgroundColor: colors.background === '#ffffff' ? `${colors.text}05` : `${colors.surface}40`,
      borderRadius: 20,
      padding: 24,
      borderLeftWidth: 4,
      borderWidth: 1,
      borderColor: colors.background === '#ffffff' ? `${colors.text}20` : `${colors.text}25`,
      marginHorizontal: isMobile ? 0 : 8,
      ...(Platform.OS === 'web' && {
        transition: 'all 0.3s ease',
      } as any),
    },
    causeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    causeIconContainer: {
      borderRadius: 12,
      padding: 12,
      marginRight: 16,
    },
    causeTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    causeDescription: {
      color: colors.textSecondary,
      lineHeight: 24,
      fontSize: 15,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    transparencySection: {
      backgroundColor: colors.background === '#ffffff' ? `${colors.success}10` : `${colors.success}15`,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: `${colors.success}25`,
    },
    transparencyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
      textAlign: 'center',
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
    transparencyDescription: {
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      ...(Platform.OS === 'web' && {
        fontFamily: "'Montserrat', sans-serif",
      }),
    },
  });
};
