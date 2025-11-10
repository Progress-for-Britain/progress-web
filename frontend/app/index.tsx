import React, { useEffect } from "react";
import { View, Text, ScrollView, Image, Pressable } from "react-native";
import Head from "expo-router/head";
import { useRouter } from "expo-router";
import { useAuth } from "../util/auth-context";
import { useTheme } from "../util/theme-context";
import { getCommonStyles } from "../util/commonStyles";
import { useResponsive } from "../util/useResponsive";

/**
 * Optional: drop in your product render here.
 * If `heroImageUri` is undefined, a clean 3D-ish block mock will render instead.
 */

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const styles = getCommonStyles(isDark, isMobile, width);

  const heroImageUri = isDark 
  ? require('../assets/background-dark.png') 
  : require('../assets/background.png');

  useEffect(() => {
    if (isAuthenticated && !isLoading) router.replace("/account");
  }, [isAuthenticated, isLoading]);

  return (
    <>
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
          <View style={styles.homeHeroRow}>
            {/* Left side - Image */}
            <View style={styles.homeImageSection}>
              <View style={styles.homeProductWrap}>
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
                <Text style={styles.homeSubtitle}>A political party beyond left and right.</Text>
                
                <Text style={styles.homeDescription}>
                  A workshop in which the future of Britain is being built.{'\n'}
                  A partnership of the able.
                </Text>

                <View style={styles.homeSeparator} />

                <Text style={styles.homeDescription}>
                  Maybe you hate politics.{'\n'}
                  Maybe you think ordinary people could govern better than politicians do.{'\n'}
                  We think you're right.
                </Text>

                <View style={styles.homeSeparator} />

                <Text style={styles.homeClosingText}>
                  That's what Progress is - a party full of ordinary people, doing extraordinary things.
                </Text>
              </View>
            </View>
          </View>

          {/* BOTTOM-LEFT COPY & CTA */}
          <View style={styles.homeBottomLeft}>
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

          {/* SCROLL CUE (bottom-right) */}
          <View style={styles.homeScrollCue}>
            <View style={styles.homeScrollDot} />
          </View>
        </ScrollView>
      </View>
    </>
  );
}