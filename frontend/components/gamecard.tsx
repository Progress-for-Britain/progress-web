import React, { useEffect, useState, useRef } from "react";
import { View, Text, Pressable, Animated, Platform, Image } from "react-native";

// GameCard Component
export const GameCard = ({ index, title, description, icon, image, url, styles }: any) => {
  const { fadeAnim, slideAnim, cardRef } = useCardAnimation(index);

  // Callback ref to ensure we get the actual DOM node
  const setRef = (ref: any) => {
    if (ref && Platform.OS === 'web') {
      // Try different ways to get the DOM node
      const domNode = ref.getNode?.() || ref._touchableNode || ref;
      cardRef.current = domNode;
    } else {
      cardRef.current = ref;
    }
  };

  return (
    <Animated.View
      ref={setRef}
      collapsable={false}
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Pressable
        style={({ pressed }) => [
          styles.gameCard,
          pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
        ]}
        onPress={() => {
          if (typeof window !== 'undefined') {
            window.open(url, '_blank');
          }
        }}
      >
        <View style={styles.gameImageContainer}>
          <View style={styles.gameImagePlaceholder}>
            {image ? (
              <Image
                source={image}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.gamePlaceholderIcon}>{icon}</Text>
            )}
          </View>
          <View style={styles.gameOverlay} />
        </View>
        <View style={styles.gameContent}>
          <Text style={styles.gameTitle}>{title}</Text>
          <Text style={styles.gameDescription}>{description}</Text>
          <View style={styles.gamePlayButton}>
            <Text style={styles.gamePlayText}>Play Now</Text>
            <Text style={styles.gamePlayArrow}>→</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// Custom hook for scroll-triggered card animations
const useCardAnimation = (index: number) => {
  const [isVisible, setIsVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const cardRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isVisible) {
              setIsVisible(true);
            }
          });
        },
        {
          threshold: 0.1, // Trigger when 10% of the element is visible
          rootMargin: '50px', // Start animation 50px before element enters viewport
        }
      );

      // Get the actual DOM node
      const node = cardRef.current;
      if (node) {
        // For React Native Web, we might need to access the underlying element
        const element = node._touchableNode || node._nativeTag || node;
        if (element && element.nodeType === 1) { // Check if it's a DOM element
          observer.observe(element);
        }
      }

      return () => {
        if (node) {
          const element = node._touchableNode || node._nativeTag || node;
          if (element && element.nodeType === 1) {
            observer.unobserve(element);
          }
        }
      };
    } else {
      // For mobile or non-supporting browsers, show immediately
      setIsVisible(true);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      // Stagger animation based on card index
      const delay = index * 150; // 150ms delay between each card
      
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, fadeAnim, slideAnim, index]);

  return { fadeAnim, slideAnim, cardRef };
};