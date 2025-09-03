// filepath: /Users/tristanhill/Documents/git/progress-web/frontend/app/policies/new.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../util/theme-context';
import { useResponsive } from '../../util/useResponsive';
import { getCommonStyles, getColors } from '../../util/commonStyles';
import { useAuth } from '../../util/auth-context';
import { createPolicy } from './mockpolicy';
import MDEditor from '@uiw/react-md-editor';
import MarkdownDisplay from 'react-native-markdown-display';

export default function NewPolicyPage() {
  const { isDark } = useTheme();
  const { isMobile } = useResponsive();
  const { user } = useAuth();
  const router = useRouter();
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark, isMobile, 0);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('# New Policy\n\nStart writing your policy here...');
  const [isPreview, setIsPreview] = useState(false);

  const handleSave = () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const newPolicy = createPolicy({
      name: title,
      description,
      lastUpdated: new Date().toISOString(),
      author: user?.firstName + ' ' + user?.lastName || 'Unknown',
      status: 'draft',
      version: '1.0.0',
      content,
    });

    Alert.alert('Success', 'Policy created successfully!', [
      { text: 'OK', onPress: () => router.replace(`/policies/${newPolicy.id}`) }
    ]);
  };

  const renderEditor = () => {
    if (Platform.OS === 'web') {
      return (
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || '')}
          preview={isPreview ? 'preview' : 'edit'}
          hideToolbar={false}
          visibleDragbar={false}
          data-color-mode={isDark ? 'dark' : 'light'}
          style={{
            backgroundColor: colors.background,
            color: colors.text,
          }}
        />
      );
    } else {
      return (
        <View>
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => setIsPreview(false)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: !isPreview ? colors.primary : 'transparent',
                borderRadius: 6,
                marginRight: 8,
              }}
            >
              <Text style={{ color: !isPreview ? 'white' : colors.text }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsPreview(true)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: isPreview ? colors.primary : 'transparent',
                borderRadius: 6,
              }}
            >
              <Text style={{ color: isPreview ? 'white' : colors.text }}>Preview</Text>
            </TouchableOpacity>
          </View>
          {isPreview ? (
            <MarkdownDisplay
              style={{
                body: { color: colors.text, backgroundColor: colors.background },
                heading1: { color: colors.text },
                heading2: { color: colors.text },
                heading3: { color: colors.text },
                paragraph: { color: colors.text },
                listItem: { color: colors.text },
              }}
            >
              {content}
            </MarkdownDisplay>
          ) : (
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 16,
                fontSize: 16,
                color: colors.text,
                backgroundColor: colors.background,
                minHeight: 300,
                textAlignVertical: 'top',
              }}
              multiline
              value={content}
              onChangeText={setContent}
              placeholder="Write your policy content here..."
              placeholderTextColor={colors.textSecondary}
            />
          )}
        </View>
      );
    }
  };

  return (
    <View style={commonStyles.appContainer}>
      <ScrollView contentContainerStyle={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[commonStyles.sectionHeader, { marginBottom: 32 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: 16, marginLeft: 8 }}>
              Back to Policies
            </Text>
          </TouchableOpacity>
          <Text style={[commonStyles.title, { textAlign: 'left' }]}>Create New Policy</Text>
        </View>

        {/* Form */}
        <View style={[commonStyles.cardContainer, { marginBottom: 24, padding: isMobile ? 16 : 20 }]}>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
              Policy Title *
            </Text>
            <TextInput
              style={commonStyles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter policy title"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
              Description *
            </Text>
            <TextInput
              style={commonStyles.textInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Brief description of the policy"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
              Content
            </Text>
            {renderEditor()}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 6,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Ionicons name="save" size={16} color="white" />
              <Text style={{ color: 'white', fontWeight: '600' }}>Create Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}