import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { getEvent, registerForEvent, unregisterFromEvent } from '../../util/api';
import { useAuth } from '../../util/auth-context';
import type { Event, EventType } from '../../util/api';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const EventTypeColors = {
  RALLY: '#FF6B6B',
  MEETING: '#4ECDC4',
  FUNDRAISER: '#45B7D1',
  CAMPAIGN: '#96CEB4',
  VOLUNTEER: '#FECA57',
  TRAINING: '#FF9FF3',
  CONFERENCE: '#95A5A6',
  SOCIAL: '#E17055',
};

const EventTypeIcons = {
  RALLY: 'megaphone-outline' as const,
  MEETING: 'people-outline' as const,
  FUNDRAISER: 'wallet-outline' as const,
  CAMPAIGN: 'flag-outline' as const,
  VOLUNTEER: 'heart-outline' as const,
  TRAINING: 'school-outline' as const,
  CONFERENCE: 'business-outline' as const,
  SOCIAL: 'happy-outline' as const,
};

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [userRegistration, setUserRegistration] = useState<any>(null);

  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const scaleAnim = useSharedValue(0.9);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 600 });
    slideAnim.value = withSpring(0, { damping: 15, stiffness: 150 });
    scaleAnim.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, []);

  const loadEvent = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const eventData = await getEvent(id);
      setEvent(eventData);
      
      // Check if user is registered
      if (user && eventData.participants) {
        const registration = eventData.participants.find(
          (p: any) => p.user.id === user.id && 
          ['REGISTERED', 'CONFIRMED'].includes(p.status)
        );
        setUserRegistration(registration);
      }
    } catch (error) {
      console.error('Error loading event:', error);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async () => {
    if (!event || !user || !isAuthenticated) return;

    try {
      setRegistering(true);
      
      if (userRegistration) {
        // Unregister
        await unregisterFromEvent(event.id);
        setUserRegistration(null);
        Alert.alert('Success', 'You have been unregistered from this event');
      } else {
        // Register
        await registerForEvent(event.id);
        const newRegistration = {
          id: 'temp',
          user: {
            id: user.id,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
          },
          status: 'REGISTERED' as const,
        };
        setUserRegistration(newRegistration);
        Alert.alert('Success', 'You have been registered for this event!');
      }
      
      // Reload event to get updated participant count
      await loadEvent();
    } catch (error) {
      console.error('Error with registration:', error);
      Alert.alert('Error', 'Failed to update registration');
    } finally {
      setRegistering(false);
    }
  };

  const handleShare = async () => {
    if (!event) return;

    try {
      await Share.share({
        message: `Check out this event: ${event.title}\n\n${event.description}\n\nDate: ${formatDate(event.startDate)}\nLocation: ${event.location}`,
        title: event.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const openLocation = () => {
    if (!event?.location) return;

    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(event.location)}`,
      android: `geo:0,0?q=${encodeURIComponent(event.location)}`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isEventPast = () => {
    if (!event) return false;
    return new Date(event.startDate) < new Date();
  };

  const getUserDisplayName = (participant: any) => {
    const { firstName, lastName } = participant.user;
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return firstName || lastName || 'Anonymous';
  };

  const getUserInitial = (participant: any) => {
    const { firstName, lastName } = participant.user;
    if (firstName) return firstName.charAt(0).toUpperCase();
    if (lastName) return lastName.charAt(0).toUpperCase();
    return 'A';
  };

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [
        { translateY: slideAnim.value },
        { scale: scaleAnim.value },
      ],
    };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scaleAnim.value,
      [0.9, 1],
      [0.8, 1],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ scale }],
    };
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.replace('/events')}
          >
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </Pressable>
          <Text style={styles.pageTitle}>Event Details</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.loadingSpinner, animatedContainerStyle]}>
            <Ionicons name="time-outline" size={48} color="#666" />
            <Text style={styles.loadingText}>Loading event details...</Text>
          </Animated.View>
        </View>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </Pressable>
          <Text style={styles.pageTitle}>Event Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>Event not found</Text>
          <Pressable
            style={styles.backButtonSecondary}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const eventColor = EventTypeColors[event.eventType as keyof typeof EventTypeColors] || '#95A5A6';
  const eventIcon = EventTypeIcons[event.eventType as keyof typeof EventTypeIcons] || 'calendar-outline';

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </Pressable>
        <Text style={styles.pageTitle}>Event Details</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, animatedContainerStyle]}>
          {/* Event Header */}
          <View style={[styles.eventHeader, { backgroundColor: eventColor }]}>
            <View style={styles.eventTypeContainer}>
              <Ionicons name={eventIcon} size={24} color="white" />
              <Text style={styles.eventType}>{event.eventType.replace('_', ' ')}</Text>
            </View>
            
            <Pressable 
              style={styles.shareButton}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={24} color="white" />
            </Pressable>
          </View>

          {/* Event Title and Description */}
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDescription}>{event.description}</Text>
          </View>

          {/* Event Details */}
          <View style={styles.detailsContainer}>
            {/* Date and Time */}
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="calendar-outline" size={24} color={eventColor} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>{formatDate(event.startDate)}</Text>
              </View>
            </View>

            {/* Location */}
            <Pressable style={styles.detailItem} onPress={openLocation}>
              <View style={styles.detailIcon}>
                <Ionicons name="location-outline" size={24} color={eventColor} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={[styles.detailValue, styles.locationText]}>
                  {event.location || 'TBD'}
                </Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color="#666" />
            </Pressable>

            {/* Capacity */}
            {event.capacity && (
              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="people-outline" size={24} color={eventColor} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Capacity</Text>
                  <Text style={styles.detailValue}>
                    {event.participants?.length || 0} / {event.capacity} registered
                  </Text>
                </View>
              </View>
            )}

            {/* Status */}
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons 
                  name={isEventPast() ? "checkmark-circle-outline" : "time-outline"} 
                  size={24} 
                  color={isEventPast() ? "#666" : eventColor} 
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={[
                  styles.detailValue,
                  { color: isEventPast() ? "#666" : eventColor }
                ]}>
                  {isEventPast() ? "Past Event" : "Upcoming"}
                </Text>
              </View>
            </View>
          </View>

          {/* Registration Status */}
          {userRegistration && (
            <View style={[styles.registrationStatus, { borderColor: eventColor }]}>
              <Ionicons name="checkmark-circle" size={24} color={eventColor} />
              <Text style={[styles.registrationText, { color: eventColor }]}>
                You are registered for this event
              </Text>
            </View>
          )}

          {/* Participants Preview */}
          {event.participants && event.participants.length > 0 && (
            <View style={styles.participantsContainer}>
              <Text style={styles.participantsTitle}>
                Participants ({event.participants.length})
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.participantsList}
              >
                {event.participants.slice(0, 10).map((participant, index) => (
                  <View key={participant.id} style={styles.participantItem}>
                    <View style={[styles.participantAvatar, { backgroundColor: eventColor }]}>
                      <Text style={styles.participantInitial}>
                        {getUserInitial(participant)}
                      </Text>
                    </View>
                    <Text style={styles.participantName} numberOfLines={1}>
                      {getUserDisplayName(participant)}
                    </Text>
                  </View>
                ))}
                {event.participants.length > 10 && (
                  <View style={styles.participantItem}>
                    <View style={[styles.participantAvatar, { backgroundColor: "#DDD" }]}>
                      <Text style={styles.participantInitial}>
                        +{event.participants.length - 10}
                      </Text>
                    </View>
                    <Text style={styles.participantName}>More</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Action Button */}
      {!isEventPast() && isAuthenticated && (
        <Animated.View style={[styles.actionContainer, animatedButtonStyle]}>
          <AnimatedPressable
            style={[
              styles.actionButton,
              {
                backgroundColor: userRegistration ? "#FF6B6B" : eventColor,
                opacity: registering ? 0.7 : 1,
              }
            ]}
            onPress={handleRegistration}
            disabled={registering}
          >
            <Ionicons 
              name={userRegistration ? "close-outline" : "add-outline"} 
              size={24} 
              color="white" 
            />
            <Text style={styles.actionButtonText}>
              {registering 
                ? "Processing..." 
                : userRegistration 
                ? "Unregister" 
                : "Register for Event"
              }
            </Text>
          </AnimatedPressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingSpinner: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#FF6B6B',
    textAlign: 'center',
    fontWeight: '600',
  },
  backButtonSecondary: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  eventTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventType: {
    marginLeft: 8,
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  shareButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  eventInfo: {
    padding: 20,
    backgroundColor: 'white',
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  eventDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  detailsContainer: {
    backgroundColor: 'white',
    marginTop: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailIcon: {
    width: 40,
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
    marginLeft: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  locationText: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  registrationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 4,
  },
  registrationText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  participantsContainer: {
    backgroundColor: 'white',
    marginTop: 12,
    padding: 20,
  },
  participantsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  participantsList: {
    flexDirection: 'row',
  },
  participantItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 60,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  participantInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  participantName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    marginLeft: 8,
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
