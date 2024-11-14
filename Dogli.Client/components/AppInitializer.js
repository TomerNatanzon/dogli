import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import { api } from "../services/api";
import { getAuthToken, getUserId, clearUserData } from "../services/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AppInitializer = ({ navigation }) => {
  navigation = useNavigation();

  const authenticateUser = async () => {
    try {
      const token = getAuthToken();

      if (token) {
        // Attempt to authenticate with the stored token
        const response = await api.get("/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          console.log(
            "User authenticated, redirecting to home screen\n",
            response.data
          );
          let userId = await getUserId();
          const dogs = await fetchUserDogs();

          let userProfile = { ...response.data, id: userId, dogs: dogs || [] };
          console.log("User profile: ", JSON.stringify(userProfile));
          await AsyncStorage.setItem(
            "@userProfile",
            JSON.stringify(userProfile)
          );
          navigation.navigate("MainScreen");
        } else {
          await AsyncStorage.removeItem("@userProfile");
          navigation.navigate("LoginScreen");
        }
      } else {
        navigation.navigate("WelcomeToDogliScreen1");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log("Token expired or invalid, redirecting to login");
      } else {
        console.log("Error authenticating user", error);
      }
      await clearUserData();
      navigation.navigate("WelcomeToDogliScreen1");
    }
  };

  fetchUserDogs = async () => {
    try {
      const response = await api.get("/dogs/my-dogs");

      if (response.status === 200) {
        console.log("My dogs: " + JSON.stringify(response.data));
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching dogs", error);
    }
  };

  useEffect(() => {
    authenticateUser();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text>Initializing...</Text>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
};

export default AppInitializer;
