import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  Platform, 
  KeyboardAvoidingView,
  Animated,
  Modal
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Header from '../components/Header';

export default function NDA() {
  const [name, setName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [showFullNDA, setShowFullNDA] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isLoading) {
      // Start rotation animation when loading
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      // Stop rotation when not loading
      rotateAnim.setValue(0);
    }
  }, [isLoading]);

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
      
      // Animate success elements
      Animated.sequence([
        Animated.parallel([
          Animated.spring(successAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(checkmarkScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 150,
            friction: 7,
          }),
        ]),
        Animated.delay(1500), // Show success for 1.5 seconds
      ]).start(() => {
        // Auto-redirect after animation completes
        router.replace('/join');
      });
      
    } catch (error) {
      Alert.alert('Error', 'Failed to submit NDA. Please try again.');
      setIsLoading(false);
    }
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
          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View 
              style={{ 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                backgroundColor: '#ffffff',
                borderRadius: 16,
                padding: 24,
                marginBottom: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              {/* Header */}
              <View style={{ alignItems: 'center', marginBottom: 32 }}>
                <View 
                  style={{
                    backgroundColor: '#d946ef',
                    borderRadius: 30,
                    padding: 16,
                    marginBottom: 16
                  }}
                >
                  <MaterialIcons name="security" size={32} color="#ffffff" />
                </View>
                <Text 
                  style={{ 
                    fontSize: 28,
                    fontWeight: 'bold',
                    color: '#1f2937',
                    textAlign: 'center',
                    marginBottom: 8
                  }}
                >
                  Confidentiality Agreement
                </Text>
                <Text 
                  style={{ 
                    fontSize: 16,
                    color: '#6b7280',
                    textAlign: 'center',
                    lineHeight: 24
                  }}
                >
                  Bletchley Point Ltd. • Dated 19/08/2025
                </Text>
              </View>

              {/* NDA Content */}
              <View style={{ marginBottom: 32 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 16 }}>
                  Agreement Overview
                </Text>
                <Text style={{ fontSize: 14, color: '#4b5563', lineHeight: 22, marginBottom: 16 }}>
                  This confidentiality agreement is between Bletchley Point Ltd., and any future entity to which 
                  the venture may be renamed (the "Company"), represented by Maxi Gorynski [General Director], 
                  and you (the "New Member").
                </Text>

                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
                  Key Terms:
                </Text>
                
                <View style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                    <View style={{ 
                      backgroundColor: '#d946ef', 
                      borderRadius: 4, 
                      width: 8, 
                      height: 8, 
                      marginTop: 8, 
                      marginRight: 12 
                    }} />
                    <Text style={{ fontSize: 14, color: '#4b5563', flex: 1, lineHeight: 22 }}>
                      <Text style={{ fontWeight: '600' }}>Non-Disclosure:</Text> You agree not to copy, distribute, 
                      or disseminate any Company materials including documents, strategic plans, contact registers, 
                      software products, and financial information.
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                    <View style={{ 
                      backgroundColor: '#d946ef', 
                      borderRadius: 4, 
                      width: 8, 
                      height: 8, 
                      marginTop: 8, 
                      marginRight: 12 
                    }} />
                    <Text style={{ fontSize: 14, color: '#4b5563', flex: 1, lineHeight: 22 }}>
                      <Text style={{ fontWeight: '600' }}>Purpose Limitation:</Text> Confidential information may only 
                      be used for work with Bletchley Point and its subsidiaries, including the Progress party.
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                    <View style={{ 
                      backgroundColor: '#d946ef', 
                      borderRadius: 4, 
                      width: 8, 
                      height: 8, 
                      marginTop: 8, 
                      marginRight: 12 
                    }} />
                    <Text style={{ fontSize: 14, color: '#4b5563', flex: 1, lineHeight: 22 }}>
                      <Text style={{ fontWeight: '600' }}>No Commercial Use:</Text> You shall not use confidential 
                      information for any commercial reason, independently or with third parties.
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                    <View style={{ 
                      backgroundColor: '#d946ef', 
                      borderRadius: 4, 
                      width: 8, 
                      height: 8, 
                      marginTop: 8, 
                      marginRight: 12 
                    }} />
                    <Text style={{ fontSize: 14, color: '#4b5563', flex: 1, lineHeight: 22 }}>
                      <Text style={{ fontWeight: '600' }}>Duration:</Text> Obligations continue for 5 years from 
                      this agreement date, with trade secrets protected as long as they remain confidential.
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                    <View style={{ 
                      backgroundColor: '#d946ef', 
                      borderRadius: 4, 
                      width: 8, 
                      height: 8, 
                      marginTop: 8, 
                      marginRight: 12 
                    }} />
                    <Text style={{ fontSize: 14, color: '#4b5563', flex: 1, lineHeight: 22 }}>
                      <Text style={{ fontWeight: '600' }}>Health & Social Care Exception:</Text> This agreement does 
                      not restrict discussion of matters pertaining solely to health and social care policy.
                    </Text>
                  </View>
                </View>

                <View style={{ 
                  backgroundColor: '#fef3c7', 
                  borderColor: '#f59e0b', 
                  borderWidth: 1, 
                  borderRadius: 8, 
                  padding: 16, 
                  marginBottom: 16 
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <Ionicons name="warning" size={20} color="#f59e0b" style={{ marginRight: 8, marginTop: 2 }} />
                    <Text style={{ fontSize: 14, color: '#92400e', flex: 1, lineHeight: 20 }}>
                      <Text style={{ fontWeight: '600' }}>Important:</Text> This is a legally binding agreement. 
                      Please read the full terms carefully. By signing, you acknowledge understanding and agreement 
                      to all terms and conditions.
                    </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  onPress={() => setShowFullNDA(true)}
                  style={{
                    backgroundColor: '#f3f4f6',
                    borderRadius: 8,
                    padding: 12,
                    alignItems: 'center',
                    marginBottom: 24,
                    flexDirection: 'row',
                    justifyContent: 'center'
                  }}
                >
                  <MaterialIcons name="article" size={20} color="#6b7280" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#6b7280', fontSize: 14, fontWeight: '500' }}>
                    View Full Legal Document
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Name Input */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
                  Your Name
                </Text>
                <View 
                  style={{
                    borderWidth: 2,
                    borderColor: nameFocused ? '#d946ef' : '#e5e7eb',
                    borderRadius: 12,
                    backgroundColor: '#ffffff',
                  }}
                >
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                    placeholder="Enter your full legal name"
                    style={{
                      padding: 16,
                      fontSize: 16,
                      color: '#1f2937',
                    }}
                    autoCapitalize="words"
                    autoComplete="name"
                  />
                </View>
              </View>

              {/* Agreement Checkbox */}
              <TouchableOpacity 
                onPress={() => setAgreed(!agreed)}
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'flex-start', 
                  marginBottom: 32,
                  paddingVertical: 8
                }}
              >
                <View 
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: agreed ? '#d946ef' : '#d1d5db',
                    backgroundColor: agreed ? '#d946ef' : '#ffffff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                    marginTop: 2
                  }}
                >
                  {agreed && <Ionicons name="checkmark" size={16} color="#ffffff" />}
                </View>
                <Text style={{ fontSize: 14, color: '#4b5563', flex: 1, lineHeight: 22 }}>
                  I have read, understood, and agree to be bound by the terms of this Confidentiality Agreement. 
                  I acknowledge that this creates a legally binding obligation and that breach may result in 
                  legal action including injunctive relief.
                </Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <TouchableOpacity 
                onPress={handleSubmit}
                disabled={isLoading || !name.trim() || !agreed}
                style={{
                  backgroundColor: isLoading ? '#9CA3AF' : 
                                 (!name.trim() || !agreed) ? '#d1d5db' : '#d946ef',
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  marginBottom: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  opacity: isLoading ? 0.8 : 1,
                }}
              >
                {isLoading ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Animated.View
                      style={{
                        transform: [{
                          rotate: rotateAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          })
                        }]
                      }}
                    >
                      <Ionicons name="refresh" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                    </Animated.View>
                    <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                      Signing NDA...
                    </Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialIcons name="security" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                      Sign NDA Agreement
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => router.back()}
                style={{
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#6b7280', fontSize: 16, fontWeight: '500' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Success Animation Overlay */}
        {isSuccess && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
              opacity: successAnim,
            }}
          >
            <Animated.View
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 24,
                padding: 40,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.3,
                shadowRadius: 30,
                elevation: 20,
                transform: [
                  {
                    scale: successAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              }}
            >
              <Animated.View
                style={{
                  backgroundColor: '#10B981',
                  borderRadius: 50,
                  padding: 20,
                  marginBottom: 24,
                  transform: [{ scale: checkmarkScale }],
                }}
              >
                <Ionicons name="checkmark" size={40} color="#ffffff" />
              </Animated.View>
              
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#1f2937',
                  textAlign: 'center',
                  marginBottom: 12,
                }}
              >
                NDA Signed Successfully!
              </Text>
              
              <Text
                style={{
                  fontSize: 16,
                  color: '#6b7280',
                  textAlign: 'center',
                  lineHeight: 24,
                  maxWidth: 280,
                }}
              >
                Thank you {name}! Redirecting you back to complete your application...
              </Text>
              
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginTop: 20,
                backgroundColor: '#f3f4f6',
                borderRadius: 8,
                padding: 8
              }}>
                <Animated.View
                  style={{
                    transform: [{
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      })
                    }]
                  }}
                >
                  <Ionicons name="refresh" size={16} color="#6b7280" style={{ marginRight: 8 }} />
                </Animated.View>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>
                  Redirecting...
                </Text>
              </View>
            </Animated.View>
          </Animated.View>
        )}

        {/* Full NDA Modal */}
        <Modal
          visible={showFullNDA}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: 16, 
              backgroundColor: '#ffffff',
              borderBottomWidth: 1,
              borderBottomColor: '#e5e7eb',
              paddingTop: Platform.OS === 'ios' ? 50 : 16
            }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937' }}>
                Confidentiality Agreement - Full Text
              </Text>
              <TouchableOpacity onPress={() => setShowFullNDA(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{ flex: 1, padding: 16 }}>
              <View style={{ 
                backgroundColor: '#ffffff',
                borderRadius: 12,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937', textAlign: 'center', marginBottom: 8 }}>
                  Bletchley Point Ltd.
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937', textAlign: 'center', marginBottom: 16 }}>
                  Confidentiality Agreement
                </Text>
                <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>
                  This confidentiality agreement (the "Agreement") is dated 19/08/2025.
                </Text>

                <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 16 }}>
                  The Agreement is to hold between Bletchley Point Ltd., and any future entity to which the venture in question may in future be renamed (the "Company"), represented by Maxi Gorynski [General Director], and <Text style={{ fontWeight: '600' }}>Your name</Text> (the "New Member").
                </Text>

                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
                  Definitions
                </Text>
                <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                  For the purposes of this Agreement:
                </Text>
                <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 16 }}>
                  "Confidential Information" means any and all non-public information disclosed by the Company to the New Member, including but not limited to:
                </Text>

                <View style={{ marginLeft: 16, marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 4 }}>
                    • Technological products, software, systems, and technical specifications
                  </Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 4 }}>
                    • Electoral strategies, campaign plans, and political positioning
                  </Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 4 }}>
                    • Communication plans, messaging strategies, and media relations approaches
                  </Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 4 }}>
                    • Logistical operational plans, organizational structures, and strategic initiatives
                  </Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 4 }}>
                    • Financial information, budgets, and resource allocation plans
                  </Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 4 }}>
                    • Donor lists, supporter databases, and contact registers
                  </Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 4 }}>
                    • Internal documents, correspondence, and meeting records
                  </Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 4 }}>
                    • Any other proprietary information that a political organization would reasonably consider confidential
                  </Text>
                </View>

                <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 16 }}>
                  Confidential Information does not include information that falls within the exclusions set forth in Section 1A of this Agreement.
                </Text>

                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
                  1. Non-Disclosure of Confidential Information
                </Text>
                <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                  By signing this confidentiality agreement, the New Member agrees to the following:
                </Text>

                <View style={{ marginLeft: 16, marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                    They shall not copy, distribute, or otherwise disseminate any material belonging to the Company – inclusive of but not limited to documents, digital or material assets, logos, strategic plans, marketing materials, contact registers, software products, codebases, databases, communications logs, letters and correspondence, and financial information; they shall not do so orally, in writing, or by any other format
                  </Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                    They shall not use or exploit any Confidential Information given to them in any way except for the Purpose, the Purpose which shall be defined as any and all work for Bletchley Point and any and all of its subsidiaries, including the Progress party, which the New Member enters into individually or in collaboration with other Members;
                  </Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                    That while the New Member may accept contract or other forms of agreement to work on initiatives in a comparable space to the Company, they agree not to unduly disseminate sensitive knowledge or proprietary materials that are property of the Company to third parties without express, prior approval of the Company;
                  </Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                    They shall not disclose or make available the Confidential Information to any third party, except as expressly permitted by this Agreement;
                  </Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                    They shall not utilise the Confidential Information for any commercial reason, independently or in collaboration with any third party;
                  </Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                    They shall not copy, reduce to writing or otherwise record the Confidential Information except as strictly necessary for the Purpose (and any such copies, reductions to writing and records shall be the property of the Disclosing Party); and
                  </Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                    They shall apply the same security measures and degree of care to the Confidential Information as the Recipient applies to its own confidential information
                  </Text>
                </View>

                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
                  1A. Exclusions from Confidential Information
                </Text>
                <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                  The obligations set forth in Section 1 shall not apply to information that:
                </Text>

                <View style={{ marginLeft: 16, marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                    • Is or becomes generally available to the public through no breach of this Agreement by the New Member;
                  </Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                    • Was known to the New Member prior to disclosure by the Company, as evidenced by written records predating such disclosure;
                  </Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                    • Is independently developed by the New Member without use of or reference to the Company's Confidential Information, as evidenced by written records;
                  </Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                    • Is rightfully received by the New Member from a third party without breach of any confidentiality obligation;
                  </Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                    • Is required to be disclosed by law, court order, or governmental regulation, provided the New Member gives the Company reasonable advance notice of such required disclosure to permit the Company to seek protective measures;
                  </Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                    • Pertains solely to matters of health and social care, including but not limited to topics falling under the remit of public health policy, service provision, or healthcare system operations.
                  </Text>
                </View>

                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
                  1B. Residuals
                </Text>
                <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                  Notwithstanding any other provision of this Agreement, the New Member shall be free to use and employ, in any lawful manner, any general skills, experience, concepts, ideas, or know-how of a general nature that are:
                </Text>

                <View style={{ marginLeft: 16, marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                    • Retained in the unaided memory of the New Member following termination of their involvement with the Company;
                  </Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                    • Part of the general knowledge, skills, and experience developed by the New Member during their involvement with the Company; or
                  </Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                    • Publicly available techniques, methodologies, or approaches that become part of the New Member's general professional competence.
                  </Text>
                </View>

                <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 16 }}>
                  This residuals clause shall not permit the New Member to disclose or use specific Confidential Information (as defined above) that constitutes trade secrets or proprietary information of the Company.
                </Text>

                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
                  2. Permitted Disclosure of Confidential Information
                </Text>
                <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                  The New Member may not disclose Confidential Information outside the remit of the Company except with the express, prior permission of the Company. They may disclose the Company's Confidential Information to those of the New Member's Representatives who need to know this Confidential Information for the Purpose, provided that:
                </Text>

                <View style={{ marginLeft: 16, marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                    • it informs its Representatives of the confidential nature of the Confidential Information, or the aspects of the Solution to be disclosed, before disclosure, and likewise obtains signed, written approval from the Disclosing Party for the Confidential Information to be disclosed;
                  </Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                    • It procures that its Representatives shall, in relation to any Confidential Information disclosed to them (or information shared as regards the Solution), comply with this Agreement as if they were the Recipient and, if the Disclosing Party so requests, procure that any relevant Representative enters into a confidentiality agreement with the Disclosing Party on terms equivalent to those contained in this Agreement,
                  </Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                    • The Recipient may disclose Confidential Information, or information about the Solution, to the extent such Confidential Information is required:
                  </Text>
                  <View style={{ marginLeft: 16, marginBottom: 8 }}>
                    <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 4 }}>
                      - to be disclosed by law, rule or regulation; or
                    </Text>
                    <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 4 }}>
                      - by any governmental, judicial or other regulatory authority (including, without limitation, any recognised stock exchange or by a court or other authority of competent jurisdiction),
                    </Text>
                  </View>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                    • The parties agree that this Agreement shall not restrict the discussion, disclosure, or use of information that pertains solely to matters of health and social care, including but not limited to topics falling under the remit of public health policy, service provision, or healthcare system operations.
                  </Text>
                </View>

                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
                  3. Reservation of Rights and Acknowledgement
                </Text>
                <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                  All Confidential Information shall remain the property of the Disclosing Party. The Disclosing Party reserves all rights in its Confidential Information. No rights, including, but not limited to, intellectual property rights, in respect of the Disclosing Party's Confidential Information are granted to the Recipient and no obligations are imposed on the Disclosing Party other than those expressly stated in this Agreement.
                </Text>

                <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                  Intellectual Property specifically created by the New Member solely for the Company's proprietary use and directly related to the Company's confidential technological products or electoral strategies shall be owned by the Company, unless an agreement is brokered and achieved between the New Member and the Company to specify an alternative arrangement of ownership relative to specific IP. General skills, methodologies, and non-proprietary work product developed by the New Member shall remain the property of the New Member.
                </Text>

                <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                  The disclosure of Confidential Information by the Disclosing Party shall not form any offer by, or representation or warranty on the part of, the Disclosing Party to enter into any further agreement in relation to the Purpose.
                </Text>

                <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                  The Recipient acknowledges that damages alone would not be an adequate remedy for the breach of any of the provisions of this Agreement. Accordingly, without prejudice to any other rights and remedies it may have, the Disclosing Party shall be entitled to seek the granting of equitable relief (including without limitation injunctive relief) concerning any threatened or actual breach of any of the provisions of this Agreement.
                </Text>

                <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                  If the Recipient has included a secondary name/handle at the head of this document (for example, a pseudonym/social media handle), then it shall also follow that the Company shall hold the Recipient's legal name as Confidential Information belonging to the Recipient and shall not reveal it, including, if it is the Recipient's wish, to any personnel outside of the Company's Heads of Function, unless compelled to do so by law.
                </Text>

                <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                  The obligations of each Party shall, notwithstanding any earlier termination of negotiations or discussions between the parties in relation to the Purpose, continue for a period of five (5) years from the date of this Agreement, except that obligations relating to trade secrets shall continue for so long as such information remains a trade secret under applicable law.
                </Text>

                <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                  Any failure to exercise or any delay in exercising any right or remedy under this Agreement shall not constitute a waiver of that right or remedy or a waiver of any other right or remedy and no single or partial exercise of any right or remedy under this Agreement will prevent any further exercise of that right or remedy or the exercise of any other right or remedy.
                </Text>

                <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 16 }}>
                  No variation or agreed termination of this Agreement shall be of any force or effect unless in writing and signed by each Party.
                </Text>

                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
                  4. Governing Law and Jurisdiction
                </Text>
                <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 }}>
                  This Agreement and any dispute or claim arising out of or in connection with it or its subject matter or formation (including non-contractual disputes or claims) shall be governed by and construed in accordance with the law of England and Wales.
                </Text>
                <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 24 }}>
                  Each party irrevocably agrees that the courts of England and Wales shall have exclusive jurisdiction to settle any dispute or claim arising out of or in connection with this Agreement or its subject matter or formation (including non-contractual disputes or claims).
                </Text>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    </>
  );
}
