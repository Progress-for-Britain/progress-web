import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring
} from 'react-native-reanimated';
import { useAuth } from '../../util/auth-context';
import { api } from '../../util/api';
import { Post } from '../../util/types';

export default function ArticlePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading]);

  // Load the post
  useEffect(() => {
    if (isAuthenticated && id) {
      loadPost();
    }
  }, [isAuthenticated, id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const postData = await api.getPostById(id!);
      setPost(postData);
    } catch (error) {
      console.error('Error loading post:', error);
      setError('Failed to load article. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!post) return;
    
    try {
      await api.toggleReaction(post.id, emoji);
      // Reload the post to get updated reaction counts
      loadPost();
    } catch (error) {
      console.error('Error toggling reaction:', error);
      Alert.alert('Error', 'Failed to add reaction. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading || loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar style="light" />
        <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center', 
            paddingHorizontal: 20 
          }}>
            <Text style={{ fontSize: 18, color: '#6B7280' }}>Loading article...</Text>
          </View>
        </View>
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar style="light" />
        <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center', 
            paddingHorizontal: 20 
          }}>
            <View 
              style={{
                backgroundColor: '#fef2f2',
                borderRadius: 20,
                padding: 20,
                marginBottom: 16,
              }}
            >
              <Ionicons name="alert-circle" size={48} color="#ef4444" />
            </View>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: 'bold', 
              color: '#111827', 
              textAlign: 'center', 
              marginBottom: 8 
            }}>
              Article not found
            </Text>
            <Text style={{ 
              fontSize: 16, 
              color: '#6B7280', 
              textAlign: 'center', 
              marginBottom: 24,
              lineHeight: 24 
            }}>
              {error || 'The article you\'re looking for doesn\'t exist or has been removed.'}
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                backgroundColor: '#d946ef',
                borderRadius: 12,
                paddingHorizontal: 24,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Header with back button */}
          <View style={{
            backgroundColor: '#ffffff',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 8,
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#6B7280" style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16, color: '#6B7280', fontWeight: '500' }}>
                Back to News
              </Text>
            </TouchableOpacity>
          </View>

          {/* Article Content */}
          <Animated.View style={[{ paddingHorizontal: 20, paddingVertical: 32 }, fadeInStyle]}>
            <View style={{ maxWidth: 800, alignSelf: 'center', width: '100%' }}>
              {/* Featured badge */}
              {post.featured && (
                <View 
                  style={{ 
                    backgroundColor: '#fdf4ff',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    alignSelf: 'flex-start',
                    marginBottom: 16,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                >
                  <MaterialIcons name="star" size={16} color="#d946ef" style={{ marginRight: 4 }} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#d946ef', letterSpacing: 0.5 }}>
                    FEATURED ARTICLE
                  </Text>
                </View>
              )}

              {/* Title */}
              <Text 
                style={{ 
                  fontSize: Platform.OS === 'web' ? 40 : 32,
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: 20,
                  lineHeight: Platform.OS === 'web' ? 48 : 40,
                }}
              >
                {post.title}
              </Text>

              {/* Excerpt */}
              {post.excerpt && (
                <Text 
                  style={{ 
                    fontSize: 20,
                    color: '#6B7280',
                    lineHeight: 30,
                    marginBottom: 24,
                    fontStyle: 'italic'
                  }}
                >
                  {post.excerpt}
                </Text>
              )}

              {/* Meta information */}
              <View style={{ 
                flexDirection: 'column',
                marginBottom: 32,
                paddingVertical: 20,
                borderTopWidth: 1,
                borderBottomWidth: 1,
                borderColor: '#e5e7eb',
                gap: 12
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="person" size={16} color="#6B7280" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 14, color: '#6B7280' }}>
                      By {post.author.firstName} {post.author.lastName}
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="calendar" size={16} color="#6B7280" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 14, color: '#6B7280' }}>
                      {formatDate(post.publishedAt || post.createdAt)}
                    </Text>
                  </View>
                  
                  {post.readTime && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="time" size={16} color="#6B7280" style={{ marginRight: 6 }} />
                      <Text style={{ fontSize: 14, color: '#6B7280' }}>
                        {post.readTime} min read
                      </Text>
                    </View>
                  )}
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View 
                    style={{ 
                      backgroundColor: '#f8fafc',
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderWidth: 1,
                      borderColor: '#e2e8f0'
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                      {post.category}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Article Content */}
              <View style={{ marginBottom: 40 }}>
                <Text 
                  style={{ 
                    fontSize: 18,
                    color: '#374151',
                    lineHeight: 32,
                    letterSpacing: 0.3
                  }}
                >
                  {post.content}
                </Text>
              </View>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <View style={{ marginBottom: 32 }}>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: '#111827', 
                    marginBottom: 12 
                  }}>
                    Tags
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {post.tags.map((tag, index) => (
                      <View
                        key={index}
                        style={{
                          backgroundColor: '#f1f5f9',
                          borderRadius: 16,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                        }}
                      >
                        <Text style={{ fontSize: 14, color: '#64748b', fontWeight: '500' }}>
                          #{tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Reactions */}
              <View style={{ 
                backgroundColor: '#ffffff',
                borderRadius: 16,
                padding: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
                marginBottom: 32,
              }}>
                <Text style={{ 
                  fontSize: 18, 
                  fontWeight: '600', 
                  color: '#111827', 
                  marginBottom: 16 
                }}>
                  Reactions ({post._count.reactions})
                </Text>
                
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['👍', '❤️', '🎉', '👏'].map((emoji) => {
                    const count = post.reactionCounts[emoji] || 0;
                    return (
                      <TouchableOpacity
                        key={emoji}
                        onPress={() => handleReaction(emoji)}
                        style={{
                          backgroundColor: count > 0 ? '#f0f9ff' : '#f8fafc',
                          borderRadius: 20,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderWidth: 1,
                          borderColor: count > 0 ? '#0ea5e9' : '#e2e8f0',
                          flexDirection: 'row',
                          alignItems: 'center',
                          minWidth: 50,
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 16, marginRight: count > 0 ? 4 : 0 }}>{emoji}</Text>
                        {count > 0 && (
                          <Text style={{ 
                            fontSize: 12, 
                            fontWeight: '600', 
                            color: '#0ea5e9' 
                          }}>
                            {count}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </>
  );
}
