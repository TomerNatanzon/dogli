import * as React from "react";
import {
  View,
  Pressable,
  StyleSheet,
  ImageBackground,
  Text,
} from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { FontFamily, FontSize, Color } from "../GlobalStyles";

const WelcomeToDogliScreen2 = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.welcomeScreen2}>
      <ImageBackground
        source={require("../assets/park_finder_frame2.png")}
        resizeMode="cover"
        style={{
          flex: 1,
          width: "100%",
        }}
      >
        <Pressable
          style={[styles.fullStopWhite, styles.fullPosition]}
          onPress={() => {
            console.log("Press detected, navigating to WelcomeToDogliScreen1");
            navigation.navigate("WelcomeToDogliScreen1");
          }}
        >
          <Image
            style={styles.icon}
            contentFit="cover"
            source={require("../assets/full-stop.png")}
          />
        </Pressable>
        <ImageBackground
          style={[styles.fullStopBlack, styles.fullPosition]}
          resizeMode="cover"
          source={require("../assets/fullstopblack.png")}
        />
        <View style={[styles.frame, styles.framePosition]} />
        <View style={[styles.frame1, styles.frame1Position]} />
        <View style={styles.frame2}>
          <View style={styles.frame3} />
        </View>
        <Pressable
          style={styles.welcomeScreen2Inner}
          onPress={() => navigation.navigate("StartScreen")}
        >
          <Pressable
            style={styles.donePosition}
            onPress={() => navigation.navigate("StartScreen")}
          >
            <View
              style={{
                backgroundColor: "white",
                borderColor: "#BB6B29", // "#FF8C00",
                borderRadius: 15,
                borderWidth: 2,
                paddingVertical: 12, 
                alignItems: "center", 
              }}
            >
              <Text style={[styles.done, styles.donePosition]}>Let's Go!</Text>
            </View>
          </Pressable>
        </Pressable>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  fullPosition: {
    height: 15,
    position: "absolute",
    top: "90%",
  },
  frame1Layout: {
    width: 254,
    left: 80,
  },
  doneTypo: {
    fontFamily: FontFamily.interExtraLight,
    fontWeight: "200",
    lineHeight: 25,
    letterSpacing: -0.4,
    fontSize: FontSize.size_xl,
    textShadowRadius: 4,
    textShadowOffset: {
      width: 0,
      height: 4,
    },
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textAlign: "center",
    color: Color.colorBlack,
  },
  frame1Position: {
    top: 346,
    position: "absolute",
  },
  framePosition: {
    height: 128,
    top: 133,
    position: "absolute",
  },
  donePosition: {
    left: 0,
    height: 35,
    width: 134,
    top: 0,
    position: "absolute",
  },
  icon: {
    height: "100%",
    width: "100%",
  },
  fullStopWhite_test: {
    // left: 170,
    left: 170,
    width: 23,
    zIndex: 1,
  },
  fullStopWhite: {
    // left: 170,
    left: 162,
    width: 23,
    zIndex: 1,
  },
  fullStopBlack: {
    // left: 201,
    left: 193,
    width: 23,
  },
  parkExplorer1: {
    fontSize: FontSize.size_5xl,
    letterSpacing: -0.5,
    lineHeight: 34,
    fontWeight: "500",
    fontFamily: FontFamily.smallText,
    width: "100%",
    height: 48,
    textShadowRadius: 4,
    textShadowOffset: {
      width: 0,
      height: 4,
    },
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textAlign: "center",
    color: Color.colorBlack,
  },
  discoverNearbyParks: {
    alignSelf: "stretch",
    marginTop: 13,
  },
  parkExplorer: {
    top: 508,
    height: 225,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    width: 254,
  },
  dogsMeetingOnAWalk: {
    left: 117,
    width: 155,
    height: 170,
  },
  doglieMainLogoIcon: {
    left: 94,
    width: 198,
  },
  frame: {
    width: 212,
    left: 80,
    top: 133,
    overflow: "hidden",
  },
  frame1: {
    height: 387,
    width: 254,
    left: 80,
    overflow: "hidden",
  },
  frame3: {
    left: 90,
    width: 201,
    top: 0,
    height: 16,
    position: "absolute",
    overflow: "hidden",
  },
  frame2: {
    top: 787,
    width: 291,
    height: 16,
    left: 80,
    position: "absolute",
    overflow: "hidden",
  },
  done: {
    fontFamily: FontFamily.interBold,
    fontWeight: "200",
    lineHeight: 25,
    letterSpacing: -0.4,
    fontSize: FontSize.size_xl,
    textAlign: "center",
    color: "#BB6B29", 
  },
  welcomeScreen2Inner: {
    top: "93%",
    left: 256,
    height: 35,
    width: 134,

    position: "absolute",
  },
  welcomeScreen2: {
    backgroundColor: Color.colorWhite,
    flex: 1,
    height: 844,
    overflow: "hidden",
    width: "100%",
  },
});

export default WelcomeToDogliScreen2;
