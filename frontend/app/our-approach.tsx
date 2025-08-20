import React from "react";
import { View, Text, Platform, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import Header from '../components/Header';  
import SEOHead from '../components/SEOHead';
import { AuroraBackground } from '../util/auroraComponents';
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
      <SEOHead pageKey="our-approach" />
      <View style={commonStyles.appContainer}>
        {/* Header Component */}
        <Header />
        
        {/* Background aurora effect */}
        <AuroraBackground />

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
              2029 is an historic opportunity. First-past-the-post is prone to long periods of stability, then decline, 
              then sudden realignments to new parties. This cycle typically repeats every 80-100 years, and last occurred 
              in Britain in 1918, ushering in the Labour-Conservative binary.{'\n\n'}
              
              Today, both Labour and the Conservatives are almost universally hated. Not disliked - hated. In fact, 
              citizens are questioning the legitimacy of the British state itself.{'\n\n'}
              
              People know that the system is broken, but don't know how to fix it.{'\n\n'}
              
              People are crying out for regime change, but don't know who to vote for.
            </Text>
          </View>

          {/* Reform Analysis */}
          <View style={styles.section}>
            <Text style={[commonStyles.text, styles.bodyText]}>
              Enter Reform. This new party is led by Nigel Farage, historically a man with a low ceiling of support, 
              and a record of unprofessionalism. Despite their lead in the polls, focus grouping tells us Reform is 
              untrusted even among supporters - the hard ceiling remains, and we do not expect them to professionalise. 
              We think that they are currently the default choice for the politically homeless, not a preferred choice.{'\n\n'}
              
              This leaves the ground ripe for another party to sweep to victory.{'\n\n'}
              
              No existing party, large or small, has the technological capability, logistical appreciation, profile 
              breadth, or talent density we do.
            </Text>
          </View>

          {/* Call to Action */}
          <View style={styles.section}>
            <Text style={[commonStyles.text, styles.bodyText]}>
              We need to win to avoid another five years of instability and turmoil. We need to win so Reform can't 
              discredit the notion of new parties. We need to win to turn this ship around.{'\n\n'}
              
              It can be done.
            </Text>
          </View>

          {/* The People Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 
                name="users" 
                size={22} 
                color={colors.accent} 
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>The People</Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>
              The core purpose of PROGRESS - outside of winning elections - is to bring some of the most talented 
              people in the country into politics.{'\n\n'}
              
              A former scientific advisor to the PM described us as, 'by far the most advanced entity that exists for 
              these purposes so far. You would be amazed at how little the other challengers have.'
            </Text>
          </View>

          {/* Team Composition */}
          <View style={styles.section}>
            <Text style={[commonStyles.text, styles.bodyText]}>
              We have a core team of top engineers, ML experts, engineering PhDs, founders of data and AI companies, 
              policy experts, megaproject managers, network builders, NHS professionals, education specialists, polling 
              and focus grouping experts… And so on.{'\n\n'}
              
              We're all extremely anguished at the state of the UK and are determined to do something about it.{'\n\n'}
              
              We've been spinning up the most sophisticated new party machine in the country, defined by big-tent 
              politics that defies typical left-right conventions in favour of obsessive focus on voter needs.
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
              Our culture is entrepreneurial and agentic - if you join, you will be expected to identify problems and 
              opportunities, and go and solve them. We red team problems to enforce truth-seeking, and we eliminate 
              echo-chambers and in-group signalling.
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
    textAlign: 'justify',
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
