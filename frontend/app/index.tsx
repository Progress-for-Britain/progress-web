import { View, Text, Image, Animated, StyleSheet } from 'react-native';
import { useRef, useEffect } from 'react';
import { Stack } from 'expo-router';

export default function Home() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Home' }} />
      <Image
        source={{ uri: 'https://placekitten.com/800/300' }}
        style={styles.headerImage}
        resizeMode="cover"
      />
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Progress Party Values</Text>
        <Text style={styles.subtitle}>We stand for equality, transparency and relentless progress.</Text>
        <Text style={styles.text}>Together we can build a brighter future for everyone.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerImage: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0070f3',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  text: {
    textAlign: 'center',
  },
});
