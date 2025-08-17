import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, ScrollView, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../util/auth-context';
import Header from '../components/Header';

export default function Newsroom() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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
  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const categories = [
    { id: 'all', label: 'All News' },
    { id: 'policy', label: 'Policy Updates' },
    { id: 'campaigns', label: 'Campaigns' },
    { id: 'events', label: 'Events' },
    { id: 'victories', label: 'Victories' },
    { id: 'press', label: 'Press Releases' }
  ];

  const newsArticles = [
    {
      id: 1,
      title: 'Progress Party Leads Historic Climate Action Bill Through Committee',
      excerpt: 'Our comprehensive climate legislation advances with bipartisan support, including $500B in renewable energy investments and green job creation programs.',
      category: 'policy',
      date: '2025-08-10',
      readTime: '4 min read',
      featured: true,
      imageUrl: null
    },
    {
      id: 2,
      title: 'Universal Healthcare Initiative Gains Momentum in Three States',
      excerpt: 'State-level Progress Party candidates champion accessible healthcare, with pilot programs showing 40% reduction in medical bankruptcies.',
      category: 'policy',
      date: '2025-08-08',
      readTime: '6 min read',
      featured: false,
      imageUrl: null
    },
    {
      id: 3,
      title: 'Community Victory: Housing First Program Reduces Homelessness by 60%',
      excerpt: 'Our local affiliate\'s housing initiative in Portland shows remarkable success, serving as a model for national implementation.',
      category: 'victories',
      date: '2025-08-05',
      readTime: '3 min read',
      featured: false,
      imageUrl: null
    },
    {
      id: 4,
      title: 'Young Voters Rally: 50,000 Register in Weekend Drive',
      excerpt: 'Progress Party\'s youth outreach breaks records with massive voter registration campaign across college campuses nationwide.',
      category: 'campaigns',
      date: '2025-08-03',
      readTime: '2 min read',
      featured: false,
      imageUrl: null
    },
    {
      id: 5,
      title: 'Education Equity Bill Signed Into Law',
      excerpt: 'After months of advocacy, our education funding reform becomes law, ensuring equal resources for all public schools.',
      category: 'victories',
      date: '2025-08-01',
      readTime: '5 min read',
      featured: false,
      imageUrl: null
    }
  ];

  const filteredArticles = newsArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const CategoryButton = ({ category }: { category: typeof categories[0] }) => (
    <TouchableOpacity
      onPress={() => setSelectedCategory(category.id)}
      style={{
        backgroundColor: selectedCategory === category.id ? '#d946ef' : '#ffffff',
        borderWidth: 1,
        borderColor: selectedCategory === category.id ? '#d946ef' : '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        marginBottom: 8,
        ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
      }}
    >
      <Text 
        style={{ 
          fontSize: 14,
          fontWeight: '500',
          color: selectedCategory === category.id ? '#ffffff' : '#374151'
        }}
      >
        {category.label}
      </Text>
    </TouchableOpacity>
  );

  const NewsCard = ({ article, featured = false }: { article: typeof newsArticles[0]; featured?: boolean }) => (
    <TouchableOpacity
      onPress={() => {
        // In a real app, navigate to article detail
        console.log('Navigate to article:', article.id);
      }}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: featured ? 24 : 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        ...(featured && {
          borderLeftWidth: 4,
          borderLeftColor: '#d946ef'
        }),
        ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
      }}
    >
      {featured && (
        <View 
          style={{ 
            backgroundColor: '#fdf4ff',
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 4,
            alignSelf: 'flex-start',
            marginBottom: 12
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#d946ef' }}>
            FEATURED
          </Text>
        </View>
      )}
      
      <Text 
        style={{ 
          fontSize: featured ? 20 : 18,
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: 8,
          lineHeight: featured ? 28 : 24
        }}
      >
        {article.title}
      </Text>
      
      <Text 
        style={{ 
          fontSize: 16,
          color: '#6B7280',
          lineHeight: 24,
          marginBottom: 12
        }}
      >
        {article.excerpt}
      </Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: '#9CA3AF', marginRight: 12 }}>
            {new Date(article.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </Text>
          <Text style={{ fontSize: 14, color: '#9CA3AF' }}>
            {article.readTime}
          </Text>
        </View>
        
        <View 
          style={{ 
            backgroundColor: '#f3f4f6',
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 4
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '500', color: '#6B7280', textTransform: 'capitalize' }}>
            {categories.find(c => c.id === article.category)?.label || article.category}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <Header />
        
        <ScrollView style={{ flex: 1 }}>
          {/* Header Section */}
          <View 
            style={{ 
              backgroundColor: '#d946ef',
              paddingVertical: 40,
              paddingHorizontal: 16
            }}
          >
            <Text 
              style={{ 
                fontSize: 32,
                fontWeight: 'bold',
                color: '#ffffff',
                textAlign: 'center',
                marginBottom: 8
              }}
            >
              Progress Newsroom
            </Text>
            <Text 
              style={{ 
                fontSize: 16,
                color: '#f5d0fe',
                textAlign: 'center',
                lineHeight: 24
              }}
            >
              Stay informed about our latest achievements, policy updates, and campaign progress
            </Text>
          </View>

          {/* Search and Filters */}
          <View style={{ paddingHorizontal: 16, paddingVertical: 24, backgroundColor: '#ffffff' }}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search news articles..."
              style={{
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                backgroundColor: '#f9fafb',
                marginBottom: 16
              }}
            />
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row' }}>
                {categories.map((category) => (
                  <CategoryButton key={category.id} category={category} />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* News Articles */}
          <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
            {filteredArticles.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ fontSize: 18, color: '#6B7280', textAlign: 'center' }}>
                  No articles found matching your criteria.
                </Text>
                <Text style={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginTop: 8 }}>
                  Try adjusting your search or category filter.
                </Text>
              </View>
            ) : (
              <>
                {/* Featured Article */}
                {filteredArticles.find(a => a.featured) && (
                  <View style={{ marginBottom: 24 }}>
                    <Text 
                      style={{ 
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: '#111827',
                        marginBottom: 16
                      }}
                    >
                      Featured Story
                    </Text>
                    <NewsCard article={filteredArticles.find(a => a.featured)!} featured />
                  </View>
                )}

                {/* Other Articles */}
                <Text 
                  style={{ 
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: '#111827',
                    marginBottom: 16
                  }}
                >
                  Latest News
                </Text>
                
                {filteredArticles.filter(a => !a.featured).map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}
