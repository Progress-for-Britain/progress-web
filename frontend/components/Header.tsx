import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, Animated, Modal } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from '../util/auth-context';
import { useResponsive } from '../util/useResponsive';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { isMobile } = useResponsive();
  
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
        paddingHorizontal: isMobileMenu ? 16 : 16,
        paddingVertical: isMobileMenu ? 14 : 10,
        borderRadius: isMobileMenu ? 10 : 10,
        ...(isMobileMenu && { width: '100%' as const }),
      };

      switch (variant) {
        case 'primary':
          return {
            ...baseStyles,
            backgroundColor: '#d946ef',
            paddingHorizontal: isMobileMenu ? 16 : 20,
            paddingVertical: isMobileMenu ? 14 : 12,
            borderRadius: 12,
          };
        case 'secondary':
          return {
            ...baseStyles,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: '#d946ef',
            paddingHorizontal: isMobileMenu ? 16 : 16,
            paddingVertical: isMobileMenu ? 14 : 10,
            borderRadius: 12,
          };
        default:
          return baseStyles;
      }
    };

    const getTextColor = () => {
      switch (variant) {
        case 'primary':
          return '#ffffff';
        case 'secondary':
          return '#d946ef';
        default:
          return '#374151';
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
              backgroundColor: variant === 'default' ? '#f9fafb' : undefined,
            }),
          },
          variant !== 'default' && {
            shadowColor: variant === 'primary' ? '#d946ef' : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: variant === 'primary' ? 0.2 : 0.1,
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
                fontWeight: variant === 'default' ? '500' : '600',
                fontSize: isMobileMenu ? 16 : 15
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
          backgroundColor: '#ffffff',
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
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
            {/* Enhanced Logo */}
            <TouchableOpacity 
              onPress={() => router.push('/')} 
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
            >
              <View 
                style={{ 
                  width: isMobile ? 36 : 40, 
                  height: isMobile ? 36 : 40, 
                  backgroundColor: '#d946ef', 
                  borderRadius: 12, 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginRight: isMobile ? 8 : 12,
                  shadowColor: '#d946ef',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 4,
                }}
              >
                <FontAwesome5 name="flag" size={isMobile ? 16 : 18} color="#ffffff" />
              </View>
              <View>
                <Text style={{ 
                  fontSize: isMobile ? 18 : 22, 
                  fontWeight: 'bold', 
                  color: '#111827',
                  lineHeight: isMobile ? 22 : 26
                }}>
                  Progress UK
                </Text>
                <Text style={{ 
                  fontSize: isMobile ? 10 : 11, 
                  color: '#6B7280',
                  fontWeight: '500',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase'
                }}>
                  Unleashing Potential
                </Text>
              </View>
            </TouchableOpacity>

            {/* Desktop Navigation */}
            {!isMobile && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {!isAuthenticated ? (
                  // Unauthenticated navigation
                  <>
                    <NavButton href="/" icon="home">Home</NavButton>
                    <NavButton href="/donate" icon="heart" variant="secondary">Donate</NavButton>
                    <NavButton href="/join" icon="people" variant="primary">Join Us</NavButton>
                    <NavButton href="/login" icon="log-in">Login</NavButton>
                  </>
                ) : (
                  // Authenticated navigation
                  <>
                    <NavButton href="/account" icon="person">Account</NavButton>
                    <NavButton href="/newsroom" icon="newspaper">Newsroom</NavButton>
                    <NavButton href="/events" icon="calendar">Events</NavButton>
                    <NavButton href="/settings" icon="settings">Settings</NavButton>
                    <NavButton onPress={handleLogoutRequest} icon="log-out" variant="secondary">
                      Logout
                    </NavButton>
                  </>
                )}
              </View>
            )}

            {/* Mobile Menu Button with Animation */}
            {isMobile && (
              <TouchableOpacity
                onPress={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  backgroundColor: isMobileMenuOpen ? '#f3f4f6' : 'transparent',
                  borderWidth: 1,
                  borderColor: isMobileMenuOpen ? '#d1d5db' : 'transparent',
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
                    color={isMobileMenuOpen ? '#d946ef' : '#374151'} 
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
            backgroundColor: '#ffffff',
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
            paddingHorizontal: 16,
            paddingTop: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 8,
            maxHeight: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 300], // Adjust based on your menu content
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
                backgroundColor: '#f3f4f6',
                marginBottom: 16,
                marginHorizontal: -16,
              }}
            />
            
            {!isAuthenticated ? (
              // Unauthenticated mobile navigation with staggered animations
              <>
                <NavButton href="/" icon="home" isMobileMenu animationDelay={0}>Home</NavButton>
                <NavButton href="/donate" icon="heart" variant="secondary" isMobileMenu animationDelay={100}>Donate</NavButton>
                <NavButton href="/join" icon="people" variant="primary" isMobileMenu animationDelay={200}>Join Us</NavButton>
                <NavButton href="/login" icon="log-in" isMobileMenu animationDelay={300}>Login</NavButton>
              </>
            ) : (
              // Authenticated mobile navigation with staggered animations
              <>
                <NavButton href="/account" icon="person" isMobileMenu animationDelay={0}>Account</NavButton>
                <NavButton href="/newsroom" icon="newspaper" isMobileMenu animationDelay={100}>Newsroom</NavButton>
                <NavButton href="/settings" icon="settings" isMobileMenu animationDelay={200}>Settings</NavButton>
                <View style={{ height: 8 }} />
                <NavButton onPress={handleLogoutRequest} icon="log-out" variant="secondary" isMobileMenu animationDelay={300}>
                  Logout
                </NavButton>
              </>
            )}
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
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 400,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  backgroundColor: '#fee2e2',
                  borderRadius: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <Ionicons name="log-out" size={28} color="#dc2626" />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#111827',
                  textAlign: 'center',
                  marginBottom: 8,
                }}
              >
                Confirm Logout
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: '#6B7280',
                  textAlign: 'center',
                  lineHeight: 24,
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
                  backgroundColor: '#f3f4f6',
                  borderRadius: 8,
                  paddingVertical: 14,
                  alignItems: 'center',
                  ...(Platform.OS === 'web' && { cursor: 'pointer' } as any),
                }}
              >
                <Text
                  style={{
                    color: '#374151',
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogoutConfirm}
                style={{
                  flex: 1,
                  backgroundColor: '#dc2626',
                  borderRadius: 8,
                  paddingVertical: 14,
                  alignItems: 'center',
                  shadowColor: '#dc2626',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
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
