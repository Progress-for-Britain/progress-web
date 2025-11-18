import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Head from 'expo-router/head';
import { getCommonStyles, getGradients, getColors } from '../util/commonStyles';
import { useTheme } from '../util/theme-context';
import { useResponsive } from '../util/useResponsive';

export default function WhatWeBelieve() {
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
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
          <View style={styles.ctaSection}>
            <Text style={[commonStyles.text, styles.ctaText]}>
              Britain can't wait any longer. We must act. It can be done.
            </Text>
            <Text style={[commonStyles.text, styles.ctaSubtext]}>
              Join us
            </Text>
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
  ctaSection: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
    paddingHorizontal: isMobile ? 20 : 40,
  },
  ctaText: {
    fontSize: isMobile ? 18 : 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaSubtext: {
    fontSize: isMobile ? 16 : 20,
    textAlign: 'center',
    fontWeight: '600',
  },
});
