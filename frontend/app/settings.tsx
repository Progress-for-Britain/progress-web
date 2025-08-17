import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, ScrollView, Switch } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading]);

  // Show loading screen while auth is being determined
  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Show loading screen if not authenticated (while redirect is happening)
  if (!isAuthenticated || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

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
              router.replace('/');
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

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View 
      style={{ 
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4
      }}
    >
      <Text 
        style={{ 
          fontSize: 18,
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: 16
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );

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
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
      <View style={{ flex: 1, marginRight: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827', marginBottom: 4 }}>
          {label}
        </Text>
        {description && (
          <Text style={{ fontSize: 14, color: '#6B7280', lineHeight: 20 }}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#f3f4f6', true: '#d946ef' }}
        thumbColor={value ? '#ffffff' : '#9ca3af'}
      />
    </View>
  );

  if (!user || isLoadingPreferences) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <Header />
        
        <ScrollView style={{ flex: 1 }}>
          {/* Header */}
          <View 
            style={{ 
              backgroundColor: '#d946ef',
              paddingVertical: 40,
              paddingHorizontal: 16
            }}
          >
            <Text 
              style={{ 
                fontSize: 28,
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: 8
              }}
            >
              Account Settings
            </Text>
            <Text 
              style={{ 
                fontSize: 16,
                color: '#f5d0fe'
              }}
            >
              Manage your profile, preferences, and privacy settings
            </Text>
          </View>

          <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
            {/* Profile Information */}
            <SettingSection title="Profile Information">
              <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                    First Name
                  </Text>
                  <TextInput
                    value={profileData.firstName}
                    onChangeText={(value) => updateProfileField('firstName', value)}
                    style={{
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      backgroundColor: '#ffffff'
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                    Last Name
                  </Text>
                  <TextInput
                    value={profileData.lastName}
                    onChangeText={(value) => updateProfileField('lastName', value)}
                    style={{
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      backgroundColor: '#ffffff'
                    }}
                  />
                </View>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                  Email
                </Text>
                <TextInput
                  value={profileData.email}
                  onChangeText={(value) => updateProfileField('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    backgroundColor: '#ffffff'
                  }}
                />
              </View>

              <TouchableOpacity
                onPress={handleSaveProfile}
                disabled={isLoading}
                style={{
                  backgroundColor: isLoading ? '#9CA3AF' : '#d946ef',
                  borderRadius: 8,
                  paddingVertical: 12,
                  marginTop: 8,
                  ...(Platform.OS === 'web' && { cursor: isLoading ? 'not-allowed' : 'pointer' } as any)
                }}
              >
                <Text 
                  style={{ 
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: '600',
                    textAlign: 'center'
                  }}
                >
                  {isLoading ? 'Saving...' : 'Save Profile'}
                </Text>
              </TouchableOpacity>
            </SettingSection>

            {/* Notification Preferences */}
            <SettingSection title="Notification Preferences">
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
            <SettingSection title="Privacy Settings">
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
            <SettingSection title="Account Actions">
              <TouchableOpacity
                style={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  marginBottom: 12,
                  ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', textAlign: 'center' }}>
                  Change Password
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  marginBottom: 12,
                  ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', textAlign: 'center' }}>
                  Download My Data
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  backgroundColor: '#DC2626',
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  marginBottom: 12,
                  ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#ffffff', textAlign: 'center' }}>
                  Logout
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: '#DC2626',
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#DC2626', textAlign: 'center' }}>
                  Delete Account
                </Text>
              </TouchableOpacity>
            </SettingSection>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
