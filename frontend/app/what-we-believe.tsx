import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { getCommonStyles, getGradients, getColors } from '../util/commonStyles';
import { useTheme } from '../util/theme-context';
import { useResponsive } from '../util/useResponsive';

export default function WhatWeBelieve() {
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const router = useRouter();
  const commonStyles = getCommonStyles(isDark, isMobile, width);
  const gradients = getGradients(isDark);
  const colors = getColors(isDark);
  const styles = getStyles(colors, isMobile, width);

  return (
    <>
      <Head>
        <title>What We Believe - Progress UK</title>
        <meta name="description" content="Discover Progress UK's vision for Britain's future - our economic, social, and governance principles for building a kingdom united." />
      </Head>
      <View style={commonStyles.appContainer}>
        <ScrollView contentContainerStyle={commonStyles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <Text style={commonStyles.title}>What We Believe</Text>
          </View>

          {/* Economic Vision Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons 
                name="trending-up" 
                size={24} 
                color={colors.accent} 
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Economic Vision</Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>
              We believe every Briton should be richer, with real wage increases that reflect their potential. We believe in growth propelled by cutting edge technology and high creativity. We believe in monumental reindustrialisation. We believe in putting everyone on a track to prosperity with skills, training and opportunity for all.
            </Text>
          </View>

          {/* Social Vision Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons 
                name="people" 
                size={24} 
                color={colors.accent} 
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Social Vision</Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>
              We believe everyone has the right to walk down the street at night without fear. We believe in the rule of law, robust policing and open justice. We believe in community. At its best, we believe Britain is the freest and fairest nation in the world, and we must rediscover this.
            </Text>
          </View>

          {/* Governance Vision Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons 
                name="account-balance" 
                size={24} 
                color={colors.accent} 
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Governance Vision</Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>
              We believe in a state that serves its citizens, not a self-obsessed political class. We believe in courts that serve the interests of the law-abiding, not the criminal. We believe in a civil service that is lean, cost-effective and hyper-productive. We believe in a crown-jewel health service. We believe in integrity.
            </Text>
          </View>

          {/* Call to Action Section */}
          <View style={styles.closingSection}>
            <TouchableOpacity 
              onPress={() => router.push('/join')}
              style={styles.joinButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.closingGradient}
              >
                <Text style={styles.closingText}>
                  Britain can't wait any longer. We must act. It can be done.{'\n\n'}Join us
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Add extra space at the bottom for mobile scroll */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </>
  );
}

const getStyles = (colors: any, isMobile: boolean, width: number) => StyleSheet.create({
  heroSection: {
    marginBottom: 40,
    alignItems: 'center',
  },
  bodyText: {
    fontSize: isMobile ? 16 : 18,
    lineHeight: isMobile ? 24 : 28,
    textAlign: 'left',
  },
  section: {
    marginBottom: 40,
    paddingHorizontal: isMobile ? 20 : 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: 'bold',
  },
  closingSection: {
    marginBottom: 40,
    alignItems: 'center',
    paddingHorizontal: isMobile ? 20 : 40,
  },
  joinButton: {
    minWidth: isMobile ? '90%' : '60%',
  },
  closingGradient: {
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
  },
  closingText: {
    color: '#FFFFFF',
    fontSize: isMobile ? 16 : 18,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: isMobile ? 24 : 28,
  },
});
