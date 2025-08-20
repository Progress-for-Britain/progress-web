import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, Animated, Modal } from 'react-native';
import { Link, useRouter, usePathname } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from '../util/auth-context';
import { useTheme } from '../util/theme-context';
import { useResponsive } from '../util/useResponsive';
import { getColors } from '../util/commonStyles';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { isMobile } = useResponsive();
  const colors = getColors(isDark);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Animation effect
  useEffect(() => {
    if (isMobileMenuOpen) {
      // Open animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Close animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isMobileMenuOpen]);

  const handleLogoutRequest = () => {
    setShowLogoutConfirm(true);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false);
    
    try {
      await logout();
      // Don't manually navigate - let the auth state change handle the redirect
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const handleNavigation = (href?: string, onPress?: () => void) => {
    if (isMobile) {
      setIsMobileMenuOpen(false); // Close mobile menu on navigation
    }
    if (onPress) {
      onPress();
    } else if (href) {
      router.push(href as any);
    }
  };

  const NavButton = ({ 
    href, 
    children, 
    onPress, 
    icon,
    iconLibrary = 'Ionicons',
    variant = 'default',
    isMobileMenu = false,
    animationDelay = 0
  }: { 
    href?: string; 
    children: React.ReactNode; 
    onPress?: () => void;
    icon?: string;
    iconLibrary?: 'Ionicons' | 'MaterialIcons' | 'FontAwesome5';
    variant?: 'default' | 'primary' | 'secondary';
    isMobileMenu?: boolean;
    animationDelay?: number;
  }) => {
    
    const itemAnim = useRef(new Animated.Value(0)).current;

    // Check if this nav item is active
    const isActive = href ? (
      pathname === href || 
      (href === '/events' && pathname.startsWith('/events/')) ||
      (href === '/newsroom' && pathname.startsWith('/news/')) ||
      (href === '/account' && pathname.startsWith('/account'))
    ) : false;

    useEffect(() => {
      if (isMobileMenu && isMobileMenuOpen) {
        Animated.timing(itemAnim, {
          toValue: 1,
          duration: 200,
          delay: animationDelay,
          useNativeDriver: true,
        }).start();
      } else if (isMobileMenu && !isMobileMenuOpen) {
        itemAnim.setValue(0);
      }
    }, [isMobileMenuOpen, isMobileMenu, animationDelay]);

    const getButtonStyles = () => {
      const baseStyles = {
        backgroundColor: 'transparent',
        paddingHorizontal: isMobile ? 16 : 16,
        paddingVertical: isMobile ? 14 : 10,
        borderRadius: isMobile ? 10 : 20,
        ...(isMobileMenu && { width: '100%' as const }),
      };

      // Handle active state - add subtle glow effect
      if (isActive && variant === 'default') {
        return {
          ...baseStyles,
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
        };
      }

      switch (variant) {
        case 'primary':
          return {
            ...baseStyles,
            backgroundColor: '#660033', // Updated Join Us button color
            paddingHorizontal: isMobile ? 16 : 20,
            paddingVertical: isMobile ? 14 : 12,
            borderRadius: 12,
          };
        case 'secondary':
          return {
            ...baseStyles,
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: 'rgba(177, 0, 36, 0.6)',
            paddingHorizontal: isMobile ? 16 : 16,
            paddingVertical: isMobile ? 14 : 10,
            borderRadius: 12,
          };
        default:
          return baseStyles;
      }
    };

    const getTextColor = () => {
      // Handle active state - always ensure good contrast
      if (isActive && variant === 'default') {
        return colors.text;
      }

      switch (variant) {
        case 'primary':
          return '#ffffff'; // Keep white for primary buttons (colored background)
        case 'secondary':
          return colors.text; // Use theme text color for secondary buttons
        default:
          return colors.text; // Use theme text color for default buttons
      }
    };

    const IconComponent = iconLibrary === 'MaterialIcons' ? MaterialIcons : 
                         iconLibrary === 'FontAwesome5' ? FontAwesome5 : Ionicons;

    const ButtonComponent = isMobileMenu ? Animated.View : View;
    const TouchableComponent = TouchableOpacity;

    return (
      <TouchableComponent
        onPress={() => handleNavigation(href, onPress)}
        style={[
          getButtonStyles(),
          {
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: isMobileMenu ? 0 : 4,
            marginVertical: isMobileMenu ? 6 : 0,
            ...(Platform.OS === 'web' && { cursor: 'pointer' }),
            ...(isMobileMenu && {
              backgroundColor: variant === 'default' ? 'rgba(255, 255, 255, 0.05)' : undefined,
            }),
          },
          (variant !== 'default') && {
            shadowColor: variant === 'primary' ? '#B10024' : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: variant === 'primary' ? 0.4 : 0.3,
            shadowRadius: 4,
            elevation: 3,
          }
        ]}
      >
        <ButtonComponent 
          style={[
            { flexDirection: 'row', alignItems: 'center' },
            isMobileMenu && {
              opacity: itemAnim,
              transform: [
                {
                  translateX: itemAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {icon && (
            <IconComponent 
              name={icon as any} 
              size={isMobileMenu ? 20 : 16} 
              color={getTextColor()} 
              style={{ marginRight: children ? (isMobileMenu ? 12 : 6) : 0 }} 
            />
          )}
          {children && (
            <Text 
              style={{ 
                color: getTextColor(), 
                fontWeight: isActive && variant === 'default' ? '700' : 
                           variant === 'default' ? '500' : '600',
                fontSize: isMobileMenu ? 16 : 15,
                fontFamily: Platform.OS === 'web' ? "'Montserrat', sans-serif" : undefined,
              }}
            >
              {children}
            </Text>
          )}
        </ButtonComponent>
      </TouchableComponent>
    );
  };

  return (
    <>
      <View 
        style={{
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          shadowColor: isDark ? '#000' : '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.8 : 0.1,
          shadowRadius: 8,
          elevation: 4,
          width: '100%',
        }}
      >
        <View style={{ width: '100%', paddingHorizontal: isMobile ? 16 : 20 }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            height: isMobile ? 64 : 72,
            paddingVertical: 8,
            width: '100%'
          }}>
            {/* Progress brand name */}
            <TouchableOpacity 
              onPress={() => router.push('/')} 
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
            >
              <Text style={{ 
                fontSize: isMobile ? 18 : 22, 
                fontWeight: '700', 
                color: colors.text,
                lineHeight: isMobile ? 22 : 26,
                fontFamily: Platform.OS === 'web' ? "'Montserrat', sans-serif" : undefined,
                letterSpacing: 1,
              }}>
                PROGRESS
              </Text>
            </TouchableOpacity>

            {/* Desktop Navigation */}
            {!isMobile && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                
                {!isAuthenticated ? (
                  // Unauthenticated navigation
                  <>
                  <NavButton href="/" icon="home">Home</NavButton>
                  <NavButton href="/about" icon="information-circle">About</NavButton>
                  {/* <NavButton href="/donate" icon="heart" variant="secondary">Donate</NavButton> */}
                  <NavButton href="/join" icon="people">Join Us</NavButton>
                  <NavButton href="/login" icon="log-in">Login</NavButton>
                  </>
                ) : (
                  // Authenticated navigation
                  <>
                  <NavButton href="/account" icon="person">Account</NavButton>
                  <NavButton href="/newsroom" icon="newspaper">Newsroom</NavButton>
                  <NavButton href="/events" icon="calendar">Events</NavButton>
                  {user?.role === 'ADMIN' && (
                    <NavButton href="/user-management" icon="people">User Management</NavButton>
                  )}
                  <NavButton href="/settings" icon="settings">Settings</NavButton>
                  <NavButton onPress={handleLogoutRequest} icon="log-out" variant="secondary">
                    Logout
                  </NavButton>
                  </>
                )}
                {/* Theme Toggle */}
                <TouchableOpacity
                  onPress={toggleTheme}
                  style={{
                    marginRight: 16,
                    padding: 8,
                    borderRadius: 20,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    ...(Platform.OS === 'web' && { cursor: 'pointer' } as any),
                  }}
                >
                  <Ionicons 
                    name={isDark ? "moon" : "sunny"} 
                    size={20} 
                    color={colors.text} 
                  />
                </TouchableOpacity>
                </View>
            )}

            {/* Mobile Menu Button with Animation */}
            {isMobile && (
              <TouchableOpacity
                onPress={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  backgroundColor: isMobileMenuOpen ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  borderWidth: 1,
                  borderColor: isMobileMenuOpen ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                }}
              >
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: rotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '180deg'],
                        }),
                      },
                    ],
                  }}
                >
                  <Ionicons 
                    name={isMobileMenuOpen ? "close" : "menu"} 
                    size={24} 
                    color={isMobileMenuOpen ? colors.text : colors.textSecondary}
                  />
                </Animated.View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Animated Mobile Menu Dropdown */}
      {isMobile && (
        <Animated.View
          style={{
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            paddingHorizontal: 16,
            paddingTop: 8,
            shadowColor: isDark ? '#000' : '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.8 : 0.1,
            shadowRadius: 12,
            elevation: 8,
            maxHeight: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1000], // Adjust based on your menu content
            }),
            opacity: fadeAnim,
            paddingBottom: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 20],
            }),
            overflow: 'hidden',
          }}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            }}
          >
            {/* Separator line */}
            <View 
              style={{
                height: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                marginBottom: 16,
                marginHorizontal: -16,
              }}
            />
            
            {!isAuthenticated ? (
              // Unauthenticated mobile navigation with staggered animations
              <>
                <NavButton href="/" icon="home" isMobileMenu animationDelay={0}>Home</NavButton>
                <NavButton href="/about" icon="information-circle" isMobileMenu animationDelay={100}>About</NavButton>
                {/* <NavButton href="/donate" icon="heart" variant="secondary" isMobileMenu animationDelay={100}>Donate</NavButton> */}
                <NavButton href="/join" icon="people" variant="primary" isMobileMenu animationDelay={200}>Join Us</NavButton>
                <NavButton href="/login" icon="log-in" isMobileMenu animationDelay={300}>Login</NavButton>
              </>
            ) : (
              // Authenticated mobile navigation with staggered animations
              <>
                <NavButton href="/account" icon="person" isMobileMenu animationDelay={0}>Account</NavButton>
                <NavButton href="/newsroom" icon="newspaper" isMobileMenu animationDelay={100}>Newsroom</NavButton>
                <NavButton href="/events" icon="calendar">Events</NavButton>
                {user?.role === 'ADMIN' && (
                    <NavButton href="/user-management" icon="people">User Management</NavButton>
                  )}
                <NavButton href="/settings" icon="settings" isMobileMenu animationDelay={200}>Settings</NavButton>
                <View style={{ height: 8 }} />
                <NavButton onPress={handleLogoutRequest} icon="log-out" variant="secondary" isMobileMenu animationDelay={300}>
                  Logout
                </NavButton>
              </>
            )}

            {/* Theme Toggle for Mobile - Improved UI */}
            <TouchableOpacity
              onPress={toggleTheme}
              activeOpacity={0.85}
              style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 14,
              paddingHorizontal: 18,
              marginHorizontal: -12,
              marginBottom: 10,
              backgroundColor: isDark ? 'rgba(177, 0, 36, 0.08)' : 'rgba(177, 0, 36, 0.04)',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(177,0,36,0.12)',
              shadowColor: '#B10024',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 4,
              elevation: 2,
              }}
            >
              <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(177,0,36,0.08)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
              >
              <Ionicons
                name={isDark ? "moon" : "sunny"}
                size={20}
                color={isDark ? "#FFD700" : "#B10024"}
              />
              </View>
              <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
              flex: 1,
              letterSpacing: 0.2,
              }}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
              <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textSecondary}
              style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={handleLogoutCancel}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              backgroundColor: '#111111',
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 400,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.6,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  backgroundColor: 'rgba(177, 0, 36, 0.2)',
                  borderRadius: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: 'rgba(177, 0, 36, 0.3)',
                }}
              >
                <Ionicons name="log-out" size={28} color="#B10024" />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  textAlign: 'center',
                  marginBottom: 8,
                  fontFamily: Platform.OS === 'web' ? "'Montserrat', sans-serif" : undefined,
                }}
              >
                Confirm Logout
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: 'rgba(255, 255, 255, 0.7)',
                  textAlign: 'center',
                  lineHeight: 24,
                  fontFamily: Platform.OS === 'web' ? "'Montserrat', sans-serif" : undefined,
                }}
              >
                Are you sure you want to log out of your account?
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={handleLogoutCancel}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  paddingVertical: 14,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  ...(Platform.OS === 'web' && { cursor: 'pointer' } as any),
                }}
              >
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: '600',
                    fontFamily: Platform.OS === 'web' ? "'Montserrat', sans-serif" : undefined,
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogoutConfirm}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(177, 0, 36, 0.8)',
                  borderRadius: 8,
                  paddingVertical: 14,
                  alignItems: 'center',
                  shadowColor: '#B10024',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.5,
                  shadowRadius: 4,
                  elevation: 4,
                  ...(Platform.OS === 'web' && { cursor: 'pointer' } as any),
                }}
              >
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: '600',
                    fontFamily: Platform.OS === 'web' ? "'Montserrat', sans-serif" : undefined,
                  }}
                >
                  Yes, Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
