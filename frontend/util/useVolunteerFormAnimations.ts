import { useEffect } from 'react';
import { useSharedValue, withTiming, withSpring, withRepeat } from 'react-native-reanimated';
import { ANIMATION_CONFIG } from './volunteerFormConstants';

export const useVolunteerFormAnimations = (isSuccess: boolean) => {
  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const rotateAnim = useSharedValue(0);
  const successAnim = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);

  useEffect(() => {
    // Animate elements on mount
    fadeAnim.value = withTiming(1, { duration: ANIMATION_CONFIG.fadeIn.duration });
    slideAnim.value = withSpring(0, { damping: ANIMATION_CONFIG.spring.damping });

    // Rotation animation for decorative elements
    rotateAnim.value = withRepeat(
      withTiming(360, { duration: ANIMATION_CONFIG.rotation.duration }),
      ANIMATION_CONFIG.rotation.repeat
    );
  }, [fadeAnim, slideAnim, rotateAnim]);

  useEffect(() => {
    if (isSuccess) {
      successAnim.value = withSpring(1, { damping: ANIMATION_CONFIG.spring.damping });
      checkmarkScale.value = withSpring(1, { damping: ANIMATION_CONFIG.checkmark.damping });
    }
  }, [isSuccess, successAnim, checkmarkScale]);

  return {
    fadeAnim,
    slideAnim,
    rotateAnim,
    successAnim,
    checkmarkScale,
  };
};