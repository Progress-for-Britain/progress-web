import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Header from '../components/Header';

export default function Donate() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<'one-time' | 'monthly'>('one-time');
  const [isLoading, setIsLoading] = useState(false);

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

  const AmountButton = ({ amount }: { amount: number }) => (
    <TouchableOpacity
      onPress={() => setSelectedAmount(amount)}
      style={{
        backgroundColor: selectedAmount === amount ? '#d946ef' : '#ffffff',
        borderWidth: 2,
        borderColor: selectedAmount === amount ? '#d946ef' : '#D1D5DB',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        marginBottom: 12,
        marginHorizontal: 6,
        flex: 1,
        ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
      }}
    >
      <Text 
        style={{ 
          fontSize: 20,
          fontWeight: '600',
          textAlign: 'center',
          color: selectedAmount === amount ? '#ffffff' : '#374151'
        }}
      >
        ${amount}
      </Text>
    </TouchableOpacity>
  );

  const FrequencyButton = ({ freq, label }: { freq: 'one-time' | 'monthly'; label: string }) => (
    <TouchableOpacity
      onPress={() => setFrequency(freq)}
      style={{
        backgroundColor: frequency === freq ? '#d946ef' : '#ffffff',
        borderWidth: 2,
        borderColor: frequency === freq ? '#d946ef' : '#D1D5DB',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginHorizontal: 8,
        flex: 1,
        ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
      }}
    >
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
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <Header />
        
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
              Fund the Future
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
              Your contribution helps us build grassroots campaigns, support progressive candidates, and create lasting change in our communities.
            </Text>
          </View>

          {/* Donation Form */}
          <View style={{ maxWidth: 600, alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 40 }}>
            <View 
              style={{ 
                backgroundColor: '#ffffff',
                borderRadius: 16,
                padding: 32,
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
                Make a Donation
              </Text>

              {/* Frequency Selection */}
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 12 }}>
                Donation Frequency
              </Text>
              <View style={{ flexDirection: 'row', marginBottom: 24 }}>
                <FrequencyButton freq="one-time" label="One-time" />
                <FrequencyButton freq="monthly" label="Monthly" />
              </View>

              {/* Amount Selection */}
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 12 }}>
                Select Amount
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
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
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 24
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#166534', marginBottom: 8 }}>
                    Your Impact: ${selectedAmount} {frequency}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#15803d', lineHeight: 20 }}>
                    {selectedAmount >= 500 ? 
                      "Funds a full week of grassroots organizing in a key district" :
                      selectedAmount >= 250 ?
                      "Supports voter outreach for 500+ constituents" :
                      selectedAmount >= 100 ?
                      "Powers digital campaigns reaching 1,000+ people" :
                      "Helps fund community event materials and supplies"
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
                  borderRadius: 12,
                  paddingVertical: 16,
                  marginBottom: 16,
                  ...(Platform.OS === 'web' && { cursor: (!selectedAmount || isLoading) ? 'not-allowed' : 'pointer' } as any)
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
                  {isLoading ? 'Processing...' : `Donate $${selectedAmount || 0} ${frequency}`}
                </Text>
              </TouchableOpacity>

              <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 18 }}>
                Your donation is secure and encrypted. We use industry-standard security measures to protect your information.
              </Text>
            </View>
          </View>

          {/* Why Donate Section */}
          <View style={{ backgroundColor: '#f3f4f6', paddingVertical: 40, paddingHorizontal: 16 }}>
            <View style={{ maxWidth: 800, alignSelf: 'center' }}>
              <Text 
                style={{ 
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#111827',
                  textAlign: 'center',
                  marginBottom: 24
                }}
              >
                Why Your Donation Matters
              </Text>
              
              <View style={{ flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: 24 }}>
                <View style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: 12, padding: 20 }}>
                  <Text style={{ fontSize: 18, fontWeight: '600', color: '#d946ef', marginBottom: 8 }}>
                    🗳️ Electoral Impact
                  </Text>
                  <Text style={{ color: '#6B7280', lineHeight: 22 }}>
                    Support progressive candidates and ballot initiatives that align with our values of equality and justice.
                  </Text>
                </View>
                
                <View style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: 12, padding: 20 }}>
                  <Text style={{ fontSize: 18, fontWeight: '600', color: '#d946ef', marginBottom: 8 }}>
                    🏘️ Community Programs
                  </Text>
                  <Text style={{ color: '#6B7280', lineHeight: 22 }}>
                    Fund local initiatives that directly improve lives in our communities through education and outreach.
                  </Text>
                </View>
                
                <View style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: 12, padding: 20 }}>
                  <Text style={{ fontSize: 18, fontWeight: '600', color: '#d946ef', marginBottom: 8 }}>
                    📢 Advocacy Work
                  </Text>
                  <Text style={{ color: '#6B7280', lineHeight: 22 }}>
                    Power our lobbying efforts and policy research to create meaningful legislative change.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
