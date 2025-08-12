import { Stack } from "expo-router";
import { Animated, Image, ScrollView, Text, View } from "react-native";
import { useEffect, useRef } from "react";

export default function Home() {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
  }, []);

  return (
    <ScrollView className="flex-1 bg-white">
      <Stack.Screen options={{ title: "Home" }} />
      <Animated.View style={{ opacity: fade }} className="p-6 space-y-4">
        <Text className="text-3xl font-bold text-primary">Our Values</Text>
        <Text className="text-lg">
          We believe in progress through inclusivity, transparency, and community-driven change.
        </Text>
        <View className="w-full h-48 bg-gray-200 rounded-md overflow-hidden">
          <Image source={{ uri: "https://placekitten.com/400/200" }} className="w-full h-full" />
        </View>
      </Animated.View>
    </ScrollView>
  );
}
