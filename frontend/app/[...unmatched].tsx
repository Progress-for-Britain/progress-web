import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Platform, ScrollView } from "react-native";
import { Link, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import Head from 'expo-router/head';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AuroraBackground } from '../util/auroraComponents';
import { getCommonStyles, getColors, getGradients } from '../util/commonStyles';
import { useTheme } from '../util/theme-context';
import { useResponsive } from '../util/useResponsive';

export default function NotFound() {
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const colors = getColors(isDark);
  const gradients = getGradients(isDark);
  const commonStyles = getCommonStyles(isDark, isMobile, width);

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
            backgroundColor: colors.accent,
            borderWidth: 0,
          };
        case 'secondary':
          return {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: colors.accent,
          };
        case 'accent':
          return {
            backgroundColor: colors.primary,
            borderWidth: 0,
          };
        default:
          return {
            backgroundColor: colors.accent,
            borderWidth: 0,
          };
      }
    };

    const getTextColor = () => {
      return variant === 'secondary' ? colors.accent : '#ffffff';
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
            minWidth: isMobile ? width * 0.7 : 200,
            ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
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
                textAlign: 'center',
                ...(Platform.OS === 'web' && {
                  fontFamily: "'Montserrat', sans-serif",
                } as any),
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
    <View style={commonStyles.appContainer}>
      <Head>
        <title>Page Not Found - Progress UK</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to Progress UK's homepage to continue exploring" />
      </Head>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <Header />

      {/* Background aurora effect */}
      <AuroraBackground />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Main Content */}
        <View style={commonStyles.content}>
          {/* Hero Section */}
          <View style={commonStyles.heroContainer}>
            <Animated.View style={fadeInStyle}>
              {/* 404 Number */}
              <View style={{ marginBottom: 30, alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: isMobile ? 80 : 120,
                    fontWeight: 'bold',
                    color: colors.accent,
                    textAlign: 'center',
                    ...(Platform.OS === 'web' && {
                      fontFamily: "'Montserrat', sans-serif",
                    } as any),
                  }}
                >
                  404
                </Text>
              </View>

              {/* Error Icon */}
              <View
                style={{
                  backgroundColor: `${colors.accent}20`,
                  borderRadius: 25,
                  padding: 20,
                  marginBottom: 30,
                  alignSelf: 'center',
                }}
              >
                <MaterialIcons name="error-outline" size={50} color={colors.accent} />
              </View>

              <Text style={[commonStyles.title, {
                fontSize: isMobile ? 32 : 42,
                marginBottom: 20,
                textAlign: 'center'
              }]}>
                Page Not Found
              </Text>

              <Text style={[commonStyles.text, {
                fontSize: isMobile ? 16 : 20,
                lineHeight: isMobile ? 24 : 30,
                marginBottom: 40,
                maxWidth: 600,
                textAlign: 'center',
                alignSelf: 'center'
              }]}>
                Looks like this page has taken a detour on the road to British prosperity! Don't worry, we'll get you back on track.
              </Text>
            </Animated.View>
          </View>

          {/* Quick Navigation Card */}
          <View style={[commonStyles.cardContainer, { marginBottom: 40 }]}>
            <Animated.View style={fadeInStyle}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Ionicons name="information-circle" size={24} color={colors.accent} style={{ marginRight: 10 }} />
                <Text style={[commonStyles.text, { 
                  fontSize: 18, 
                  fontWeight: '600',
                  color: colors.text,
                  textAlign: 'left'
                }]}>
                  Quick Navigation Tips
                </Text>
              </View>
              <Text style={[commonStyles.text, { 
                color: colors.textSecondary, 
                lineHeight: 24,
                textAlign: 'left'
              }]}>
                Use the navigation above or the buttons below to explore our policies, join our movement, or learn about upcoming events.
              </Text>
            </Animated.View>
          </View>

          {/* Action Buttons */}
          <View style={{
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: 40
          }}>
            <ActionButton href="/" icon="home" iconLibrary="Ionicons">
              Back to Home
            </ActionButton>
            <ActionButton href="/join" variant="secondary" icon="person-add" iconLibrary="Ionicons">
              Join Movement
            </ActionButton>
          </View>

          {/* Popular Sections */}
          <View style={[commonStyles.cardContainer, { marginBottom: 40 }]}>
            <Animated.View style={fadeInStyle}>
              <Text style={[commonStyles.text, { 
                color: colors.textSecondary, 
                fontSize: 16, 
                marginBottom: 20,
                textAlign: 'center'
              }]}>
                Or explore these popular sections:
              </Text>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 16
              }}>

                <Link href="/donate" asChild>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: `${colors.surface}80`,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: `${colors.text}20`,
                      ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                    }}
                  >
                    <Ionicons name="heart" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                    <Text style={{ 
                      color: colors.textSecondary, 
                      fontSize: 14,
                      ...(Platform.OS === 'web' && {
                        fontFamily: "'Montserrat', sans-serif",
                      } as any),
                    }}>Donate</Text>
                  </TouchableOpacity>
                </Link>

                <Link href="/account" asChild>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: `${colors.surface}80`,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: `${colors.text}20`,
                      ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                    }}
                  >
                    <Ionicons name="person" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                    <Text style={{ 
                      color: colors.textSecondary, 
                      fontSize: 14,
                      ...(Platform.OS === 'web' && {
                        fontFamily: "'Montserrat', sans-serif",
                      } as any),
                    }}>Account</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </Animated.View>
          </View>
        </View>

        {/* Footer */}
        <Footer />
      </ScrollView>
    </View>
  );
}
