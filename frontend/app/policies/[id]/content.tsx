import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../util/theme-context';
import { useResponsive } from '../../../util/useResponsive';
import { getCommonStyles, getColors } from '../../../util/commonStyles';
import { useAuth } from '../../../util/auth-context';
import { getPolicyById } from '../mockpolicy';
import ContentView from '../ContentView';

export default function PolicyContentPage() {
  const { id } = useLocalSearchParams();
  const { isDark } = useTheme();
  const { isMobile } = useResponsive();
  const router = useRouter();
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark, isMobile, 0);
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect if not authenticated or not authorized (but wait for loading to complete)
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user || !['ADMIN', 'WRITER', 'MEMBER', 'VOLUNTEER'].includes(user.role))) {
      Alert.alert('Access Denied', 'You must be an authorized user to access this page.');
      router.push('/');
      return;
    }
  }, [isAuthenticated, isLoading, user]);

  const policy = getPolicyById(id as string);

  if (!policy) {
    return (
      <View style={commonStyles.appContainer}>
        <View style={[commonStyles.content, { alignItems: 'center', justifyContent: 'center', minHeight: 400 }]}>
          <Ionicons name="document" size={48} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary, fontSize: 18, marginTop: 16 }}>
            Policy not found
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/policies')}
            style={{ marginTop: 16 }}
          >
            <Text style={{ color: colors.primary, fontSize: 16 }}>
              Back to Policies
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return '#10b981';
      case 'draft': return '#f59e0b';
      case 'review': return '#8b5cf6';
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header - Fixed at top */}
      <View style={{
        backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingHorizontal: 24,
        paddingVertical: 20,
        ...(Platform.OS === 'web' && {
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        } as any),
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: 16, marginLeft: 8 }}>
              Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Document-like Content Area */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={true}
      >
        {/* Formatted Content */}
        <ContentView content={policy.content} />
      </ScrollView>
    </View>
  );
}