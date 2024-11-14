import React from "react";
import Background from "../components/Background";
import Header from "../components/Header";
import Button from "../components/Button";
import Paragraph from "../components/Paragraph";
import { useNavigation } from "@react-navigation/native";
import { signUp } from "../services/authService";
import { ImageBackground, StyleSheet, View } from "react-native";

export default function StartScreen({ navigation }) {
  navigation = useNavigation();
  return (
    <View style={styles.startScreen}>
      <ImageBackground 
        source={require("../assets/start-screen.png")}
        resizeMode="cover"
        style={{
          flex: 1,
          width: "100%",
        }}
      >
        <Button
          mode="contained"
          onPress={() => navigation.navigate("LoginScreen")}
          style={styles.signInButton}
          labelStyle={[styles.text]}
        >
          Sign In
        </Button>
        <Paragraph style={styles.paragraph}>Don’t have an account?</Paragraph>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate("RegisterScreen")}
          style={styles.signUpButton}
          labelStyle={[{ color: "#BB6B29" }, styles.text]}
        >
          Sign Up
        </Button>
      </ImageBackground>
    </View>
  );
}

styles = StyleSheet.create({
  startScreen: {
    backgroundColor: "#FFFFFF",
    flex: 1,
    // height: 844,
    overflow: "hidden",
    width: "100%",
    // maxWidth: 340,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  signInButton: {
    alignSelf: "center",
    backgroundColor: "#BB6B29", // "#8D3B3C",
    borderRadius: 28,
    position: "absolute",
    width: "70%",
    height: 56,
    top: 603,
  },
  signUpButton: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#BB6B29", // "#8D3B3C",
    borderWidth: 2,
    borderRadius: 28,
    position: "absolute",
    width: "70%",
    height: 56,
    top: 700,
  },
  text: {
    // fontFamily: "Poppins",
    fontFamily: "sans-serif-medium",
    // fontWeight: "medium",
    fontSize: 17,
    lineHeight: 26,
  },
  paragraph: {
    fontFamily: "sans-serif",
    alignSelf: "center",
    fontSize: 17,
    lineHeight: 20,
    position: "absolute",
    justifyContent: "center",
    top: 680,
    color: "#BB6B29",
  },
});
