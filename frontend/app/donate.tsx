import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, ScrollView, ImageBackground } from 'react-native';
import { Stack } from 'expo-router';
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
import Header from '../components/Header';

export default function Donate() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<'one-time' | 'monthly'>('one-time');
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(30);
  const rotateAnim = useSharedValue(0);

  useEffect(() => {
    // Animate elements on mount
    fadeAnim.value = withTiming(1, { duration: 800 });
    slideAnim.value = withSpring(0, { damping: 15 });
    
    // Rotation animation for decorative elements
    rotateAnim.value = withRepeat(
      withTiming(360, { duration: 25000 }),
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
        `Your ${frequency} donation of $${selectedAmount} is being processed. You will be redirected to our secure payment processor.`,
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

    return (
      <TouchableOpacity
        onPress={() => setSelectedAmount(amount)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: selectedAmount === amount ? '#d946ef' : '#ffffff',
          borderWidth: 2,
          borderColor: selectedAmount === amount ? '#d946ef' : '#e5e7eb',
          borderRadius: 16,
          paddingVertical: 20,
          paddingHorizontal: 24,
          marginBottom: 12,
          marginHorizontal: 6,
          flex: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: selectedAmount === amount ? 6 : 2 },
          shadowOpacity: selectedAmount === amount ? 0.15 : 0.05,
          shadowRadius: selectedAmount === amount ? 12 : 6,
          elevation: selectedAmount === amount ? 8 : 3,
          ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
        }}
      >
        <Animated.View style={[{ alignItems: 'center' }, animatedStyle]}>
          <Text 
            style={{ 
              fontSize: 24,
              fontWeight: '700',
              textAlign: 'center',
              color: selectedAmount === amount ? '#ffffff' : '#374151',
              marginBottom: 4
            }}
          >
            £{amount}
          </Text>
          {selectedAmount === amount && (
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

    return (
      <TouchableOpacity
        onPress={() => setFrequency(freq)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: frequency === freq ? '#d946ef' : '#ffffff',
          borderWidth: 2,
          borderColor: frequency === freq ? '#d946ef' : '#e5e7eb',
          borderRadius: 16,
          paddingVertical: 16,
          paddingHorizontal: 24,
          marginHorizontal: 8,
          flex: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: frequency === freq ? 4 : 2 },
          shadowOpacity: frequency === freq ? 0.1 : 0.05,
          shadowRadius: frequency === freq ? 8 : 4,
          elevation: frequency === freq ? 6 : 2,
          ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
        }}
      >
        <Animated.View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
          <Ionicons 
            name={icon as any} 
            size={20} 
            color={frequency === freq ? '#ffffff' : '#6B7280'} 
            style={{ marginRight: 8 }} 
          />
          <Text 
            style={{ 
              fontSize: 16,
              fontWeight: '600',
              textAlign: 'center',
              color: frequency === freq ? '#ffffff' : '#374151'
            }}
          >
            {label}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <Header />
        
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Hero Section with Background Image */}
          <ImageBackground
            source={{ 
              uri: 'https://images.unsplash.com/photo-1559166631-ef208440c75a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
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
                backgroundColor: 'rgba(30, 41, 59, 0.75)',
              }}
            />

            {/* Animated Background Elements */}
            <Animated.View 
              style={[
                {
                  position: 'absolute',
                  top: 40,
                  right: 40,
                  width: 80,
                  height: 80,
                  backgroundColor: 'rgba(217, 70, 239, 0.2)',
                  borderRadius: 40,
                },
                rotateStyle
              ]}
            />

            <Animated.View style={fadeInStyle}>
              <View style={{ alignItems: 'center', maxWidth: 700 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <FontAwesome5 name="heart" size={28} color="#ffffff" style={{ marginRight: 12 }} />
                  <Text 
                    style={{ 
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#f0f9ff',
                      letterSpacing: 1.5,
                      textTransform: 'uppercase'
                    }}
                  >
                    Support Progress
                  </Text>
                </View>
                
                <Text 
                  style={{ 
                    fontSize: Platform.OS === 'web' ? 48 : 32,
                    fontWeight: 'bold',
                    color: '#ffffff',
                    textAlign: 'center',
                    marginBottom: 20,
                    lineHeight: Platform.OS === 'web' ? 56 : 40,
                    textShadowColor: 'rgba(0, 0, 0, 0.3)',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 4,
                  }}
                >
                  Invest in Britain's Future
                </Text>
                
                <Text 
                  style={{ 
                    fontSize: 18,
                    color: '#e0f2fe',
                    textAlign: 'center',
                    lineHeight: 28,
                    maxWidth: 600,
                    marginBottom: 30
                  }}
                >
                  Power our campaigns for unicorn farms, prosperity zones, and policies that unleash innovation across every region of Britain.
                </Text>

                {/* Key impact stats */}
                <View style={{ 
                  flexDirection: Platform.OS === 'web' ? 'row' : 'column',
                  gap: 20,
                  alignItems: 'center',
                  marginBottom: 20
                }}>
                  <View style={{ alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: 16, minWidth: 140 }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ffffff' }}>£2.1M</Text>
                    <Text style={{ fontSize: 14, color: '#cbd5e1', textAlign: 'center' }}>Raised to Date</Text>
                  </View>
                  <View style={{ alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: 16, minWidth: 140 }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ffffff' }}>15K+</Text>
                    <Text style={{ fontSize: 14, color: '#cbd5e1', textAlign: 'center' }}>Active Donors</Text>
                  </View>
                  <View style={{ alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: 16, minWidth: 140 }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ffffff' }}>98%</Text>
                    <Text style={{ fontSize: 14, color: '#cbd5e1', textAlign: 'center' }}>Direct Impact</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          </ImageBackground>

          {/* Donation Form */}
          <View style={{ maxWidth: 700, alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 60 }}>
            <Animated.View 
              style={[
                { 
                  backgroundColor: '#ffffff',
                  borderRadius: 24,
                  padding: 40,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.12,
                  shadowRadius: 20,
                  elevation: 12
                },
                fadeInStyle
              ]}
            >
              <View style={{ alignItems: 'center', marginBottom: 32 }}>
                <View 
                  style={{
                    backgroundColor: '#d946ef20',
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  <MaterialIcons name="volunteer-activism" size={32} color="#d946ef" />
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
                  Make Your Contribution
                </Text>
                <Text 
                  style={{ 
                    fontSize: 16,
                    color: '#6B7280',
                    textAlign: 'center',
                    lineHeight: 24
                  }}
                >
                  Every contribution fuels innovation and progress across Britain
                </Text>
              </View>

              {/* Frequency Selection */}
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 16 }}>
                <Ionicons name="time" size={18} color="#6B7280" style={{ marginRight: 8 }} />
                Donation Frequency
              </Text>
              <View style={{ flexDirection: 'row', marginBottom: 32 }}>
                <FrequencyButton freq="one-time" label="One-time" icon="flash" />
                <FrequencyButton freq="monthly" label="Monthly" icon="refresh" />
              </View>

              {/* Amount Selection */}
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 16 }}>
                <Ionicons name="card" size={18} color="#6B7280" style={{ marginRight: 8 }} />
                Select Amount
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 32 }}>
                {donationAmounts.map((amount) => (
                  <View key={amount} style={{ width: '33.33%', paddingHorizontal: 4 }}>
                    <AmountButton amount={amount} />
                  </View>
                ))}
              </View>

              {/* Impact Description */}
              {selectedAmount && (
                <View 
                  style={{ 
                    backgroundColor: '#f0fdf4',
                    borderLeftWidth: 4,
                    borderLeftColor: '#10b981',
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 32
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <View 
                      style={{
                        backgroundColor: '#10b981',
                        borderRadius: 12,
                        padding: 8,
                        marginRight: 12,
                      }}
                    >
                      <Ionicons name="analytics" size={20} color="#ffffff" />
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#166534' }}>
                      Your Impact: £{selectedAmount} {frequency}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 15, color: '#15803d', lineHeight: 22 }}>
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
                style={{
                  backgroundColor: (!selectedAmount || isLoading) ? '#9CA3AF' : '#d946ef',
                  borderRadius: 16,
                  paddingVertical: 20,
                  marginBottom: 20,
                  shadowColor: '#d946ef',
                  shadowOffset: { width: 0, height: (!selectedAmount || isLoading) ? 0 : 6 },
                  shadowOpacity: (!selectedAmount || isLoading) ? 0 : 0.3,
                  shadowRadius: (!selectedAmount || isLoading) ? 0 : 12,
                  elevation: (!selectedAmount || isLoading) ? 0 : 8,
                  ...(Platform.OS === 'web' && { cursor: (!selectedAmount || isLoading) ? 'not-allowed' : 'pointer' } as any)
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  {!isLoading && (
                    <FontAwesome5 name="heart" size={18} color="#ffffff" style={{ marginRight: 12 }} />
                  )}
                  <Text 
                    style={{ 
                      color: '#ffffff',
                      fontSize: 18,
                      fontWeight: '700',
                      textAlign: 'center'
                    }}
                  >
                    {isLoading ? 'Processing...' : `Donate £${selectedAmount || 0} ${frequency}`}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="shield-checkmark" size={16} color="#10b981" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 18 }}>
                  Secure, encrypted, and GDPR compliant processing
                </Text>
              </View>
            </Animated.View>
          </View>

          {/* Why Donate Section */}
          <View style={{ backgroundColor: '#1e293b', paddingVertical: 80, paddingHorizontal: 20 }}>
            <View style={{ maxWidth: 1000, alignSelf: 'center' }}>
              <View style={{ alignItems: 'center', marginBottom: 60 }}>
                <MaterialIcons name="trending-up" size={48} color="#d946ef" style={{ marginBottom: 20 }} />
                <Text 
                  style={{ 
                    fontSize: 36,
                    fontWeight: 'bold',
                    color: '#ffffff',
                    textAlign: 'center',
                    marginBottom: 16
                  }}
                >
                  Why Your Investment Matters
                </Text>
                <Text 
                  style={{ 
                    fontSize: 18,
                    color: '#cbd5e1',
                    textAlign: 'center',
                    lineHeight: 28,
                    maxWidth: 600
                  }}
                >
                  Every pound you contribute directly powers Britain's innovation economy and progressive policies
                </Text>
              </View>
              
              <View style={{ flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: 24 }}>
                <View style={{ 
                  flex: 1, 
                  backgroundColor: '#334155', 
                  borderRadius: 20, 
                  padding: 30,
                  borderLeftWidth: 4,
                  borderLeftColor: '#d946ef'
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <View 
                      style={{
                        backgroundColor: '#d946ef20',
                        borderRadius: 12,
                        padding: 12,
                        marginRight: 16,
                      }}
                    >
                      <Ionicons name="rocket" size={24} color="#d946ef" />
                    </View>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#ffffff' }}>
                      Innovation Economy
                    </Text>
                  </View>
                  <Text style={{ color: '#cbd5e1', lineHeight: 24, fontSize: 15 }}>
                    Fund unicorn farms, tech incubators, and startup ecosystems that position Britain as the global leader in innovation and entrepreneurship.
                  </Text>
                </View>
                
                <View style={{ 
                  flex: 1, 
                  backgroundColor: '#334155', 
                  borderRadius: 20, 
                  padding: 30,
                  borderLeftWidth: 4,
                  borderLeftColor: '#10b981'
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <View 
                      style={{
                        backgroundColor: '#10b98120',
                        borderRadius: 12,
                        padding: 12,
                        marginRight: 16,
                      }}
                    >
                      <Ionicons name="business" size={24} color="#10b981" />
                    </View>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#ffffff' }}>
                      Prosperity Zones
                    </Text>
                  </View>
                  <Text style={{ color: '#cbd5e1', lineHeight: 24, fontSize: 15 }}>
                    Power Special Economic Zones that give the North its own back, creating high-skilled jobs and rebalancing Britain's economy.
                  </Text>
                </View>
                
                <View style={{ 
                  flex: 1, 
                  backgroundColor: '#334155', 
                  borderRadius: 20, 
                  padding: 30,
                  borderLeftWidth: 4,
                  borderLeftColor: '#f59e0b'
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <View 
                      style={{
                        backgroundColor: '#f59e0b20',
                        borderRadius: 12,
                        padding: 12,
                        marginRight: 16,
                      }}
                    >
                      <Ionicons name="school" size={24} color="#f59e0b" />
                    </View>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#ffffff' }}>
                      Skills Capital
                    </Text>
                  </View>
                  <Text style={{ color: '#cbd5e1', lineHeight: 24, fontSize: 15 }}>
                    Invest in deep skills training, apprenticeships, and lifelong learning programs that build Britain's human capital for the future economy.
                  </Text>
                </View>
              </View>

              {/* Transparency Section */}
              <View style={{ 
                backgroundColor: '#475569', 
                borderRadius: 16, 
                padding: 24, 
                marginTop: 40,
                alignItems: 'center'
              }}>
                <Ionicons name="bar-chart" size={32} color="#10b981" style={{ marginBottom: 16 }} />
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#ffffff', marginBottom: 12, textAlign: 'center' }}>
                  Full Financial Transparency
                </Text>
                <Text style={{ color: '#cbd5e1', textAlign: 'center', lineHeight: 22 }}>
                  98% of donations go directly to programs and campaigns. View our detailed financial reports and impact metrics online.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
