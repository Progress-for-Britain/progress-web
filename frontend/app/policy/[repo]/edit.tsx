import React, { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { Platform, View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import Head from 'expo-router/head';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Markdown from 'react-native-markdown-display';

import { useTheme } from '../../../util/theme-context';
import { useResponsive } from '../../../util/useResponsive';
import { getCommonStyles, getColors } from '../../../util/commonStyles';
import { useAuth } from '../../../util/auth-context';
import { api } from '../../../util/api';

// Lazy-load the SimpleMDE editor for web
let WebMDE: any = null;
const isWeb = Platform.OS === 'web';
if (isWeb) {
  // Dynamic import at runtime to avoid bundling issues in native
  import('react-simplemde-editor').then((mod) => {
    WebMDE = mod.default;
  }).catch(() => {
    WebMDE = null;
  });
}

export default function PolicyEditor() {
  const router = useRouter();
  const { repo } = useLocalSearchParams<{ repo: string }>();
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const { user } = useAuth();
  const commonStyles = getCommonStyles(isDark, isMobile, width);
  const colors = getColors(isDark);
  const styles = getStyles(colors, isMobile);
  const scrollRef = useRef<any>(null);

  const [content, setContent] = useState('');
  const [commitMessage, setCommitMessage] = useState('Update policy.md');
  const [branchName, setBranchName] = useState('policy/update-' + Date.now());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  const isWriter = user?.roles?.includes('WRITER') || user?.roles?.includes('ADMIN');

  useEffect(() => {
    // Ensure page opens scrolled to top
    if (isWeb && typeof window !== 'undefined') {
      try {
        window.scrollTo({ top: 0, behavior: 'auto' });
      } catch {}
    }
    // Also reset any ScrollView ref position
    setTimeout(() => {
      try {
        scrollRef.current?.scrollTo?.({ y: 0, animated: false });
      } catch {}
    }, 0);

    let mounted = true;
    async function load() {
      if (!repo) return;
      setLoading(true);
      setError(null);
      try {
        const data = await api.getPolicyContent(String(repo), 'policy.md');
        if (!mounted) return;
        setContent(data.content || '');
      } catch (e) {
        setError('Failed to load policy for editing');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, [repo]);

  const handleSave = async () => {
    if (!repo) return;
    try {
      setSaving(true);
      await api.editPolicy(String(repo), 'policy.md', content, commitMessage || 'Update policy.md', branchName || undefined);
      Alert.alert('Success', 'Policy updated and PR created!');
      router.replace(`/policy/${repo}`);
    } catch (e) {
      Alert.alert('Error', 'Failed to save policy changes');
    } finally {
      setSaving(false);
    }
  };

  // Guard non-writers
  if (!isWriter) {
    return (
      <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }, commonStyles.appContainer]}>
        <Text style={{ color: colors.text, marginBottom: 12, fontSize: 16 }}>You do not have access to the policy editor.</Text>
        <TouchableOpacity onPress={() => router.replace(`/policy/${repo}`)} style={[styles.primaryButton, { paddingHorizontal: 16 }]}>
          <Text style={styles.primaryButtonText}>Back to Policy</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[{ flex: 1, paddingVertical: 16 }, commonStyles.appContainer]}>
      {/* Include EasyMDE CSS on web for styling */}
      {isWeb && (
        <Head>
          <link rel="stylesheet" href="https://unpkg.com/easymde/dist/easymde.min.css" />
          <title>Policy Editor</title>
        </Head>
      )}

      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingHorizontal: isMobile ? 16 : 32, paddingBottom: 100 }}>
        <View style={{ marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700' }}>Policy Editor: {repo}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={[styles.secondaryButton]} onPress={() => router.replace(`/policy/${repo}`)}>
              <Text style={styles.secondaryButtonText}>Back to View</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryButton]} onPress={handleSave} disabled={saving}>
              <Text style={styles.primaryButtonText}>{saving ? 'Saving…' : 'Save & Create PR'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mode toggle */}
        <View style={{ flexDirection: 'row', marginBottom: 16, gap: 8 }}>
          <TouchableOpacity
            style={[styles.modeButton, !isPreview && styles.modeButtonActive]}
            onPress={() => setIsPreview(false)}
          >
            <Text style={[styles.modeButtonText, !isPreview && styles.modeButtonTextActive]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, isPreview && styles.modeButtonActive]}
            onPress={() => setIsPreview(true)}
          >
            <Text style={[styles.modeButtonText, isPreview && styles.modeButtonTextActive]}>Preview</Text>
          </TouchableOpacity>
        </View>

        {/* Commit controls */}
        <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 8, marginBottom: 12 }}>
          <TextInput
            style={[styles.input, { flex: 2 }]}
            placeholder="Commit message"
            placeholderTextColor={colors.textSecondary}
            value={commitMessage}
            onChangeText={setCommitMessage}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Branch name (optional)"
            placeholderTextColor={colors.textSecondary}
            value={branchName}
            onChangeText={setBranchName}
          />
        </View>

        {/* Editor/Preview */}
        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color={colors.accent} />
            <Text style={{ color: colors.text, marginTop: 8 }}>Loading content…</Text>
          </View>
        ) : isPreview ? (
          <View style={styles.previewContainer}>
            <ScrollView style={{ flex: 1 }}>
              <Markdown
                style={{
                  body: { color: colors.text, fontSize: 16 },
                  heading1: { color: colors.text, borderBottomColor: colors.border, borderBottomWidth: 1, paddingBottom: 8 },
                  heading2: { color: colors.text },
                  heading3: { color: colors.text },
                  heading4: { color: colors.text },
                  heading5: { color: colors.text },
                  heading6: { color: colors.text },
                  hr: { backgroundColor: colors.border },
                  strong: { color: colors.text },
                  em: { color: colors.text },
                  s: { color: colors.textSecondary },
                  blockquote: { backgroundColor: colors.surface, borderLeftColor: colors.accent, borderLeftWidth: 4, paddingLeft: 16 },
                  bullet_list: {},
                  ordered_list: {},
                  list_item: { color: colors.text },
                  code_inline: { backgroundColor: colors.surface, color: colors.text, fontFamily: 'monospace' },
                  code_block: { backgroundColor: colors.surface, color: colors.text, fontFamily: 'monospace', padding: 12, borderRadius: 8 },
                  fence: { backgroundColor: colors.surface, color: colors.text, fontFamily: 'monospace', padding: 12, borderRadius: 8 },
                  table: { borderColor: colors.border },
                  thead: {},
                  tbody: {},
                  th: { backgroundColor: colors.surface, color: colors.text, fontWeight: 'bold', borderColor: colors.border },
                  td: { color: colors.text, borderColor: colors.border },
                  link: { color: colors.accent },
                  image: {},
                  text: { color: colors.text },
                  paragraph: { color: colors.text },
                }}
              >
                {content || '*No content to preview*'}
              </Markdown>
            </ScrollView>
          </View>
        ) : isWeb && WebMDE ? (
          <View style={styles.editorWebContainer}>
            {/* @ts-ignore */}
            <WebMDE
              value={content}
              onChange={(v: string) => setContent(v)}
              options={{
                spellChecker: true,
                // Disable autofocus to avoid auto-scroll to editor on load
                autofocus: false,
                status: false,
                minHeight: '400px',
                placeholder: 'Edit policy markdown…',
                toolbar: [
                  'bold', 'italic', 'heading', '|',
                  'quote', 'unordered-list', 'ordered-list', '|',
                  'link', 'table', '|', 'preview', 'side-by-side', 'fullscreen'
                ],
              }}
            />
          </View>
        ) : (
          <TextInput
            style={styles.editorInput}
            multiline
            value={content}
            onChangeText={setContent}
            placeholder="Edit policy markdown…"
            placeholderTextColor={colors.textSecondary}
          />
        )}

        {error && (
          <Text style={{ color: colors.error, marginTop: 12 }}>{error}</Text>
        )}

        {/* Bottom actions for mobile */}
        <View style={{ height: 24 }} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={() => router.replace(`/policy/${repo}`)}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={handleSave} disabled={saving}>
            <Text style={styles.primaryButtonText}>{saving ? 'Saving…' : 'Save & Create PR'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any, isMobile: boolean) => StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  editorWebContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  editorInput: {
    minHeight: 400,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
    fontSize: 16,
  },
  previewContainer: {
    minHeight: 400,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  modeButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
});
