import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';

import SEOHead from '../../components/SEOHead';
import { useTheme } from '../../util/theme-context';
import { useResponsive } from '../../util/useResponsive';
import { getCommonStyles, getColors } from '../../util/commonStyles';
import { useAuth } from '../../util/auth-context';
import { api } from '../../util/api';

interface PullRequest { 
  id: string; 
  title: string; 
  state: string; 
  html_url: string; 
  number: number; 
  draft?: boolean;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
  head: {
    ref: string;
  };
}

export default function PolicyContent() {
  const router = useRouter();
  const { repo } = useLocalSearchParams<{ repo: string }>();
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const { user } = useAuth();
  const commonStyles = getCommonStyles(isDark, isMobile, width);
  const colors = getColors(isDark);
  const styles = getStyles(colors, isMobile);

  const [content, setContent] = useState('');
  const [title, setTitle] = useState(repo || '');
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isWriter = user?.roles?.includes('WRITER') || user?.roles?.includes('ADMIN');

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!repo) return;
      setLoading(true);
      setError(null);
      // Add a tiny delay to ensure auth is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      try {
        const data = await api.getPolicyContent(String(repo), 'policy.md');
        if (!mounted) return;
        setContent(data.content);
        // Extract the first heading from the content
        const lines = data.content.split('\n');
        const firstHeading = lines.find(line => line.startsWith('# '));
        if (firstHeading) {
          setTitle(firstHeading.replace(/^#+\s*/, ''));
        } else {
          setTitle(repo || '');
        }
        if (isWriter) {
          const [p] = await Promise.all([
            api.getPolicyPRs(String(repo))
          ]);
          if (!mounted) return;
          setPrs(p);
        }
      } catch (e) {
        console.error('Error loading policy content:', e);
        setError('Failed to load policy content');
        setContent('');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, [repo, user]);

  return (
    <>
      <SEOHead pageKey="policy" />
      <View style={commonStyles.appContainer}>
        <ScrollView contentContainerStyle={commonStyles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <View style={styles.titleContainer}>
              <Text style={commonStyles.title}>{title}</Text>
              <Text style={[commonStyles.text, styles.heroSubtext]}>Policy contents</Text>
            </View>
            <TouchableOpacity style={styles.backButton} onPress={() => router.push('/policy')}>
              <MaterialIcons name="arrow-back" size={24} color={colors.text} />
              <Text style={[commonStyles.text, styles.backText]}>Back to Policies</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={colors.accent} />
                <Text style={[commonStyles.text, styles.loadingText]}>Loading…</Text>
              </View>
            ) : error ? (
              <View style={styles.errorBox}>
                <MaterialIcons name="error-outline" size={18} color={colors.error} />
                <Text style={[commonStyles.text, styles.errorText]}>{error}</Text>
              </View>
            ) : (
              <Markdown style={getMarkdownStyles(colors)}>{content || 'No policy content found.'}</Markdown>
            )}
          </View>

          {isWriter && (
            <>
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => router.push(`/policy/${repo}/edit`)}
                >
                  <Text style={styles.editButtonText}>Open Editor</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[commonStyles.text, styles.sectionTitle]}>Pull Requests</Text>
                  <Text style={styles.prCount}>{prs.length} {prs.length === 1 ? 'PR' : 'PRs'}</Text>
                </View>
                
                {prs.length === 0 ? (
                  <View style={styles.emptyState}>
                    <MaterialIcons name="description" size={48} color={colors.textSecondary} />
                    <Text style={[commonStyles.text, styles.emptyStateTitle]}>No Pull Requests</Text>
                    <Text style={[commonStyles.text, styles.emptyStateText]}>
                      There are no open pull requests for this policy.
                    </Text>
                  </View>
                ) : (
                  prs.map((pr) => (
                    <View key={pr.id} style={styles.prCard}>
                      <View style={styles.prHeader}>
                        <View style={styles.prTitleRow}>
                          <Text style={styles.prNumber}>#{pr.number}</Text>
                          <Text style={styles.prTitle}>{pr.title}</Text>
                        </View>
                        <View style={styles.prStatusRow}>
                          <View style={[styles.statusBadge, { 
                            backgroundColor: pr.state === 'open' ? colors.success : colors.error 
                          }]}>
                            <MaterialIcons 
                              name={pr.state === 'open' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                              size={14} 
                              color="#fff" 
                            />
                            <Text style={styles.statusText}>
                              {pr.state === 'open' ? 'Open' : 'Closed'}
                            </Text>
                          </View>
                          {pr.draft && (
                            <View style={styles.draftBadge}>
                              <MaterialIcons name="edit" size={14} color="#fff" />
                              <Text style={styles.draftText}>Draft</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <View style={styles.prMeta}>
                        <View style={styles.prMetaItem}>
                          <MaterialIcons name="person" size={16} color={colors.textSecondary} />
                          <Text style={styles.prMetaText}>
                            {pr.user.login.includes('[bot]') 
                              ? pr.title.replace(/'s changes$/, '') 
                              : pr.user.login}
                          </Text>
                        </View>
                        <View style={styles.prMetaItem}>
                          <MaterialIcons name="call-split" size={16} color={colors.textSecondary} />
                          <Text style={styles.prMetaText}>{pr.head.ref}</Text>
                        </View>
                        <View style={styles.prMetaItem}>
                          <MaterialIcons name="schedule" size={16} color={colors.textSecondary} />
                          <Text style={styles.prMetaText}>
                            {new Date(pr.created_at).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.prActions}>
                        <TouchableOpacity 
                          style={styles.prActionButton}
                          onPress={() => router.push(`/policy/${repo}/pr/${pr.number}`)}
                        >
                          <MaterialIcons name="visibility" size={16} color={colors.accent} />
                          <Text style={styles.prActionText}>View Details</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.prActionButton}
                          onPress={() => Linking.openURL(pr.html_url)}
                        >
                          <MaterialIcons name="open-in-new" size={16} color={colors.accent} />
                          <Text style={styles.prActionText}>Open in GitHub</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </>
          )}

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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  spacer: {
    flex: 1,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  prCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  emptyStateText: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.8,
  },
  prCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  prHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  prTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.accent,
  },
  prTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  prStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  draftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  draftText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  prMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  prMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prMetaText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  prActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  prActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prActionText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: 'bold',
  },
  listItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  prState: {
    fontSize: 12,
    opacity: 0.7,
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
  editButton: {
    backgroundColor: colors.accent,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
