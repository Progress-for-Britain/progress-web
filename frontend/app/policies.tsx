import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Platform, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../util/theme-context';
import { useResponsive } from '../util/useResponsive';
import { getCommonStyles, getColors } from '../util/commonStyles';
import { useAuth } from '../util/auth-context';
import { mockPolicies } from './policies/mockpolicy';

export default function PoliciesPage() {
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark, isMobile, width);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Redirect if not authenticated or not authorized (but wait for loading to complete)
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user || !['ADMIN', 'WRITER', 'MEMBER', 'VOLUNTEER'].includes(user.role))) {
      Alert.alert('Access Denied', 'You must be an authorized user to access this page.');
      router.push('/');
      return;
    }
  }, [isAuthenticated, isLoading, user]);

  const filteredPolicies = useMemo(() => {
    return mockPolicies.filter(policy => {
      const matchesSearch = policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           policy.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || policy.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterStatus]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return 'checkmark-circle';
      case 'draft': return 'create';
      case 'review': return 'eye';
      default: return 'document';
    }
  };

  return (
    <View style={commonStyles.appContainer}>
      <ScrollView contentContainerStyle={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[commonStyles.sectionHeader, { marginBottom: 32 }]}>
          <Text style={[commonStyles.title, { textAlign: 'left' }]}>Policies</Text>
          <Text style={[commonStyles.text, { marginTop: 8, color: colors.textSecondary }]}>
            Manage and track changes to our policy documents
          </Text>
        </View>

        {/* Search and Filters */}
        <View style={[commonStyles.cardContainer, { marginBottom: 24, padding: isMobile ? 16 : 20 }]}>
          <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 16, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={[commonStyles.textInput, { marginBottom: 0 }]}
                placeholder="Search policies..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['all', 'published', 'draft', 'review'].map(status => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setFilterStatus(status)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 6,
                    backgroundColor: filterStatus === status ? colors.primary : 'transparent',
                    borderWidth: 1,
                    borderColor: filterStatus === status ? colors.primary : colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{
                    color: filterStatus === status ? 'white' : colors.text,
                    fontSize: 14,
                    fontWeight: '500',
                    textTransform: 'capitalize',
                    textAlign: 'center',
                  }}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* New Policy Button */}
          {user?.role === 'ADMIN' && (
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 6,
                alignSelf: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Ionicons name="add" size={16} color="white" />
              <Text style={{ color: 'white', fontWeight: '600' }}>New Policy</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Policies List */}
        <View style={{ gap: 16 }}>
          {filteredPolicies.map(policy => (
            <Link key={policy.id} href={`/policies/${policy.id}`} asChild>
              <TouchableOpacity
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  borderRadius: 8,
                  padding: isMobile ? 16 : 20,
                  borderWidth: 1,
                  borderColor: colors.border,
                  ...(Platform.OS === 'web' && { cursor: 'pointer' } as any),
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1, marginRight: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <MaterialIcons name="description" size={20} color={colors.text} />
                      <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
                        {policy.name}
                      </Text>
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        backgroundColor: getStatusColor(policy.status),
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 10,
                      }}>
                        <Ionicons name={getStatusIcon(policy.status)} size={12} color="white" />
                        <Text style={{ color: 'white', fontSize: 12, fontWeight: '500', textTransform: 'capitalize' }}>
                          {policy.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 20 }}>
                      {policy.description}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', minWidth: 80 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                      v{policy.version}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="person" size={14} color={colors.textSecondary} />
                      <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                        {policy.author}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="git-commit" size={14} color={colors.textSecondary} />
                      <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                        {policy.commits.length} commits
                      </Text>
                    </View>
                    {policy.pullRequests.length > 0 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="git-pull-request" size={14} color={colors.textSecondary} />
                        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                          {policy.pullRequests.length} PRs
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                    Updated {formatDate(policy.lastUpdated)}
                  </Text>
                </View>
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        {filteredPolicies.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <Ionicons name="document" size={48} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: 18, marginTop: 16 }}>
              No policies found
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 8 }}>
              Try adjusting your search or filter criteria
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}