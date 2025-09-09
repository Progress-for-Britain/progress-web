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

interface Branch { name: string }
interface PullRequest { id: string; title: string; state: string; html_url: string }

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
  const [branches, setBranches] = useState<Branch[]>([]);
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
          const [b, p] = await Promise.all([
            api.getPolicyBranches(String(repo)),
            api.getPolicyPRs(String(repo))
          ]);
          if (!mounted) return;
          setBranches(b);
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
  }, [repo]);

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
                <Text style={[commonStyles.text, styles.sectionTitle]}>Branches</Text>
                {branches.map((b) => (
                  <View key={b.name} style={styles.listItem}>
                    <Text style={commonStyles.text}>{b.name}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={[commonStyles.text, styles.sectionTitle]}>Pull Requests</Text>
                {prs.map((pr) => (
                  <View key={pr.id} style={styles.listItem}>
                    <Text style={commonStyles.text}>{pr.title}</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                      <Text style={[commonStyles.text, styles.prState]}>{pr.state}</Text>
                      <TouchableOpacity onPress={() => Linking.openURL(pr.html_url)}>
                        <Text style={styles.openText}>Open</Text>
                      </TouchableOpacity>
                    </View>
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
