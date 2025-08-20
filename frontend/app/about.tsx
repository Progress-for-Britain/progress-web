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
            <Text style={commonStyles.title}>About Us</Text>
            <Text style={[commonStyles.text, styles.heroSubtext]}>Some time ago…</Text>
          </View>

          {/* Foundation Section */}
          <View style={styles.section}>
            <Text style={[commonStyles.text, styles.foundationText]}>
              …PROGRESS was formed by a group of people – engineers, founders of data and AI companies, megaproject managers, 
              network builders, grassroots organisers, NHS professionals, astrophysicists, world-class educators, inventors, 
              polling and focus grouping experts, and more – united by three common and uncontroversial beliefs:
            </Text>
          </View>

          {/* Core Beliefs Section */}
          <View style={styles.centeredSection}>
            <Text style={[commonStyles.text, styles.centeredBelief]}>
              That Britain, one of the finest and most successful states ever to rise from the earth, finds itself in terminal decline.
            </Text>
            <Text style={[commonStyles.text, styles.centeredBelief]}>
              That this decline can be stopped, enabling Britain to exceed the level of success and stability it has known historically.
            </Text>
            <Text style={[commonStyles.text, styles.centeredBelief]}>
              And that this decline must be stopped.
            </Text>
          </View>

          {/* Formation Section */}
          <View style={styles.section}>
            <Text style={[commonStyles.text, styles.bodyText]}>
              PROGRESS was formed from a desperate unwillingness to allow Britain's fate to be left to chance. It is our conviction 
              that Britain's revival and flourishing is assured - if only we can summon the will.{'\n\n'}
              
              PROGRESS' platform is simple, and oriented around a vision of A Kingdom United.
            </Text>
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
              Economically, we believe in a Britain whose growth is propelled by cutting edge technology and high creativity. 
              We believe in the poverty-reducing and prosperity-spreading power of markets. We believe in monumental reindustrialisation. 
              We believe in a focus on skills and training for all, to create tracks to prosperity for all citizens, so that there 
              shall be no one in Britain who cannot count on their own mounting skill capital with satisfaction, who cannot look 
              forward to a future of home-ownership and to the success of their issue – their own personal visions of PROGRESS, 
              for their time and for coming time.
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
              Socially, we believe that it should be the right of all people to walk down the street at night without fear of harm. 
              We believe in the rule of law in the universal interest, robust policing, and a culture of open justice that holds 
              matters of corruption and white-collar criminality to as pointed a standard as it does matters of violent and petty 
              criminality. We believe in a nation defined not by cursory differences as abide between us, but by shared commitment 
              to, and shared commitment to the protection of, the classically British values that made this country the freest, 
              fairest, and most successful in the world, the envy and inspiration of many of the world's greatest states to have 
              followed after it.
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
              And we believe in a state that serves its citizens. In courts that serve the interests of the law-abiding, not the 
              criminal. In a civil service that is lean, cost-effective and hyper-productive. In a crown jewel health service that 
              provides for its people according to their need, and seeks to reduce the need in question as progressively as it 
              treats those needs that already exist or have become inexorable. In a political class that has transcended petty 
              considerations of the political left and the political right, and is merely concerned with the skilful usage of that 
              raw material of governance in the service of increasing public prosperity, security, and means-to-venture for all 
              people, whether their personal affinities make them sympathetic to PROGRESS or not.
            </Text>
          </View>

          {/* Mission Statement Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 
                name="flag" 
                size={22} 
                color={colors.accent} 
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Our Mission</Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>
              We are a party devoted to bringing about the glory of our name: PROGRESS, for one and all. A party that believes 
              in the heroism, rationality, and beauty of human beings; and in the greatness of Britain, and of the British people; 
              and in the magnificence of our Common Law; and in the vitality of British culture, so vigorous in its originality 
              and so pervasive in effect that it has sired, propelled, and justified many of the developments in the march of 
              global development of which humanity can be most proud.{'\n\n'}
              
              A party that believes in the credo of "Always Better Today Than Yesterday." A party that believes in its own 
              almost-impossible mission – not merely elections won, and a movement born, but an entire national culture revitalised. 
              It is a fundamentally unreasonable aim, but these are unreasonable times. The service of the people of Britain cannot 
              wait any longer. And just as we believe that the answers to the questions facing the British people are within them, 
              so do we believe that the service of those answers is within us.
            </Text>
          </View>

          {/* Closing Statement */}
          <View style={styles.closingSection}>
            <LinearGradient
              colors={gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.closingGradient}
            >
              <Text style={styles.closingText}>It Can Be Done.</Text>
            </LinearGradient>
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
    alignItems: 'flex-start',
  },
  heroSubtext: {
    fontSize: isMobile ? 16 : 18,
    fontStyle: 'italic',
    marginTop: 8,
    opacity: 0.8,
  },
  foundationText: {
    fontSize: isMobile ? 16 : 18,
    lineHeight: isMobile ? 24 : 28,
    textAlign: 'justify',
  },
  centeredSection: {
    marginBottom: 40,
    paddingHorizontal: isMobile ? 20 : 40,
    alignItems: 'center',
  },
  centeredBelief: {
    fontSize: isMobile ? 16 : 18,
    lineHeight: isMobile ? 24 : 28,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  bodyText: {
    fontSize: isMobile ? 16 : 18,
    lineHeight: isMobile ? 24 : 28,
    textAlign: 'justify',
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
  closingGradient: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  closingText: {
    color: '#FFFFFF',
    fontSize: isMobile ? 18 : 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
