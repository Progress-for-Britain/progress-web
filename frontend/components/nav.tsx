import React, { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { View, Text, Platform, StyleSheet, TouchableOpacity, Animated, Dimensions, Modal } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../util/theme-context";
import { getColors } from "../util/commonStyles";

// Type definition for navigation items
type NavigationItem = {
  href: string;
  icon: string;
  label: string;
  variant?: 'default' | 'primary' | 'secondary';
};

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
  const colors = getColors(isDark);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(
    Platform.OS === 'web' ? window?.innerWidth || 1400 : Dimensions.get('window').width
  );
  
  // Animation refs for each navigation item
  const animationRefs = useRef<{ [key: string]: Animated.Value }>({});
  const scaleAnimationRefs = useRef<{ [key: string]: Animated.Value }>({});
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  // Track screen width changes
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleResize = () => {
        setScreenWidth(window.innerWidth);
        // Close dropdown on resize to prevent layout issues
        if (isDropdownOpen) {
          setIsDropdownOpen(false);
        }
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isDropdownOpen]);

  const isLargeScreen = screenWidth >= 1380;

  // Navigation items
  const navigationItems: NavigationItem[] = useMemo(() => [
    { href: "/", icon: "home", label: "Home" },
    { href: "/about", icon: "information-circle", label: "About" },
    { href: "/our-approach", icon: "analytics", label: "Our Approach" },
    { href: "/policy", icon: "document-text", label: "Policies" },
    { href: "/join", icon: "people", label: "Join Us", variant: "primary" as const },
    { href: "/login", icon: "log-in", label: "Login" },
  ], []);

  // Initialize animation values
  navigationItems.forEach(item => {
    if (!animationRefs.current[item.href]) {
      animationRefs.current[item.href] = new Animated.Value(0);
    }
    if (!scaleAnimationRefs.current[item.href]) {
      scaleAnimationRefs.current[item.href] = new Animated.Value(1);
    }
  });

  // Check if route is active
  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Animate dropdown
  useEffect(() => {
    Animated.timing(dropdownAnim, {
      toValue: isDropdownOpen ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isDropdownOpen]);

  // Animate items based on active state (only for large screens)
  useEffect(() => {
    if (isLargeScreen) {
      navigationItems.forEach(item => {
        const isActive = isActiveRoute(item.href);
        const opacityValue = animationRefs.current[item.href];
        
        Animated.timing(opacityValue, {
          toValue: isActive ? 1 : 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [pathname, navigationItems, isLargeScreen]);

  // Handle press with scale animation (only for large screens)
  const handlePress = useCallback((href: string) => {
    if (isLargeScreen) {
      const scaleValue = scaleAnimationRefs.current[href];
      
      // Scale down then up animation
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();

      // Navigate after a short delay to show the animation
      setTimeout(() => {
        router.push(href as any);
      }, 100);
    } else {
      // Immediate navigation for dropdown
      router.push(href as any);
      setIsDropdownOpen(false);
    }
  }, [isLargeScreen, router]);

  const handleMenuToggle = useCallback(() => {
    setIsDropdownOpen(!isDropdownOpen);
  }, [isDropdownOpen]);

  const styles = useMemo(() => StyleSheet.create({
    /* HEADER */
    header: {
      position: "absolute",
      top: 18,
      left: 28,
      right: 28,
      height: 48,
      zIndex: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      pointerEvents: "box-none",
    },
    brandContainer: {
      ...(Platform.OS === "web" && {
        cursor: "pointer",
      }),
    },
    brand: {
      fontSize: 40,
      fontWeight: "600",
      letterSpacing: -0.5,
      color: colors.text,
      ...(Platform.OS === "web" && {
        fontFamily: "ui-sans-serif, -apple-system, Segoe UI, Helvetica, Arial",
      }),
    },
  headerRight: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 16 
  },
  darkModeToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    padding: 1,
    justifyContent: 'center',
    ...(Platform.OS === "web" && {
      cursor: "pointer",
      transition: "all 0.3s ease",
    }),
  },
  darkModeSlider: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === "web" && {
      transition: "all 0.3s ease",
    }),
  },
  darkModeIcon: {
    fontSize: 10,
  },
  menuPill: {
      backgroundColor: isDark ? colors.surface : "#0F172A",
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 999,
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? colors.border : "transparent",
      ...(Platform.OS === "web" && {
        boxShadow: isDark 
          ? "0 1px 0 rgba(255,255,255,0.1) inset, 0 8px 20px rgba(0,0,0,0.25)"
          : "0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 20px rgba(0,0,0,0.12)",
      }),
    },
    menuPillText: {
      color: isDark ? colors.text : "#FFFFFF",
      fontSize: 12,
      opacity: 0.8,
      ...(Platform.OS === "web" && { userSelect: "none" } as any),
    },

    /* RIGHT RAIL */
    rightRail: {
      position: "absolute",
      right: 26,
      top: 120,
      gap: 16,
      zIndex: 5,
      alignItems: "flex-end",
    },
    railItemContainer: {
      position: "relative",
      alignItems: "flex-end",
      borderRadius: 12,
      backgroundColor: "transparent",
    },
    touchableContainer: {
      alignItems: "flex-end",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: "transparent",
      ...(Platform.OS === "web" && {
        transition: "all 0.2s ease",
        cursor: "pointer",
      }),
    },
    railItemActiveContainer: {
      backgroundColor: isDark 
        ? "rgba(255, 255, 255, 0.08)" 
        : "rgba(15, 23, 42, 0.05)",
      ...(Platform.OS === "web" && {
        boxShadow: isDark 
          ? "0 2px 8px rgba(255, 255, 255, 0.1)"
          : "0 2px 8px rgba(15, 23, 42, 0.1)",
      }),
    },
    railItem: {
      fontSize: 15,
      letterSpacing: 0.3,
      fontWeight: "500",
      ...(Platform.OS === "web" && {
        fontFamily: "ui-sans-serif, -apple-system, Segoe UI, Helvetica, Arial",
        transition: "all 0.2s ease",
      }),
    },
    railMuted: { 
      color: isDark ? "#9CA3AF" : "#9CA3AF",
      ...(Platform.OS === "web" && {
        "&:hover": {
          color: isDark ? "#D1D5DB" : "#6B7280",
        },
      }),
    },
    railActive: {
      color: colors.text,
      fontWeight: "600",
      letterSpacing: 0.2,
    },
    activeIndicator: {
      position: "absolute",
      right: 4,
      top: "50%",
      width: 3,
      height: 3,
      borderRadius: 999,
      backgroundColor: colors.text,
      ...(Platform.OS === "web" && {
        transform: "translateY(-50%)",
        boxShadow: `0 0 8px ${colors.text}66`,
      }),
    },

    /* DROPDOWN STYLES */
    dropdown: {
      position: "absolute",
      top: 80,
      right: 26,
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingVertical: 8,
      minWidth: 200,
      zIndex: 1000,
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? colors.border : "transparent",
      ...(Platform.OS === "web" && {
        boxShadow: isDark 
          ? "0 10px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)"
          : "0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)",
      }),
      // For React Native
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: isDark ? 0.4 : 0.15,
      shadowRadius: 20,
      elevation: 10,
    },
    dropdownItem: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: isDark 
        ? "rgba(255, 255, 255, 0.08)" 
        : "rgba(0, 0, 0, 0.05)",
      ...(Platform.OS === "web" && {
        transition: "background-color 0.15s ease",
        cursor: "pointer",
      }),
    },
    dropdownItemActive: {
      backgroundColor: isDark 
        ? "rgba(255, 255, 255, 0.08)" 
        : "rgba(15, 23, 42, 0.05)",
    },
    dropdownItemLast: {
      borderBottomWidth: 0,
    },
    dropdownItemText: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.text,
      letterSpacing: 0.2,
      ...(Platform.OS === "web" && {
        fontFamily: "ui-sans-serif, -apple-system, Segoe UI, Helvetica, Arial",
      }),
    },
    dropdownItemTextActive: {
      color: colors.text,
      fontWeight: "600",
    },
    dropdownActiveIndicator: {
      width: 6,
      height: 6,
      borderRadius: 999,
      backgroundColor: colors.text,
      ...(Platform.OS === "web" && {
        boxShadow: `0 0 8px ${colors.text}66`,
      }),
    },
    backdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
    },
    
    // Theme toggle styles
    dropdownSeparator: {
      height: 1,
      marginHorizontal: 20,
      marginVertical: 8,
    },
    themeToggleItem: {
      borderBottomWidth: 0,
    },
    themeToggleContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    themeToggleIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
  }), [isDark, colors]);

  return (
    <>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.push("/")}
          style={styles.brandContainer}
          activeOpacity={0.7}
        >
          <Text style={[styles.brand, { color: colors.text }]}>Progress</Text>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          {/* Dark Mode Toggle */}
          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.darkModeToggle, { 
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
            }]}
            activeOpacity={0.8}
          >
            <Animated.View style={[
              styles.darkModeSlider,
              {
                backgroundColor: isDark ? '#FFC107' : '#6B7280',
                transform: [{ translateX: isDark ? 16 : 2 }]
              }
            ]}>
              <Text style={styles.darkModeIcon}>
                {isDark ? '🌙' : '☀️'}
              </Text>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={isLargeScreen ? () => console.log('Menu pressed') : handleMenuToggle} 
            style={[styles.menuPill, {
              backgroundColor: isDark ? colors.surface : "#0F172A",
              borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
            }]}
          >
            <Text style={[styles.menuPillText, { color: isDark ? colors.text : "#FFFFFF" }]}>Menu</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LARGE SCREEN - RIGHT RAIL NAVIGATION */}
      {isLargeScreen && (
        <View style={styles.rightRail}>
          {navigationItems.map((item) => {
            const isActive = isActiveRoute(item.href);
            const opacityAnim = animationRefs.current[item.href];
            const scaleAnim = scaleAnimationRefs.current[item.href];
            
            return (
              <Animated.View
                key={item.href}
                style={[
                  styles.railItemContainer,
                  {
                    transform: [{ scale: scaleAnim }]
                  }
                ]}
              >
                <TouchableOpacity 
                  onPress={() => handlePress(item.href)}
                  style={[
                    styles.touchableContainer,
                    isActive && styles.railItemActiveContainer
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.railItem, 
                    isActive ? [styles.railActive, { color: colors.text }] : [styles.railMuted, { color: colors.textSecondary }]
                  ]}>
                    {item.label}
                  </Text>
                  <Animated.View 
                    style={[
                      styles.activeIndicator,
                      {
                        opacity: opacityAnim,
                        transform: [
                          {
                            scale: opacityAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.5, 1],
                            })
                          }
                        ]
                      }
                    ]} 
                  />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      )}

      {/* SMALL SCREEN - DROPDOWN NAVIGATION */}
      {!isLargeScreen && isDropdownOpen && (
        <Animated.View 
          style={[
            styles.dropdown,
            {
              backgroundColor: colors.background,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              borderWidth: 1,
              opacity: dropdownAnim,
              transform: [
                {
                  translateY: dropdownAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  })
                },
                {
                  scale: dropdownAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  })
                }
              ]
            }
          ]}
        >
          {navigationItems.map((item, index) => {
            const isActive = isActiveRoute(item.href);
            
            return (
              <TouchableOpacity
                key={item.href}
                onPress={() => handlePress(item.href)}
                style={[
                  styles.dropdownItem,
                  isActive && styles.dropdownItemActive,
                  index === navigationItems.length - 1 && styles.dropdownItemLast
                ]}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dropdownItemText,
                  { color: colors.text },
                  isActive && [styles.dropdownItemTextActive, { color: colors.text }]
                ]}>
                  {item.label}
                </Text>
                {isActive && <View style={[styles.dropdownActiveIndicator, { backgroundColor: colors.text }]} />}
              </TouchableOpacity>
            );
          })}
          
          {/* Theme Toggle for Small Screens */}
          <View style={[styles.dropdownSeparator, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.dropdownItem, styles.themeToggleItem]}
            activeOpacity={0.7}
          >
            <View style={styles.themeToggleContent}>
              <View style={[styles.themeToggleIcon, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}>
                <Ionicons
                  name={isDark ? "moon" : "sunny"}
                  size={16}
                  color={isDark ? "#FFD700" : "#F59E0B"}
                />
              </View>
              <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* BACKDROP FOR DROPDOWN */}
      {!isLargeScreen && isDropdownOpen && (
        <TouchableOpacity
          style={styles.backdrop}
          onPress={() => setIsDropdownOpen(false)}
          activeOpacity={1}
        />
      )}
    </>
  );
}