import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
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
import { nameValidator } from "../helpers/nameValidator";
import { usernameValidator } from "../helpers/usernameValidator";
import { useNavigation } from "@react-navigation/native";
import { getUsernames, signUp } from "../services/authService";

export default function RegisterScreen({ navigation }) {
  const navigation = useNavigation();

  const [usernameList, setUsernameList] = useState([]);
  const [name, setName] = useState({ value: "", error: "" });
  const [username, setUsername] = useState({ value: "", error: "" });
  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });

  const onSignUpPressed = async () => {
    const nameError = nameValidator(name.value);
    const usernameError = usernameValidator(username.value, usernameList);
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);
    if (emailError || passwordError || nameError || usernameError) {
      setName({ ...name, error: nameError });
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      setUsername({ ...username, error: usernameError });
      return;
    }
    await handleSignUp();
  };

  React.useEffect(() => {
    getUsernames()
      .then((response) => {
        setUsernameList(response);
      })
      .catch((error) => {
        console.log(`error while fetching usernameList: ${error}`);
      });
  }, []);

  const handleSignUp = async () => {
    try {
      const response = await signUp(
        username.value,
        email.value,
        password.value,
        name.value
      );
      Alert.alert("Success", "Account created!");
      navigation.navigate("LoginScreen", { isNewUser: true });
    } catch (error) {
      Alert.alert("Sign Up Error", error.message);
      return;
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
        Create Account
      </Text>
      <TextInput
        label="Full Name"
        returnKeyType="next"
        value={name.value}
        onChangeText={(text) => setName({ value: text, error: "" })}
        error={!!name.error}
        errorText={name.error}
      />
      <TextInput
        label="Username"
        returnKeyType="next"
        value={username.value}
        onChangeText={(text) => setUsername({ value: text, error: "" })}
        error={!!username.error}
        errorText={username.error}
      />
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
      <Button
        mode="contained"
        onPress={onSignUpPressed}
        style={{ marginTop: 24, backgroundColor: "#BB6B29" }}
      >
        Sign Up
      </Button>
      <View style={styles.row}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace("LoginScreen")}>
          <Text style={styles.link}>Login</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginTop: 4,
  },
  link: {
    fontWeight: "bold",
    // color: theme.colors.primary,
    color: "#BB6B29",
  },
});
