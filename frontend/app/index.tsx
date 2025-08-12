import React, { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform, Dimensions, ImageBackground } from "react-native";
import { Link, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolate
} from "react-native-reanimated";
import Header from "../components/Header";

export default function Home() {
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const rotateAnim = useSharedValue(0);

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

  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnim.value}deg` }],
  }));

  const PartyValue = ({ 
    title, 
    description, 
    icon, 
    iconLibrary = 'Ionicons',
    delay = 0,
    color = '#d946ef' 
  }: { 
    title: string; 
    description: string; 
    icon: string;
    iconLibrary?: 'Ionicons' | 'MaterialIcons' | 'FontAwesome5';
    delay?: number;
    color?: string;
  }) => {
    const itemAnim = useSharedValue(0);
    const scaleAnim = useSharedValue(0.8);

    useEffect(() => {
      const timer = setTimeout(() => {
        itemAnim.value = withSpring(1, { damping: 12 });
        scaleAnim.value = withSpring(1, { damping: 15 });
      }, delay);
      return () => clearTimeout(timer);
    }, [delay]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: itemAnim.value,
      transform: [
        { scale: scaleAnim.value },
        { translateY: interpolate(itemAnim.value, [0, 1], [30, 0], Extrapolate.CLAMP) }
      ],
    }));

    const IconComponent = iconLibrary === 'MaterialIcons' ? MaterialIcons : 
                         iconLibrary === 'FontAwesome5' ? FontAwesome5 : Ionicons;

    return (
      <Animated.View 
        style={[
          {
            backgroundColor: '#ffffff',
            borderRadius: 20,
            padding: 24,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 20,
            elevation: 12,
            borderLeftWidth: 5,
            borderLeftColor: color,
            ...(Platform.OS === 'web' && {
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            })
          },
          animatedStyle
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <View 
            style={{
              backgroundColor: color + '20',
              borderRadius: 12,
              padding: 12,
              marginRight: 16,
            }}
          >
            <IconComponent name={icon as any} size={28} color={color} />
          </View>
          <Text 
            style={{ 
              fontSize: 22, 
              fontWeight: 'bold', 
              color: '#111827',
              flex: 1,
              lineHeight: 28
            }}
          >
            {title}
          </Text>
        </View>
        <Text 
          style={{ 
            color: '#4B5563', 
            lineHeight: 24,
            fontSize: 16
          }}
        >
          {description}
        </Text>
      </Animated.View>
    );
  };

  const ActionButton = ({ 
    href, 
    children, 
    variant = 'primary',
    icon,
    iconLibrary = 'Ionicons'
  }: { 
    href: string; 
    children: React.ReactNode; 
    variant?: 'primary' | 'secondary' | 'accent';
    icon?: string;
    iconLibrary?: 'Ionicons' | 'MaterialIcons' | 'FontAwesome5';
  }) => {
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

    const getButtonStyles = () => {
      switch (variant) {
        case 'primary':
          return {
            backgroundColor: '#d946ef',
            borderWidth: 0,
          };
        case 'secondary':
          return {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: '#d946ef',
          };
        case 'accent':
          return {
            backgroundColor: '#0ea5e9',
            borderWidth: 0,
          };
        default:
          return {
            backgroundColor: '#d946ef',
            borderWidth: 0,
          };
      }
    };

    const getTextColor = () => {
      return variant === 'secondary' ? '#d946ef' : '#ffffff';
    };

    const IconComponent = iconLibrary === 'MaterialIcons' ? MaterialIcons : 
                         iconLibrary === 'FontAwesome5' ? FontAwesome5 : Ionicons;

    return (
      <Link href={href} asChild>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={{
            ...getButtonStyles(),
            borderRadius: 16,
            paddingHorizontal: 32,
            paddingVertical: 18,
            marginHorizontal: 8,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 200,
            ...(Platform.OS === 'web' && { cursor: 'pointer' })
          }}
        >
          <Animated.View style={[{ flexDirection: 'row', alignItems: 'center' }, animatedStyle]}>
            {icon && (
              <IconComponent 
                name={icon as any} 
                size={20} 
                color={getTextColor()} 
                style={{ marginRight: 8 }} 
              />
            )}
            <Text 
              style={{ 
                color: getTextColor(),
                fontSize: 18,
                fontWeight: '700',
                textAlign: 'center'
              }}
            >
              {children}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </Link>
    );
  };

  const StatCard = ({ number, label, icon }: { number: string; label: string; icon: string }) => (
    <Animated.View 
      style={[
        {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 16,
          padding: 20,
          alignItems: 'center',
          marginHorizontal: 8,
          minWidth: 120,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        }
      ]}
    >
      <Ionicons name={icon as any} size={32} color="#d946ef" style={{ marginBottom: 8 }} />
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 4 }}>
        {number}
      </Text>
      <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', fontWeight: '600' }}>
        {label}
      </Text>
    </Animated.View>
  );

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
              uri: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
            }}
            style={{ 
              paddingVertical: 100,
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
                backgroundColor: 'rgba(30, 41, 59, 0.7)', // Dark overlay
              }}
            />
            {/* Animated Background Elements */}
            <Animated.View 
              style={[
                {
                  position: 'absolute',
                  top: 50,
                  right: 30,
                  width: 100,
                  height: 100,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 50,
                },
                rotateStyle
              ]}
            />
            <Animated.View 
              style={[
                {
                  position: 'absolute',
                  bottom: 40,
                  left: 20,
                  width: 60,
                  height: 60,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 30,
                },
                rotateStyle
              ]}
            />

            <Animated.View style={fadeInStyle}>
              <View style={{ alignItems: 'center', maxWidth: 800 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <FontAwesome5 name="flag" size={32} color="#ffffff" style={{ marginRight: 12 }} />
                  <Text 
                    style={{ 
                      fontSize: 18,
                      fontWeight: '600',
                      color: '#f0f9ff',
                      letterSpacing: 2,
                      textTransform: 'uppercase'
                    }}
                  >
                    Progressive UK
                  </Text>
                </View>
                
                <Text 
                  style={{ 
                    fontSize: Platform.OS === 'web' ? 56 : 36,
                    fontWeight: 'bold',
                    color: '#ffffff',
                    textAlign: 'center',
                    marginBottom: 24,
                    lineHeight: Platform.OS === 'web' ? 64 : 44,
                    textShadowColor: 'rgba(0, 0, 0, 0.3)',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 4,
                  }}
                >
                  Unleashing Britain's Potential
                </Text>
                
                <Text 
                  style={{ 
                    fontSize: 20,
                    color: '#e0f2fe',
                    textAlign: 'center',
                    marginBottom: 40,
                    lineHeight: 30,
                    maxWidth: 600,
                    fontWeight: '400'
                  }}
                >
                  From unicorn farms to prosperity zones, building the innovation economy that works for everyone, everywhere.
                </Text>
                
                {/* Statistics Row */}
                <View style={{ 
                  flexDirection: Platform.OS === 'web' ? 'row' : 'column', 
                  alignItems: 'center',
                  marginBottom: 40,
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  <StatCard number="50K+" label="Members" icon="people" />
                  <StatCard number="200+" label="Constituencies" icon="location" />
                  <StatCard number="£2M+" label="Raised" icon="trending-up" />
                </View>
                
                <View style={{ 
                  flexDirection: Platform.OS === 'web' ? 'row' : 'column', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  <ActionButton href="/join" icon="person-add" iconLibrary="Ionicons">
                    Join Our Movement
                  </ActionButton>
                  <ActionButton href="/donate" variant="secondary" icon="heart" iconLibrary="Ionicons">
                    Support Our Cause
                  </ActionButton>
                </View>
              </View>
            </Animated.View>
          </ImageBackground>

          {/* Party Values Section */}
          <View style={{ maxWidth: 1200, alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 80 }}>
            <Animated.View style={fadeInStyle}>
              <View style={{ alignItems: 'center', marginBottom: 60 }}>
                <MaterialIcons name="stars" size={48} color="#d946ef" style={{ marginBottom: 16 }} />
                <Text 
                  style={{ 
                    fontSize: 40, 
                    fontWeight: 'bold', 
                    textAlign: 'center', 
                    color: '#111827', 
                    marginBottom: 16 
                  }}
                >
                  Our Policy Vision
                </Text>
                <Text 
                  style={{ 
                    fontSize: 20, 
                    color: '#6B7280', 
                    textAlign: 'center', 
                    lineHeight: 30,
                    maxWidth: 600
                  }}
                >
                  Bold policies to drive innovation, prosperity, and justice across Britain
                </Text>
              </View>
            </Animated.View>

            <View style={{ maxWidth: 900, alignSelf: 'center' }}>
              <PartyValue
                title="Innovation Economy"
                description="Making Britain the world's largest unicorn farm through targeted investment in technology, startups, and R&D. Funding innovation with smart property policies that drive growth in every region."
                icon="rocket"
                iconLibrary="Ionicons"
                color="#8b5cf6"
                delay={200}
              />
              
              <PartyValue
                title="Prosperity Zones"
                description="Special Economic Zones giving the North its own back - dedicated areas with tax incentives, streamlined regulations, and focused investment to rebalance the UK economy away from London."
                icon="trending-up"
                iconLibrary="Ionicons"
                color="#10b981"
                delay={400}
              />
              
              <PartyValue
                title="Cost of Living Relief"
                description="Driving down everyday costs through strategic policies on housing, energy, and essentials. Making life affordable for working families while building long-term economic resilience."
                icon="cash"
                iconLibrary="Ionicons"
                color="#f59e0b"
                delay={600}
              />
              
              <PartyValue
                title="Skill Capital Investment"
                description="Deep focus on building Britain's human capital through vocational training, apprenticeships, and lifelong learning. Creating the skilled workforce for tomorrow's economy."
                icon="school"
                iconLibrary="Ionicons"
                color="#ef4444"
                delay={800}
              />
              
              <PartyValue
                title="Worker Partnership"
                description="Returning paid overtime and creating employee partnership schemes. Dual-mandate unions that balance worker rights with economic competitiveness and productivity growth."
                icon="people"
                iconLibrary="Ionicons"
                color="#0ea5e9"
                delay={1000}
              />
              
              <PartyValue
                title="Open Justice & Safety"
                description="Championing open justice with transparent courts and processes. Building an anti-crime culture through community engagement, prevention, and unified judicial services."
                icon="shield-checkmark"
                iconLibrary="Ionicons"
                color="#d946ef"
                delay={1200}
              />
            </View>
          </View>

          {/* Featured Initiatives Section */}
          <View 
            style={{ 
              backgroundColor: '#f1f5f9',
              paddingVertical: 80,
              paddingHorizontal: 20,
            }}
          >
            <View style={{ maxWidth: 1200, alignSelf: 'center' }}>
              <Text 
                style={{ 
                  fontSize: 36,
                  fontWeight: 'bold',
                  color: '#111827',
                  textAlign: 'center',
                  marginBottom: 16
                }}
              >
                Current Campaigns
              </Text>
              <Text 
                style={{ 
                  fontSize: 18,
                  color: '#6B7280',
                  textAlign: 'center',
                  marginBottom: 50,
                  lineHeight: 28
                }}
              >
                Active initiatives making real change happen today
              </Text>

              <View style={{ 
                flexDirection: Platform.OS === 'web' ? 'row' : 'column',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                gap: 20
              }}>
                {[
                  { title: "Unicorn Farms", icon: "rocket", color: "#8b5cf6" },
                  { title: "Prosperity Zones", icon: "business", color: "#10b981" },
                  { title: "Skills Capital", icon: "school", color: "#f59e0b" },
                  { title: "Open Justice", icon: "shield-checkmark", color: "#ef4444" }
                ].map((campaign, index) => (
                  <Animated.View 
                    key={campaign.title}
                    style={[
                      {
                        backgroundColor: '#ffffff',
                        borderRadius: 16,
                        padding: 30,
                        alignItems: 'center',
                        flex: Platform.OS === 'web' ? 1 : undefined,
                        minWidth: 200,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.1,
                        shadowRadius: 15,
                        elevation: 10,
                      }
                    ]}
                  >
                    <View 
                      style={{
                        backgroundColor: campaign.color + '20',
                        borderRadius: 20,
                        padding: 20,
                        marginBottom: 16,
                      }}
                    >
                      <Ionicons name={campaign.icon as any} size={36} color={campaign.color} />
                    </View>
                    <Text 
                      style={{ 
                        fontSize: 18, 
                        fontWeight: 'bold', 
                        color: '#111827',
                        textAlign: 'center'
                      }}
                    >
                      {campaign.title}
                    </Text>
                  </Animated.View>
                ))}
              </View>
            </View>
          </View>

          {/* Call to Action Section */}
          <View 
            style={{ 
              backgroundColor: '#1e293b',
              paddingVertical: 80,
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
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  backgroundColor: 'rgba(217, 70, 239, 0.1)',
                  borderRadius: 100,
                },
                rotateStyle
              ]}
            />
            
            <View style={{ maxWidth: 800, alignItems: 'center' }}>
              <Text 
                style={{ 
                  fontSize: 40,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  textAlign: 'center',
                  marginBottom: 20
                }}
              >
                Ready to Unleash Britain's Potential?
              </Text>
              <Text 
                style={{ 
                  fontSize: 20,
                  color: '#cbd5e1',
                  textAlign: 'center',
                  marginBottom: 40,
                  lineHeight: 30
                }}
              >
                Join the movement for innovation, prosperity, and progress. From unicorn farms to prosperity zones - let's build the future together.
              </Text>
              
              <View style={{ 
                flexDirection: Platform.OS === 'web' ? 'row' : 'column', 
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <ActionButton href="/join" icon="person-add" iconLibrary="Ionicons">
                  Become a Member
                </ActionButton>
                <ActionButton href="/volunteer" variant="accent" icon="people" iconLibrary="Ionicons">
                  Volunteer Today
                </ActionButton>
                <ActionButton href="/donate" variant="secondary" icon="heart" iconLibrary="Ionicons">
                  Donate Now
                </ActionButton>
              </View>

              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginTop: 40,
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <Text style={{ color: '#94a3b8', fontSize: 16, marginRight: 20 }}>
                  Follow our progress:
                </Text>
                <View style={{ flexDirection: 'row', gap: 15 }}>
                  <TouchableOpacity style={{ padding: 10 }}>
                    <FontAwesome5 name="twitter" size={24} color="#1da1f2" />
                  </TouchableOpacity>
                  <TouchableOpacity style={{ padding: 10 }}>
                    <FontAwesome5 name="facebook" size={24} color="#4267b2" />
                  </TouchableOpacity>
                  <TouchableOpacity style={{ padding: 10 }}>
                    <FontAwesome5 name="instagram" size={24} color="#e4405f" />
                  </TouchableOpacity>
                  <TouchableOpacity style={{ padding: 10 }}>
                    <FontAwesome5 name="youtube" size={24} color="#ff0000" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
