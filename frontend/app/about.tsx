import React from "react";
import { View, Text, Platform, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AuroraBackground } from '../util/auroraComponents';
import { getCommonStyles, getGradients, getColors } from '../util/commonStyles';
import { useTheme } from '../util/theme-context';
import { useResponsive } from '../util/useResponsive';

export default function About() {
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const commonStyles = getCommonStyles(isDark, isMobile, width);
  const gradients = getGradients(isDark);
  const colors = getColors(isDark);
  const styles = getStyles(colors, isMobile, width);
  
  return (
    <>
      <View style={commonStyles.appContainer}>
        {/* Header Component */}
        <Header />
        
        {/* Background aurora effect */}
        <AuroraBackground />

        {/* About Page Content */}
        <ScrollView contentContainerStyle={commonStyles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <Text style={commonStyles.title}>About Progress</Text>
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
          </View>

          {/* Mission Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons 
                name="flag" 
                size={24} 
                color={colors.accent} 
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Our Mission</Text>
            </View>
            <Text style={[commonStyles.text, styles.sectionText]}>
              Progress is more than a political party - we're a movement of ordinary people doing extraordinary things. 
              We believe that Britain's future should be built by those who live and work here every day, not by 
              career politicians disconnected from reality.{'\n\n'}
              
              We're creating a new kind of politics - one that puts competence over ideology, solutions over soundbites, 
              and the common good over party politics.
            </Text>
          </View>

          {/* Vision Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons 
                name="telescope" 
                size={24} 
                color={colors.accent} 
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Our Vision</Text>
            </View>
            <Text style={[commonStyles.text, styles.sectionText]}>
              We envision a Britain where:{'\n\n'}
              • Decisions are made based on evidence, not political expediency{'\n'}
              • Every citizen has the opportunity to contribute their skills and expertise{'\n'}
              • Government serves the people, not special interests{'\n'}
              • Innovation and pragmatism drive policy{'\n'}
              • Political discourse is civil and constructive
            </Text>
          </View>

          {/* Values Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 
                name="heart" 
                size={22} 
                color={colors.accent} 
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Our Values</Text>
            </View>
            
            <View style={styles.valuesList}>
              <View style={styles.valueItem}>
                <View style={styles.valueIconContainer}>
                  <MaterialIcons name="groups" size={20} color={colors.accent} />
                </View>
                <View style={styles.valueContent}>
                  <Text style={[commonStyles.text, styles.valueTitle]}>Inclusivity</Text>
                  <Text style={[commonStyles.text, styles.valueDescription]}>
                    We welcome people from all backgrounds who share our commitment to building a better Britain.
                  </Text>
                </View>
              </View>

              <View style={styles.valueItem}>
                <View style={styles.valueIconContainer}>
                  <MaterialIcons name="science" size={20} color={colors.accent} />
                </View>
                <View style={styles.valueContent}>
                  <Text style={[commonStyles.text, styles.valueTitle]}>Evidence-Based Policy</Text>
                  <Text style={[commonStyles.text, styles.valueDescription]}>
                    Our policies are grounded in research, data, and real-world experience.
                  </Text>
                </View>
              </View>

              <View style={styles.valueItem}>
                <View style={styles.valueIconContainer}>
                  <MaterialIcons name="account-balance" size={20} color={colors.accent} />
                </View>
                <View style={styles.valueContent}>
                  <Text style={[commonStyles.text, styles.valueTitle]}>Transparency</Text>
                  <Text style={[commonStyles.text, styles.valueDescription]}>
                    We believe in open, honest communication and accountable governance.
                  </Text>
                </View>
              </View>

              <View style={styles.valueItem}>
                <View style={styles.valueIconContainer}>
                  <MaterialIcons name="psychology" size={20} color={colors.accent} />
                </View>
                <View style={styles.valueContent}>
                  <Text style={[commonStyles.text, styles.valueTitle]}>Pragmatism</Text>
                  <Text style={[commonStyles.text, styles.valueDescription]}>
                    We focus on what works, not what fits traditional political categories.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* How We're Different Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons 
                name="bulb" 
                size={24} 
                color={colors.accent} 
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>How We're Different</Text>
            </View>
            <Text style={[commonStyles.text, styles.sectionText]}>
              Unlike traditional political parties, Progress operates as a partnership of the able. We don't 
              follow rigid ideological lines or party whips. Instead, we:{'\n\n'}
              
              • Recruit based on competence and character, not political connections{'\n'}
              • Encourage diverse perspectives and healthy debate{'\n'}
              • Make decisions through evidence-based analysis{'\n'}
              • Focus on long-term solutions rather than short-term political gains{'\n'}
              • Maintain independence from special interest groups
            </Text>
          </View>

          {/* Get Involved Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 
                name="hands-helping" 
                size={22} 
                color={colors.accent} 
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Get Involved</Text>
            </View>
            <Text style={[commonStyles.text, styles.sectionText]}>
              Progress is built by people like you. Whether you're a teacher, engineer, small business owner, 
              student, or retiree - if you believe ordinary people can govern better than politicians do, 
              we want to hear from you.{'\n\n'}
              
              Join us in building the future of British politics. Together, we can create a government that 
              truly serves the people.
            </Text>
            
            <View style={styles.ctaContainer}>
              <LinearGradient
                colors={gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>Ready to make a difference?</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Footer */}
          <Footer />
          
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
    alignItems: 'flex-end',
  },
  highlightTextContainer: {
    alignSelf: 'flex-end',
    marginTop: 10,
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
  sectionText: {
    fontSize: isMobile ? 16 : 18,
    lineHeight: isMobile ? 24 : 28,
    textAlign: 'right',
  },
  valuesList: {
    gap: 20,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  valueIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    fontSize: isMobile ? 16 : 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'left',
  },
  valueDescription: {
    fontSize: isMobile ? 14 : 16,
    lineHeight: isMobile ? 20 : 24,
    opacity: 0.8,
    textAlign: 'left',
  },
  ctaContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  ctaGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: isMobile ? 16 : 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
