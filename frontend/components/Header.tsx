import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from '../util/auth-context';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const NavButton = ({ 
    href, 
    children, 
    onPress, 
    icon,
    iconLibrary = 'Ionicons',
    variant = 'default'
  }: { 
    href?: string; 
    children: React.ReactNode; 
    onPress?: () => void;
    icon?: string;
    iconLibrary?: 'Ionicons' | 'MaterialIcons' | 'FontAwesome5';
    variant?: 'default' | 'primary' | 'secondary';
  }) => {
    
    const getButtonStyles = () => {
      switch (variant) {
        case 'primary':
          return {
            backgroundColor: '#d946ef',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
          };
        case 'secondary':
          return {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: '#d946ef',
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 12,
          };
        default:
          return {
            backgroundColor: 'transparent',
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 10,
          };
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

    return (
      <TouchableOpacity
        onPress={onPress || (() => href && router.push(href as any))}
        style={{
          ...getButtonStyles(),
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: 4,
          ...(Platform.OS === 'web' && { cursor: 'pointer' }),
          ...(variant !== 'default' && {
            shadowColor: variant === 'primary' ? '#d946ef' : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: variant === 'primary' ? 0.2 : 0.1,
            shadowRadius: 4,
            elevation: 3,
          })
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {icon && (
            <IconComponent 
              name={icon as any} 
              size={16} 
              color={getTextColor()} 
              style={{ marginRight: children ? 6 : 0 }} 
            />
          )}
          {children && (
            <Text 
              style={{ 
                color: getTextColor(), 
                fontWeight: variant === 'default' ? '500' : '600',
                fontSize: 15
              }}
            >
              {children}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
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
      <View style={{ width: '100%', paddingHorizontal: 20 }}>
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          height: 72,
          paddingVertical: 8,
          width: '100%'
        }}>
          {/* Enhanced Logo */}
          <TouchableOpacity 
            onPress={() => router.push('/')} 
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <View 
              style={{ 
                width: 40, 
                height: 40, 
                backgroundColor: '#d946ef', 
                borderRadius: 12, 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginRight: 12,
                shadowColor: '#d946ef',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <FontAwesome5 name="flag" size={18} color="#ffffff" />
            </View>
            <View>
              <Text style={{ 
                fontSize: 22, 
                fontWeight: 'bold', 
                color: '#111827',
                lineHeight: 26
              }}>
                Progress UK
              </Text>
              <Text style={{ 
                fontSize: 11, 
                color: '#6B7280',
                fontWeight: '500',
                letterSpacing: 0.5,
                textTransform: 'uppercase'
              }}>
                Unleashing Potential
              </Text>
            </View>
          </TouchableOpacity>

          {/* Enhanced Navigation */}
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
                <NavButton href="/settings" icon="settings">Settings</NavButton>
                <NavButton onPress={handleLogout} icon="log-out" variant="secondary">
                  Logout
                </NavButton>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
