import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Platform, Animated, Modal, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter, usePathname, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from '../util/auth-context';
import { useTheme } from '../util/theme-context';
import { useResponsive } from '../util/useResponsive';
import { getColors, getOptimizedShadow } from '../util/commonStyles';

// Type definition for navigation items
type NavigationItem = {
  href?: string;
  onPress?: () => void;
  icon: string;
  label: string;
  variant?: 'default' | 'primary' | 'secondary';
};

// Optimized active route detection with caching
const useActiveRoute = (href?: string) => {
  const pathname = usePathname();
  
  return useMemo(() => {
    if (!href) return false;
    return (
      pathname === href || 
      (href === '/events' && pathname.startsWith('/events/')) ||
      (href === '/newsroom' && pathname.startsWith('/news/')) ||
      (href === '/account' && pathname.startsWith('/account')) ||
      (href === '/policy' && pathname.startsWith('/policy/'))
    );
  }, [pathname, href]);
};

const Header = React.memo(function Header({ onMenuToggle }: { onMenuToggle?: (isOpen: boolean) => void }) {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { isMobile } = useResponsive();
  const colors = getColors(isDark);
  const [menuContentHeight, setMenuContentHeight] = useState(0);
  const expandedPaddingTop = 8;
  const expandedPaddingBottom = 20;
  
  // Single animation value for mobile menu - much more performant
  const menuAnim = useRef(new Animated.Value(0)).current;

  // Optimized animation effect with reduced complexity
  useEffect(() => {
    Animated.timing(menuAnim, {
      toValue: isMobileMenuOpen ? 1 : 0,
      duration: isMobileMenuOpen ? 300 : 200,
      easing: isMobileMenuOpen ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web', // Use native driver on native platforms
    }).start();
  }, [isMobileMenuOpen]);

  const handleLogoutRequest = useCallback(() => {
    setShowLogoutConfirm(true);
    if (isMobile) {
      setIsMobileMenuOpen(false);
      onMenuToggle?.(false);
    }
  }, [isMobile, onMenuToggle]);

  const handleLogoutConfirm = useCallback(async () => {
    setShowLogoutConfirm(false);
    
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout]);

  const handleLogoutCancel = useCallback(() => {
    setShowLogoutConfirm(false);
  }, []);

  const handleNavigation = useCallback((href?: string, onPress?: () => void) => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
      onMenuToggle?.(false);
    }
    if (onPress) {
      onPress();
    } else if (href) {
      router.replace(href as any);
    }
  }, [isMobile, onMenuToggle, router]);

  const handleMenuToggle = useCallback(() => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    onMenuToggle?.(newState);
  }, [isMobileMenuOpen, onMenuToggle]);

  // Memoized Mobile Menu Button Component - simplified
  const MobileMenuButton = React.memo(({ 
    isMobileMenuOpen, 
    handleMenuToggle, 
    menuAnim, 
    colors,
    isDark
  }: {
    isMobileMenuOpen: boolean;
    handleMenuToggle: () => void;
    menuAnim: Animated.Value;
    colors: any;
    isDark: boolean;
  }) => {
    const rotate = menuAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    return (
      <TouchableOpacity
        onPress={handleMenuToggle}
        style={{
          padding: 10,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: isMobileMenuOpen ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        }}
      >
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons 
            name={isMobileMenuOpen ? "close" : "menu"} 
            size={24} 
            color={isMobileMenuOpen ? colors.text : colors.textSecondary}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  });

  // Memoized Theme Toggle Component
  const ThemeToggle = React.memo(({ isDark, toggleTheme, colors }: { 
    isDark: boolean; 
    toggleTheme: () => void; 
    colors: any;
  }) => (
    <TouchableOpacity
      onPress={toggleTheme}
      style={{
        marginLeft: 15,
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
  ));

  // Optimized NavButton with better memoization
  const NavButton = React.memo(({ 
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
    
    const isActive = useActiveRoute(href);
    const itemAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (isMobileMenu && isMobileMenuOpen) {
        Animated.timing(itemAnim, {
          toValue: 1,
          duration: 250,
          delay: animationDelay,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: Platform.OS !== 'web',
        }).start();
      } else if (isMobileMenu && !isMobileMenuOpen) {
        Animated.timing(itemAnim, {
          toValue: 0,
          duration: 150,
          easing: Easing.in(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }).start();
      }
    }, [isMobileMenu, isMobileMenuOpen, animationDelay]);

    // Memoized styles to prevent recalculation
    const buttonStyles = useMemo(() => {
      const baseStyles = {
        backgroundColor: 'transparent',
        paddingHorizontal: isMobile ? 16 : 16,
        paddingVertical: isMobile ? 14 : 10,
        borderRadius: isMobile ? 10 : 20,
        ...(isMobileMenu && { width: '100%' as const }),
      };

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
            backgroundColor: '#660033',
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
    }, [isActive, variant, isMobile, isMobileMenu, isDark]);

    const textColor = useMemo(() => {
      if (isActive && variant === 'default') {
        return colors.text;
      }

      switch (variant) {
        case 'primary':
          return '#ffffff';
        case 'secondary':
          return colors.text;
        default:
          return colors.text;
      }
    }, [isActive, variant, colors.text]);

    const IconComponent = useMemo(() => {
      return iconLibrary === 'MaterialIcons' ? MaterialIcons : 
             iconLibrary === 'FontAwesome5' ? FontAwesome5 : Ionicons;
    }, [iconLibrary]);

    const MemoizedIcon = useMemo(() => {
      if (!icon) return null;
      return (
        <IconComponent 
          name={icon as any} 
          size={isMobileMenu ? 20 : 16} 
          color={textColor} 
          style={{ marginRight: children ? (isMobileMenu ? 12 : 6) : 0 }} 
        />
      );
    }, [icon, isMobileMenu, children, IconComponent, textColor]);

    const ButtonComponent = isMobileMenu ? Animated.View : View;
    const TouchableComponent = TouchableOpacity;

    return (
      <TouchableComponent
        onPress={() => handleNavigation(href, onPress)}
        style={[
          buttonStyles,
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
            ...getOptimizedShadow('medium', isDark, variant === 'primary' ? '#660033' : (isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)')),
          }
        ]}
      >
        <ButtonComponent 
          style={[
            { flexDirection: 'row', alignItems: 'center' },
            isMobileMenu && {
              opacity: itemAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
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
          {MemoizedIcon}
          {children && (
            <Text 
              style={{ 
                color: textColor, 
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
  });

  // Memoized navigation items to prevent recreation
  const navigationItems: NavigationItem[] = useMemo(() => {
    if (!isAuthenticated) {
      return [
        { href: "/", icon: "home", label: "Home" },
        { href: "/about", icon: "information-circle", label: "About" },
        { href: "/our-approach", icon: "analytics", label: "Our Approach" },
        { href: "/policy", icon: "document-text", label: "Policies" },
        { href: "/join", icon: "people", label: "Join Us", variant: "primary" as const },
        { href: "/login", icon: "log-in", label: "Login" },
      ];
    } else {
      // Build authenticated navigation items conditionally
      const baseItems: NavigationItem[] = [
        { href: "/account", icon: "person", label: "Account" },
        { href: "/newsroom", icon: "newspaper", label: "Newsroom" },
        { href: "/policy", icon: "document-text", label: "Policies" },
        { href: "/events", icon: "calendar", label: "Events" },
      ];

      // Insert admin link after Events if user is admin
      const hasAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('ONBOARDING');
      if (hasAdmin) {
        baseItems.push({ href: "/user-management", icon: "people", label: "User Management" });
      }

      // Add remaining items
      baseItems.push(
        { href: "/settings", icon: "settings", label: "Settings" },
        { onPress: handleLogoutRequest, icon: "log-out", label: "Logout", variant: "secondary" as const }
      );

      return baseItems;
    }
  }, [isAuthenticated, user?.role, user?.roles, handleLogoutRequest]);

  return (
    <View>
      <SafeAreaView 
        style={{
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.2)',
        }}
        edges={['top']}
      >
        <View 
          style={{
            borderBottomWidth: 1,
            borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            ...getOptimizedShadow('medium', isDark, isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)'),
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
              onPress={() => router.replace('/')} 
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
                {navigationItems.map((item, index) => (
                  <NavButton 
                    key={item.href || item.label} 
                    href={item.href} 
                    onPress={item.onPress}
                    icon={item.icon}
                    variant={item.variant}
                  >
                    {item.label}
                  </NavButton>
                ))}
                <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} colors={colors} />
                </View>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <MobileMenuButton 
                isMobileMenuOpen={isMobileMenuOpen}
                handleMenuToggle={handleMenuToggle}
                menuAnim={menuAnim}
                colors={colors}
                isDark={isDark}
              />
            )}
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Hidden measurer for mobile menu content height */}
      {isMobile && (
        <View
          style={{ position: 'absolute', left: 0, right: 0, opacity: 0, pointerEvents: 'none', zIndex: -1 }}
          onLayout={(e) => setMenuContentHeight(e.nativeEvent.layout.height)}
        >
          <View style={{ paddingHorizontal: 16, paddingTop: expandedPaddingTop, paddingBottom: expandedPaddingBottom }}>
            <View 
              style={{
                height: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                marginBottom: 16,
                marginHorizontal: -16,
              }}
            />
            {navigationItems.map((item, index) => (
              <NavButton 
                key={item.href || item.label} 
                href={item.href} 
                onPress={item.onPress}
                icon={item.icon}
                variant={item.variant}
                isMobileMenu
                animationDelay={index * 50}
              >
                {item.label}
              </NavButton>
            ))}
            <View style={{ paddingTop: 8 }}>
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
                  marginTop: 8,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(177,0,36,0.12)',
                  ...getOptimizedShadow('light', isDark, isDark ? 'rgba(177, 0, 36, 0.08)' : 'rgba(177, 0, 36, 0.04)'),
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
            </View>
          </View>
        </View>
      )}

      {/* Mobile Menu Dropdown - optimized */}
      {isMobile && (
        <Animated.View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            paddingHorizontal: 16,
            ...getOptimizedShadow('heavy', isDark, Platform.OS === 'web' && isMobile ? 
              (isDark ? 'rgba(0, 0, 0, 0.98)' : 'rgba(255, 255, 255, 0.98)') : 
              (isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)')),
            maxHeight: menuAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, Math.max(1, menuContentHeight)],
            }),
            opacity: menuAnim,
            overflow: 'hidden',
            paddingTop: expandedPaddingTop,
            paddingBottom: expandedPaddingBottom,
          }}
        >
          <View>
            <View 
              style={{
                height: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                marginBottom: 16,
                marginHorizontal: -16,
              }}
            />
            
            {navigationItems.map((item, index) => (
              <NavButton 
                key={item.href || item.label} 
                href={item.href} 
                onPress={item.onPress}
                icon={item.icon}
                variant={item.variant}
                isMobileMenu
                animationDelay={index * 50}
              >
                {item.label}
              </NavButton>
            ))}

            {/* Theme Toggle for Mobile */}
            <Animated.View
              style={{
                opacity: menuAnim,
                transform: [
                  {
                    translateX: menuAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              }}
            >
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
                marginTop: 8,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(177,0,36,0.12)',
                ...getOptimizedShadow('light', isDark, isDark ? 'rgba(177, 0, 36, 0.08)' : 'rgba(177, 0, 36, 0.04)'),
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
          </View>
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
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 400,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
              ...getOptimizedShadow('heavy', true, '#111111'),
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
                  borderRadius: 8,
                  paddingVertical: 14,
                  alignItems: 'center',
                  ...getOptimizedShadow('medium', false, 'rgba(177, 0, 36, 0.8)'),
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
    </View>
  );
});

export default Header;
