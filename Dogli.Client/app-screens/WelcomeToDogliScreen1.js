import * as React from "react";
import {
  Pressable,
  StyleSheet,
  ImageBackground,
  View,
  Text,
} from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { Color, FontSize, FontFamily } from "../GlobalStyles";

const WelcomeToDogliScreen1 = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.welcomeScreen1}>
      <ImageBackground 
        source={require("../assets/welcome-to-dogli-screen.png")}
        resizeMode="cover"
        style={{
          flex: 1,
          width: "100%",
        }}
      >
        <Pressable
          style={[styles.fullStopWhite, styles.fullPosition]}
          onPress={() => {
            navigation.navigate("WelcomeToDogliScreen2");
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
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  fullPosition: {
    height: 15,
    top: "90%",
    position: "absolute",
  },
  manageYourDogText: {
    textShadowRadius: 4,
    textShadowOffset: {
      width: 0,
      height: 4,
    },
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textAlign: "center",
    color: Color.colorBlack,
  },
  icon: {
    height: "100%",
    width: "100%",
  },
  fullStopWhite: {
    left: 193,
    width: 23,
    zIndex: 1,
  },
  fullStopBlack: {
    left: 162,
    width: 23,
  },
  activityTracking1: {
    fontSize: FontSize.size_5xl,
    letterSpacing: -0.5,
    lineHeight: 34,
    fontWeight: "500",
    fontFamily: FontFamily.smallText,
  },
  manageYourDog: {
    alignSelf: "stretch",
    fontSize: FontSize.size_xl,
    letterSpacing: -0.4,
    lineHeight: 28,
    fontWeight: "200",
    fontFamily: FontFamily.interExtraLight,
    marginTop: 13,
  },
  activityTracking: {
    top: 500,
    left: 73,
    width: 254,
    height: 225,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  groupOfPicsIcon: {
    top: 341,
    left: 80,
    width: 251,
    height: 190,
    position: "absolute",
  },
  doglieMainLogoIcon: {
    top: 137,
    left: 94,
    width: 198,
    height: 128,
    position: "absolute",
  },
  welcomeScreen1: {
    backgroundColor: Color.colorWhite,
    flex: 1,
    height: 844,
    overflow: "hidden",
    width: "100%",
  },
});

export default WelcomeToDogliScreen1;
