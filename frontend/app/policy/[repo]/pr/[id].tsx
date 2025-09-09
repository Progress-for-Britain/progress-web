import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';

import SEOHead from '../../../../components/SEOHead';
import { useTheme } from '../../../../util/theme-context';
import { useResponsive } from '../../../../util/useResponsive';
import { getCommonStyles, getColors } from '../../../../util/commonStyles';
import { useAuth } from '../../../../util/auth-context';
import { api } from '../../../../util/api';

interface PullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  state: string;
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  merged_at?: string;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
  };
}

interface Review {
  id: number;
  user: {
    login: string;
    avatar_url: string;
  };
  body: string;
  state: string;
  submitted_at: string;
}

interface Comment {
  id: number;
  user: {
    login: string;
    avatar_url: string;
  };
  body: string;
  created_at: string;
}

interface FileChange {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export default function PRDetail() {
  const router = useRouter();
  const { repo, id } = useLocalSearchParams<{ repo: string; id: string }>();
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const { user } = useAuth();
  const commonStyles = getCommonStyles(isDark, isMobile, width);
  const colors = getColors(isDark);
  const styles = getStyles(colors, isMobile);

  const [pr, setPr] = useState<PullRequest | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [files, setFiles] = useState<FileChange[]>([]);
  const [conversation, setConversation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const isWriter = user?.roles?.includes('WRITER') || user?.roles?.includes('ADMIN');

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!repo || !id) return;
      setLoading(true);
      setError(null);
      try {
        const [prData, reviewsData, commentsData, filesData] = await Promise.all([
          api.getPolicyPR(repo, id),
          api.getPolicyPRReviews(repo, id),
          api.getPolicyPRComments(repo, id),
          api.getPolicyPRFiles(repo, id)
        ]);
        if (!mounted) return;
        setPr(prData);
        setReviews(reviewsData);
        setComments(commentsData);
        setFiles(filesData);

        // Combine reviews and comments into conversation
        const allItems = [
          ...reviewsData.map(r => ({ ...r, type: 'review', date: r.submitted_at })),
          ...commentsData.map(c => ({ ...c, type: 'comment', date: c.created_at }))
        ];
        allItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setConversation(allItems);
      } catch (e) {
        console.error('Error loading PR data:', e);
        setError('Failed to load PR data');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, [repo, id]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !repo || !id) return;
    setPostingComment(true);
    try {
      const comment = await api.postPolicyPRComment(repo, id, newComment);
      setComments(prev => [...prev, comment]);
      // Update conversation
      setConversation(prev => {
        const newItem = { ...comment, type: 'comment', date: comment.created_at };
        const updated = [...prev, newItem];
        updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return updated;
      });
      setNewComment('');
    } catch (e) {
      console.error('Error posting comment:', e);
      setError('Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <>
      <SEOHead pageKey="policy" />
      <View style={commonStyles.appContainer}>
        <ScrollView contentContainerStyle={commonStyles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <View style={styles.titleContainer}>
              <Text style={commonStyles.title}>{pr?.title || 'Pull Request'}</Text>
              <Text style={[commonStyles.text, styles.heroSubtext]}>PR #{pr?.number}</Text>
            </View>
            <TouchableOpacity style={styles.backButton} onPress={() => router.push(`/policy/${repo}`)}>
              <MaterialIcons name="arrow-back" size={24} color={colors.text} />
              <Text style={[commonStyles.text, styles.backText]}>Back to Policy</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={colors.accent} />
                <Text style={[commonStyles.text, styles.loadingText]}>Loading PR details…</Text>
              </View>
            ) : error ? (
              <View style={styles.errorBox}>
                <MaterialIcons name="error-outline" size={18} color={colors.error} />
                <Text style={[commonStyles.text, styles.errorText]}>{error}</Text>
              </View>
            ) : pr ? (
              <>
                <View style={styles.prHeader}>
                  <View style={styles.prMeta}>
                    <Text style={[commonStyles.text, styles.prState, { color: pr.state === 'open' ? colors.success : colors.error }]}>
                      {pr.state.toUpperCase()}
                    </Text>
                    <Text style={commonStyles.text}>
                      Opened by {pr.user.login} on {formatDate(pr.created_at)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => Linking.openURL(pr.html_url)}>
                    <Text style={styles.openText}>View on GitHub</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.section}>
                  <Text style={[commonStyles.text, styles.sectionTitle]}>Files Changed ({files.length})</Text>
                  {files.map((file, index) => (
                    <View key={index} style={styles.fileItem}>
                      <View style={styles.fileHeader}>
                        <Text style={commonStyles.text}>{file.filename}</Text>
                        <Text style={[commonStyles.text, styles.fileStatus, { color: file.status === 'added' ? colors.success : file.status === 'removed' ? colors.error : colors.warning }]}>
                          {file.status}
                        </Text>
                        <Text style={[commonStyles.text, styles.fileChanges]}>
                          +{file.additions} -{file.deletions}
                        </Text>
                      </View>
                      {file.patch && (
                        <View style={styles.diffContainer}>
                          <Text style={[commonStyles.text, styles.diffText]}>{file.patch}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                  {files.length === 0 && (
                    <Text style={[commonStyles.text, styles.noData]}>No files changed.</Text>
                  )}
                </View>

                <View style={styles.prBody}>
                  <Markdown style={getMarkdownStyles(colors)}>{pr.body || 'No description provided.'}</Markdown>
                </View>

                <View style={styles.section}>
                  <Text style={[commonStyles.text, styles.sectionTitle]}>Conversation ({conversation.length})</Text>
                  {conversation.map((item) => (
                    <View key={item.id} style={styles.conversationItem}>
                      <View style={styles.conversationHeader}>
                        <Text style={commonStyles.text}>{item.user.login}</Text>
                        {item.type === 'review' && (
                          <Text style={[commonStyles.text, styles.reviewState, { color: item.state === 'APPROVED' ? colors.success : item.state === 'CHANGES_REQUESTED' ? colors.warning : colors.text }]}>
                            {item.state}
                          </Text>
                        )}
                        <Text style={[commonStyles.text, styles.conversationDate]}>{formatDate(item.date)}</Text>
                      </View>
                      {item.body && (
                        <Markdown style={getMarkdownStyles(colors)}>{item.body}</Markdown>
                      )}
                    </View>
                  ))}
                  {conversation.length === 0 && (
                    <Text style={[commonStyles.text, styles.noData]}>No conversation yet.</Text>
                  )}
                </View>

                {isWriter && (
                  <View style={styles.section}>
                    <Text style={[commonStyles.text, styles.sectionTitle]}>Add Comment</Text>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Write a comment..."
                      value={newComment}
                      onChangeText={setNewComment}
                      multiline
                      numberOfLines={4}
                      placeholderTextColor={colors.textSecondary}
                    />
                    <TouchableOpacity
                      style={[styles.postButton, (!newComment.trim() || postingComment) && styles.disabledButton]}
                      onPress={handlePostComment}
                      disabled={!newComment.trim() || postingComment}
                    >
                      {postingComment ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.postButtonText}>Post Comment</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <Text style={[commonStyles.text, styles.noData]}>PR not found.</Text>
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </>
  );
}

const getStyles = (colors: any, isMobile: boolean) => StyleSheet.create({
  heroSection: {
    marginBottom: 40,
    alignItems: 'center',
    position: 'relative',
  },
  titleContainer: {
    alignItems: 'center',
  },
  heroSubtext: {
    fontSize: isMobile ? 16 : 18,
    fontStyle: 'italic',
    marginTop: 8,
    opacity: 0.8,
  },
  section: {
    marginBottom: 40,
    paddingHorizontal: isMobile ? 20 : 40,
  },
  sectionTitle: {
    fontSize: isMobile ? 18 : 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  prHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  prMeta: {
    flex: 1,
  },
  prState: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  prBody: {
    marginBottom: 20,
  },
  conversationItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  conversationDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  reviewState: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  postButton: {
    backgroundColor: colors.accent,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  openText: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  loadingBox: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    opacity: 0.8,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: colors.error,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  noData: {
    opacity: 0.7,
    fontStyle: 'italic',
  },
  fileItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fileStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  fileChanges: {
    fontSize: 12,
    opacity: 0.7,
  },
  diffContainer: {
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  diffText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: colors.text,
  },
});

const getMarkdownStyles = (colors: any) => ({
  body: { color: colors.text },
  heading1: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: colors.text },
  heading2: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: colors.text },
  paragraph: { marginBottom: 12, lineHeight: 20, color: colors.text },
  listItem: { marginBottom: 8, color: colors.text },
  link: { color: colors.accent },
});