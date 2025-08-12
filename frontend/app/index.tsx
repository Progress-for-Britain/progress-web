/// <reference types="nativewind/types" />
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function Home() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: 'Home' }} />

      {/* Hero Section */}
      <View className="relative h-80 justify-center items-center">
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2070&auto=format&fit=crop' }}
          className="w-full h-full absolute"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.3)']}
          className="absolute inset-0"
        />
        <View className="p-5 items-center">
          <Text className="text-4xl font-bold text-white text-center mb-2">Building a Brighter Future</Text>
          <Text className="text-lg text-white text-center mb-6">Join the Progress Party in creating a fair, innovative, and prosperous society.</Text>
          <TouchableOpacity className="bg-blue-600 py-3 px-8 rounded-full shadow-lg">
            <Text className="text-white font-bold text-base">Join Our Movement</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Our Mission Section */}
      <View className="py-12 px-6 bg-white">
        <Text className="text-3xl font-bold text-center mb-6 text-gray-800">Our Mission</Text>
        <Text className="text-center text-gray-600 text-base leading-relaxed max-w-2xl mx-auto">
          We are dedicated to championing policies that foster economic growth, social equality, and environmental sustainability. We believe in a transparent and accountable government that works for all people.
        </Text>
      </View>

      {/* What We Stand For Section */}
      <LinearGradient colors={['#f3f4f6', '#e5e7eb']} className="py-12 px-6">
        <Text className="text-3xl font-bold text-center mb-10 text-gray-800">What We Stand For</Text>
        <View className="flex-row justify-around flex-wrap">
          <ValueCard icon="balance-scale" title="Equality" text="Equal opportunities for every citizen." color="#3b82f6" />
          <ValueCard icon="leaf" title="Sustainability" text="Protecting our planet for future generations." color="#10b981" />
          <ValueCard icon="lightbulb-o" title="Innovation" text="Driving progress through technology and new ideas." color="#f59e0b" />
        </View>
      </LinearGradient>

      {/* Latest News Section */}
      <View className="py-12 px-6 bg-white">
        <Text className="text-3xl font-bold text-center mb-10 text-gray-800">Latest News</Text>
        <View className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
          <Text className="text-xl font-semibold text-gray-900">New Green Energy Initiative Announced</Text>
          <Text className="text-sm text-gray-500 mt-1 mb-3">August 12, 2025</Text>
          <Text className="text-gray-700 mb-4">The initiative aims to invest in renewable energy sources, creating thousands of new jobs and a sustainable future...</Text>
          <TouchableOpacity>
            <Text className="text-blue-600 font-semibold">Read More</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Get Involved Section */}
      <View className="py-12 px-6 bg-gray-50">
        <Text className="text-3xl font-bold text-center mb-10 text-gray-800">Get Involved</Text>
        <View className="flex-row justify-center space-x-4">
          <InvolvedButton icon="user-plus" text="Join Us" color="bg-blue-600" />
          <InvolvedButton icon="heart" text="Donate" color="bg-green-600" />
          <InvolvedButton icon="bullhorn" text="Volunteer" color="bg-gray-700" />
        </View>
      </View>
    </ScrollView>
  );
}

const ValueCard = ({ icon, title, text, color }: { icon: any; title: string; text: string; color: string }) => (
  <View className="items-center w-1/3 p-4 mb-6">
    <FontAwesome name={icon} size={32} color={color} />
    <Text className="text-xl font-bold mt-4 text-gray-800">{title}</Text>
    <Text className="text-center text-gray-600 mt-2">{text}</Text>
  </View>
);

const InvolvedButton = ({ icon, text, color }: { icon: any; text: string; color: string }) => (
  <TouchableOpacity className={`${color} flex-row items-center py-3 px-6 rounded-full shadow-md`}>
    <FontAwesome name={icon} size={20} color="#fff" />
    <Text className="text-white font-bold ml-3">{text}</Text>
  </TouchableOpacity>
);
