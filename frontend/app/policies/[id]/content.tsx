import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../util/theme-context';
import { useResponsive } from '../../../util/useResponsive';
import { getCommonStyles, getColors } from '../../../util/commonStyles';
import { mockPolicy } from '../mockpolicy';
import ContentView from '../ContentView';

export default function PolicyContentPage() {
  const { id } = useLocalSearchParams();
  const { isDark } = useTheme();
  const { isMobile } = useResponsive();
  const router = useRouter();
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark, isMobile, 0);

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
        paddingVertical: 12, // Reduced from 20 for thinner header
        ...(Platform.OS === 'web' && {
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        } as any),
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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

          {/* Center: Title and Description */}
          <View style={{ flex: 1, alignItems: 'center', marginHorizontal: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <MaterialIcons name="description" size={24} color={colors.text} />
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>
                {mockPolicy.name}
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center' }}>
              {mockPolicy.description}
            </Text>
          </View>

          {/* Right: Badges and Meta Info */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: getStatusColor(mockPolicy.status),
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' }}>
                {mockPolicy.status}
              </Text>
            </View>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: colors.border,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
            }}>
              <Ionicons name="git-branch" size={14} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '500' }}>
                v{mockPolicy.version}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="person" size={14} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                {mockPolicy.author}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="time" size={14} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                {formatDate(mockPolicy.lastUpdated)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/policies/${id}`)}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Ionicons name="document-text" size={14} color="white" />
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>
                Source
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Document-like Content Area */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingVertical: 48,
        }}
        showsVerticalScrollIndicator={true}
      >
        {/* Formatted Content */}
        <ContentView content={mockPolicy.content} />
      </ScrollView>
    </View>
  );
}