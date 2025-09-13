import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, ScrollView, Alert, Modal, TextInput, Switch } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import Head from 'expo-router/head';
import { useAuth } from '../util/auth-context';
import api from '../util/api';
import { UserActivity, UserStats } from '../util/types';

export default function Account() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showQuickActions, setShowQuickActions] = useState(true);

  // API data state
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);

  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const scaleAnim = useSharedValue(0.8);

  useEffect(() => {
    // Animate elements on mount
    fadeAnim.value = withTiming(1, { duration: 1000 });
    slideAnim.value = withSpring(0, { damping: 15 });
    scaleAnim.value = withSpring(1, { damping: 12 });
  }, []);

  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const scaleInStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ scale: scaleAnim.value }],
  }));

  // Load user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    }
  }, [isAuthenticated, user]);

  const loadUserData = async () => {
    try {
      setLoadingStats(true);
      setLoadingActivity(true);

      // Load stats and activity in parallel
      const [statsData, activityData] = await Promise.all([
        api.getUserStats().catch(error => {
          console.warn('Failed to load user stats:', error);
          return {
            eventsParticipated: 0,
            totalVolunteerHours: 0,
            totalDonated: 0,
            thisMonth: {
              eventsParticipated: 0,
              volunteerHours: 0,
              donationAmount: 0
            }
          };
        }),
        api.getUserActivity(10).catch(error => {
          console.warn('Failed to load user activity:', error);
          return [];
        })
      ]);

      setUserStats(statsData);
      setUserActivity(activityData);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert(
        'Error', 
        'Failed to load your account data. Please check your connection and try again.',
        [
          { text: 'Retry', onPress: loadUserData },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoadingStats(false);
      setLoadingActivity(false);
    }
  };

  // Redirect if not authenticated (but wait for loading to complete)
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading]);

  const QuickActionCard = ({ 
    title, 
    description, 
    onPress, 
    icon, 
    iconLibrary = 'Ionicons',
    color = '#d946ef',
    delay = 0 
  }: { 
    title: string; 
    description: string; 
    onPress: () => void; 
    icon: string;
    iconLibrary?: 'Ionicons' | 'MaterialIcons' | 'FontAwesome5';
    color?: string;
    delay?: number;
  }) => {
    const cardAnim = useSharedValue(0);
    const buttonAnim = useSharedValue(1);

    useEffect(() => {
      const timer = setTimeout(() => {
        cardAnim.value = withSpring(1, { damping: 12 });
      }, delay);
      return () => clearTimeout(timer);
    }, [delay]);

    const cardAnimatedStyle = useAnimatedStyle(() => ({
      opacity: cardAnim.value,
      transform: [
        { scale: interpolate(cardAnim.value, [0, 1], [0.9, 1], Extrapolate.CLAMP) },
        { translateY: interpolate(cardAnim.value, [0, 1], [20, 0], Extrapolate.CLAMP) }
      ],
    }));

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: buttonAnim.value }],
    }));

    const handlePressIn = () => {
      buttonAnim.value = withSpring(0.98);
    };

    const handlePressOut = () => {
      buttonAnim.value = withSpring(1);
    };

    const IconComponent = iconLibrary === 'MaterialIcons' ? MaterialIcons : 
                         iconLibrary === 'FontAwesome5' ? FontAwesome5 : Ionicons;

    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
        }}
      >
        <Animated.View
          style={[
            {
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: 24,
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 8,
              borderLeftWidth: 5,
              borderLeftColor: color,
              ...(Platform.OS === 'web' && {
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
              })
            },
            cardAnimatedStyle,
            buttonAnimatedStyle
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View 
              style={{
                backgroundColor: color + '20',
                borderRadius: 12,
                padding: 12,
                marginRight: 16,
              }}
            >
              <IconComponent name={icon as any} size={24} color={color} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', flex: 1 }}>
              {title}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={color} />
          </View>
          <Text style={{ color: '#6B7280', lineHeight: 22, fontSize: 15 }}>
            {description}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const StatCard = ({ 
    label, 
    value, 
    trend, 
    icon, 
    color = '#d946ef' 
  }: { 
    label: string; 
    value: string; 
    trend?: string; 
    icon: string;
    color?: string;
  }) => {
    const statAnim = useSharedValue(0);

    useEffect(() => {
      const timer = setTimeout(() => {
        statAnim.value = withSpring(1, { damping: 15 });
      }, 300);
      return () => clearTimeout(timer);
    }, []);

    const statAnimatedStyle = useAnimatedStyle(() => ({
      opacity: statAnim.value,
      transform: [
        { scale: interpolate(statAnim.value, [0, 1], [0.8, 1], Extrapolate.CLAMP) },
        { translateY: interpolate(statAnim.value, [0, 1], [20, 0], Extrapolate.CLAMP) }
      ],
    }));

    return (
      <Animated.View
        style={[
          {
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 20,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
            flex: 1,
            marginHorizontal: 6,
            borderTopWidth: 3,
            borderTopColor: color,
            ...(Platform.OS === 'web' && {
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
            })
          },
          statAnimatedStyle
        ]}
      >
        <View 
          style={{
            backgroundColor: color + '20',
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: color, marginBottom: 4 }}>
          {value}
        </Text>
        <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 4, fontWeight: '600' }}>
          {label}
        </Text>
        {trend && (
          <Text style={{ fontSize: 12, color: '#10B981', fontWeight: '600' }}>
            {trend}
          </Text>
        )}
      </Animated.View>
    );
  };

  return (
    <>
      <Head>
        <title>Account - Progress UK</title>
        <meta name="description" content="Manage your Progress UK account, update your profile, and access member resources" />
      </Head>
      {/* Show loading screen while auth is being determined */}
      {isLoading ? (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: '#f8fafc' 
        }}>
          <Text style={{ fontSize: 18, color: '#6B7280' }}>Loading...</Text>
        </View>
      ) : /* Show loading screen if not authenticated (while redirect is happening) */
      (!isAuthenticated || !user) ? (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: '#f8fafc' 
        }}>
          <Text style={{ fontSize: 18, color: '#6B7280' }}>Loading...</Text>
        </View>
      ) : (
        <>
          <Stack.Screen options={{ headerShown: false }} />
          <StatusBar style="light" />
          <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {/* Hero Section */}
              <View 
                style={{ 
                  backgroundColor: '#1e293b',
                  paddingVertical: 60,
                  paddingHorizontal: 20,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Animated background elements */}
                <View 
                  style={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    backgroundColor: 'rgba(217, 70, 239, 0.1)',
                    borderRadius: 100,
                  }}
                />
                <View 
                  style={{
                    position: 'absolute',
                    bottom: -30,
                    left: -30,
                    width: 150,
                    height: 150,
                    backgroundColor: 'rgba(217, 70, 239, 0.08)',
                    borderRadius: 75,
                  }}
                />

                <Animated.View style={[fadeInStyle, { alignItems: 'center', maxWidth: 800, alignSelf: 'center' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <Ionicons name="person-circle" size={28} color="#ffffff" style={{ marginRight: 12 }} />
                    <Text 
                      style={{ 
                        fontSize: 16,
                        fontWeight: '600',
                        color: '#f0f9ff',
                        letterSpacing: 1,
                        textTransform: 'uppercase'
                      }}
                    >
                      Member Dashboard
                    </Text>
                  </View>
                  
                  <Text 
                    style={{ 
                      fontSize: Platform.OS === 'web' ? 36 : 28,
                      fontWeight: 'bold',
                      color: '#ffffff',
                      textAlign: 'center',
                      marginBottom: 16,
                      lineHeight: Platform.OS === 'web' ? 44 : 36,
                    }}
                  >
                    Welcome back, {user.firstName}!
                  </Text>
                  
                  <Text 
                    style={{ 
                      fontSize: 18,
                      color: '#e0f2fe',
                      textAlign: 'center',
                      marginBottom: 20,
                      lineHeight: 26
                    }}
                  >
                    Member since {new Date(user.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </Text>
                  
                  <Animated.View
                    style={[
                      scaleInStyle,
                      {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      }
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ 
                        backgroundColor: user.payments && user.payments[0]?.status === 'active' ? '#10B981' : '#F59E0B',
                        borderRadius: 6,
                        width: 12,
                        height: 12,
                        marginRight: 12
                      }} />
                      <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                        {user.payments && user.payments[0]?.status === 'active' ? 'Active Member' : 
                         user.payments && user.payments[0]?.status === 'pending' ? 'Membership Pending' : 
                         'Membership Expired'}
                      </Text>
                    </View>
                  </Animated.View>
                </Animated.View>
              </View>

              {/* Stats Section */}
              <View style={{ 
                paddingHorizontal: 20, 
                paddingVertical: 40, 
                backgroundColor: '#ffffff',
                marginTop: -20,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}>
                <View style={{ maxWidth: 1200, alignSelf: 'center', width: '100%' }}>
                  <Animated.View style={fadeInStyle}>
                    <View style={{ alignItems: 'center', marginBottom: 32 }}>
                      <MaterialIcons name="analytics" size={32} color="#d946ef" style={{ marginBottom: 12 }} />
                      <Text 
                        style={{ 
                          fontSize: 24,
                          fontWeight: 'bold',
                          color: '#111827',
                          marginBottom: 8
                        }}
                      >
                        Your Impact
                      </Text>
                      <Text 
                        style={{ 
                          fontSize: 16, 
                          color: '#6B7280', 
                          textAlign: 'center',
                          maxWidth: 400
                        }}
                      >
                        Track your engagement and contributions to our movement
                      </Text>
                    </View>
                  </Animated.View>
                  
                  <View style={{ 
                    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
                    gap: 12
                  }}>
                    <StatCard 
                      label="Events Participated" 
                      value={loadingStats ? "..." : userStats?.eventsParticipated.toString() || "0"} 
                      trend={loadingStats ? "" : userStats?.thisMonth.eventsParticipated ? `+${userStats.thisMonth.eventsParticipated} this month` : "No events this month"} 
                      icon="calendar" 
                      color="#8b5cf6" 
                    />
                    <StatCard 
                      label="Donations Made" 
                      value={loadingStats ? "..." : userStats?.totalDonated ? `$${userStats.totalDonated}` : "$0"} 
                      trend={loadingStats ? "" : userStats?.thisMonth.donationAmount ? `$${userStats.thisMonth.donationAmount} this month` : "No donations this month"} 
                      icon="heart" 
                      color="#10b981" 
                    />
                    <StatCard 
                      label="Volunteer Hours" 
                      value={loadingStats ? "..." : userStats?.totalVolunteerHours.toString() || "0"} 
                      trend={loadingStats ? "" : userStats?.thisMonth.volunteerHours ? `+${userStats.thisMonth.volunteerHours} this month` : "No hours this month"} 
                      icon="time" 
                      color="#f59e0b" 
                    />
                  </View>
                </View>
              </View>

              {/* Quick Actions */}
              {showQuickActions && (
                <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
                  <View style={{ maxWidth: 1200, alignSelf: 'center', width: '100%' }}>
                    <Animated.View style={fadeInStyle}>
                      <View style={{ alignItems: 'center', marginBottom: 32 }}>
                        <Ionicons name="rocket" size={32} color="#d946ef" style={{ marginBottom: 12 }} />
                        <Text 
                          style={{ 
                            fontSize: 24,
                            fontWeight: 'bold',
                            color: '#111827',
                            marginBottom: 8
                          }}
                        >
                          Quick Actions
                        </Text>
                        <Text 
                          style={{ 
                            fontSize: 16, 
                            color: '#6B7280', 
                            textAlign: 'center',
                            maxWidth: 400
                          }}
                        >
                          Everything you need to stay engaged and make an impact
                        </Text>
                      </View>
                    </Animated.View>

                    <View style={{ 
                      maxWidth: 800, 
                      alignSelf: 'center',
                      width: '100%'
                    }}>
                      <QuickActionCard
                        icon="newspaper"
                        iconLibrary="Ionicons"
                        title="Latest News & Updates"
                        description="Stay informed with the latest party news, policy updates, and campaign progress"
                        onPress={() => router.replace('/newsroom')}
                        color="#8b5cf6"
                        delay={100}
                      />

                      <QuickActionCard
                        icon="heart"
                        iconLibrary="Ionicons"
                        title="Make a Donation"
                        description="Support our ongoing campaigns and initiatives with a contribution"
                        onPress={() => router.replace('/donate')}
                        color="#10b981"
                        delay={200}
                      />

                      <QuickActionCard
                        icon="ballot"
                        iconLibrary="MaterialIcons"
                        title="Upcoming Votes"
                        description="View and participate in upcoming party votes and policy decisions"
                        onPress={() => router.replace('/votes')}
                        color="#f59e0b"
                        delay={300}
                      />

                      <QuickActionCard
                        icon="calendar"
                        iconLibrary="Ionicons"
                        title="Local Events"
                        description="Find and register for political events, rallies, and meetings in your area"
                        onPress={() => router.replace('/events')}
                        color="#ef4444"
                        delay={400}
                      />

                      <QuickActionCard
                        icon="time"
                        iconLibrary="Ionicons"
                        title="Log Volunteer Hours"
                        description="Record your volunteer contributions and track your community impact"
                        onPress={() => {
                          // For now, show a coming soon alert - you can implement a modal later
                          Alert.alert(
                            'Log Volunteer Hours',
                            'This feature will allow you to log your volunteer hours. Coming soon!',
                            [{ text: 'OK' }]
                          );
                        }}
                        color="#0ea5e9"
                        delay={450}
                      />

                      <QuickActionCard
                        icon="people"
                        iconLibrary="Ionicons"
                        title="Volunteer Opportunities"
                        description="Sign up to help with campaigns, phone banking, and community outreach"
                        onPress={() => router.replace('/volunteer')}
                        color="#10b981"
                        delay={500}
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* Recent Activity */}
              <View 
                style={{ 
                  backgroundColor: '#f1f5f9',
                  paddingHorizontal: 20, 
                  paddingVertical: 40 
                }}
              >
                <View style={{ maxWidth: 1200, alignSelf: 'center', width: '100%' }}>
                  <Animated.View style={fadeInStyle}>
                    <View style={{ alignItems: 'center', marginBottom: 32 }}>
                      <MaterialIcons name="timeline" size={32} color="#d946ef" style={{ marginBottom: 12 }} />
                      <Text 
                        style={{ 
                          fontSize: 24,
                          fontWeight: 'bold',
                          color: '#111827',
                          marginBottom: 8
                        }}
                      >
                        Recent Activity
                      </Text>
                      <Text 
                        style={{ 
                          fontSize: 16, 
                          color: '#6B7280', 
                          textAlign: 'center',
                          maxWidth: 400
                        }}
                      >
                        Your latest contributions and engagement with our movement
                      </Text>
                    </View>
                  </Animated.View>

                  <View style={{ maxWidth: 600, alignSelf: 'center', width: '100%' }}>
                    {loadingActivity ? (
                      <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                        <Text style={{ fontSize: 16, color: '#6B7280' }}>Loading activity...</Text>
                      </View>
                    ) : userActivity.length === 0 ? (
                      <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                        <View 
                          style={{
                            backgroundColor: '#f1f5f9',
                            borderRadius: 20,
                            padding: 20,
                            marginBottom: 16,
                          }}
                        >
                          <Ionicons name="time" size={48} color="#6B7280" />
                        </View>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 8 }}>
                          No Recent Activity
                        </Text>
                        <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>
                          Start participating in events, volunteering, or making donations to see your activity here
                        </Text>
                      </View>
                    ) : (
                      userActivity.map((activity, index) => (
                        <Animated.View 
                          key={index}
                          style={[
                            {
                              backgroundColor: '#ffffff',
                              borderRadius: 12,
                              padding: 20,
                              marginBottom: 12,
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.05,
                              shadowRadius: 8,
                              elevation: 4,
                              borderLeftWidth: 4,
                              borderLeftColor: activity.color,
                              ...(Platform.OS === 'web' && {
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                              })
                            }
                          ]}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View 
                              style={{
                                backgroundColor: activity.color + '20',
                                borderRadius: 10,
                                padding: 10,
                                marginRight: 16,
                              }}
                            >
                              <Ionicons name={activity.icon as any} size={20} color={activity.color} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{ 
                                fontSize: 16, 
                                fontWeight: '600', 
                                color: '#111827', 
                                marginBottom: 4 
                              }}>
                                {activity.title}
                              </Text>
                              <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>
                                {activity.description}
                              </Text>
                              <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
                                {new Date(activity.date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </Text>
                            </View>
                            <View 
                              style={{ 
                                width: 8, 
                                height: 8, 
                                backgroundColor: activity.color, 
                                borderRadius: 4 
                              }} 
                            />
                          </View>
                        </Animated.View>
                      ))
                    )}
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </>
      )}
    </>
  );
}
