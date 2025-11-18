import React, { useEffect } from "react";
import { View, Text, ScrollView, Image, Pressable } from "react-native";
import Head from "expo-router/head";
import { useRouter } from "expo-router";
import { useAuth } from "../util/auth-context";
import { useTheme } from "../util/theme-context";
import { getCommonStyles, getColors } from "../util/commonStyles";
import { useResponsive } from "../util/useResponsive";
import { GameCard } from "../components/gamecard";
import CelestialDecoration from "../components/CelestialDecoration";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const styles = getCommonStyles(isDark, isMobile, width);
  const colors = getColors(isDark);

  const heroImageUri = isDark 
  ? require('../assets/background-dark.png') 
  : require('../assets/background.png');

  useEffect(() => {
    if (isAuthenticated && !isLoading) router.replace("/account");
  }, [isAuthenticated, isLoading]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Head>
        <title>Progress UK</title>
      </Head>

      {/* PAGE */}
      <View style={styles.homePage}>

          {/* CONTENT CANVAS */}
          <ScrollView
            contentContainerStyle={styles.homeCanvas}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            {/* MAIN HERO */}
            
            <View style={[styles.homeHeroRow, { minHeight: isMobile ? 600 : 700 }]}>
              {/* Left side - Image */}
              <View style={styles.homeImageSection}>
                <View style={styles.homeProductWrap}>
                  {/* Celestial Decoration - fills the entire image container */}
                  <CelestialDecoration 
                    containerWidth={width * (isMobile ? 1 : 0.5)} 
                    containerHeight={isMobile ? 400 : 500} 
                  />
                  
                  {heroImageUri ? (
                    <Image
                      source={heroImageUri}
                      resizeMode="contain"
                      style={styles.homeProductImage}
                    />
                  ) : (
                    // Minimal "3D accent" mock if no image is provided
                    <View style={styles.homeMockCube}>
                      <View style={styles.homeMockFace} />
                      <View style={styles.homeMockDial} />
                      <Text style={styles.homeMockTime}>7:08</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Right side - Text Content */}
              <View style={styles.homeTextSection}>
                <View style={styles.homeTextContent}>
                  <Text style={styles.homeWelcomeTitle}>Welcome to Progress</Text>
                  
                  <Text style={styles.homeDescription}>
                    Britain's decline ends now.
                  </Text>

                  <View style={styles.homeSeparator} />

                  <Text style={styles.homeDescription}>
                    We're a political movement beyond left and right building a better future for Britain.
                  </Text>

                  <View style={styles.homeSeparator} />

                  <Text style={styles.homeClosingText}>
                    We all deserve better.
                  </Text>
                </View>
              </View>
            </View>
            
            {/* CTA SECTION */}
            <View style={{ alignItems: 'flex-start', marginTop: isMobile ? 24 : 32 }}>
              <Pressable
                onPress={() => router.push("/join")}
                style={({ pressed }) => [
                  styles.homeCta,
                  pressed && { transform: [{ translateY: 1 }] },
                ]}
              >
                <Text style={styles.homeCtaText}>Join us</Text>
                <Text style={styles.homeCtaArrow}>→</Text>
              </Pressable>
            </View>
            
            {/* Spacer for visual separation */}
            <View style={{ height: isMobile ? 40 : 60 }} />

            {/* ABOUT SECTION */}
            <View style={styles.gamesSection}>
              <Text style={styles.gamesSectionTitle}>About</Text>
              <Text style={styles.gamesSectionSubtitle}>
                Progress is formed by a group of patriotic engineers, founders of data and AI companies, megaproject managers, network builders, grassroots organisers, NHS professionals, astrophysicists, world-class educators, inventors, polling and focus grouping experts, and more – united by three common beliefs:{'\n\n'}
                That Britain, one of the most successful nations in history, is in terminal decline.{'\n\n'}
                That this decline can be stopped if we fundamentally change how politics works to serve the public, enabling Britain to attain unprecedented success and stability.{'\n\n'}
                And that this decline must be stopped.{'\n\n'}
                We're taking on responsibility to make this happen.
              </Text>
            </View>
          

            {/* GAMES SECTION */}
            <View style={styles.gamesSection}>
              <Text style={styles.gamesSectionTitle}>Explore Our Games</Text>
              <Text style={styles.gamesSectionSubtitle}>
                Interactive experiences that teach the principles of governance and democracy
              </Text>
              
              <View style={styles.gamesGrid}>
                {/* Game Card 1 */}
                <GameCard 
                  index={0}
                  title="Nick Sim"
                  description="Experience the challenges of living as an average 30 year old in modern Britain"
                  image={require('../assets/nick-sim.png')}
                  url="https://nicksimulator.com/"
                  styles={styles}
                />

                {/* Game Card 2 */}
                <GameCard 
                  index={1}
                  title="Would you believe it?"
                  description="Test your political knowledge and challenge common misconceptions in British politics"
                  image={require('../assets/quiz-night.png')}
                  url="https://believe-quiz.vercel.app/"
                  styles={styles}
                />

              </View>
            </View>
          </ScrollView>
        </View>
      </View>
  );
}