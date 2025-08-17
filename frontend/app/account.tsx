import React from 'react';
import { View, Text, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../util/auth-context';
import Header from '../components/Header';

export default function Account() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated (but wait for loading to complete)
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading]);

  // Show loading screen while auth is being determined
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Show loading screen if not authenticated (while redirect is happening)
  if (!isAuthenticated || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const QuickActionCard = ({ title, description, onPress, icon }: { 
    title: string; 
    description: string; 
    onPress: () => void; 
    icon: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#d946ef',
        ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 24, marginRight: 12 }}>{icon}</Text>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', flex: 1 }}>
          {title}
        </Text>
        <Text style={{ fontSize: 18, color: '#d946ef' }}>→</Text>
      </View>
      <Text style={{ color: '#6B7280', lineHeight: 20 }}>
        {description}
      </Text>
    </TouchableOpacity>
  );

  const StatCard = ({ label, value, trend }: { label: string; value: string; trend?: string }) => (
    <View
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        flex: 1,
        marginHorizontal: 4
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#d946ef', marginBottom: 4 }}>
        {value}
      </Text>
      <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 4 }}>
        {label}
      </Text>
      {trend && (
        <Text style={{ fontSize: 12, color: '#10B981' }}>
          {trend}
        </Text>
      )}
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <Header />
        
        <ScrollView style={{ flex: 1 }}>
          {/* Welcome Section */}
          <View 
            style={{ 
              backgroundColor: '#d946ef',
              paddingVertical: 40,
              paddingHorizontal: 16
            }}
          >
            <Text 
              style={{ 
                fontSize: 28,
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: 8
              }}
            >
              Welcome back, {user.firstName}!
            </Text>
            <Text 
              style={{ 
                fontSize: 16,
                color: '#f5d0fe',
                marginBottom: 16
              }}
            >
              Member since {new Date(user.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </Text>
            <View
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 8,
                paddingVertical: 8,
                paddingHorizontal: 12,
                alignSelf: 'flex-start'
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>
                {user.payments && user.payments[0]?.status === 'active' ? '✓ Active Member' : 
                 user.payments && user.payments[0]?.status === 'pending' ? '⏳ Membership Pending' : 
                 '⚠️ Membership Expired'}
              </Text>
            </View>
          </View>

          {/* Stats Section */}
          <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
            <Text 
              style={{ 
                fontSize: 20,
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: 16
              }}
            >
              Your Impact
            </Text>
            <View style={{ flexDirection: 'row', marginBottom: 32 }}>
              <StatCard label="Events Attended" value="12" trend="+3 this month" />
              <StatCard label="Donations Made" value="$450" trend="$50 this month" />
              <StatCard label="Volunteer Hours" value="28" trend="+6 this month" />
            </View>
          </View>

          {/* Quick Actions */}
          <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
            <Text 
              style={{ 
                fontSize: 20,
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: 16
              }}
            >
              Quick Actions
            </Text>

            <QuickActionCard
              icon="📰"
              title="Latest News & Updates"
              description="Stay informed with the latest party news, policy updates, and campaign progress"
              onPress={() => router.push('/newsroom')}
            />

            <QuickActionCard
              icon="💰"
              title="Make a Donation"
              description="Support our ongoing campaigns and initiatives with a contribution"
              onPress={() => router.push('/donate')}
            />

            <QuickActionCard
              icon="🗳️"
              title="Upcoming Votes"
              description="View and participate in upcoming party votes and policy decisions"
              onPress={() => router.push('/votes')}
            />

            <QuickActionCard
              icon="📅"
              title="Local Events"
              description="Find and register for political events, rallies, and meetings in your area"
              onPress={() => router.push('/events')}
            />

            <QuickActionCard
              icon="🤝"
              title="Volunteer Opportunities"
              description="Sign up to help with campaigns, phone banking, and community outreach"
              onPress={() => router.push('/volunteer')}
            />

            <QuickActionCard
              icon="⚙️"
              title="Account Settings"
              description="Update your profile, preferences, and notification settings"
              onPress={() => router.push('/settings')}
            />
          </View>

          {/* Recent Activity */}
          <View style={{ backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 24 }}>
            <Text 
              style={{ 
                fontSize: 20,
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: 16
              }}
            >
              Recent Activity
            </Text>

            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <View 
                  style={{ 
                    width: 8, 
                    height: 8, 
                    backgroundColor: '#10B981', 
                    borderRadius: 4, 
                    marginRight: 12 
                  }} 
                />
                <Text style={{ fontSize: 16, color: '#111827', flex: 1 }}>
                  Attended Climate Action Rally
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>
                  2 days ago
                </Text>
              </View>
            </View>

            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <View 
                  style={{ 
                    width: 8, 
                    height: 8, 
                    backgroundColor: '#d946ef', 
                    borderRadius: 4, 
                    marginRight: 12 
                  }} 
                />
                <Text style={{ fontSize: 16, color: '#111827', flex: 1 }}>
                  Donated $50 to Healthcare Initiative
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>
                  1 week ago
                </Text>
              </View>
            </View>

            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <View 
                  style={{ 
                    width: 8, 
                    height: 8, 
                    backgroundColor: '#F59E0B', 
                    borderRadius: 4, 
                    marginRight: 12 
                  }} 
                />
                <Text style={{ fontSize: 16, color: '#111827', flex: 1 }}>
                  Voted on Education Policy Proposal
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>
                  2 weeks ago
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
