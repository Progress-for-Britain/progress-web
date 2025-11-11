import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Head from 'expo-router/head';
import { useAuth } from '../util/auth-context';
import { useTheme } from '../util/theme-context';
import { getCommonStyles } from '../util/commonStyles';
import { useResponsive } from '../util/useResponsive';
import api from '../util/api';
import { UserActivity, UserStats } from '../util/types';
import { SpaceSpinner } from '../components/spaceSpinner';

export default function Account() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const styles = getCommonStyles(isDark, isMobile, width);
  const router = useRouter();

  // API data state
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);

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
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading]);

  const QuickActionLink = ({
    title,
    onPress,
  }: {
    title: string;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }: { pressed: boolean }) => [
        styles.homeCta,
        pressed && { transform: [{ translateY: 1 }] },
        { marginBottom: 12 }
      ]}
    >
      <Text style={styles.homeCtaText}>{title}</Text>
      <Text style={styles.homeCtaArrow}>→</Text>
    </Pressable>
  );

  return (
    <>
      <Head>
        <title>Account - Progress UK</title>
        <meta name="description" content="Manage your Progress UK account, update your profile, and access member resources" />
      </Head>

      {/* Show loading screen while auth is being determined */}
      {isLoading ? (
        <View style={[styles.homePage, { justifyContent: 'center', alignItems: 'center' }]}>
          <SpaceSpinner isDark={isDark} />
        </View> 
      ) : /* Show loading screen if not authenticated (while redirect is happening) */
      (!isAuthenticated || !user) ? (
        <View style={[styles.homePage, { justifyContent: 'center', alignItems: 'center' }]}>
          <SpaceSpinner isDark={isDark} />
        </View>
      ) : (

        <View style={styles.homePage}>
          <>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />

            {/* PAGE */}
            <View style={styles.homePage}>
              {/* CONTENT CANVAS */}
              <ScrollView
                contentContainerStyle={styles.homeCanvas}
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
              >
                {/* HERO SECTION */}
                <View style={styles.homeHeroRow}>
                  {/* Left side - Welcome content */}
                  <View style={styles.homeTextSection}>
                    <View style={styles.homeTextContent}>
                      <Text style={styles.homeWelcomeTitle}>Welcome back, {user.firstName}</Text>
                      <Text style={styles.homeSubtitle}>
                        Member since {new Date(user.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </Text>

                      <Text style={styles.homeDescription}>
                        Your membership status: {
                          user.payments && user.payments[0]?.status === 'active' ? 'Active Member' :
                          user.payments && user.payments[0]?.status === 'pending' ? 'Membership Pending' :
                          (user.role === 'VOLUNTEER' || user.roles?.includes('VOLUNTEER')) ? 'Volunteer' :
                          'Membership Expired'
                        }
                      </Text>

                      <View style={styles.homeSeparator} />

                      <Text style={styles.homeDescription}>
                        Here's your activity overview and quick actions to stay engaged.
                      </Text>
                    </View>
                  </View>

                  {/* Right side - Stats */}
                  <View style={styles.homeImageSection}>
                    <View style={styles.homeTextContent}>
                      <Text style={styles.homeWelcomeTitle}>Your Impact</Text>

                      <View style={styles.homeSeparator} />

                      <Text style={styles.homeDescription}>
                        Events participated: {loadingStats ? "..." : userStats?.eventsParticipated || "0"}
                      </Text>

                      <Text style={styles.homeDescription}>
                        Total donations: {loadingStats ? "..." : userStats?.totalDonated ? `$${userStats.totalDonated}` : "$0"}
                      </Text>

                      <Text style={styles.homeDescription}>
                        Volunteer hours: {loadingStats ? "..." : userStats?.totalVolunteerHours || "0"}
                      </Text>

                      <View style={styles.homeSeparator} />

                      <Text style={styles.homeClosingText}>
                        This month: {loadingStats ? "..." : `${userStats?.thisMonth.eventsParticipated || 0} events, $${userStats?.thisMonth.donationAmount || 0} donated, ${userStats?.thisMonth.volunteerHours || 0} hours`}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* QUICK ACTIONS */}
                <View style={styles.homeHeroRow}>
                  <View style={styles.homeTextSection}>
                    <View style={styles.homeTextContent}>
                      <Text style={styles.homeWelcomeTitle}>Quick Actions</Text>

                      <View style={styles.homeSeparator} />

                      <QuickActionLink
                        title="Latest News & Updates"
                        onPress={() => router.replace('/newsroom')}
                      />

                      <QuickActionLink
                        title="Make a Donation"
                        onPress={() => router.replace('/donate')}
                      />

                      <QuickActionLink
                        title="Upcoming Votes"
                        onPress={() => router.replace('/votes')}
                      />

                      <QuickActionLink
                        title="Local Events"
                        onPress={() => router.replace('/events')}
                      />

                      <QuickActionLink
                        title="Volunteer Opportunities"
                        onPress={() => router.replace('/volunteer')}
                      />

                      <QuickActionLink
                        title="Privacy Policy"
                        onPress={() => router.replace('/privacy-policy')}
                      />

                      <QuickActionLink
                        title="Terms of Service"
                        onPress={() => router.replace('/terms-of-service')}
                      />
                    </View>
                  </View>

                  {/* RECENT ACTIVITY */}
                  <View style={styles.homeImageSection}>
                    <View style={styles.homeTextContent}>
                      <Text style={styles.homeWelcomeTitle}>Recent Activity</Text>

                      <View style={styles.homeSeparator} />

                      {loadingActivity ? (
                        <Text style={styles.homeDescription}>Loading activity...</Text>
                      ) : userActivity.length === 0 ? (
                        <Text style={styles.homeDescription}>
                          No recent activity. Start participating in events, volunteering, or making donations to see your activity here.
                        </Text>
                      ) : (
                        userActivity.map((activity, index) => (
                          <View key={index} style={{ marginBottom: 16 }}>
                            <Text style={styles.homeDescription}>
                              {activity.title} - {new Date(activity.date).toLocaleDateString('en-GB', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </Text>
                            <Text style={[styles.homeDescription, { fontSize: isMobile ? 12 : 14, color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                              {activity.description}
                            </Text>
                          </View>
                        ))
                      )}
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </>
        </View>
      )}
    </>
  );
}
