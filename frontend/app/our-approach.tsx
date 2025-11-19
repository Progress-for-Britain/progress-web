import React from "react";
import { View, Text, Platform, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';  
import { getCommonStyles, getGradients, getColors } from '../util/commonStyles';
import { useTheme } from '../util/theme-context';
import { useResponsive } from '../util/useResponsive';

export default function OurApproach() {
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
        <title>Our Approach - Progress UK</title>
        <meta name="description" content="Discover Progress UK's innovative approach to progressive politics, policy development, and community engagement across Britain." />
      </Head>
      <View style={commonStyles.appContainer}>

        {/* Our Approach Page Content */}
        <ScrollView contentContainerStyle={commonStyles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <Text style={commonStyles.title}>Our Approach</Text>
          </View>

          {/* The Opportunity Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons 
                name="timeline" 
                size={24} 
                color={colors.accent} 
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>The Opportunity</Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>
              Britain stands at a crossroads. The political establishment is crumbling as the country's decline accelerates. 
              Support for both Labour and the Conservatives is collapsing as the public gives up on their ability to improve 
              Britain, while Reform's newfound popularity is fragile. Voters don't trust them, and they're right. Reform doesn't 
              have the talent nor professionalism to bring about the change Britain needs.{'\n\n'}
              
              It's time for something new. It's time for Progress.{'\n\n'}
              
              We see it as our duty to bring some of the most talented people in the country into politics. We're not trying to 
              pressure the existing parties to change - we're doing the hard work to prepare a credible alternative.{'\n\n'}
              
              A former scientific advisor to the Prime Minister described us as, "by far the most advanced entity that exists for 
              these purposes so far. You would be amazed at how little the other challengers have."{'\n\n'}
              
              You'd be surprised by what we've already achieved.
            </Text>
          </View>

          {/* Culture Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons 
                name="psychology" 
                size={24} 
                color={colors.accent} 
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Our Culture</Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>
              We're entrepreneurial and proactive. If you join, you will be expected to identify problems and opportunities, 
              and go and solve them.
            </Text>
          </View>

          {/* The Policy Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons 
                name="policy" 
                size={24} 
                color={colors.accent} 
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>The Policy</Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>
              PROGRESS recognises the importance of ideas and of policy. In fact, the name Progress is intended to 
              provoke the question, "Progress towards what?" We are living through major worldview transitions, and 
              need to ask serious questions about philosophy, morality and ethics.{'\n\n'}
              
              We do not shirk the deeper moral and philosophical questions about what we ought to be working towards, 
              and we take a systems engineering approach to developing a comprehensive and practical policy platform 
              which will deliver. If addressing peoples' needs requires rethinking our ideas of positive rights and 
              responsibilities, repealing the Human Rights Act, or rewiring the Paris Agreement - then that is what 
              must be done.
            </Text>
          </View>

          {/* Final Call to Action */}
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
                  If you want to work with the most serious and high leverage team in the country, join us.
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
  bodyText: {
    fontSize: isMobile ? 16 : 18,
    lineHeight: isMobile ? 24 : 28,
    textAlign: isMobile ? 'left' : 'justify',
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
