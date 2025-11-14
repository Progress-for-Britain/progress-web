import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Animated } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import Head from 'expo-router/head';
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

  const heroText = "Some time ago…";
  const fullText = "…PROGRESS was formed by a group of people – engineers, founders of data and AI companies, megaproject managers, network builders, grassroots organisers, NHS professionals, astrophysicists, world-class educators, inventors, polling and focus grouping experts, and more – united by three common and uncontroversial beliefs:";
  const formationText = "PROGRESS was formed from a desperate unwillingness to allow Britain's fate to be left to chance. It is our conviction that Britain's revival and flourishing is assured - if only we can summon the will.\n\nPROGRESS' platform is simple, and oriented around a vision of A Kingdom United.";
  
  const [displayedHeroText, setDisplayedHeroText] = useState("");
  const [heroComplete, setHeroComplete] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [typingComplete, setTypingComplete] = useState(false);
  const [displayedFormationText, setDisplayedFormationText] = useState("");
  const [formationComplete, setFormationComplete] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [formationFadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Function to get delay based on character
    const getDelay = (char: string) => {
      if (char === '.' || char === ':') return 300;
      if (char === ',' || char === ';' || char === '–') return 150;
      return 35;
    };

    // Type hero text first
    let heroIndex = 0;
    const typeHero = () => {
      if (heroIndex < heroText.length) {
        setDisplayedHeroText(heroText.substring(0, heroIndex + 1));
        heroIndex++;
        setTimeout(typeHero, 50);
      } else {
        setHeroComplete(true);
        // Pause before main text
        setTimeout(() => {
          let mainIndex = 0;
          const typeMain = () => {
            if (mainIndex < fullText.length) {
              setDisplayedText(fullText.substring(0, mainIndex + 1));
              const delay = getDelay(fullText[mainIndex]);
              mainIndex++;
              setTimeout(typeMain, delay);
            } else {
              setTypingComplete(true);
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              }).start();
              
              // Wait for beliefs to fade in, then pause before typing formation text
              setTimeout(() => {
                let formationIndex = 0;
                const typeFormation = () => {
                  if (formationIndex < formationText.length) {
                    setDisplayedFormationText(formationText.substring(0, formationIndex + 1));
                    const delay = getDelay(formationText[formationIndex]);
                    formationIndex++;
                    setTimeout(typeFormation, delay);
                  } else {
                    setFormationComplete(true);
                    // Fade in remaining content
                    Animated.timing(formationFadeAnim, {
                      toValue: 1,
                      duration: 800,
                      useNativeDriver: true,
                    }).start();
                  }
                };
                typeFormation();
              }, 2500); // Pause to let user read the three beliefs
            }
          };
          typeMain();
        }, 500);
      }
    };
    
    typeHero();
  }, []);
  
  return (
    <>
      <Head>
        <title>About Us - Progress UK</title>
        <meta name="description" content="Learn about Progress UK's mission, values, and vision for building a fairer future. Discover our progressive approach to politics and community engagement." />
      </Head>
      <View style={commonStyles.appContainer}>

        {/* About Page Content */}
        <ScrollView contentContainerStyle={commonStyles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <Text style={commonStyles.title}>About Us</Text>
            {displayedHeroText && (
              <Text style={[commonStyles.text, styles.heroSubtext]}>
                {displayedHeroText}
                {!heroComplete && <Text style={styles.cursor}>|</Text>}
              </Text>
            )}
          </View>

          {/* Foundation Section - with fixed height to prevent layout shift */}
          {heroComplete && (
            <View style={styles.section}>
              <View style={styles.typingContainer}>
                <Text style={[commonStyles.text, styles.foundationText]}>
                  {displayedText}
                  {!typingComplete && <Text style={styles.cursor}>|</Text>}
                </Text>
              </View>
            </View>
          )}

          {/* Animated content that appears after typing is complete */}
          {typingComplete && (
            <Animated.View style={{ opacity: fadeAnim }}>
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

          {/* Formation Section with typing */}
          <View style={styles.section}>
            <View style={styles.typingContainer}>
              <Text style={[commonStyles.text, styles.bodyText]}>
                {displayedFormationText}
                {!formationComplete && displayedFormationText && <Text style={styles.cursor}>|</Text>}
              </Text>
            </View>
          </View>
            </Animated.View>
          )}

          {/* Remaining content after formation typing is complete */}
          {formationComplete && (
            <Animated.View style={{ opacity: formationFadeAnim }}>

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
            </Animated.View>
          )}
          
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
  heroSubtext: {
    fontSize: isMobile ? 16 : 18,
    fontStyle: 'italic',
    marginTop: 8,
    opacity: 0.8,
  },
  typingContainer: {
    minHeight: isMobile ? 120 : 100, // Reserve space to prevent layout shift
  },
  foundationText: {
    fontSize: isMobile ? 16 : 18,
    lineHeight: isMobile ? 24 : 28,
    textAlign: 'left',
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
  cursor: {
    opacity: 0.7,
    fontWeight: 'normal',
  },
});
