import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Switch,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../util/auth-context';
import { useTheme } from '../util/theme-context';
import { getCommonStyles, getColors } from '../util/commonStyles';
import { useResponsive } from '../util/useResponsive';
import { api, NotificationPreferences, UpdateNotificationPreferencesRequest, PrivacySettings, UpdatePrivacySettingsRequest } from '../util/api';

export default function Settings() {
  const { user, refreshUser, logout } = useAuth();
  const { isDark, actualTheme } = useTheme();
  const { isMobile, width } = useResponsive();
  const router = useRouter();
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark, isMobile, width);

  // Personal info state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences | null>(null);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  // Privacy settings state
  const [privacyPrefs, setPrivacyPrefs] = useState<PrivacySettings | null>(null);
  const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);

  // Confirmation modals state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const modalStyles = {
    modalOverlay: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '80%' as const,
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 20,
      alignItems: 'center' as const,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      marginBottom: 10,
      color: colors.text,
    },
    modalMessage: {
      fontSize: 16,
      marginBottom: 20,
      textAlign: 'center' as const,
      color: colors.text,
    },
    modalButtons: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      width: '100%' as const,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 10,
      marginHorizontal: 5,
      borderRadius: 5,
      alignItems: 'center' as const,
    },
    cancelButton: {
      backgroundColor: colors.border,
    },
    cancelButtonText: {
      color: colors.text,
    },
    confirmButton: {
      backgroundColor: colors.primary,
    },
    confirmButtonText: {
      color: colors.background,
    },
    dangerConfirmButton: {
      backgroundColor: '#B10024',
    },
    dangerConfirmButtonText: {
      color: 'white',
    },
  };

  // Load notification preferences on mount
  useEffect(() => {
    if (user?.id) {
      loadNotificationPreferences();
    }
  }, [user?.id]);

  // Load privacy settings on mount
  useEffect(() => {
    if (user?.id) {
      loadPrivacySettings();
    }
  }, [user?.id]);

  const loadNotificationPreferences = async () => {
    try {
      if (!user?.id) return;
      const prefs = await api.getNotificationPreferences(user.id);
      setNotificationPrefs(prefs);
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      Alert.alert('Error', 'Failed to load notification preferences');
    }
  };

  const loadPrivacySettings = async () => {
    try {
      if (!user?.id) return;
      const prefs = await api.getPrivacySettings(user.id);
      setPrivacyPrefs(prefs);
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
      Alert.alert('Error', 'Failed to load privacy settings');
    }
  };

  const updateProfile = async () => {
    if (!user?.id) return;

    setIsUpdatingProfile(true);
    try {
      await api.updateUser(user.id, {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        email: email.trim() || undefined,
      });
      await refreshUser();
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const updateNotificationPreference = async (key: keyof UpdateNotificationPreferencesRequest, value: boolean) => {
    if (!user?.id || !notificationPrefs) return;

    setIsUpdatingNotifications(true);
    try {
      const updatedPrefs = await api.updateNotificationPreferences(user.id, {
        [key]: value,
      });
      setNotificationPrefs(updatedPrefs);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      Alert.alert('Error', 'Failed to update notification preferences');
      // Revert the change on error
      setNotificationPrefs(prev => prev ? { ...prev, [key]: !value } : null);
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const updatePrivacySetting = async (key: keyof UpdatePrivacySettingsRequest, value: boolean) => {
    if (!user?.id || !privacyPrefs) return;

    setIsUpdatingPrivacy(true);
    try {
      const updatedPrefs = await api.updatePrivacySettings(user.id, {
        [key]: value,
      });
      setPrivacyPrefs(updatedPrefs);
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
      Alert.alert('Error', 'Failed to update privacy settings');
      // Revert the change on error
      setPrivacyPrefs(prev => prev ? { ...prev, [key]: !value } : null);
    } finally {
      setIsUpdatingPrivacy(false);
    }
  };

  // Logout handlers
  const handleLogoutRequest = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false);
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  // Delete account handlers
  const handleDeleteRequest = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    try {
      if (!user?.id) return;
      await api.deleteUser(user.id);
      await logout();
      router.replace('/login');
      Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
    } catch (error) {
      console.error('Failed to delete account:', error);
      Alert.alert('Error', 'Failed to delete account');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  // Change password handler
  const handleChangePassword = () => {
    Alert.alert('Coming Soon', 'Change password feature is coming soon!');
  };

  const openPrivacyPolicy = () => {
    router.push('/privacy-policy');
  };

  const openEULA = () => {
    router.push('/eula');
  };

  if (!user) {
    return (
      <View style={[commonStyles.appContainer, styles.centered]}>
        <Text style={commonStyles.text}>Please log in to access settings</Text>
      </View>
    );
  }

  return (
    <ScrollView style={commonStyles.appContainer} contentContainerStyle={styles.scrollContent}>
      <View style={commonStyles.content}>
        <Text style={commonStyles.title}>Settings</Text>

        {/* Personal Information Section */}
        <View style={[commonStyles.cardContainer, styles.section]}>
          <Text style={[commonStyles.inputLabel, styles.sectionTitle]}>Personal Information</Text>

          <View style={commonStyles.formRow}>
            <View style={commonStyles.formField}>
              <Text style={commonStyles.inputLabel}>First Name</Text>
              <TextInput
                style={commonStyles.textInput}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={commonStyles.formField}>
              <Text style={commonStyles.inputLabel}>Last Name</Text>
              <TextInput
                style={commonStyles.textInput}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={commonStyles.formField}>
            <Text style={commonStyles.inputLabel}>Email</Text>
            <TextInput
              style={commonStyles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <TouchableOpacity
            style={[commonStyles.primaryButton, styles.updateButton]}
            onPress={updateProfile}
            disabled={isUpdatingProfile}
          >
            <Text style={[commonStyles.highlightText, styles.buttonText]}>
              {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notification Preferences Section */}
        <View style={[commonStyles.cardContainer, styles.section]}>
          <Text style={[commonStyles.inputLabel, styles.sectionTitle]}>Notification Preferences</Text>

          {notificationPrefs ? (
            <View style={styles.notificationContainer}>
              <View style={styles.notificationItem}>
                <Text style={commonStyles.text}>Email Newsletter</Text>
                <Switch
                  value={notificationPrefs.emailNewsletter}
                  onValueChange={(value) => updateNotificationPreference('emailNewsletter', value)}
                  disabled={isUpdatingNotifications}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={notificationPrefs.emailNewsletter ? colors.background : colors.textSecondary}
                />
              </View>

              <View style={styles.notificationItem}>
                <Text style={commonStyles.text}>Event Notifications</Text>
                <Switch
                  value={notificationPrefs.eventNotifications}
                  onValueChange={(value) => updateNotificationPreference('eventNotifications', value)}
                  disabled={isUpdatingNotifications}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={notificationPrefs.eventNotifications ? colors.background : colors.textSecondary}
                />
              </View>

              <View style={styles.notificationItem}>
                <Text style={commonStyles.text}>Donation Reminders</Text>
                <Switch
                  value={notificationPrefs.donationReminders}
                  onValueChange={(value) => updateNotificationPreference('donationReminders', value)}
                  disabled={isUpdatingNotifications}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={notificationPrefs.donationReminders ? colors.background : colors.textSecondary}
                />
              </View>

              <View style={styles.notificationItem}>
                <Text style={commonStyles.text}>Push Notifications</Text>
                <Switch
                  value={notificationPrefs.pushNotifications}
                  onValueChange={(value) => updateNotificationPreference('pushNotifications', value)}
                  disabled={isUpdatingNotifications}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={notificationPrefs.pushNotifications ? colors.background : colors.textSecondary}
                />
              </View>

              <View style={styles.notificationItem}>
                <Text style={commonStyles.text}>SMS Updates</Text>
                <Switch
                  value={notificationPrefs.smsUpdates}
                  onValueChange={(value) => updateNotificationPreference('smsUpdates', value)}
                  disabled={isUpdatingNotifications}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={notificationPrefs.smsUpdates ? colors.background : colors.textSecondary}
                />
              </View>
            </View>
          ) : (
            <Text style={commonStyles.text}>Loading notification preferences...</Text>
          )}
        </View>

        {/* Privacy Settings Section */}
        <View style={[commonStyles.cardContainer, styles.section]}>
          <Text style={[commonStyles.inputLabel, styles.sectionTitle]}>Privacy Settings</Text>

          {privacyPrefs ? (
            <View style={styles.notificationContainer}>
              <View style={styles.notificationItem}>
                <Text style={commonStyles.text}>Public Profile</Text>
                <Switch
                  value={privacyPrefs.publicProfile}
                  onValueChange={(value) => updatePrivacySetting('publicProfile', value)}
                  disabled={isUpdatingPrivacy}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={privacyPrefs.publicProfile ? colors.background : colors.textSecondary}
                />
              </View>

              <View style={styles.notificationItem}>
                <Text style={commonStyles.text}>Share Activity</Text>
                <Switch
                  value={privacyPrefs.shareActivity}
                  onValueChange={(value) => updatePrivacySetting('shareActivity', value)}
                  disabled={isUpdatingPrivacy}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={privacyPrefs.shareActivity ? colors.background : colors.textSecondary}
                />
              </View>

              <View style={styles.notificationItem}>
                <Text style={commonStyles.text}>Allow Messages</Text>
                <Switch
                  value={privacyPrefs.allowMessages}
                  onValueChange={(value) => updatePrivacySetting('allowMessages', value)}
                  disabled={isUpdatingPrivacy}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={privacyPrefs.allowMessages ? colors.background : colors.textSecondary}
                />
              </View>
            </View>
          ) : (
            <Text style={commonStyles.text}>Loading privacy settings...</Text>
          )}
        </View>

        {/* Account Actions Section */}
        <View style={[commonStyles.cardContainer, styles.section]}>
          <Text style={[commonStyles.inputLabel, styles.sectionTitle]}>Account Actions</Text>

          <TouchableOpacity
            style={[commonStyles.button, styles.accountActionButton]}
            onPress={handleChangePassword}
          >
            <Text style={[commonStyles.text, styles.accountActionText]}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.button, styles.accountActionButton]}
            onPress={handleLogoutRequest}
          >
            <Text style={[commonStyles.text, styles.accountActionText]}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.button, styles.accountActionButton, styles.dangerButton]}
            onPress={handleDeleteRequest}
          >
            <Text style={[commonStyles.text, styles.dangerText]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Section */}
        <View style={[commonStyles.cardContainer, styles.section]}>
          <Text style={[commonStyles.inputLabel, styles.sectionTitle]}>Legal</Text>

          <TouchableOpacity
            style={[commonStyles.button, styles.legalButton]}
            onPress={openPrivacyPolicy}
          >
            <Text style={[commonStyles.text, styles.legalButtonText]}>View Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.button, styles.legalButton]}
            onPress={openEULA}
          >
            <Text style={[commonStyles.text, styles.legalButtonText]}>View EULA</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={handleLogoutCancel}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContent}>
            <Text style={modalStyles.modalTitle}>Confirm Logout</Text>
            <Text style={modalStyles.modalMessage}>
              Are you sure you want to log out of your account?
            </Text>
            <View style={modalStyles.modalButtons}>
              <TouchableOpacity
                style={[modalStyles.modalButton, modalStyles.cancelButton]}
                onPress={handleLogoutCancel}
              >
                <Text style={modalStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.modalButton, modalStyles.confirmButton]}
                onPress={handleLogoutConfirm}
              >
                <Text style={modalStyles.confirmButtonText}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={handleDeleteCancel}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContent}>
            <Text style={modalStyles.modalTitle}>Delete Account</Text>
            <Text style={modalStyles.modalMessage}>
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
            </Text>
            <View style={modalStyles.modalButtons}>
              <TouchableOpacity
                style={[modalStyles.modalButton, modalStyles.cancelButton]}
                onPress={handleDeleteCancel}
              >
                <Text style={modalStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.modalButton, modalStyles.dangerConfirmButton]}
                onPress={handleDeleteConfirm}
              >
                <Text style={modalStyles.dangerConfirmButtonText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'left',
  },
  updateButton: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  notificationContainer: {
    gap: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  legalButton: {
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  legalButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  accountActionButton: {
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  accountActionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  dangerButton: {
    backgroundColor: 'red',
  },
  dangerText: {
    color: 'white',
  },
});