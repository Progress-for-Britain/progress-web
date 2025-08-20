import React from "react";
import { View, Text, Platform, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../components/Header';
import { AuroraBackground } from '../util/auroraComponents';
import { commonStyles, colors, gradients } from '../util/commonStyles';

export default function Home() {
  return (
    <View style={commonStyles.appContainer}>
      {/* Header Component */}
      <Header />
      
      {/* Background aurora effect */}
      <AuroraBackground />

      {/* Home Page Content */}
      <View style={commonStyles.content}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    lineHeight: 28,
    fontSize: 18,
    textAlign: 'right',
  },
});
