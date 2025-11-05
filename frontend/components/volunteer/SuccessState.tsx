import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { getVolunteerFormStyles } from '../../util/volunteerFormStyles';
import { SUCCESS_INFO } from '../../util/volunteerFormConstants';
import { getColors } from '../../util/commonStyles';
import { useTheme } from '../../util/theme-context';
import useResponsive from '../../util/useResponsive';

interface SuccessStateProps {
  successMessage: string;
  successStyle: any;
  checkmarkStyle: any;
  onContinue: () => void;
}

export const SuccessState = memo(({ successMessage, successStyle, checkmarkStyle, onContinue }: SuccessStateProps) => {
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const colors = getColors(isDark);
  const styles = getVolunteerFormStyles(colors, isMobile, width);

  return (
    <Animated.View style={[successStyle, styles.successContainer]}>
      <View style={styles.successContent}>
        <Animated.View style={[checkmarkStyle, styles.checkmarkContainer]}>
          <Ionicons name="checkmark" size={40} color="#ffffff" />
        </Animated.View>

        <Text style={[{ 
          fontSize: isMobile ? 32 : 48,
          fontWeight: '700',
          marginBottom: 12,
          color: colors.text,
          textAlign: 'center',
        }]}>
          {SUCCESS_INFO.title}
        </Text>

        <Text style={[{
          lineHeight: 24,
          fontSize: 16,
          color: colors.text,
          textAlign: 'center',
          marginBottom: 24,
          maxWidth: 400,
        }]}>
          {successMessage}
        </Text>

        <View style={styles.infoContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="information-circle" size={20} color={colors.success} style={{ marginRight: 8 }} />
            <Text style={[{
              fontSize: 16,
              fontWeight: '600',
              color: colors.success,
            }]}>
              {SUCCESS_INFO.whatHappensNext.title}
            </Text>
          </View>
          <Text style={[{
            fontSize: 16,
            color: colors.success,
            lineHeight: 20,
          }]}>
            {SUCCESS_INFO.whatHappensNext.items.map(item => `• ${item}`).join('\n')}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onContinue}
          style={styles.continueButton}
        >
          <Text style={styles.continueButtonText}>
            Continue to Home
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

SuccessState.displayName = 'SuccessState';