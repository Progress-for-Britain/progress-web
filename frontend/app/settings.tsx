import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, ScrollView, Switch } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../util/auth-context';
import Header from '../components/Header';
import api, { NotificationPreferences, PrivacySettings } from '../util/api';

export default function Settings() {
  const { user, isAuthenticated, isLoading: authLoading, logout, refreshUser } = useAuth();
  const router = useRouter();

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [notifications, setNotifications] = useState({
    emailNewsletter: true,
    eventNotifications: true,
    donationReminders: false,
    pushNotifications: true,
    smsUpdates: false
  });

  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    shareActivity: false,
    allowMessages: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

  // Redirect if not authenticated (but wait for loading to complete)
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, authLoading]);

  // Load notification preferences and privacy settings
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!user?.id) return;
      
      setIsLoadingPreferences(true);
      try {
        // Load notification preferences
        try {
          const notificationPrefs = await api.getNotificationPreferences(user.id);
          setNotifications({
            emailNewsletter: notificationPrefs.emailNewsletter,
            eventNotifications: notificationPrefs.eventNotifications,
            donationReminders: notificationPrefs.donationReminders,
            pushNotifications: notificationPrefs.pushNotifications,
            smsUpdates: notificationPrefs.smsUpdates
          });
        } catch (error) {
          console.log('No notification preferences found, using defaults');
        }

        // Load privacy settings
        try {
          const privacySettings = await api.getPrivacySettings(user.id);
          setPrivacy({
            publicProfile: privacySettings.publicProfile,
            shareActivity: privacySettings.shareActivity,
            allowMessages: privacySettings.allowMessages
          });
        } catch (error) {
          console.log('No privacy settings found, using defaults');
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      } finally {
        setIsLoadingPreferences(false);
      }
    };

    loadUserPreferences();
  }, [user?.id]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      await api.updateUser(user.id, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        address: profileData.address
      });
      
      Alert.alert('Success', 'Profile updated successfully');
      await refreshUser();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Don't manually navigate - let the auth state change handle the redirect
            } catch (error) {
              console.error('Logout failed:', error);
            }
          }
        }
      ]
    );
  };

  const updateProfileField = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const updateNotificationSetting = async (setting: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [setting]: value }));
    
    // Save to API
    if (user?.id) {
      try {
        await api.updateNotificationPreferences(user.id, { [setting]: value });
      } catch (error) {
        console.error('Error updating notification setting:', error);
        Alert.alert('Error', 'Failed to save notification setting. Please try again.');
        // Revert the change
        setNotifications(prev => ({ ...prev, [setting]: !value }));
      }
    }
  };

  const updatePrivacySetting = async (setting: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [setting]: value }));
    
    // Save to API
    if (user?.id) {
      try {
        await api.updatePrivacySettings(user.id, { [setting]: value });
      } catch (error) {
        console.error('Error updating privacy setting:', error);
        Alert.alert('Error', 'Failed to save privacy setting. Please try again.');
        // Revert the change
        setPrivacy(prev => ({ ...prev, [setting]: !value }));
      }
    }
  };

  const SettingSection = ({ title, children, icon }: { title: string; children: React.ReactNode; icon?: string }) => {
    return (
      <View 
        style={{ 
          backgroundColor: '#ffffff',
          borderRadius: 16,
          padding: 24,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
          borderLeftWidth: 4,
          borderLeftColor: '#d946ef',
          ...(Platform.OS === 'web' && {
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
          })
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          {icon && (
            <View 
              style={{
                backgroundColor: '#d946ef20',
                borderRadius: 12,
                padding: 12,
                marginRight: 16,
              }}
            >
              <Ionicons name={icon as any} size={24} color="#d946ef" />
            </View>
          )}
          <Text 
            style={{ 
              fontSize: 20,
              fontWeight: 'bold',
              color: '#111827',
              flex: 1
            }}
          >
            {title}
          </Text>
        </View>
        {children}
      </View>
    );
  };

  const ToggleSetting = ({ 
    label, 
    description, 
    value, 
    onValueChange 
  }: { 
    label: string; 
    description?: string; 
    value: boolean; 
    onValueChange: (value: boolean) => void; 
  }) => (
    <View style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      marginBottom: 20,
      paddingVertical: 8
    }}>
      <View style={{ flex: 1, marginRight: 16 }}>
        <Text style={{ 
          fontSize: 16, 
          fontWeight: '600', 
          color: '#111827', 
          marginBottom: description ? 6 : 0 
        }}>
          {label}
        </Text>
        {description && (
          <Text style={{ 
            fontSize: 14, 
            color: '#6B7280', 
            lineHeight: 20 
          }}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#f3f4f6', true: '#d946ef' }}
        thumbColor={value ? '#ffffff' : '#d1d5db'}
        style={{
          transform: Platform.OS === 'ios' ? [] : [{ scaleX: 1.2 }, { scaleY: 1.2 }]
        }}
      />
    </View>
  );

  if (!user || isLoadingPreferences) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <View style={{ alignItems: 'center' }}>
          <Ionicons name="settings" size={48} color="#d946ef" style={{ marginBottom: 16 }} />
          <Text style={{ fontSize: 18, color: '#6B7280', fontWeight: '500' }}>Loading Settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      {/* Show loading screen while auth is being determined */}
      {authLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="settings" size={48} color="#d946ef" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 18, color: '#6B7280', fontWeight: '500' }}>Loading...</Text>
          </View>
        </View>
      ) : /* Show loading screen if not authenticated (while redirect is happening) */
      (!isAuthenticated || !user) ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="settings" size={48} color="#d946ef" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 18, color: '#6B7280', fontWeight: '500' }}>Loading...</Text>
          </View>
        </View>
      ) : (
        <>
          <Stack.Screen options={{ headerShown: false }} />
          <StatusBar style="light" />
          <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            <Header />
        
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {/* Hero Section */}
              <View 
                style={{ 
                  backgroundColor: '#1e293b',
                  paddingVertical: 60,
                  paddingHorizontal: 20,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Animated background elements */}
                <View 
                  style={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    backgroundColor: 'rgba(217, 70, 239, 0.1)',
                    borderRadius: 100,
                  }}
                />
                <View 
                  style={{
                    position: 'absolute',
                    bottom: -30,
                    left: -30,
                    width: 150,
                    height: 150,
                    backgroundColor: 'rgba(217, 70, 239, 0.08)',
                    borderRadius: 75,
                  }}
                />

                <View style={{ alignItems: 'center', maxWidth: 800, alignSelf: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <Ionicons name="settings" size={28} color="#ffffff" style={{ marginRight: 12 }} />
                    <Text 
                      style={{ 
                        fontSize: 16,
                        fontWeight: '600',
                        color: '#f0f9ff',
                        letterSpacing: 1,
                        textTransform: 'uppercase'
                      }}
                    >
                      Account Settings
                    </Text>
                  </View>
                  
                  <Text 
                    style={{ 
                      fontSize: Platform.OS === 'web' ? 36 : 28,
                      fontWeight: 'bold',
                      color: '#ffffff',
                      textAlign: 'center',
                      marginBottom: 12,
                      lineHeight: Platform.OS === 'web' ? 44 : 34
                    }}
                  >
                    Manage Your Preferences
                  </Text>
                  
                  <Text 
                    style={{ 
                      fontSize: 16,
                      color: '#cbd5e1',
                      textAlign: 'center',
                      lineHeight: 24,
                      maxWidth: 600
                    }}
                  >
                    Customize your profile, notifications, and privacy settings to get the most out of your experience
                  </Text>
                </View>
              </View>

              <View style={{ paddingHorizontal: 20, paddingVertical: 32 }}>
                {/* Profile Information */}
                <SettingSection title="Profile Information" icon="person-circle">
                  <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                    First Name
                  </Text>
                  <TextInput
                    value={profileData.firstName}
                    onChangeText={(value) => updateProfileField('firstName', value)}
                    style={{
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 16,
                      backgroundColor: '#ffffff',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1
                    }}
                    placeholder="Enter first name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                    Last Name
                  </Text>
                  <TextInput
                    value={profileData.lastName}
                    onChangeText={(value) => updateProfileField('lastName', value)}
                    style={{
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 16,
                      backgroundColor: '#ffffff',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1
                    }}
                    placeholder="Enter last name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                  Email Address
                </Text>
                <TextInput
                  value={profileData.email}
                  onChangeText={(value) => updateProfileField('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    backgroundColor: '#ffffff',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1
                  }}
                  placeholder="Enter email address"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <TouchableOpacity
                onPress={handleSaveProfile}
                disabled={isLoading}
                style={{
                  backgroundColor: isLoading ? '#9CA3AF' : '#d946ef',
                  borderRadius: 12,
                  paddingVertical: 16,
                  marginTop: 8,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  ...(Platform.OS === 'web' && { cursor: isLoading ? 'not-allowed' : 'pointer' } as any)
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons 
                    name={isLoading ? "time" : "checkmark-circle"} 
                    size={20} 
                    color="#ffffff" 
                    style={{ marginRight: 8 }} 
                  />
                  <Text 
                    style={{ 
                      color: '#ffffff',
                      fontSize: 16,
                      fontWeight: '600'
                    }}
                  >
                    {isLoading ? 'Saving Changes...' : 'Save Profile'}
                  </Text>
                </View>
              </TouchableOpacity>
            </SettingSection>

            {/* Notification Preferences */}
            <SettingSection title="Notification Preferences" icon="notifications">
              <ToggleSetting
                label="Email Newsletter"
                description="Receive our weekly newsletter with party updates and news"
                value={notifications.emailNewsletter}
                onValueChange={(value) => updateNotificationSetting('emailNewsletter', value)}
              />
              
              <ToggleSetting
                label="Event Notifications"
                description="Get notified about upcoming events and rallies in your area"
                value={notifications.eventNotifications}
                onValueChange={(value) => updateNotificationSetting('eventNotifications', value)}
              />
              
              <ToggleSetting
                label="Donation Reminders"
                description="Occasional reminders about supporting our campaigns"
                value={notifications.donationReminders}
                onValueChange={(value) => updateNotificationSetting('donationReminders', value)}
              />
              
              <ToggleSetting
                label="Push Notifications"
                description="Receive urgent updates and breaking news notifications"
                value={notifications.pushNotifications}
                onValueChange={(value) => updateNotificationSetting('pushNotifications', value)}
              />
              
              <ToggleSetting
                label="SMS Updates"
                description="Get text messages for time-sensitive campaign updates"
                value={notifications.smsUpdates}
                onValueChange={(value) => updateNotificationSetting('smsUpdates', value)}
              />
            </SettingSection>

            {/* Privacy Settings */}
            <SettingSection title="Privacy Settings" icon="shield-checkmark">
              <ToggleSetting
                label="Public Profile"
                description="Allow other members to see your profile and activity"
                value={privacy.publicProfile}
                onValueChange={(value) => updatePrivacySetting('publicProfile', value)}
              />
              
              <ToggleSetting
                label="Share Activity"
                description="Show your donations and volunteer hours to other members"
                value={privacy.shareActivity}
                onValueChange={(value) => updatePrivacySetting('shareActivity', value)}
              />
              
              <ToggleSetting
                label="Allow Messages"
                description="Let other members send you direct messages"
                value={privacy.allowMessages}
                onValueChange={(value) => updatePrivacySetting('allowMessages', value)}
              />
            </SettingSection>

            {/* Account Actions */}
            <SettingSection title="Account Actions" icon="warning">
              <TouchableOpacity
                style={{
                  backgroundColor: '#f8fafc',
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  marginBottom: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                }}
              >
                <Ionicons name="key" size={20} color="#64748b" style={{ marginRight: 12 }} />
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', flex: 1 }}>
                  Change Password
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#64748b" />
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#f8fafc',
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  marginBottom: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                }}
              >
                <Ionicons name="download" size={20} color="#64748b" style={{ marginRight: 12 }} />
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', flex: 1 }}>
                  Download My Data
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#64748b" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  backgroundColor: '#fef2f2',
                  borderWidth: 1,
                  borderColor: '#fecaca',
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  marginBottom: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                }}
              >
                <Ionicons name="log-out" size={20} color="#dc2626" style={{ marginRight: 12 }} />
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#dc2626', flex: 1 }}>
                  Sign Out
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#dc2626" />
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#fef2f2',
                  borderWidth: 1,
                  borderColor: '#fecaca',
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                }}
              >
                <Ionicons name="trash" size={20} color="#dc2626" style={{ marginRight: 12 }} />
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#dc2626', flex: 1 }}>
                  Delete Account
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#dc2626" />
              </TouchableOpacity>
            </SettingSection>
          </View>
        </ScrollView>
      </View>
        </>
      )}
    </>
  );
}
