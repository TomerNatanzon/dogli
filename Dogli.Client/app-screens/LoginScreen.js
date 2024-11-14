import React, { useState, useEffect } from "react";
import { TouchableOpacity, StyleSheet, View, Alert } from "react-native";
import { Text } from "react-native-paper";
import Background from "../components/Background";
import Logo from "../components/Logo";
import Header from "../components/Header";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import BackButton from "../components/BackButton";
import { theme } from "../core/theme";
import { emailValidator } from "../helpers/emailValidator";
import { passwordValidator } from "../helpers/passwordValidator";
import { signIn } from "../services/authService";
import { getAuthToken } from "../services/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { color } from "@rneui/base";

export default function LoginScreen({ navigation, route }) {

  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [newUser, setNewUser] = useState(false);

  useEffect(() => {
    const isNewUser = route.params?.isNewUser || false;
    setNewUser(isNewUser);
    console.log("Route params: ", route.params);
    console.log("isNewUser: ", isNewUser);
  }, [route.params]);

  const onLoginPressed = async () => {
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);
    if (emailError || passwordError) {
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      return;
    }
    await handleSignIn();
  };

  const handleSignIn = async () => {
    try {
      const response = await signIn(email.value, password.value);
      Alert.alert("Welcome", "You have successfully signed in!");
      const storedToken = await getAuthToken();
      console.log("login success, stored token:", storedToken);

      if (newUser) {
        console.log("New user, should navigate to MyProfileScreen");
        navigation.navigate("UserProfileScreen");
      } else {
        navigation.navigate("MainScreen");
      }
    } catch (error) {
      Alert.alert("Sign In Error", error.message);
    }
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Text
        style={{
          color: "#BB6B29",
          fontSize: 21,
          fontWeight: "bold",
          paddingVertical: 12,
        }}
      >
        Welcome back
      </Text>
      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: "" })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />
      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: "" })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      <View style={styles.forgotPassword}>
        <TouchableOpacity
          onPress={() => navigation.navigate("ResetPasswordScreen")}
        >
          <Text style={styles.forgot}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>
      <Button
        style={{ backgroundColor: "#BB6B29" }}
        mode="contained"
        onPress={onLoginPressed}
      >
        Sign in
      </Button>
      <View style={styles.row}>
        <Text>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace("RegisterScreen")}>
          <Text style={styles.link}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  forgotPassword: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    marginTop: 4,
  },
  forgot: {
    fontSize: 13,
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: "bold",
    color: "#BB6B29",
  },
});
