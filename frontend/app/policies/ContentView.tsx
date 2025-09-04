import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../util/theme-context';
import { useResponsive } from '../../util/useResponsive';
import { getCommonStyles, getColors } from '../../util/commonStyles';

interface PublishedViewProps {
  content: string;
}

export default function PublishedView({ content }: PublishedViewProps) {
  const { isDark } = useTheme();
  const { isMobile } = useResponsive();
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark, isMobile, 0);

  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactElement[] = [];
    let key = 0;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('# ')) {
        // Main heading
        elements.push(
          <Text key={key++} style={{
            fontSize: 36,
            fontWeight: '700',
            color: colors.text,
            marginTop: index > 0 ? 48 : 0,
            marginBottom: 24,
            lineHeight: 44,
            textAlign: 'left',
          }}>
            {trimmedLine.substring(2)}
          </Text>
        );
      } else if (trimmedLine.startsWith('## ')) {
        // Subheading
        elements.push(
          <Text key={key++} style={{
            fontSize: 32,
            fontWeight: '600',
            color: colors.text,
            marginTop: 40,
            marginBottom: 16,
            lineHeight: 38,
          }}>
            {trimmedLine.substring(3)}
          </Text>
        );
      } else if (trimmedLine.startsWith('### ')) {
        // Sub-subheading
        elements.push(
          <Text key={key++} style={{
            fontSize: 28,
            fontWeight: '600',
            color: colors.text,
            marginTop: 32,
            marginBottom: 12,
            lineHeight: 34,
          }}>
            {trimmedLine.substring(4)}
          </Text>
        );
      } else if (trimmedLine.startsWith('- ')) {
        // Bullet point
        elements.push(
          <View key={key++} style={{ flexDirection: 'row', marginBottom: 12, paddingLeft: 20 }}>
            <Text style={{ color: colors.primary, marginRight: 12, fontSize: 20, marginTop: 2 }}>•</Text>
            <Text style={{
              color: colors.text,
              fontSize: 20,
              lineHeight: 32,
              flex: 1,
            }}>
              {trimmedLine.substring(2)}
            </Text>
          </View>
        );
      } else if (trimmedLine.startsWith('*') && trimmedLine.endsWith('*')) {
        // Italic text (usually for footer/copyright)
        elements.push(
          <Text key={key++} style={{
            color: colors.textSecondary,
            fontSize: 18,
            fontStyle: 'italic',
            marginTop: 24,
            marginBottom: 24,
            textAlign: 'left',
            lineHeight: 28,
          }}>
            {trimmedLine.substring(1, trimmedLine.length - 1)}
          </Text>
        );
      } else if (trimmedLine === '') {
        // Empty line for spacing
        elements.push(<View key={key++} style={{ height: 16 }} />);
      } else {
        // Regular paragraph
        elements.push(
          <Text key={key++} style={{
            color: colors.text,
            fontSize: 20,
            lineHeight: 32,
            marginBottom: 20,
            textAlign: 'left',
          }}>
            {trimmedLine}
          </Text>
        );
      }
    });

    return elements;
  };

  return (
    <View style={{ marginTop: 24, paddingHorizontal: isMobile ? 16 : 20 }}>
      <View style={{
        width: '100%',
        paddingVertical: isMobile ? 24 : 32,
        paddingBottom: 64,
      }}>
        {renderFormattedContent(content)}
      </View>
    </View>
  );
}