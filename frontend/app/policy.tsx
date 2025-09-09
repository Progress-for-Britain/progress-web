import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Markdown from 'react-native-markdown-display';
import SEOHead from '../components/SEOHead';
import { getCommonStyles, getGradients, getColors } from '../util/commonStyles';
import { useTheme } from '../util/theme-context';
import { useResponsive } from '../util/useResponsive';
import { useAuth } from '../util/auth-context';
import { api } from '../util/api';

// Define interfaces for our data types
interface Repository {
  id: string;
  name: string;
}

interface Branch {
  name: string;
}

interface PullRequest {
  id: string;
  title: string;
  state: string;
}

export default function Policy() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const { user, isAuthenticated } = useAuth();
  const commonStyles = getCommonStyles(isDark, isMobile, width);
  const gradients = getGradients(isDark);
  const colors = getColors(isDark);
  const styles = getStyles(colors, isMobile, width);

  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [content, setContent] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [preview, setPreview] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isWriter =
    (user?.roles && (user.roles.includes('WRITER') || user.roles.includes('ADMIN')));

  useEffect(() => {
    fetchRepos();
  }, []);

  useEffect(() => {
    if (selectedRepo) {
      fetchContent();
      if (isWriter) {
        fetchBranches();
        fetchPRs();
      }
    }
  }, [selectedRepo]);

  const fetchRepos = async () => {
    try {
      const data = await api.getPolicyRepos();
      setRepos(data);
      if (data.length > 0) {
        setSelectedRepo(data[0]);
      }
    } catch (error) {
      console.error('Error fetching repos:', error);
    }
  };

  const fetchContent = async () => {
    try {
      if (!selectedRepo) return;
      setError(null);
      setContentLoading(true);
      const data = await api.getPolicyContent(selectedRepo.name, 'policy.md');
      setContent(data.content);
      setEditContent(data.content);
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Failed to load policy content');
      setContent('No policy content found.');
    } finally {
      setContentLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      if (!selectedRepo) return;
      
      const data = await api.getPolicyBranches(selectedRepo.name);
      setBranches(data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchPRs = async () => {
    try {
      if (!selectedRepo) return;
      
      const data = await api.getPolicyPRs(selectedRepo.name);
      setPrs(data);
    } catch (error) {
      console.error('Error fetching PRs:', error);
    }
  };

  const handleEdit = async () => {
    if (!selectedRepo) return;
    
    setLoading(true);
    try {
      await api.editPolicy(selectedRepo.name, 'policy.md', editContent, 'Updated policy');
      Alert.alert('Success', 'Policy updated and PR created!');
      setEditing(false);
      fetchContent(); // Refresh content
    } catch (error) {
      console.error('Error editing policy:', error);
      Alert.alert('Error', 'Failed to update policy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead pageKey="policy" />
      <View style={commonStyles.appContainer}>
        <ScrollView contentContainerStyle={commonStyles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <Text style={commonStyles.title}>Policies</Text>
            <Text style={[commonStyles.text, styles.heroSubtext]}>Our guiding principles and policies</Text>
          </View>

          {/* Role/Access Banner */}
          <View style={[styles.section, styles.banner]}>
            {isAuthenticated ? (
              <View style={styles.bannerRow}>
                <View style={[styles.badge, isWriter ? styles.badgeEditor : styles.badgeMember]}>
                  <MaterialIcons name={isWriter ? 'edit' : 'person'} size={16} color="#fff" />
                  <Text style={styles.badgeText}>{isWriter ? 'Editor Access' : 'Member Access'}</Text>
                </View>
                <Text style={[commonStyles.text, styles.bannerText]}>
                  {isWriter ? 'You can edit and propose changes.' : 'You can view policies. Editing requires writer permissions.'}
                </Text>
              </View>
            ) : (
              <View style={styles.bannerRow}>
                <Text style={[commonStyles.text, styles.bannerText]}>Sign in to contribute or join our community.</Text>
                <View style={styles.ctaRow}>
                  <TouchableOpacity style={[styles.smallButton, styles.primaryCta]} onPress={() => router.push('/login')}>
                    <Text style={styles.smallButtonText}>Sign In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.smallButton, styles.secondaryCta]} onPress={() => router.push('/join')}>
                    <Text style={styles.smallButtonText}>Join</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Repo Selector */}
          <View style={styles.section}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.repoChips}>
              {repos.map((repo) => (
                <TouchableOpacity
                  key={repo.id}
                  style={[styles.repoChip, selectedRepo?.id === repo.id && styles.selectedRepo]}
                  onPress={() => setSelectedRepo(repo)}
                >
                  <MaterialIcons name="policy" size={16} color={selectedRepo?.id === repo.id ? '#fff' : colors.text} />
                  <Text style={[commonStyles.text, styles.repoChipText, selectedRepo?.id === repo.id && styles.repoChipTextSelected]}>{repo.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Policy Content */}
          {selectedRepo && (
            <View style={styles.section}>
              <Text style={[commonStyles.text, styles.sectionTitle]}>Policy Content</Text>
              {contentLoading ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator color={colors.accent} />
                  <Text style={[commonStyles.text, styles.loadingText]}>Loading content…</Text>
                </View>
              ) : editing ? (
                <View>
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      style={[styles.toggleButton, !preview && styles.toggleButtonInactive]}
                      onPress={() => setPreview(true)}
                    >
                      <Text style={styles.toggleText}>Preview</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.toggleButton, preview && styles.toggleButtonInactive]}
                      onPress={() => setPreview(false)}
                    >
                      <Text style={styles.toggleText}>Edit</Text>
                    </TouchableOpacity>
                  </View>

                  {preview ? (
                    <View style={styles.previewBox}>
                      <Markdown style={getMarkdownStyles(colors)}>{editContent}</Markdown>
                    </View>
                  ) : (
                    <TextInput
                      style={styles.editInput}
                      multiline
                      value={editContent}
                      onChangeText={setEditContent}
                      placeholder="Enter policy content..."
                      placeholderTextColor={colors.textSecondary}
                    />
                  )}
                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleEdit} disabled={loading}>
                      <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save & Create PR'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setEditing(false)}>
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  {error && (
                    <View style={styles.errorBox}>
                      <MaterialIcons name="error-outline" size={18} color={colors.error} />
                      <Text style={[commonStyles.text, styles.errorText]}>{error}</Text>
                    </View>
                  )}
                  <Markdown style={getMarkdownStyles(colors)}>{content}</Markdown>
                </>
              )}
            </View>
          )}

          {/* Writer Features */}
          {isWriter && selectedRepo && (
            <>
              <View style={styles.section}>
                {!editing && (
                  <TouchableOpacity style={styles.editButton} onPress={() => { setPreview(true); setEditing(true); }}>
                    <Text style={styles.buttonText}>Edit Policy</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Branches */}
              <View style={styles.section}>
                <Text style={[commonStyles.text, styles.sectionTitle]}>Branches</Text>
                {branches.map((branch) => (
                  <View key={branch.name} style={styles.listItem}>
                    <Text style={commonStyles.text}>{branch.name}</Text>
                  </View>
                ))}
              </View>

              {/* PRs */}
              <View style={styles.section}>
                <Text style={[commonStyles.text, styles.sectionTitle]}>Pull Requests</Text>
                {prs.map((pr) => (
                  <View key={pr.id} style={styles.listItem}>
                    <Text style={commonStyles.text}>{pr.title}</Text>
                    <Text style={[commonStyles.text, styles.prState]}>{pr.state}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </>
  );
}

const getStyles = (colors: any, isMobile: boolean, width: number) => StyleSheet.create({
  heroSection: {
    marginBottom: 40,
    alignItems: 'center',
  },
  heroSubtext: {
    fontSize: isMobile ? 16 : 18,
    fontStyle: 'italic',
    marginTop: 8,
    opacity: 0.8,
  },
  banner: {
    paddingVertical: 12,
    paddingHorizontal: isMobile ? 16 : 24,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerRow: {
    gap: 8,
  },
  bannerText: {
    opacity: 0.9,
    marginTop: 4,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryCta: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  secondaryCta: {
    backgroundColor: 'transparent',
  },
  smallButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '600',
  },
  badgeEditor: {
    backgroundColor: colors.accent,
  },
  badgeMember: {
    backgroundColor: colors.secondary,
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
  repoChips: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  repoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    marginRight: 8,
    backgroundColor: colors.surface,
  },
  selectedRepo: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  repoChipText: {
    color: colors.text,
  },
  repoChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  editInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    minHeight: 200,
    textAlignVertical: 'top',
    color: colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: colors.accent,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: colors.accent,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
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
  loadingBox: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    opacity: 0.8,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonInactive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleText: {
    color: '#fff',
    fontWeight: '600',
  },
  previewBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
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
});

const getMarkdownStyles = (colors: any) => ({
  body: {
    color: colors.text,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.text,
  },
  paragraph: {
    marginBottom: 12,
    lineHeight: 20,
    color: colors.text,
  },
  listItem: {
    marginBottom: 8,
    color: colors.text,
  },
  link: {
    color: colors.accent,
  },
});
