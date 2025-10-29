import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '../../util/theme-context';
import { useResponsive } from '../../util/useResponsive';
import { getCommonStyles, getColors } from '../../util/commonStyles';
import { useAuth } from '../../util/auth-context';
import { api } from '../../util/api';

// Define interfaces for our data types
interface Repository {
  id: string;
  name: string;
  displayName?: string;
  tags?: string[];
  relatedPolicies?: string[];
}

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

const tagColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];

const getTagColor = (tag: string, index: number) => {
  // Use a simple hash of the tag name for consistent colors
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return tagColors[Math.abs(hash) % tagColors.length];
};

const standardTags = [
  'environment',
  'economy',
  'health',
  'education',
  'security',
  'transport',
  'housing',
  'welfare',
  'justice',
  'international',
  'climate',
  'energy',
  'taxation',
  'employment',
  'immigration',
  'defence',
  'foreign policy',
  'social care',
  'pensions',
  'digital',
];

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
  const [allRepos, setAllRepos] = useState<Repository[]>([]);
  const [relatedRepos, setRelatedRepos] = useState<Repository[]>([]);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [currentRepo, setCurrentRepo] = useState<Repository | null>(null);

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

  useEffect(() => {
    async function fetchAllRepos() {
      try {
        const data = await api.getPolicyRepos();
        const reposWithTitles = await Promise.all(data.map(async (repo) => {
          let title = repo.name;
          let tags: string[] = [];
          let relatedPolicies: string[] = [];
          
          try {
            // Fetch policy.md for title
            const policyContent = await api.getPolicyContent(repo.name, 'policy.md');
            const lines = policyContent.content.split('\n');
            const firstHeading = lines.find(line => line.startsWith('# '));
            title = firstHeading ? firstHeading.replace(/^#+\s*/, '') : repo.name;
          } catch {
            // If policy.md doesn't exist, use repo name
          }
          
          try {
            // Fetch README.md for tags and related policies
            const readmeContent = await api.getPolicyContent(repo.name, 'README.md');
            const lines = readmeContent.content.split('\n');
            
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i].trim();
              if (line.toLowerCase().startsWith('tags:')) {
                tags = line.substring(5).split(',').map(tag => tag.trim()).filter(tag => tag);
              } else if (line.toLowerCase().startsWith('related policies:')) {
                relatedPolicies = line.substring(16).split(',').map(policy => policy.trim()).filter(policy => policy);
              }
            }
          } catch {
            // If README.md doesn't exist, tags and relatedPolicies remain empty
          }
          
          return { ...repo, displayName: title, tags, relatedPolicies };
        }));
        setAllRepos(reposWithTitles);
        
        // Find current repo and compute related
        const current = reposWithTitles.find(r => r.name === repo);
        if (current) {
          setCurrentRepo(current);
          setCurrentTags(current.tags || []);
          if (current.tags && current.tags.length > 0) {
            const related: Repository[] = reposWithTitles.filter((r: Repository) => 
              r.name !== repo && r.tags && r.tags.some((tag: string) => current.tags!.includes(tag))
            );
            setRelatedRepos(related);
          }
        }
      } catch (error) {
        console.error('Error fetching all repos:', error);
      }
    }
    
    if (repo) fetchAllRepos();
  }, [repo]);

  return (
    <>
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

          {user?.roles?.includes('ADMIN') && (
            <View style={styles.section}>
              <Text style={[commonStyles.text, styles.sectionTitle]}>Manage Tags</Text>
              {isEditingTags ? (
                <View>
                  <Text style={styles.editTagsText}>Standard Tags:</Text>
                  <View style={styles.standardTagsContainer}>
                    {standardTags.map((tag) => (
                      <TouchableOpacity
                        key={tag}
                        style={[
                          styles.standardTag,
                          currentTags.includes(tag) && styles.selectedTag
                        ]}
                        onPress={() => {
                          if (currentTags.includes(tag)) {
                            setCurrentTags(currentTags.filter(t => t !== tag));
                          } else {
                            setCurrentTags([...currentTags, tag]);
                          }
                        }}
                      >
                        <Text style={[
                          styles.standardTagText,
                          currentTags.includes(tag) && styles.selectedTagText
                        ]}>
                          {tag}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.editTagsText}>Custom Tags:</Text>
                  <TextInput
                    style={styles.tagInput}
                    placeholder="Add custom tag and press Enter"
                    value={newTag}
                    onChangeText={setNewTag}
                    onSubmitEditing={() => {
                      if (newTag.trim() && !currentTags.includes(newTag.trim())) {
                        setCurrentTags([...currentTags, newTag.trim()]);
                        setNewTag('');
                      }
                    }}
                  />
                  <Text style={styles.editTagsText}>Current Tags:</Text>
                  <View style={styles.tagsContainer}>
                    {currentTags.map((tag, index) => (
                      <TouchableOpacity key={index} onPress={() => setCurrentTags(currentTags.filter(t => t !== tag))}>
                        <Text style={[styles.tag, { backgroundColor: getTagColor(tag, index) }]}>{tag} ✕</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.editButtons}>
                    <TouchableOpacity style={styles.saveButton} onPress={async () => {
                      try {
                        await api.setPolicyTags(repo!, currentTags);
                        setIsEditingTags(false);
                        // Refresh related repos
                        const updatedCurrent = { ...currentRepo, tags: currentTags };
                        setAllRepos(prev => prev.map(r => 
                          r.name === repo 
                            ? { ...updatedCurrent, id: updatedCurrent.id || r.id } as Repository 
                            : r
                        ));
                        const related = allRepos.filter(r => 
                          r.name !== repo && r.tags && r.tags.some(tag => currentTags.includes(tag))
                        );
                        setRelatedRepos(related);
                      } catch (error) {
                        Alert.alert('Error', 'Failed to update tags');
                      }
                    }}>
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditingTags(false)}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View>
                  <View style={styles.tagsContainer}>
                    {currentTags.length > 0 ? currentTags.map((tag, index) => (
                      <Text key={index} style={[styles.tag, { backgroundColor: getTagColor(tag, index) }]}>{tag}</Text>
                    )) : <Text style={styles.noTagsText}>No tags set</Text>}
                  </View>
                  <TouchableOpacity style={styles.editTagsButton} onPress={() => setIsEditingTags(true)}>
                    <Text style={styles.editTagsButtonText}>Edit Tags</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <View style={[styles.section, styles.contentSection]}>
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
              <View style={styles.markdownContainer}>
                <Markdown style={getMarkdownStyles(colors)}>{content || 'No policy content found.'}</Markdown>
              </View>
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

          {relatedRepos.length > 0 && (
            <View style={styles.section}>
              <Text style={[commonStyles.text, styles.sectionTitle]}>Related Policies</Text>
              {relatedRepos.map((relRepo) => (
                <TouchableOpacity key={relRepo.id} style={styles.relatedCard} onPress={() => router.push(`/policy/${relRepo.name}`)}>
                  <Text style={styles.relatedTitle}>{relRepo.displayName || relRepo.name}</Text>
                  {relRepo.tags && relRepo.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {relRepo.tags.slice(0, 3).map((tag, index) => (
                        <Text key={index} style={[styles.tag, { backgroundColor: getTagColor(tag, index) }]}>{tag}</Text>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
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
    opacity: .8,
  },
  section: {
    marginBottom: 40,
    paddingHorizontal: isMobile ? 20 : 40,
  },
  contentSection: {
    backgroundColor: colors.background,
    borderRadius: isMobile ? 0 : 12,
    marginHorizontal: isMobile ? -20 : 0,
    paddingHorizontal: isMobile ? 20 : 32,
    paddingVertical: isMobile ? 16 : 24,
    ...(isMobile ? {} : {
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    }),
  },
  markdownContainer: {
    backgroundColor: colors.background,
    minHeight: 200,
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
    opacity: .8,
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
    opacity: .7,
  },
  openText: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 20,
  },
  loadingText: {
    opacity: 0.8,
    fontSize: 16,
    fontWeight: '500' as const,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: colors.error,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '500' as const,
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
  relatedCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  relatedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  editTagsText: {
    fontSize: 14,
    marginBottom: 8,
  },
  tagInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: colors.accent,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: colors.error,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  editTagsButton: {
    backgroundColor: colors.accent,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  editTagsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noTagsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  standardTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  standardTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selectedTag: {
    backgroundColor: colors.accent,
  },
  standardTagText: {
    fontSize: 12,
    color: colors.text,
  },
  selectedTagText: {
    color: '#fff',
  },
});

const getMarkdownStyles = (colors: any) => ({
  body: { 
    color: colors.text, 
    lineHeight: 28,
    fontSize: 16,
    backgroundColor: colors.background,
    padding: 8,
    textAlign: 'left' as const,
  },
  
  // Enhanced heading styles with colors and better spacing
  heading1: { 
    fontSize: 28, 
    fontWeight: '800' as const, 
    marginTop: 32, 
    marginBottom: 24, 
    color: colors.accent,
    lineHeight: 34,
    letterSpacing: -0.5,
    borderBottomWidth: 3,
    borderBottomColor: colors.accent,
    paddingBottom: 12,
  },
  heading2: { 
    fontSize: 24, 
    fontWeight: '700' as const, 
    marginTop: 28, 
    marginBottom: 20, 
    color: colors.text,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  heading3: { 
    fontSize: 20, 
    fontWeight: '600' as const, 
    marginTop: 24, 
    marginBottom: 18, 
    color: colors.accent,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  heading4: { 
    fontSize: 19, 
    fontWeight: '600' as const, 
    marginTop: 20, 
    marginBottom: 16, 
    color: colors.text,
    lineHeight: 25,
    opacity: 0.9,
  },
  heading5: { 
    fontSize: 17, 
    fontWeight: '600' as const, 
    marginTop: 18, 
    marginBottom: 14, 
    color: colors.textSecondary,
    lineHeight: 23,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  heading6: { 
    fontSize: 15, 
    fontWeight: '600' as const, 
    marginTop: 16, 
    marginBottom: 12, 
    color: colors.textSecondary,
    lineHeight: 21,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  
  // Enhanced paragraph styling
  paragraph: { 
    marginBottom: 18, 
    lineHeight: 26, 
    color: colors.text,
    fontSize: 16,
    textAlign: 'justify',
  },
  
  // Enhanced list styling
  listItem: { 
    marginBottom: 10, 
    marginTop: 6,
    lineHeight: 24,
    color: colors.text,
    fontSize: 16,
  },
  
  // Enhanced link styling
  link: { 
    color: colors.accent, 
    textDecorationLine: 'underline' as const,
    fontWeight: '500' as const,
  },
  
  // Enhanced emphasis styling
  em: { 
    fontStyle: 'italic' as const,
    color: colors.text,
    opacity: 0.85,
    fontWeight: '400' as const,
  },
  strong: { 
    fontWeight: '700' as const,
    color: colors.text,
    opacity: 1,
  },
  
  // Enhanced blockquote styling
  blockquote: {
    borderLeftWidth: 6,
    borderLeftColor: colors.accent,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: colors.border,
    borderBottomColor: colors.border,
    borderRightColor: colors.border,
    paddingLeft: 20,
    paddingRight: 16,
    marginLeft: 0,
    marginTop: 20,
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative' as const,
  },
  
  // Enhanced code styling
  code_inline: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontFamily: 'monospace',
    fontSize: 15,
    color: colors.accent,
    fontWeight: '500' as const,
    borderWidth: 1,
    borderColor: colors.border,
  },
  code_block: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fence: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Enhanced list styling
  bullet_list: {
    marginTop: 12,
    marginBottom: 24,
    paddingLeft: 8,
  },
  ordered_list: {
    marginTop: 12,
    marginBottom: 24,
    paddingLeft: 8,
  },
  list_item: {
    marginBottom: 10,
    marginTop: 4,
    lineHeight: 24,
    color: colors.text,
    fontSize: 16,
    paddingLeft: 4,
  },
  
  // Enhanced table styling
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 24,
    overflow: 'hidden' as const,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  thead: {
    backgroundColor: colors.accent,
  },
  tbody: {
    backgroundColor: colors.background,
  },
  th: {
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    fontWeight: '700' as const,
    color: '#fff',
    fontSize: 16,
  },
  td: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    color: colors.text,
    fontSize: 15,
  },
  
  // Enhanced horizontal rule
  hr: {
    backgroundColor: colors.accent,
    height: 3,
    marginVertical: 32,
    borderWidth: 0,
    borderRadius: 2,
    opacity: 0.6,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },

  // Additional styling for better document structure
  text: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 26,
  },
  
  // Custom container for content sections
  content: {
    paddingHorizontal: 4,
  },
});
