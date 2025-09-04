// filepath: /Users/tristanhill/Documents/git/progress-web/frontend/app/policies/[id]/prs/[prId].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../util/theme-context';
import { useResponsive } from '../../../../util/useResponsive';
import { getCommonStyles, getColors, getOptimizedShadow } from '../../../../util/commonStyles';
import { useAuth } from '../../../../util/auth-context';
import { getPolicyById, addCommentToPR, Comment } from '../../mockpolicy';

export default function PRDetailPage() {
  const { id, prId } = useLocalSearchParams();
  const { isDark } = useTheme();
  const { isMobile } = useResponsive();
  const { user } = useAuth();
  const router = useRouter();
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark, isMobile, 0);

  const [newComment, setNewComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [activeTab, setActiveTab] = useState('conversation');

  const policy = getPolicyById(id as string);
  const pr = policy?.pullRequests.find(p => p.id === prId);

  if (!policy || !pr) {
    return (
      <View style={commonStyles.appContainer}>
        <View style={[commonStyles.content, { alignItems: 'center', justifyContent: 'center', minHeight: 400 }]}>
          <Ionicons name="document" size={48} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary, fontSize: 18, marginTop: 16 }}>
            Pull Request not found
          </Text>
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

  const getPRStatusColor = (status: string) => {
    switch (status) {
      case 'merged': return '#10b981';
      case 'open': return '#0369a1';
      case 'closed': return '#dc2626';
      default: return colors.textSecondary;
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = addCommentToPR(policy.id, pr.id, {
      author: user?.firstName + ' ' + user?.lastName || 'Unknown',
      content: newComment.trim(),
    });

    if (comment) {
      setNewComment('');
      setShowCommentForm(false);
      Alert.alert('Success', 'Comment added successfully!');
    } else {
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const handleMergePR = () => {
    Alert.alert(
      'Merge Pull Request',
      'Are you sure you want to merge this pull request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Merge',
          style: 'destructive',
          onPress: () => {
            pr.status = 'merged';
            pr.mergedAt = new Date().toISOString();
            Alert.alert('Success', 'Pull request merged successfully!');
          }
        }
      ]
    );
  };

  const handleClosePR = () => {
    Alert.alert(
      'Close Pull Request',
      'Are you sure you want to close this pull request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close',
          onPress: () => {
            pr.status = 'closed';
            Alert.alert('Success', 'Pull request closed!');
          }
        }
      ]
    );
  };

  const renderConversation = () => (
    <View>
      {/* PR Description */}
      <View style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Ionicons name="person" size={16} color={colors.textSecondary} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
            {pr.author}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            opened this pull request {formatDate(pr.createdAt)}
          </Text>
        </View>
        <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>
          {pr.description}
        </Text>
      </View>

      {/* Comments */}
      {pr.comments.map((comment: Comment) => (
        <View key={comment.id} style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          borderRadius: 8,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Ionicons name="person" size={16} color={colors.textSecondary} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
              {comment.author}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              commented {formatDate(comment.createdAt)}
            </Text>
          </View>
          <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>
            {comment.content}
          </Text>
        </View>
      ))}

      {/* Add Comment Form */}
      {showCommentForm ? (
        <View style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 6,
              padding: 12,
              fontSize: 14,
              color: colors.text,
              backgroundColor: colors.background,
              minHeight: 80,
              textAlignVertical: 'top',
              marginBottom: 12,
            }}
            multiline
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Write a comment..."
            placeholderTextColor={colors.textSecondary}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={handleAddComment}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Comment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowCommentForm(false);
                setNewComment('');
              }}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.text }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setShowCommentForm(true)}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 6,
            alignSelf: 'flex-start',
            marginBottom: 16,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Add Comment</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderChanges = () => (
    <View>
      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 16 }}>
        Files Changed
      </Text>

      {/* Mock file changes - in a real app, this would show actual diff */}
      <View style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Ionicons name="document-text" size={16} color={colors.textSecondary} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
            policy-content.md
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 8 }}>
          <Text style={{ color: '#10b981', fontSize: 12 }}>+15 lines</Text>
          <Text style={{ color: '#dc2626', fontSize: 12 }}>-3 lines</Text>
        </View>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
          Changes to privacy policy content
        </Text>
      </View>
    </View>
  );

  return (
    <View style={commonStyles.appContainer}>
      <ScrollView contentContainerStyle={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[commonStyles.sectionHeader, { marginBottom: 24 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: 16, marginLeft: 8 }}>
              Back to Policy
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
            <Ionicons name="git-pull-request" size={24} color={getPRStatusColor(pr.status)} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text }}>
                  {pr.title}
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: getPRStatusColor(pr.status),
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '500', textTransform: 'capitalize' }}>
                    {pr.status}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  {pr.author} wants to merge changes into {pr.baseBranch} from {pr.branch}
                </Text>
              </View>
            </View>
          </View>

          {/* PR Actions */}
          {pr.status === 'open' && (user?.role === 'ADMIN' || user?.role === 'WRITER') && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={handleMergePR}
                style={{
                  backgroundColor: '#10b981',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 6,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Ionicons name="git-merge" size={14} color="white" />
                <Text style={{ color: 'white', fontWeight: '600' }}>Merge Pull Request</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleClosePR}
                style={{
                  backgroundColor: '#dc2626',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 6,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Ionicons name="close" size={14} color="white" />
                <Text style={{ color: 'white', fontWeight: '600' }}>Close Pull Request</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* PR Meta Info */}
        <View style={[commonStyles.cardContainer, { marginBottom: 24, padding: isMobile ? 16 : 20 }]}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="person" size={16} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                {pr.author}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="time" size={16} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                Opened {formatDate(pr.createdAt)}
              </Text>
            </View>
            {pr.mergedAt && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="git-merge" size={16} color={colors.textSecondary} />
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Merged {formatDate(pr.mergedAt)}
                </Text>
              </View>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
            <Ionicons name="git-branch" size={16} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              {pr.branch} → {pr.baseBranch}
            </Text>
          </View>

          {pr.reviewers.length > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <Ionicons name="people" size={16} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                Reviewers: {pr.reviewers.join(', ')}
              </Text>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={{
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          marginBottom: 24,
        }}>
          {[
            { id: 'conversation', label: 'Conversation', icon: 'chatbubble' },
            { id: 'changes', label: 'Files Changed', icon: 'document-text' },
          ].map(tab => (
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
        {activeTab === 'conversation' ? renderConversation() : renderChanges()}
      </ScrollView>
    </View>
  );
}