import React, { useEffect } from "react";
import { View, Text, Platform, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { getCommonStyles, getGradients } from '../util/commonStyles';
import { useTheme } from '../util/theme-context';
import { useResponsive } from '../util/useResponsive';
import { useAuth } from '../util/auth-context';

export default function Home() {
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const commonStyles = getCommonStyles(isDark, isMobile, width);
  const gradients = getGradients(isDark);
  const styles = getStyles(isMobile);
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace('/account');
    }
  }, [isAuthenticated, isLoading]);

  return (
    <>
      <Head>
        <title>Progress UK</title>
      </Head>
      <View style={commonStyles.appContainer}>
        {/* Home Page Content */}
        <ScrollView contentContainerStyle={commonStyles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroHighlightContainer}>
            <Text style={commonStyles.title}>Welcome to Progress</Text>
            <View style={styles.textBlock}>
              <View style={styles.highlightTextContainer}>
                <LinearGradient
                  colors={gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={commonStyles.highlightBackground}
                >
                  <Text style={commonStyles.highlightText}>A political party beyond left and right.</Text>
                </LinearGradient>
              </View>
              <Text style={[commonStyles.text, styles.normalText]}>
                {'\n'}A workshop in which the future of Britain is being built.{'\n'}
                A partnership of the able.{'\n\n\n\n'}
                Maybe you hate politics.{'\n'}
                Maybe you think ordinary people could govern better than politicians do.{'\n'}
                We think you're right.{'\n\n\n'}
                That's what Progress is - a party full of ordinary people, doing extraordinary things.
              </Text>
            </View>
          </View>
          {/* Add extra space at the bottom for mobile scroll */}
          <View style={{ height: 600 }} />
        </ScrollView>
      </View>
    </>
  );
}

const getStyles = (isMobile: boolean) => StyleSheet.create({
  heroHighlightContainer: {
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'flex-end',
  },
  textBlock: {
    marginBottom: 20,
  },
  highlightTextContainer: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  normalText: {
    lineHeight: isMobile ? 24 : 28,
    fontSize: isMobile ? 16 : 18,
    textAlign: 'right',
  },
});
