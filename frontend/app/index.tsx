import React, { useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function Home() {
  const aurora = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(aurora, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  }, [aurora]);

  const auroraStyle = {
    transform: [
      {
        translateX: aurora.interpolate({
          inputRange: [0, 1],
          outputRange: [-200, 200],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.auroraWrapper, auroraStyle]}>
        <LinearGradient
          colors={["#ff0080", "#6100ff", "#00e6ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.aurora}
        />
      </Animated.View>

      <View style={styles.navbar}>
        <Text style={styles.logo}>PROGRESS</Text>
        <View style={styles.navItems}>
          <Text style={styles.navItem}>About</Text>
          <Text style={styles.navItem}>Contact Us</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Welcome to Progress</Text>
        <Text style={styles.body}>
          <Text style={styles.highlight}>
            A political party beyond left and right.
          </Text>
          {"\n"}
          A workshop in which the future of Britain is being built.{"\n"}
          A partnership of the able.{"\n\n"}
          Maybe you hate politics.{"\n"}
          Maybe you think you think ordinary people could govern better than politicians do.{"\n"}
          We think you're right.{"\n\n"}
          That's what Progress is - a party full of ordinary people, doing extraordinary things.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  auroraWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  aurora: {
    width: "200%",
    height: "200%",
    opacity: 0.3,
  },
  navbar: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 2,
  },
  navItems: {
    flexDirection: "row",
  },
  navItem: {
    marginLeft: 20,
    fontSize: 16,
    color: "#fff",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 20,
  },
  body: {
    fontSize: 18,
    lineHeight: 28,
    color: "#fff",
    fontFamily: "Montserrat, sans-serif",
  },
  highlight: {
    backgroundColor: "#B10024",
    color: "#fff",
    paddingHorizontal: 4,
    borderRadius: 4,
  },
});