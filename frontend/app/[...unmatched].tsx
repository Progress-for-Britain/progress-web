import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Platform, ImageBackground } from "react-native";
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

export default function NotFound() {
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const rotateAnim = useSharedValue(0);
  const bounceAnim = useSharedValue(0);

  useEffect(() => {
    // Animate elements on mount
    fadeAnim.value = withTiming(1, { duration: 1000 });
    slideAnim.value = withSpring(0, { damping: 15 });

    // Rotation animation for decorative elements
    rotateAnim.value = withRepeat(
      withTiming(360, { duration: 20000 }),
      -1
    );

    // Bounce animation for the 404 number
    bounceAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.95, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
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

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounceAnim.value }],
  }));

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

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <Header />
        
        {/* 404 Hero Section with Background Image */}
        <ImageBackground
          source={{ 
            uri: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
          }}
          style={{ 
            flex: 1,
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
              backgroundColor: 'rgba(30, 41, 59, 0.8)', // Darker overlay for 404 page
            }}
          />

          {/* Animated Background Elements */}
          <Animated.View 
            style={[
              {
                position: 'absolute',
                top: 100,
                right: 50,
                width: 120,
                height: 120,
                backgroundColor: 'rgba(217, 70, 239, 0.2)',
                borderRadius: 60,
              },
              rotateStyle
            ]}
          />
          <Animated.View 
            style={[
              {
                position: 'absolute',
                bottom: 80,
                left: 30,
                width: 80,
                height: 80,
                backgroundColor: 'rgba(14, 165, 233, 0.15)',
                borderRadius: 40,
              },
              rotateStyle
            ]}
          />
          <Animated.View 
            style={[
              {
                position: 'absolute',
                top: 200,
                left: 50,
                width: 60,
                height: 60,
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderRadius: 30,
              },
              rotateStyle
            ]}
          />

          <Animated.View style={fadeInStyle}>
            <View style={{ alignItems: 'center', maxWidth: 800 }}>
              {/* 404 Number with Animation */}
              <Animated.View style={[bounceStyle, { marginBottom: 30 }]}>
                <Text 
                  style={{ 
                    fontSize: Platform.OS === 'web' ? 120 : 80,
                    fontWeight: 'bold',
                    color: '#d946ef',
                    textAlign: 'center',
                    textShadowColor: 'rgba(0, 0, 0, 0.3)',
                    textShadowOffset: { width: 0, height: 4 },
                    textShadowRadius: 8,
                  }}
                >
                  404
                </Text>
              </Animated.View>

              {/* Error Icon */}
              <View 
                style={{
                  backgroundColor: 'rgba(217, 70, 239, 0.2)',
                  borderRadius: 25,
                  padding: 20,
                  marginBottom: 30,
                }}
              >
                <MaterialIcons name="error-outline" size={50} color="#d946ef" />
              </View>
              
              <Text 
                style={{ 
                  fontSize: Platform.OS === 'web' ? 42 : 32,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  textAlign: 'center',
                  marginBottom: 20,
                  lineHeight: Platform.OS === 'web' ? 50 : 40,
                  textShadowColor: 'rgba(0, 0, 0, 0.3)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4,
                }}
              >
                Page Not Found
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
                Looks like this page has taken a detour on the road to British prosperity! Don't worry, we'll get you back on track.
              </Text>

              {/* Quick Stats to maintain brand consistency */}
              <View 
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 40,
                  borderLeftWidth: 5,
                  borderLeftColor: '#d946ef',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="information-circle" size={24} color="#ffffff" style={{ marginRight: 10 }} />
                  <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '600' }}>
                    Quick Navigation Tips
                  </Text>
                </View>
                <Text style={{ color: '#cbd5e1', fontSize: 16, lineHeight: 24 }}>
                  Use the navigation above or the buttons below to explore our policies, join our movement, or learn about upcoming events.
                </Text>
              </View>
              
              <View style={{ 
                flexDirection: Platform.OS === 'web' ? 'row' : 'column', 
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <ActionButton href="/" icon="home" iconLibrary="Ionicons">
                  Back to Home
                </ActionButton>
                <ActionButton href="/events" variant="accent" icon="calendar" iconLibrary="Ionicons">
                  Upcoming Events
                </ActionButton>
                <ActionButton href="/join" variant="secondary" icon="person-add" iconLibrary="Ionicons">
                  Join Movement
                </ActionButton>
              </View>

              {/* Additional helpful links */}
              <View style={{ marginTop: 40, alignItems: 'center' }}>
                <Text style={{ color: '#94a3b8', fontSize: 16, marginBottom: 20 }}>
                  Or explore these popular sections:
                </Text>
                <View style={{ 
                  flexDirection: 'row', 
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: 20
                }}>
                  <Link href="/newsroom" asChild>
                    <TouchableOpacity 
                      style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                      }}
                    >
                      <FontAwesome5 name="newspaper" size={16} color="#94a3b8" style={{ marginRight: 8 }} />
                      <Text style={{ color: '#94a3b8', fontSize: 14 }}>Newsroom</Text>
                    </TouchableOpacity>
                  </Link>
                  
                  <Link href="/donate" asChild>
                    <TouchableOpacity 
                      style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                      }}
                    >
                      <Ionicons name="heart" size={16} color="#94a3b8" style={{ marginRight: 8 }} />
                      <Text style={{ color: '#94a3b8', fontSize: 14 }}>Donate</Text>
                    </TouchableOpacity>
                  </Link>
                  
                  <Link href="/account" asChild>
                    <TouchableOpacity 
                      style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                      }}
                    >
                      <Ionicons name="person" size={16} color="#94a3b8" style={{ marginRight: 8 }} />
                      <Text style={{ color: '#94a3b8', fontSize: 14 }}>Account</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>

              {/* Social Links (matching index page) */}
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginTop: 50,
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <Text style={{ color: '#94a3b8', fontSize: 16, marginRight: 20 }}>
                  Stay connected:
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
          </Animated.View>
        </ImageBackground>
      </View>
    </>
  );
}
