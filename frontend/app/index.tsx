import { View, Text, Image, Animated } from 'react-native';
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
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: 'Home' }} />
      <Image
        source={{ uri: 'https://placekitten.com/800/300' }}
        className="w-full h-40"
        resizeMode="cover"
      />
      <Animated.View style={{ opacity: fadeAnim }} className="p-6">
        <Text className="text-2xl font-bold text-primary text-center mb-4">Progress Party Values</Text>
        <Text className="text-center mb-2">We stand for equality, transparency and relentless progress.</Text>
        <Text className="text-center">Together we can build a brighter future for everyone.</Text>
      </Animated.View>
    </View>
  );
}
