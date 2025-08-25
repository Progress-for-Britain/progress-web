import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Platform, ScrollView } from "react-native";
import { Link, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat
} from "react-native-reanimated";
import Head from 'expo-router/head';
import Footer from "../components/Footer";;
import { getCommonStyles, getColors } from '../util/commonStyles';
import { useTheme } from '../util/theme-context';
import { useResponsive } from '../util/useResponsive';
import { AuroraBackground } from "../util/auroraComponents";

export default function NotFound() {
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark, isMobile, width);

  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const rotateAnim = useSharedValue(0);
  const bounceAnim = useSharedValue(1);

  useEffect(() => {
    // Animate elements on mount
    fadeAnim.value = withTiming(1, { duration: 1000 });
    slideAnim.value = withSpring(0, { damping: 15 });

    // Rotation animation for decorative elements
    rotateAnim.value = withRepeat(
      withTiming(360, { duration: 20000 }),
      -1
    );

    // Subtle bounce animation for the 404 number
    bounceAnim.value = withRepeat(
      withTiming(1.05, { duration: 2000 }),
      -1,
      true
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
    iconLibrary = 'Ionicons',
    fullWidth = false
  }: {
    href: string;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'accent';
    icon?: string;
    iconLibrary?: 'Ionicons' | 'MaterialIcons' | 'FontAwesome5';
    fullWidth?: boolean;
  }) => {
    const buttonAnim = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: buttonAnim.value }],
    }));

    const handlePressIn = () => {
      buttonAnim.value = withSpring(0.96);
    };

    const handlePressOut = () => {
      buttonAnim.value = withSpring(1);
    };

    const getButtonStyles = () => {
      const baseStyles = {
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      };

      switch (variant) {
        case 'primary':
          return {
            ...baseStyles,
            backgroundColor: colors.accent,
            borderWidth: 0,
          };
        case 'secondary':
          return {
            backgroundColor: `${colors.surface}95`,
            borderWidth: 2,
            borderColor: colors.accent,
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          };
        case 'accent':
          return {
            ...baseStyles,
            backgroundColor: colors.primary,
            borderWidth: 0,
          };
        default:
          return {
            ...baseStyles,
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
            borderRadius: 20,
            paddingHorizontal: isMobile ? 24 : 32,
            paddingVertical: isMobile ? 16 : 18,
            marginHorizontal: isMobile ? 0 : 8,
            marginBottom: isMobile ? 12 : 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 56, // Better touch target
            width: fullWidth ? '100%' : (isMobile ? '100%' : 'auto'),
            minWidth: isMobile ? undefined : 200,
            ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
          }}
        >
          <Animated.View style={[{ flexDirection: 'row', alignItems: 'center' }, animatedStyle]}>
            {icon && (
              <IconComponent
                name={icon as any}
                size={isMobile ? 18 : 20}
                color={getTextColor()}
                style={{ marginRight: 10 }}
              />
            )}
            <Text
              style={{
                color: getTextColor(),
                fontSize: isMobile ? 16 : 18,
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
      <AuroraBackground />
      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: isMobile ? 40 : 60,
          minHeight: isMobile ? undefined : '100%',
        }}
        bounces={true}
        alwaysBounceVertical={false}
      >
        {/* Main Content */}
        <View style={[commonStyles.content, {
          paddingHorizontal: isMobile ? 20 : commonStyles.content.paddingHorizontal,
          paddingTop: isMobile ? 40 : 60,
        }]}>
          {/* Hero Section */}
          <View style={[commonStyles.heroContainer, {
            paddingBottom: isMobile ? 40 : 60,
          }]}>
            <Animated.View style={fadeInStyle}>
              {/* 404 Number */}
              <View style={{ 
                marginBottom: isMobile ? 20 : 30, 
                alignItems: 'center',
                position: 'relative',
              }}>
                <Animated.View style={[rotateStyle, {
                  position: 'absolute',
                  width: isMobile ? 120 : 180,
                  height: isMobile ? 120 : 180,
                  borderRadius: isMobile ? 60 : 90,
                  borderWidth: 2,
                  borderColor: `${colors.accent}30`,
                  borderStyle: 'dashed',
                }]} />
                <Animated.View style={[bounceStyle]}>
                  <Text
                    style={{
                      fontSize: isMobile ? 72 : 120,
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
                </Animated.View>
              </View>

              {/* Error Icon */}
              <View
                style={{
                  backgroundColor: `${colors.accent}15`,
                  borderRadius: 30,
                  padding: isMobile ? 16 : 20,
                  marginBottom: isMobile ? 24 : 30,
                  alignSelf: 'center',
                  borderWidth: 1,
                  borderColor: `${colors.accent}25`,
                }}
              >
                <MaterialIcons 
                  name="error-outline" 
                  size={isMobile ? 40 : 50} 
                  color={colors.accent} 
                />
              </View>

              <Text style={[commonStyles.title, {
                fontSize: isMobile ? 28 : 42,
                marginBottom: isMobile ? 16 : 20,
                textAlign: 'center',
                lineHeight: isMobile ? 34 : 50,
              }]}>
                Page Not Found
              </Text>

              <Text style={[commonStyles.text, {
                fontSize: isMobile ? 16 : 20,
                lineHeight: isMobile ? 24 : 30,
                marginBottom: isMobile ? 32 : 40,
                maxWidth: isMobile ? '100%' : 600,
                textAlign: 'center',
                alignSelf: 'center',
                paddingHorizontal: isMobile ? 0 : 20,
              }]}>
                Looks like this page has taken a detour on the road to British prosperity! Don't worry, we'll get you back on track.
              </Text>
            </Animated.View>
          </View>

          {/* Quick Navigation Card */}
          <View style={[commonStyles.cardContainer, { 
            marginBottom: isMobile ? 24 : 40,
            marginHorizontal: isMobile ? 0 : 20,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: `${colors.accent}20`,
            backgroundColor: `${colors.surface}95`,
          }]}>
            <Animated.View style={fadeInStyle}>
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginBottom: 16 
              }}>
                <View style={{
                  backgroundColor: `${colors.accent}20`,
                  borderRadius: 12,
                  padding: 8,
                  marginRight: 12,
                }}>
                  <Ionicons name="information-circle" size={20} color={colors.accent} />
                </View>
                <Text style={[commonStyles.text, {
                  fontSize: isMobile ? 16 : 18,
                  fontWeight: '600',
                  color: colors.text,
                  textAlign: 'left',
                  flex: 1,
                }]}>
                  Quick Navigation Tips
                </Text>
              </View>
              <Text style={[commonStyles.text, {
                color: colors.textSecondary,
                lineHeight: isMobile ? 22 : 24,
                textAlign: 'left',
                fontSize: isMobile ? 14 : 16,
              }]}>
                Use the navigation above or the buttons below to explore our policies, join our movement, or learn about upcoming events.
              </Text>
            </Animated.View>
          </View>

          {/* Action Buttons */}
          <View style={{
            marginBottom: isMobile ? 32 : 40,
            paddingHorizontal: isMobile ? 0 : 20,
          }}>
            <View style={{
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'stretch',
              gap: isMobile ? 0 : 16,
              justifyContent: 'center',
            }}>
              <ActionButton 
                href="/" 
                icon="home" 
                iconLibrary="Ionicons"
                fullWidth={isMobile}
              >
                Back to Home
              </ActionButton>
              <ActionButton 
                href="/join" 
                variant="secondary" 
                icon="person-add" 
                iconLibrary="Ionicons"
                fullWidth={isMobile}
              >
                Join Movement
              </ActionButton>
            </View>
          </View>

          {/* Popular Sections */}
          <View style={[commonStyles.cardContainer, { 
            marginBottom: isMobile ? 32 : 40,
            marginHorizontal: isMobile ? 0 : 20,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: `${colors.accent}15`,
            backgroundColor: `${colors.surface}90`,
          }]}>
            <Animated.View style={fadeInStyle}>
              <Text style={[commonStyles.text, {
                color: colors.textSecondary,
                fontSize: isMobile ? 14 : 16,
                marginBottom: isMobile ? 16 : 20,
                textAlign: 'center',
                fontWeight: '500',
              }]}>
                Or explore these popular sections:
              </Text>
              <View style={{
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 12 : 16,
                alignItems: 'stretch',
              }}>

                <Link href="/donate" asChild>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: isMobile ? 'flex-start' : 'center',
                      backgroundColor: `${colors.surface}80`,
                      paddingHorizontal: isMobile ? 16 : 20,
                      paddingVertical: isMobile ? 14 : 16,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: `${colors.accent}25`,
                      flex: isMobile ? undefined : 1,
                      minHeight: 48,
                      shadowColor: colors.accent,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                      ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                    }}
                  >
                    <View style={{
                      backgroundColor: `${colors.accent}20`,
                      borderRadius: 8,
                      padding: 6,
                      marginRight: 12,
                    }}>
                      <Ionicons name="heart" size={16} color={colors.accent} />
                    </View>
                    <Text style={{
                      color: colors.text,
                      fontSize: isMobile ? 14 : 15,
                      fontWeight: '600',
                      flex: 1,
                      ...(Platform.OS === 'web' && {
                        fontFamily: "'Montserrat', sans-serif",
                      } as any),
                    }}>Support Progress</Text>
                  </TouchableOpacity>
                </Link>

                <Link href="/events" asChild>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: isMobile ? 'flex-start' : 'center',
                      backgroundColor: `${colors.surface}80`,
                      paddingHorizontal: isMobile ? 16 : 20,
                      paddingVertical: isMobile ? 14 : 16,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: `${colors.accent}25`,
                      flex: isMobile ? undefined : 1,
                      minHeight: 48,
                      shadowColor: colors.accent,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                      ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                    }}
                  >
                    <View style={{
                      backgroundColor: `${colors.accent}20`,
                      borderRadius: 8,
                      padding: 6,
                      marginRight: 12,
                    }}>
                      <Ionicons name="calendar" size={16} color={colors.accent} />
                    </View>
                    <Text style={{
                      color: colors.text,
                      fontSize: isMobile ? 14 : 15,
                      fontWeight: '600',
                      flex: 1,
                      ...(Platform.OS === 'web' && {
                        fontFamily: "'Montserrat', sans-serif",
                      } as any),
                    }}>Upcoming Events</Text>
                  </TouchableOpacity>
                </Link>

                <Link href="/our-approach" asChild>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: isMobile ? 'flex-start' : 'center',
                      backgroundColor: `${colors.surface}80`,
                      paddingHorizontal: isMobile ? 16 : 20,
                      paddingVertical: isMobile ? 14 : 16,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: `${colors.accent}25`,
                      flex: isMobile ? undefined : 1,
                      minHeight: 48,
                      shadowColor: colors.accent,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                      ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                    }}
                  >
                    <View style={{
                      backgroundColor: `${colors.accent}20`,
                      borderRadius: 8,
                      padding: 6,
                      marginRight: 12,
                    }}>
                      <Ionicons name="compass" size={16} color={colors.accent} />
                    </View>
                    <Text style={{
                      color: colors.text,
                      fontSize: isMobile ? 14 : 15,
                      fontWeight: '600',
                      flex: 1,
                      ...(Platform.OS === 'web' && {
                        fontFamily: "'Montserrat', sans-serif",
                      } as any),
                    }}>Our Approach</Text>
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
