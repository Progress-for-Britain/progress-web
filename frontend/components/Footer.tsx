import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../util/theme-context';
import { getColors } from '../util/commonStyles';

export default function Footer() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  return (
    <View style={[styles.footerContainer, { backgroundColor: colors.background }]}>
      <Text style={[styles.footerText, { color: colors.text }]}>
        Made by Oakforge Studios LTD.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
});
