import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, ScrollView, Alert, TextInput, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring
} from 'react-native-reanimated';
import Head from 'expo-router/head';
import { useAuth } from '../util/auth-context';
import api, { Event } from '../util/api';
import { CreateEventModal } from '../components/createEventModal';
import { EditEventModal } from '../components/editEventModal';

export default function Events() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [registering, setRegistering] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('UPCOMING');

  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);

  useEffect(() => {
    // Animate elements on mount
    fadeAnim.value = withTiming(1, { duration: 1000 });
    slideAnim.value = withSpring(0, { damping: 15 });
  }, []);

  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  // Redirect if not authenticated (but wait for loading to complete)
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading]);

  // Load events
  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
    }
  }, [isAuthenticated, selectedEventType, searchQuery, selectedStatus]);

  const loadEvents = async (resetPage = true) => {
    try {
      setLoading(true);
      const currentPage = resetPage ? 1 : page;
      
      const response = await api.getAllEvents({
        page: currentPage,
        limit: 10,
        eventType: selectedEventType === 'all' ? undefined : selectedEventType,
        search: searchQuery || undefined,
        status: selectedStatus
      });

      if (resetPage) {
        setEvents(response.events);
        setPage(1);
      } else {
        setEvents(prev => [...prev, ...response.events]);
      }
      
      setHasMore(currentPage < response.pagination.totalPages);
      if (!resetPage) {
        setPage(currentPage + 1);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert('Error', 'Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEventRegistration = async (eventId: string) => {
    if (!user) return;
    
    try {
      setRegistering(eventId);
      await api.registerForEvent(eventId);
      Alert.alert('Success', 'Successfully registered for event!');
      
      // Update the event in the list to reflect registration
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { 
                ...event, 
                participants: [
                  ...(event.participants || []),
                  {
                    id: 'temp-' + Date.now(), // Temporary ID
                    status: 'REGISTERED' as const,
                    notes: null,
                    registeredAt: new Date().toISOString(),
                    checkedInAt: null,
                    userId: user.id,
                    eventId: eventId,
                    user: {
                      id: user.id,
                      firstName: user.firstName,
                      lastName: user.lastName,
                      email: user.email
                    }
                  }
                ],
                _count: {
                  ...event._count,
                  participants: (event._count?.participants || 0) + 1
                }
              }
            : event
        )
      );
    } catch (error: any) {
      console.error('Error registering for event:', error);
      Alert.alert('Error', error.message || 'Failed to register for event. Please try again.');
    } finally {
      setRegistering(null);
    }
  };

  const handleEventUnregistration = async (eventId: string) => {
    if (!user) return;
    
    try {
      setRegistering(eventId);
      await api.cancelEventRegistration(eventId);
      Alert.alert('Success', 'Successfully unregistered from event!');
      
      // Update the event in the list to remove registration
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { 
                ...event, 
                participants: (event.participants || []).filter(p => p.user.id !== user.id),
                _count: {
                  ...event._count,
                  participants: Math.max(0, (event._count?.participants || 1) - 1)
                }
              }
            : event
        )
      );
    } catch (error: any) {
      console.error('Error unregistering from event:', error);
      Alert.alert('Error', error.message || 'Failed to unregister from event. Please try again.');
    } finally {
      setRegistering(null);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEditModal(true);
  };

  const handleEventUpdated = () => {
    loadEvents(); // Reload events after update
  };

  const handleAddToCalendar = () => {
    if (!user) return;
    // Use webcal for iCal subscription
    const baseApiUrl = `api/events/ical/${user.id}`;
    //backend url
    const apiBaseUrl = process.env.EXPO_PUBLIC_BACKEND_API_URL || 'http://localhost:3005';
    const webcalBaseUrl = apiBaseUrl.replace(/^https?:\/\//, 'webcal://');
    const webcalUrl = `${webcalBaseUrl}${baseApiUrl}`;
    Linking.openURL(webcalUrl);
  };

  const canCreateEvent = user?.role === 'ADMIN' || user?.role === 'WRITER';

  const eventTypes = [
    { id: 'all', label: 'All Events', icon: 'calendar' },
    { id: 'RALLY', label: 'Rallies', icon: 'megaphone' },
    { id: 'MEETING', label: 'Meetings', icon: 'people' },
    { id: 'FUNDRAISER', label: 'Fundraisers', icon: 'heart' },
    { id: 'CAMPAIGN', label: 'Campaigns', icon: 'flag' },
    { id: 'VOLUNTEER', label: 'Volunteer', icon: 'hand-left' },
    { id: 'TRAINING', label: 'Training', icon: 'school' },
    { id: 'CONFERENCE', label: 'Conferences', icon: 'business' },
    { id: 'SOCIAL', label: 'Social', icon: 'happy' }
  ];

  const EventTypeButton = ({ eventType }: { eventType: typeof eventTypes[0] }) => {
    const buttonAnim = useSharedValue(1);
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: buttonAnim.value }],
    }));

    const handlePressIn = () => {
      buttonAnim.value = withSpring(0.95);
    };

    const handlePressOut = () => {
      buttonAnim.value = withSpring(1);
    };

    return (
      <TouchableOpacity
        onPress={() => setSelectedEventType(eventType.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: selectedEventType === eventType.id ? '#d946ef' : '#ffffff',
          borderWidth: 2,
          borderColor: selectedEventType === eventType.id ? '#d946ef' : '#e5e7eb',
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          marginRight: 12,
          marginBottom: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 4,
          flexDirection: 'row',
          alignItems: 'center',
          ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
        }}
      >
        <Animated.View style={[animatedStyle, { flexDirection: 'row', alignItems: 'center' }]}>
          <Ionicons 
            name={eventType.icon as any} 
            size={16} 
            color={selectedEventType === eventType.id ? '#ffffff' : '#6b7280'} 
            style={{ marginRight: 6 }}
          />
          <Text 
            style={{ 
              fontSize: 14,
              fontWeight: '600',
              color: selectedEventType === eventType.id ? '#ffffff' : '#374151'
            }}
          >
            {eventType.label}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const EventCard = ({ event }: { event: Event }) => {
    const cardAnim = useSharedValue(1);
    const scaleAnim = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: cardAnim.value,
      transform: [{ scale: scaleAnim.value }],
    }));

    const handlePressIn = () => {
      scaleAnim.value = withSpring(0.98);
    };

    const handlePressOut = () => {
      scaleAnim.value = withSpring(1);
    };

    const getEventTypeColor = (type: string) => {
      const colors: { [key: string]: string } = {
        'RALLY': '#ef4444',
        'MEETING': '#3b82f6',
        'FUNDRAISER': '#10b981',
        'CAMPAIGN': '#f59e0b',
        'VOLUNTEER': '#8b5cf6',
        'TRAINING': '#06b6d4',
        'CONFERENCE': '#6366f1',
        'SOCIAL': '#ec4899'
      };
      return colors[type] || '#6b7280';
    };

    // Check if current user is registered for this event
    const isRegistered = user && event.participants?.some(
      participant => participant.user.id === user.id && 
      ['REGISTERED', 'CONFIRMED'].includes(participant.status)
    );
    const isFull = event.capacity && event._count && event._count.participants >= event.capacity;
    const isPast = new Date(event.endDate) < new Date();
    
    // Check if user participated in past event
    const userParticipated = user && event.participants?.some(
      participant => participant.user.id === user.id && 
      participant.status !== 'CANCELLED'
    );

    return (
      <TouchableOpacity
        onPress={() => {
          router.push(`/events/${event.id}`);
        }}
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
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 8,
              borderLeftWidth: 5,
              borderLeftColor: getEventTypeColor(event.eventType),
              ...(Platform.OS === 'web' && {
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
              })
            },
            animatedStyle
          ]}
        >
          {/* Event Type Badge */}
          <View 
            style={{ 
              backgroundColor: getEventTypeColor(event.eventType) + '20',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 6,
              alignSelf: 'flex-start',
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Ionicons 
              name={eventTypes.find(t => t.id === event.eventType)?.icon as any || 'calendar'} 
              size={14} 
              color={getEventTypeColor(event.eventType)} 
              style={{ marginRight: 4 }}
            />
            <Text style={{ 
              fontSize: 12, 
              fontWeight: '700', 
              color: getEventTypeColor(event.eventType), 
              letterSpacing: 0.5,
              textTransform: 'uppercase'
            }}>
              {event.eventType}
            </Text>
          </View>
          
          <Text 
            style={{ 
              fontSize: 20,
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: 12,
              lineHeight: 28
            }}
          >
            {event.title}
          </Text>
          
          <Text 
            style={{ 
              fontSize: 15,
              color: '#6B7280',
              lineHeight: 22,
              marginBottom: 16
            }}
          >
            {event.description}
          </Text>
          
          {/* Event Details */}
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="calendar-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 14, color: '#374151', fontWeight: '500' }}>
                {new Date(event.startDate).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric'
                })}
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="time-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 14, color: '#374151', fontWeight: '500' }}>
                {new Date(event.startDate).toLocaleTimeString('en-US', { 
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })} - {new Date(event.endDate).toLocaleTimeString('en-US', { 
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </Text>
            </View>

            {event.location && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons 
                  name={event.isVirtual ? "videocam-outline" : "location-outline"} 
                  size={16} 
                  color="#9CA3AF" 
                  style={{ marginRight: 8 }} 
                />
                <Text style={{ fontSize: 14, color: '#374151', fontWeight: '500', flex: 1 }}>
                  {event.location}
                </Text>
              </View>
            )}

            {event.capacity && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="people-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 14, color: '#374151', fontWeight: '500' }}>
                  {event._count?.participants || 0} / {event.capacity} participants
                </Text>
              </View>
            )}
          </View>
          
          {/* Registration Status & Button */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: '#f1f5f9'
          }}>
            <View style={{ flex: 1 }}>
              {isPast ? (
                userParticipated ? (
                  <View style={{ 
                    backgroundColor: '#059669', 
                    borderRadius: 8, 
                    paddingHorizontal: 12, 
                    paddingVertical: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'flex-start'
                  }}>
                    <Ionicons name="checkmark-circle" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>
                      You Attended
                    </Text>
                  </View>
                ) : (
                  <View style={{ 
                    backgroundColor: '#6b7280', 
                    borderRadius: 8, 
                    paddingHorizontal: 12, 
                    paddingVertical: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'flex-start'
                  }}>
                    <Ionicons name="time-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>
                      Event Completed
                    </Text>
                  </View>
                )
              ) : isFull && !isRegistered ? (
                <View style={{ 
                  backgroundColor: '#ef4444', 
                  borderRadius: 8, 
                  paddingHorizontal: 12, 
                  paddingVertical: 6,
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'flex-start'
                }}>
                  <Ionicons name="close-circle" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>
                    Full
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    if (isRegistered) {
                      handleEventUnregistration(event.id);
                    } else {
                      handleEventRegistration(event.id);
                    }
                  }}
                  disabled={registering === event.id}
                  style={{
                    backgroundColor: registering === event.id ? '#9ca3af' : isRegistered ? '#ef4444' : '#d946ef',
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'flex-start'
                  }}
                >
                  {registering === event.id ? (
                    <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>
                      {isRegistered ? 'Leaving...' : 'Registering...'}
                    </Text>
                  ) : (
                    <>
                      <Ionicons 
                        name={isRegistered ? "close" : "add"} 
                        size={16} 
                        color="#ffffff" 
                        style={{ marginRight: 6 }} 
                      />
                      <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>
                        {isRegistered ? 'Leave Event' : 'Join Event'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
            
            {/* Admin Edit Button */}
            {canCreateEvent && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleEditEvent(event);
                }}
                style={{
                  backgroundColor: '#6366f1',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  marginLeft: 8,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <Ionicons name="create-outline" size={16} color="#ffffff" style={{ marginRight: 4 }} />
                <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>
                  Edit
                </Text>
              </TouchableOpacity>
            )}
            
            <Text style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 12 }}>
              by {event.createdBy.firstName} {event.createdBy.lastName}
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Head>
        <title>Events - Progress UK</title>
        <meta name="description" content="Discover Progress UK events, meetings, and activities in your area. Join us in building the future of British politics" />
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
      (!isAuthenticated) ? (
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
                  paddingVertical: 80,
                  paddingHorizontal: 20,
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Animated background elements */}
                <View 
                  style={{
                    position: 'absolute',
                    top: -100,
                    right: -100,
                    width: 300,
                    height: 300,
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: 150,
                  }}
                />
                <View 
                  style={{
                    position: 'absolute',
                    bottom: -50,
                    left: -50,
                    width: 200,
                    height: 200,
                    backgroundColor: 'rgba(139, 92, 246, 0.08)',
                    borderRadius: 100,
                  }}
                />

                <Animated.View style={[fadeInStyle, { alignItems: 'center', maxWidth: 800 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <Ionicons name="calendar" size={32} color="#ffffff" style={{ marginRight: 12 }} />
                    <Text 
                      style={{ 
                        fontSize: 18,
                        fontWeight: '600',
                        color: '#f0f9ff',
                        letterSpacing: 2,
                        textTransform: 'uppercase'
                      }}
                    >
                      Upcoming Events
                    </Text>
                  </View>
                  
                  <Text 
                    style={{ 
                      fontSize: Platform.OS === 'web' ? 48 : 36,
                      fontWeight: 'bold',
                      color: '#ffffff',
                      textAlign: 'center',
                      marginBottom: 24,
                      lineHeight: Platform.OS === 'web' ? 56 : 44,
                      textShadowColor: 'rgba(0, 0, 0, 0.3)',
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 4,
                    }}
                  >
                    Join the Movement
                  </Text>
                  
                  <Text 
                    style={{ 
                      fontSize: 20,
                      color: '#e0f2fe',
                      textAlign: 'center',
                      marginBottom: 40,
                      lineHeight: 30,
                      maxWidth: 600,
                      fontWeight: '400'
                    }}
                  >
                    Participate in rallies, meetings, and campaigns. Every event is a step toward progress.
                  </Text>
                </Animated.View>
              </View>

              {/* Search and Filters */}
              <View style={{ 
                paddingHorizontal: 20, 
                paddingVertical: 40, 
                backgroundColor: '#ffffff',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 4,
              }}>
                <View style={{ maxWidth: 1200, alignSelf: 'center', width: '100%' }}>
                  {/* Create Event Button for Admins/Writers */}
                  {canCreateEvent && (
                    <TouchableOpacity
                      onPress={() => setShowCreateModal(true)}
                      style={{
                        backgroundColor: '#8b5cf6',
                        borderRadius: 16,
                        paddingHorizontal: 24,
                        paddingVertical: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 24,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 6,
                      }}
                    >
                      <Ionicons name="add" size={24} color="#ffffff" style={{ marginRight: 8 }} />
                      <Text style={{ 
                        color: '#ffffff', 
                        fontSize: 18, 
                        fontWeight: '700' 
                      }}>
                        Create New Event
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search events..."
                    style={{
                      borderWidth: 2,
                      borderColor: '#e5e7eb',
                      borderRadius: 16,
                      paddingHorizontal: 20,
                      paddingVertical: 16,
                      fontSize: 16,
                      backgroundColor: '#f9fafb',
                      marginBottom: 24,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  />
                  
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', paddingRight: 20 }}>
                      {eventTypes.map((eventType) => (
                        <EventTypeButton key={eventType.id} eventType={eventType} />
                      ))}
                    </View>
                  </ScrollView>
                  
                  {/* Status Filter Buttons */}
                  <View style={{ 
                    flexDirection: 'row', 
                    marginTop: 16, 
                    marginBottom: 8,
                    justifyContent: 'center'
                  }}>
                    <TouchableOpacity
                      onPress={() => setSelectedStatus('UPCOMING')}
                      style={{
                        backgroundColor: selectedStatus === 'UPCOMING' ? '#d946ef' : '#ffffff',
                        borderWidth: 2,
                        borderColor: selectedStatus === 'UPCOMING' ? '#d946ef' : '#e5e7eb',
                        borderRadius: 16,
                        paddingHorizontal: 24,
                        paddingVertical: 14,
                        marginRight: 16,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.12,
                        shadowRadius: 10,
                        elevation: 6,
                        flexDirection: 'row',
                        alignItems: 'center',
                        minWidth: 120,
                        justifyContent: 'center',
                        ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                      }}
                    >
                      <Ionicons 
                        name="time-outline" 
                        size={18} 
                        color={selectedStatus === 'UPCOMING' ? '#ffffff' : '#6b7280'} 
                        style={{ marginRight: 8 }}
                      />
                      <Text 
                        style={{ 
                          fontSize: 16,
                          fontWeight: '700',
                          color: selectedStatus === 'UPCOMING' ? '#ffffff' : '#374151',
                          letterSpacing: 0.5
                        }}
                      >
                        Upcoming
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => setSelectedStatus('COMPLETED')}
                      style={{
                        backgroundColor: selectedStatus === 'COMPLETED' ? '#d946ef' : '#ffffff',
                        borderWidth: 2,
                        borderColor: selectedStatus === 'COMPLETED' ? '#d946ef' : '#e5e7eb',
                        borderRadius: 16,
                        paddingHorizontal: 24,
                        paddingVertical: 14,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.12,
                        shadowRadius: 10,
                        elevation: 6,
                        flexDirection: 'row',
                        alignItems: 'center',
                        minWidth: 120,
                        justifyContent: 'center',
                        ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                      }}
                    >
                      <Ionicons 
                        name="checkmark-circle-outline" 
                        size={18} 
                        color={selectedStatus === 'COMPLETED' ? '#ffffff' : '#6b7280'} 
                        style={{ marginRight: 8 }}
                      />
                      <Text 
                        style={{ 
                          fontSize: 16,
                          fontWeight: '700',
                          color: selectedStatus === 'COMPLETED' ? '#ffffff' : '#374151',
                          letterSpacing: 0.5
                        }}
                      >
                        Past
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Events List */}
              <View style={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20 }}>
                <View style={{ maxWidth: 1200, alignSelf: 'center', width: '100%' }}>
                  {events.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                      <View 
                        style={{
                          backgroundColor: '#f1f5f9',
                          borderRadius: 20,
                          padding: 20,
                          marginBottom: 16,
                        }}
                      >
                        <Ionicons name="calendar-outline" size={48} color="#6B7280" />
                      </View>
                      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 8 }}>
                        No events found
                      </Text>
                      <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', maxWidth: 400 }}>
                        {searchQuery || selectedEventType !== 'all' 
                          ? 'Try adjusting your search or filters to find events.'
                          : 'No upcoming events at the moment. Check back soon for new opportunities to get involved!'
                        }
                      </Text>
                    </View>
                  ) : (
                    <>
                      {events.map((event, index) => (
                        <EventCard key={event.id} event={event} />
                      ))}

                      {hasMore && (
                        <TouchableOpacity
                          onPress={() => loadEvents(false)}
                          disabled={loading}
                          style={{
                            backgroundColor: loading ? '#e5e7eb' : '#f8fafc',
                            borderWidth: 2,
                            borderColor: '#e5e7eb',
                            borderRadius: 16,
                            paddingVertical: 16,
                            alignItems: 'center',
                            marginTop: 20,
                          }}
                        >
                          <Text style={{ 
                            color: loading ? '#9ca3af' : '#6b7280', 
                            fontSize: 16, 
                            fontWeight: '600' 
                          }}>
                            {loading ? 'Loading...' : 'Load More Events'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              </View>
              
              {/* Subscribe to Calendar Button at Bottom */}
              <View style={{ 
                paddingHorizontal: 20, 
                paddingVertical: 40, 
                backgroundColor: '#ffffff',
                borderTopWidth: 1,
                borderTopColor: '#f1f5f9'
              }}>
                <View style={{ maxWidth: 1200, alignSelf: 'center', width: '100%', alignItems: 'center' }}>
                  <TouchableOpacity
                    onPress={handleAddToCalendar}
                    style={{
                      backgroundColor: '#10b981',
                      borderRadius: 16,
                      paddingHorizontal: 24,
                      paddingVertical: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 12,
                      elevation: 6,
                    }}
                  >
                    <Ionicons name="calendar-outline" size={24} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={{ 
                      color: '#ffffff', 
                      fontSize: 18, 
                      fontWeight: '700' 
                    }}>
                      Subscribe to Calendar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>

          {/* Create Event Modal */}
          <CreateEventModal 
            visible={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onEventCreated={() => loadEvents()}
          />

          {/* Edit Event Modal */}
          <EditEventModal 
            visible={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditingEvent(null);
            }}
            onEventUpdated={handleEventUpdated}
            onEventDeleted={() => {
              loadEvents(); // Reload events after deletion
              setShowEditModal(false);
              setEditingEvent(null);
            }}
            event={editingEvent}
          />
        </>
      )}
    </>
  );
}