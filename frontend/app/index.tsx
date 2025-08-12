import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { Link, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Header from "../components/Header";

export default function Home() {
  const PartyValue = ({ title, description, delay = 0 }: { title: string; description: string; delay?: number }) => (
    <View 
      className="bg-white rounded-xl p-6 shadow-lg animate-fade-in"
      style={{ 
        backgroundColor: '#ffffff', 
        borderRadius: 12, 
        padding: 24, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 24,
        ...(Platform.OS === 'web' && {
          animationDelay: `${delay}ms`,
        })
      }}
    >
      <Text className="text-xl font-bold text-gray-900 mb-3" style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 12 }}>
        {title}
      </Text>
      <Text className="text-gray-600 leading-relaxed" style={{ color: '#4B5563', lineHeight: 24 }}>
        {description}
      </Text>
    </View>
  );

  const ActionButton = ({ href, children, variant = 'primary' }: { href: string; children: React.ReactNode; variant?: 'primary' | 'secondary' }) => (
    <Link href={href} asChild>
      <TouchableOpacity
        style={{
          backgroundColor: variant === 'primary' ? '#d946ef' : 'transparent',
          borderWidth: variant === 'primary' ? 0 : 2,
          borderColor: '#d946ef',
          borderRadius: 12,
          paddingHorizontal: 32,
          paddingVertical: 16,
          marginHorizontal: 8,
          marginBottom: 16,
          ...(Platform.OS === 'web' && { cursor: 'pointer' })
        }}
      >
        <Text 
          style={{ 
            color: variant === 'primary' ? '#ffffff' : '#d946ef',
            fontSize: 18,
            fontWeight: '600',
            textAlign: 'center'
          }}
        >
          {children}
        </Text>
      </TouchableOpacity>
    </Link>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <Header />
        
        <ScrollView style={{ flex: 1 }}>
          {/* Hero Section */}
          <View 
            className="bg-gradient-to-br from-magenta-500 to-magenta-700"
            style={{ 
              backgroundColor: '#d946ef',
              paddingVertical: 80,
              paddingHorizontal: 16,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text 
              className="text-4xl md:text-6xl font-bold text-white text-center mb-6 animate-slide-up"
              style={{ 
                fontSize: Platform.OS === 'web' ? 48 : 32,
                fontWeight: 'bold',
                color: '#ffffff',
                textAlign: 'center',
                marginBottom: 24,
                lineHeight: Platform.OS === 'web' ? 56 : 40
              }}
            >
              Building Progress Together
            </Text>
            <Text 
              className="text-xl text-magenta-100 text-center max-w-2xl mb-8 animate-fade-in"
              style={{ 
                fontSize: 18,
                color: '#f5d0fe',
                textAlign: 'center',
                marginBottom: 32,
                lineHeight: 28,
                maxWidth: 600
              }}
            >
              Join us in creating a future where equality, sustainability, and innovation drive meaningful change for all.
            </Text>
            
            <View style={{ flexDirection: Platform.OS === 'web' ? 'row' : 'column', alignItems: 'center' }}>
              <ActionButton href="/join">Join Our Movement</ActionButton>
              <ActionButton href="/donate" variant="secondary">Support Our Cause</ActionButton>
            </View>
          </View>

          {/* Party Values Section */}
          <View style={{ maxWidth: 1200, alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 80 }}>
            <Text 
              className="text-3xl font-bold text-center text-gray-900 mb-4"
              style={{ fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#111827', marginBottom: 16 }}
            >
              Our Core Values
            </Text>
            <Text 
              className="text-lg text-gray-600 text-center mb-12"
              style={{ fontSize: 18, color: '#6B7280', textAlign: 'center', marginBottom: 48, lineHeight: 28 }}
            >
              The principles that guide our vision for a better tomorrow
            </Text>

            <View style={{ maxWidth: 800, alignSelf: 'center' }}>
              <PartyValue
                title="🌍 Environmental Justice"
                description="We believe in protecting our planet for future generations through sustainable policies, renewable energy initiatives, and environmental restoration programs that create jobs while healing our Earth."
                delay={200}
              />
              
              <PartyValue
                title="⚖️ Social Equality"
                description="Every person deserves equal rights, opportunities, and dignity regardless of their background, identity, or circumstances. We fight for justice in healthcare, education, housing, and employment."
                delay={400}
              />
              
              <PartyValue
                title="💡 Innovation & Progress"
                description="Embracing technology and innovation to solve complex problems, while ensuring that progress benefits everyone, not just the privileged few. We invest in education, research, and digital infrastructure."
                delay={600}
              />
              
              <PartyValue
                title="🤝 Community Empowerment"
                description="Strengthening local communities through grassroots democracy, supporting small businesses, and ensuring every voice is heard in the decisions that affect their lives."
                delay={800}
              />
              
              <PartyValue
                title="🏥 Universal Healthcare"
                description="Healthcare is a human right. We advocate for accessible, affordable healthcare for all, including mental health services, preventive care, and support for vulnerable populations."
                delay={1000}
              />
              
              <PartyValue
                title="📚 Education for All"
                description="Quality education should be accessible to everyone, from early childhood through higher education and vocational training. We support teachers, modernize curricula, and eliminate educational debt barriers."
                delay={1200}
              />
            </View>
          </View>

          {/* Call to Action Section */}
          <View 
            style={{ 
              backgroundColor: '#f3f4f6',
              paddingVertical: 60,
              paddingHorizontal: 16,
              alignItems: 'center'
            }}
          >
            <Text 
              style={{ 
                fontSize: 28,
                fontWeight: 'bold',
                color: '#111827',
                textAlign: 'center',
                marginBottom: 16
              }}
            >
              Ready to Make a Difference?
            </Text>
            <Text 
              style={{ 
                fontSize: 18,
                color: '#6B7280',
                textAlign: 'center',
                marginBottom: 32,
                lineHeight: 28,
                maxWidth: 600
              }}
            >
              Your voice matters. Join thousands of progressive citizens working together to build a better future.
            </Text>
            
            <View style={{ flexDirection: Platform.OS === 'web' ? 'row' : 'column', alignItems: 'center' }}>
              <ActionButton href="/join">Become a Member</ActionButton>
              <ActionButton href="/volunteer" variant="secondary">Volunteer Today</ActionButton>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
