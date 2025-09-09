import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import Head from 'expo-router/head';
import { useLocalSearchParams, useRouter } from 'expo-router';

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

interface Heading {
  level: number;
  text: string;
  line: number;
}

const parseHeadings = (content: string): Heading[] => {
  const lines = content.split('\n');
  const headings: Heading[] = [];
  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.*)$/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        line: index
      });
    }
  });
  return headings;
};

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
  // Holds the EasyMDE instance on web so we can access CodeMirror APIs
  const easyMdeRef = useRef<any>(null);
  const textInputRef = useRef<TextInput>(null);

  const [content, setContent] = useState('');
  const [commitMessage, setCommitMessage] = useState('Update policy.md');
  const [branchName, setBranchName] = useState('policy/update-' + Date.now());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOutline, setShowOutline] = useState(true);

  const isWriter = user?.roles?.includes('WRITER') || user?.roles?.includes('ADMIN');

  const headings = useMemo(() => parseHeadings(content), [content]);

  // Memoize SimpleMDE options so the editor isn't re-initialized on each render
  const mdeOptions = useMemo(() => ({
    spellChecker: false,
    // Disable autofocus to avoid auto-scroll to editor on load
    autofocus: false,
    status: false,
    minHeight: '400px',
    placeholder: 'Edit policy markdown…',
    toolbar: [
      'bold', 'italic', 'strikethrough', 'heading', '|',
      'code', 'quote', 'unordered-list', 'ordered-list', 'clean-block', '|',
      'link', 'image', 'table', 'horizontal-rule', '|',
      'undo', 'redo', '|',
      'preview', 'side-by-side', 'fullscreen', '|', 'guide'
    ],
  }), []);

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
          {/* Temporary highlight for scrolled-to heading lines */}
          <style>{`
            .CodeMirror .cm-line-highlight { 
              background-color: rgba(255, 230, 0, 0.35);
            }
          `}</style>
        </Head>
      )}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: isMobile ? 'column' : 'row', flex: 1, paddingHorizontal: isMobile ? 16 : 32 }}>
          {/* Outline */}
          {showOutline && (
            <View style={{ width: isMobile ? '100%' : 200, marginBottom: isMobile ? 16 : 0, marginRight: isMobile ? 0 : 16 }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Outline</Text>
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {headings.map((heading, index) => (
                  <TouchableOpacity key={index} onPress={() => {
                    if (isWeb && easyMdeRef.current && easyMdeRef.current.codemirror) {
                      try {
                        const cm = easyMdeRef.current.codemirror;
                        // Place cursor at heading and align it to top of editor viewport
                        cm.focus();
                        cm.setCursor({ line: heading.line, ch: 0 });
                        const top = cm.charCoords({ line: heading.line, ch: 0 }, 'local').top;
                        cm.scrollTo(null, top);
                        // Brief highlight on the target line
                        const cls = 'cm-line-highlight';
                        cm.addLineClass(heading.line, 'background', cls);
                        setTimeout(() => {
                          try { cm.removeLineClass(heading.line, 'background', cls); } catch {}
                        }, 900);
                      } catch {}
                    } else if (!isWeb && textInputRef.current) {
                      const lines = content.split('\n');
                      const pos = lines.slice(0, heading.line).reduce((acc, line) => acc + line.length + 1, 0);
                      textInputRef.current.setNativeProps({ selection: { start: pos, end: pos } });
                    }
                  }} style={{ paddingVertical: 4, paddingLeft: heading.level * 10 }}>
                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: heading.level === 1 ? 'bold' : 'normal' }}>{heading.text}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          {/* Editor part */}
          <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              <View style={{ marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700' }}>Policy Editor: {repo}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity style={[styles.secondaryButton]} onPress={() => setShowOutline(!showOutline)}>
                    <Text style={styles.secondaryButtonText}>{showOutline ? 'Hide Outline' : 'Show Outline'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.secondaryButton]} onPress={() => router.replace(`/policy/${repo}`)}>
                    <Text style={styles.secondaryButtonText}>Back to View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.primaryButton]} onPress={handleSave} disabled={saving}>
                    <Text style={styles.primaryButtonText}>{saving ? 'Saving…' : 'Save & Create PR'}</Text>
                  </TouchableOpacity>
                </View>
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
              {/* Editor */}
              {loading ? (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                  <ActivityIndicator color={colors.accent} />
                  <Text style={{ color: colors.text, marginTop: 8 }}>Loading content…</Text>
                </View>
              ) : isWeb && WebMDE ? (
                <View style={styles.editorWebContainer}>
                  {/* @ts-ignore */}
                  <WebMDE
                    value={content}
                    onChange={(v: string) => setContent(v)}
                    options={mdeOptions}
                    // Capture the EasyMDE and CodeMirror instances for programmatic control
                    // @ts-ignore - prop is provided by react-simplemde-editor
                    getMdeInstance={(inst: any) => { easyMdeRef.current = inst; }}
                    // @ts-ignore - some versions also expose the underlying CodeMirror instance directly
                    getCodemirrorInstance={(cm: any) => {
                      if (!easyMdeRef.current) easyMdeRef.current = { codemirror: cm };
                      else easyMdeRef.current.codemirror = cm;
                    }}
                  />
                </View>
              ) : (
                <TextInput
                  ref={textInputRef}
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
            </ScrollView>
          </View>
        </View>
      </View>
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
