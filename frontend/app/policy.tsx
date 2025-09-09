import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, TextInput, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import SEOHead from '../components/SEOHead';
import { getCommonStyles, getColors } from '../util/commonStyles';
import { useTheme } from '../util/theme-context';
import { useResponsive } from '../util/useResponsive';
import { useAuth } from '../util/auth-context';
import { api } from '../util/api';

// Define interfaces for our data types
interface Repository {
  id: string;
  name: string;
  displayName?: string;
}

export default function Policy() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const { user } = useAuth();
  const commonStyles = getCommonStyles(isDark, isMobile, width);
  const colors = getColors(isDark);
  const styles = getStyles(colors, isMobile, width);

  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);

  // Admin state for creating repos
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDescription, setNewRepoDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const isAdmin = user?.roles?.includes('ADMIN');

  // Load repos on mount
  useEffect(() => {
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    try {
      setLoading(true);
      const data = await api.getPolicyRepos();
      // Fetch titles for each repo
      const reposWithTitles = await Promise.all(data.map(async (repo) => {
        try {
          const contentData = await api.getPolicyContent(repo.name, 'policy.md');
          const lines = contentData.content.split('\n');
          const firstHeading = lines.find(line => line.startsWith('# '));
          const title = firstHeading ? firstHeading.replace(/^#+\s*/, '') : repo.name;
          return { ...repo, displayName: title };
        } catch {
          return { ...repo, displayName: repo.name };
        }
      }));
      setRepos(reposWithTitles);
    } catch (error) {
      console.error('Error fetching repos:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRepo = async () => {
    if (!newRepoName.trim()) {
      Alert.alert('Error', 'Please enter a repository name');
      return;
    }

    try {
      setCreating(true);
      await api.createPolicyRepo(newRepoName.trim(), newRepoDescription.trim() || undefined);
      setNewRepoName('');
      setNewRepoDescription('');
      Alert.alert('Success', 'Policy repository created successfully!');
      fetchRepos(); // Refresh the list
    } catch (error) {
      console.error('Error creating repo:', error);
      Alert.alert('Error', 'Failed to create policy repository');
    } finally {
      setCreating(false);
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

          {/* Repo list */}
          <View style={styles.section}>
            <Text style={[commonStyles.text, styles.sectionTitle]}>Select a Policy</Text>
            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={colors.accent} />
                <Text style={[commonStyles.text, styles.loadingText]}>Loading policies…</Text>
              </View>
            ) : (
              <FlatList
                data={repos}
                keyExtractor={(item) => item.id}
                numColumns={isMobile ? 1 : 2}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.repoCard}
                    onPress={() => router.push(`/policy/${item.name}`)}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${item.displayName || item.name} policy`}
                  >
                    <MaterialIcons name="policy" size={32} color={colors.accent} />
                    <Text style={[commonStyles.text, styles.repoCardText]}>{item.displayName || item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>

          {isAdmin && (
            <View style={styles.section}>
              <Text style={[commonStyles.text, styles.sectionTitle]}>Create New Policy Repository</Text>
              <TextInput
                style={styles.input}
                placeholder="Repository Name"
                value={newRepoName}
                onChangeText={setNewRepoName}
              />
              <TextInput
                style={styles.input}
                placeholder="Repository Description (optional)"
                value={newRepoDescription}
                onChangeText={setNewRepoDescription}
              />
              <TouchableOpacity
                style={styles.createButton}
                onPress={createRepo}
                disabled={creating}
              >
                <Text style={styles.buttonText}>{creating ? 'Creating...' : 'Create Repository'}</Text>
              </TouchableOpacity>
            </View>
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
  loadingBox: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    opacity: 0.8,
  },
  repoCard: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    margin: 12,
    backgroundColor: colors.surface,
  },
  repoCardText: {
    marginTop: 8,
    fontWeight: 'bold',
    fontSize: isMobile ? 16 : 18,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  createButton: {
    backgroundColor: colors.accent,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
