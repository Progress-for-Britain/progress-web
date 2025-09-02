import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../util/theme-context';
import { useResponsive } from '../../util/useResponsive';
import { getCommonStyles, getColors, getOptimizedShadow } from '../../util/commonStyles';
import { useAuth } from '../../util/auth-context';
import { getPolicyById, Policy, Commit, PullRequest, DiffChange } from './mockpolicy';
import ContentView from './ContentView';

const tabs = [
  { id: 'source', label: 'Source', icon: 'document-text' },
  { id: 'history', label: 'History', icon: 'git-commit' },
  { id: 'pulls', label: 'Pull Requests', icon: 'git-pull-request' },
];

const parseChanges = (changesString: string) => {
  const match = changesString.match(/\+(\d+)\s*-\s*(\d+)/);
  if (match) {
    const additions = parseInt(match[1]);
    const deletions = parseInt(match[2]);
    return { additions, deletions };
  }
  return { additions: 0, deletions: 0 };
};

export default function PolicyDetailPage() {
  const { id } = useLocalSearchParams();
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark, isMobile, width);

  const [activeTab, setActiveTab] = useState('source');
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);
  const [showCommitModal, setShowCommitModal] = useState(false);

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

  const getPRStatusColor = (status: string) => {
    switch (status) {
      case 'merged': return '#10b981';
      case 'open': return '#0369a1';
      case 'closed': return '#dc2626';
      default: return colors.textSecondary;
    }
  };

  const handleCommitClick = (commit: Commit) => {
    setSelectedCommit(commit);
    setShowCommitModal(true);
  };

  const handleCloseModal = () => {
    setShowCommitModal(false);
    setSelectedCommit(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'source':
        return (
          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 24 }}>
            <Text style={{
              color: colors.text,
              fontSize: 18,
              lineHeight: 28,
              fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
              paddingHorizontal: 16,
            }}>
              {policy.content}
            </Text>
          </ScrollView>
        );

      case 'history':
        return (
          <View style={{ marginTop: 24 }}>
            {policy.commits.map(commit => (
              <TouchableOpacity
                key={commit.id}
                onPress={() => handleCommitClick(commit)}
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  borderRadius: 8,
                  padding: isMobile ? 16 : 20,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  ...(Platform.OS === 'web' && { cursor: 'pointer' } as any),
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1, marginRight: 16 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                      {commit.message}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="person" size={14} color={colors.textSecondary} />
                        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                          {commit.author}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="time" size={14} color={colors.textSecondary} />
                        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                          {formatDate(commit.date)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {(() => {
                      const { additions, deletions } = parseChanges(commit.changes);
                      return (
                        <>
                          {additions > 0 && (
                            <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '500' }}>
                              +{additions}
                            </Text>
                          )}
                          {deletions > 0 && (
                            <Text style={{ color: '#dc2626', fontSize: 12, fontWeight: '500' }}>
                              -{deletions}
                            </Text>
                          )}
                          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                            lines
                          </Text>
                        </>
                      );
                    })()}
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="git-commit" size={14} color={colors.textSecondary} />
                  <Text style={{ color: colors.textSecondary, fontSize: 14, fontFamily: 'monospace' }}>
                    {commit.id}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'pulls':
        return (
          <View style={{ marginTop: 24 }}>
            {policy.pullRequests.map((pr: PullRequest) => (
              <View key={pr.id} style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderRadius: 8,
                padding: isMobile ? 16 : 20,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1, marginRight: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Ionicons name="git-pull-request" size={18} color={getPRStatusColor(pr.status)} />
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                        {pr.title}
                      </Text>
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        backgroundColor: getPRStatusColor(pr.status),
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 10,
                      }}>
                        <Text style={{ color: 'white', fontSize: 12, fontWeight: '500', textTransform: 'capitalize' }}>
                          {pr.status}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="person" size={14} color={colors.textSecondary} />
                        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                          {pr.author}
                        </Text>
                      </View>
                      <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                        Created {formatDate(pr.createdAt)}
                      </Text>
                      {pr.status === 'merged' && pr.mergedAt && (
                        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                          Merged {formatDate(pr.mergedAt)}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
                {pr.reviewers.length > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    <Ionicons name="people" size={14} color={colors.textSecondary} />
                    <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                      Reviewers: {pr.reviewers.join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={commonStyles.appContainer}>
      <ScrollView contentContainerStyle={{
        marginTop: 50,
        paddingHorizontal: isMobile ? 16 : 20,
        position: 'relative',
        zIndex: 2,
      }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => router.replace('/policies')}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: 16, marginLeft: 8 }}>
              Back to Policies
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <MaterialIcons name="description" size={24} color={colors.text} />
                <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>
                  {policy.name}
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: getStatusColor(policy.status),
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}>
                  <Ionicons name="checkmark-circle" size={14} color="white" />
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: '500', textTransform: 'capitalize' }}>
                    {policy.status}
                  </Text>
                </View>
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 18, marginBottom: 16 }}>
                {policy.description}
              </Text>
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
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
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Updated {formatDate(policy.lastUpdated)}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => router.push(`/policies/${id}/content`)}
                style={{
                  backgroundColor: '#8b5cf6',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 6,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Ionicons name="eye" size={14} color="white" />
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
                  Content
                </Text>
              </TouchableOpacity>
              {(user?.role === 'ADMIN' || user?.role === 'WRITER') && (
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Ionicons name="create" size={14} color="white" />
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
                    Edit
                  </Text>
                </TouchableOpacity>
              )}
              {(user?.role === 'ADMIN' || user?.role === 'WRITER') && (
                <TouchableOpacity
                  style={{
                    backgroundColor: '#10b981',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Ionicons name="git-pull-request" size={14} color="white" />
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
                    New PR
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={{
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          marginBottom: 0,
        }}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: isMobile ? 12 : 16,
                paddingVertical: 12,
                borderBottomWidth: activeTab === tab.id ? 2 : 0,
                borderBottomColor: activeTab === tab.id ? colors.primary : 'transparent',
              }}
            >
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={activeTab === tab.id ? colors.primary : colors.textSecondary}
              />
              <Text style={{
                color: activeTab === tab.id ? colors.primary : colors.textSecondary,
                fontSize: 16,
                fontWeight: activeTab === tab.id ? '600' : '500',
              }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {renderContent()}
      </ScrollView>

      {/* Commit Details Modal */}
      <Modal
        visible={showCommitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
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
              borderRadius: 12,
              width: '100%',
              maxWidth: isMobile ? width - 40 : 800,
              maxHeight: '80%',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
              ...getOptimizedShadow('heavy', isDark, '#111111'),
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Ionicons name="git-commit" size={20} color={colors.primary} />
                  <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
                    Commit {selectedCommit?.id}
                  </Text>
                </View>
                <Text style={{ fontSize: 16, color: colors.text, marginBottom: 8 }}>
                  {selectedCommit?.message}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="person" size={14} color={colors.textSecondary} />
                    <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                      {selectedCommit?.author}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="time" size={14} color={colors.textSecondary} />
                    <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                      {selectedCommit ? formatDate(selectedCommit.date) : ''}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {(() => {
                      const { additions, deletions } = parseChanges(selectedCommit?.changes || '');
                      return (
                        <>
                          {additions > 0 && (
                            <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '500' }}>
                              +{additions}
                            </Text>
                          )}
                          {deletions > 0 && (
                            <Text style={{ color: '#dc2626', fontSize: 12, fontWeight: '500' }}>
                              -{deletions}
                            </Text>
                          )}
                          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                            lines
                          </Text>
                        </>
                      );
                    })()}
                  </View>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={{
                  padding: 8,
                  borderRadius: 6,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  ...(Platform.OS === 'web' && { cursor: 'pointer' } as any),
                }}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
              <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 16 }}>
                  Changes
                </Text>

                {/* Diff Display */}
                <View style={{
                  backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  overflow: 'hidden',
                }}>
                  {selectedCommit?.diff?.map((change: DiffChange, index: number) => (
                    <View key={index} style={{ flexDirection: 'row' }}>
                      {/* Line number */}
                      <View style={{
                        width: 60,
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)',
                        alignItems: 'center',
                      }}>
                        <Text style={{
                          fontSize: 12,
                          color: colors.textSecondary,
                          fontFamily: 'monospace',
                        }}>
                          {change.line}
                        </Text>
                      </View>

                      {/* Change indicator */}
                      <View style={{
                        width: 40,
                        paddingVertical: 4,
                        alignItems: 'center',
                        backgroundColor: change.type === 'addition' ? '#10b981' :
                                       change.type === 'deletion' ? '#dc2626' :
                                       change.type === 'modification' ? '#f59e0b' : 'transparent',
                      }}>
                        <Text style={{
                          fontSize: 12,
                          color: 'white',
                          fontWeight: 'bold',
                        }}>
                          {change.type === 'addition' ? '+' :
                           change.type === 'deletion' ? '-' :
                           change.type === 'modification' ? '~' : ''}
                        </Text>
                      </View>

                      {/* Content */}
                      <View style={{
                        flex: 1,
                        paddingVertical: 4,
                        paddingHorizontal: 12,
                        backgroundColor: change.type === 'addition' ? 'rgba(16, 185, 129, 0.1)' :
                                       change.type === 'deletion' ? 'rgba(220, 38, 38, 0.1)' :
                                       change.type === 'modification' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                      }}>
                        <Text style={{
                          fontSize: 14,
                          color: colors.text,
                          fontFamily: 'monospace',
                          lineHeight: 20,
                        }}>
                          {change.content}
                        </Text>
                        {change.oldContent && (
                          <Text style={{
                            fontSize: 14,
                            color: colors.textSecondary,
                            fontFamily: 'monospace',
                            lineHeight: 20,
                            textDecorationLine: 'line-through',
                          }}>
                            {change.oldContent}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}