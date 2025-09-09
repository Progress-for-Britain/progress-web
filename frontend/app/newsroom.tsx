import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, ScrollView, TextInput, Alert, Modal } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
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
import { api, Post } from '../util/api';

export default function Newsroom() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  // Load posts
  useEffect(() => {
    if (isAuthenticated) {
      loadPosts();
    }
  }, [isAuthenticated, selectedCategory, searchQuery]);

  const loadPosts = async (resetPage = true) => {
    try {
      setLoading(true);
      const currentPage = resetPage ? 1 : page;
      
      const response = await api.getAllPosts({
        page: currentPage,
        limit: 10,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchQuery || undefined
      });

      if (resetPage) {
        setPosts(response.posts);
        setPage(1);
      } else {
        setPosts(prev => [...prev, ...response.posts]);
      }
      
      setHasMore(currentPage < response.pagination.totalPages);
      if (!resetPage) {
        setPage(currentPage + 1);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      Alert.alert('Error', 'Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canCreatePost =
    (user?.roles && (user.roles.includes('ADMIN') || user.roles.includes('WRITER')));

  const categories = [
    { id: 'all', label: 'All News' },
    { id: 'NEWS', label: 'News' },
    { id: 'POLICY', label: 'Policy Updates' },
    { id: 'CAMPAIGNS', label: 'Campaigns' },
    { id: 'EVENTS', label: 'Events' },
    { id: 'VICTORIES', label: 'Victories' },
    { id: 'PRESS', label: 'Press Releases' }
  ];

  const handleReaction = async (postId: string, emoji: string) => {
    try {
      await api.toggleReaction(postId, emoji);
      // Reload posts to get updated reaction counts
      loadPosts();
    } catch (error) {
      console.error('Error toggling reaction:', error);
      Alert.alert('Error', 'Failed to add reaction. Please try again.');
    }
  };

  const CategoryButton = ({ category }: { category: typeof categories[0] }) => {
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
        onPress={() => setSelectedCategory(category.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: selectedCategory === category.id ? '#d946ef' : '#ffffff',
          borderWidth: 2,
          borderColor: selectedCategory === category.id ? '#d946ef' : '#e5e7eb',
          borderRadius: 12,
          paddingHorizontal: 20,
          paddingVertical: 12,
          marginRight: 12,
          marginBottom: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 4,
          ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
        }}
      >
        <Animated.View style={animatedStyle}>
          <Text 
            style={{ 
              fontSize: 15,
              fontWeight: '600',
              color: selectedCategory === category.id ? '#ffffff' : '#374151'
            }}
          >
            {category.label}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const NewsCard = ({ article, featured = false }: { article: Post; featured?: boolean }) => {
    const cardAnim = useSharedValue(1); // Start with fully visible
    const scaleAnim = useSharedValue(1); // Start with normal scale

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: cardAnim.value,
      transform: [
        { scale: scaleAnim.value },
        { translateY: 0 } // No vertical animation to prevent re-triggering
      ],
    }));

    const buttonAnim = useSharedValue(1);

    const handlePressIn = () => {
      buttonAnim.value = withSpring(0.98);
    };

    const handlePressOut = () => {
      buttonAnim.value = withSpring(1);
    };

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: buttonAnim.value }],
    }));

    return (
      <TouchableOpacity
        onPress={() => {
          router.push(`/news/${article.id}`);
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
              borderRadius: featured ? 20 : 16,
              padding: featured ? 32 : 24,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: featured ? 8 : 4 },
              shadowOpacity: featured ? 0.15 : 0.1,
              shadowRadius: featured ? 20 : 12,
              elevation: featured ? 12 : 8,
              ...(featured && {
                borderLeftWidth: 5,
                borderLeftColor: '#d946ef'
              }),
              ...(Platform.OS === 'web' && {
                boxShadow: featured 
                  ? '0 20px 40px rgba(0, 0, 0, 0.12)' 
                  : '0 8px 20px rgba(0, 0, 0, 0.08)',
              })
            },
            animatedStyle,
            buttonAnimatedStyle
          ]}
        >
          {featured && (
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
                FEATURED
              </Text>
            </View>
          )}
          
          <Text 
            style={{ 
              fontSize: featured ? 24 : 20,
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: 12,
              lineHeight: featured ? 32 : 28
            }}
          >
            {article.title}
          </Text>
          
          <Text 
            style={{ 
              fontSize: 16,
              color: '#6B7280',
              lineHeight: 26,
              marginBottom: 16
            }}
          >
            {article.excerpt}
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={16} color="#9CA3AF" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 14, color: '#9CA3AF', marginRight: 16 }}>
                {new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </Text>
              {article.readTime && (
                <>
                  <Ionicons name="time-outline" size={16} color="#9CA3AF" style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 14, color: '#9CA3AF' }}>
                    {article.readTime} min read
                  </Text>
                </>
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
                  borderColor: '#e2e8f0',
                  marginRight: 8
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', textTransform: 'capitalize' }}>
                  {categories.find(c => c.id === article.category)?.label || article.category}
                </Text>
              </View>
              
              <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
                by {article.author.firstName} {article.author.lastName}
              </Text>
            </View>
          </View>
          
          {/* Reactions */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginTop: 16, 
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: '#f1f5f9'
          }}>
            <Text style={{ fontSize: 14, color: '#6B7280', marginRight: 12 }}>
              {article._count.reactions} reactions
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['👍', '❤️', '🎉', '👏'].map((emoji) => {
                const count = article.reactionCounts[emoji] || 0;
                return (
                  <TouchableOpacity
                    key={emoji}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleReaction(article.id, emoji);
                    }}
                    style={{
                      backgroundColor: count > 0 ? '#f0f9ff' : '#f8fafc',
                      borderRadius: 20,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderWidth: 1,
                      borderColor: count > 0 ? '#0ea5e9' : '#e2e8f0',
                      flexDirection: 'row',
                      alignItems: 'center',
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
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const CreatePostModal = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [category, setCategory] = useState('NEWS');
    const [featured, setFeatured] = useState(false);
    const [readTime, setReadTime] = useState('');
    const [creating, setCreating] = useState(false);

    const handleCreate = async () => {
      if (!title.trim() || !content.trim()) {
        Alert.alert('Error', 'Title and content are required.');
        return;
      }

      try {
        setCreating(true);
        await api.createPost({
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || undefined,
          category: category as any,
          featured,
          readTime: readTime ? parseInt(readTime) : undefined,
          status: 'PUBLISHED'
        });

        Alert.alert('Success', 'Post created successfully!');
        setShowCreateModal(false);
        
        // Reset form
        setTitle('');
        setContent('');
        setExcerpt('');
        setCategory('NEWS');
        setFeatured(false);
        setReadTime('');
        
        // Reload posts
        loadPosts();
      } catch (error) {
        console.error('Error creating post:', error);
        Alert.alert('Error', 'Failed to create post. Please try again.');
      } finally {
        setCreating(false);
      }
    };

    return (
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
          <View style={{ 
            backgroundColor: '#ffffff',
            paddingTop: Platform.OS === 'ios' ? 60 : 40,
            paddingHorizontal: 20,
            paddingBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb'
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                style={{ padding: 8 }}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
              
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>
                Create New Post
              </Text>
              
              <TouchableOpacity
                onPress={handleCreate}
                disabled={creating || !title.trim() || !content.trim()}
                style={{
                  backgroundColor: creating || !title.trim() || !content.trim() ? '#9CA3AF' : '#d946ef',
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                }}
              >
                <Text style={{ color: '#ffffff', fontWeight: '600' }}>
                  {creating ? 'Creating...' : 'Publish'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={{ flex: 1, padding: 20 }}>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                Title *
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Enter post title..."
                style={{
                  borderWidth: 2,
                  borderColor: '#e5e7eb',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  backgroundColor: '#ffffff'
                }}
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                Content *
              </Text>
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="Write your post content..."
                multiline
                numberOfLines={10}
                style={{
                  borderWidth: 2,
                  borderColor: '#e5e7eb',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  backgroundColor: '#ffffff',
                  minHeight: 200,
                  textAlignVertical: 'top'
                }}
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                Excerpt
              </Text>
              <TextInput
                value={excerpt}
                onChangeText={setExcerpt}
                placeholder="Brief summary (optional)..."
                multiline
                numberOfLines={3}
                style={{
                  borderWidth: 2,
                  borderColor: '#e5e7eb',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  backgroundColor: '#ffffff',
                  minHeight: 80,
                  textAlignVertical: 'top'
                }}
              />
            </View>

            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                  Category
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row' }}>
                    {categories.filter(cat => cat.id !== 'all').map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setCategory(cat.id)}
                        style={{
                          backgroundColor: category === cat.id ? '#d946ef' : '#ffffff',
                          borderWidth: 2,
                          borderColor: category === cat.id ? '#d946ef' : '#e5e7eb',
                          borderRadius: 8,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          marginRight: 8,
                        }}
                      >
                        <Text style={{ 
                          color: category === cat.id ? '#ffffff' : '#374151',
                          fontSize: 14,
                          fontWeight: '600'
                        }}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                  Read Time (minutes)
                </Text>
                <TextInput
                  value={readTime}
                  onChangeText={setReadTime}
                  placeholder="0"
                  keyboardType="numeric"
                  style={{
                    borderWidth: 2,
                    borderColor: '#e5e7eb',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    backgroundColor: '#ffffff'
                  }}
                />
              </View>
              
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                  Featured Post
                </Text>
                <TouchableOpacity
                  onPress={() => setFeatured(!featured)}
                  style={{
                    backgroundColor: featured ? '#d946ef' : '#ffffff',
                    borderWidth: 2,
                    borderColor: featured ? '#d946ef' : '#e5e7eb',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialIcons 
                    name={featured ? 'star' : 'star-border'} 
                    size={20} 
                    color={featured ? '#ffffff' : '#6B7280'} 
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ 
                    color: featured ? '#ffffff' : '#6B7280',
                    fontWeight: '600'
                  }}>
                    {featured ? 'Featured' : 'Normal'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <>
      <Head>
        <title>Newsroom - Progress UK</title>
        <meta name="description" content="Stay updated with Progress UK news, press releases, and latest developments in our political movement" />
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
                    backgroundColor: 'rgba(217, 70, 239, 0.1)',
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
                    backgroundColor: 'rgba(217, 70, 239, 0.08)',
                    borderRadius: 100,
                  }}
                />

                <Animated.View style={[fadeInStyle, { alignItems: 'center', maxWidth: 800 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <Ionicons name="newspaper" size={32} color="#ffffff" style={{ marginRight: 12 }} />
                    <Text 
                      style={{ 
                        fontSize: 18,
                        fontWeight: '600',
                        color: '#f0f9ff',
                        letterSpacing: 2,
                        textTransform: 'uppercase'
                      }}
                    >
                      Progress News
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
                    Progress Newsroom
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
                    Stay informed about our latest achievements, policy updates, and campaign progress
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
                  {/* Create Post Button for Writers/Admins */}
                  {canCreatePost && (
                    <TouchableOpacity
                      onPress={() => setShowCreateModal(true)}
                      style={{
                        backgroundColor: '#d946ef',
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
                        Create New Post
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search news articles..."
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
                      {categories.map((category) => (
                        <CategoryButton key={category.id} category={category} />
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>

              {/* News Articles */}
              <View style={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20 }}>
                <View style={{ maxWidth: 1200, alignSelf: 'center', width: '100%' }}>
                  {posts.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                      <View 
                        style={{
                          backgroundColor: '#f1f5f9',
                          borderRadius: 20,
                          padding: 20,
                          marginBottom: 16,
                        }}
                      >
                        <Ionicons name="search" size={48} color="#6B7280" />
                      </View>
                      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 8 }}>
                        No articles found
                      </Text>
                      <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', maxWidth: 400, lineHeight: 24 }}>
                        No articles match your current search criteria. Try adjusting your search or category filter.
                      </Text>
                    </View>
                  ) : (
                    <>
                      {/* Featured Article */}
                      {posts.find((a: Post) => a.featured) && (
                        <View style={{ marginBottom: 40 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                            <MaterialIcons name="star" size={28} color="#d946ef" style={{ marginRight: 8 }} />
                            <Text 
                              style={{ 
                                fontSize: 24,
                                fontWeight: 'bold',
                                color: '#111827',
                              }}
                            >
                              Featured Story
                            </Text>
                          </View>
                          <NewsCard article={posts.find((a: Post) => a.featured)!} featured />
                        </View>
                      )}

                      {/* Other Articles */}
                      {posts.filter((a: Post) => !a.featured).length > 0 && (
                        <>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                            <Ionicons name="newspaper-outline" size={28} color="#d946ef" style={{ marginRight: 8 }} />
                            <Text 
                              style={{ 
                                fontSize: 24,
                                fontWeight: 'bold',
                                color: '#111827',
                              }}
                            >
                              Latest News
                            </Text>
                          </View>
                          
                          {posts.filter((a: Post) => !a.featured).map((article: Post) => (
                            <NewsCard key={article.id} article={article} />
                          ))}
                        </>
                      )}
                    </>
                  )}
                </View>
              </View>
            </ScrollView>
          </View>
          
          <CreatePostModal />
        </>
      )}
    </>
  );
}
