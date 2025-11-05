import React, { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getVolunteerFormStyles } from '../../util/volunteerFormStyles';
import { getColors, getCommonStyles } from '../../util/commonStyles';
import { useTheme } from '../../util/theme-context';
import useResponsive from '../../util/useResponsive';

interface TagSelectorProps {
  title: string;
  items: readonly string[];
  selectedItems: string[];
  onToggleItem: (item: string) => void;
  variant?: 'primary' | 'success';
}

export const TagSelector = memo(({ 
  title, 
  items, 
  selectedItems, 
  onToggleItem,
  variant = 'primary'
}: TagSelectorProps) => {
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark, isMobile, width);
  const styles = getVolunteerFormStyles(colors, isMobile, width);

  // Memoize style keys based on variant
  const styleKeys = useMemo(() => {
    return variant === 'success' 
      ? {
          tag: 'contributionTag',
          tagSelected: 'contributionTagSelected',
          tagText: 'contributionTagText',
          tagTextSelected: 'contributionTagTextSelected'
        }
      : {
          tag: 'interestTag',
          tagSelected: 'interestTagSelected', 
          tagText: 'interestTagText',
          tagTextSelected: 'interestTagTextSelected'
        };
  }, [variant]);

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[styles.inputLabel, { marginBottom: 12 }]}>
        {title}
      </Text>
      <View style={commonStyles.tagContainer}>
        {items.map((item) => {
          const isSelected = selectedItems.includes(item);
          return (
            <TouchableOpacity
              key={item}
              onPress={() => onToggleItem(item)}
              style={[
                styles[styleKeys.tag as keyof typeof styles],
                isSelected && styles[styleKeys.tagSelected as keyof typeof styles]
              ]}
            >
              <Text
                style={[
                  styles[styleKeys.tagText as keyof typeof styles],
                  isSelected && styles[styleKeys.tagTextSelected as keyof typeof styles]
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

TagSelector.displayName = 'TagSelector';