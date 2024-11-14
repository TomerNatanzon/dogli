import { api } from "./api";
import {
  storeAuthToken,
  getAuthToken,
  storeUserId,
  clearUserData,
} from "./storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const signIn = async (email, password) => {
  try {
    const response = await api.post("/users/login", { email, password });
    const { token, id } = response.data;
    await storeUserId(id);
    await storeAuthToken(token);

    if (token && id) {
      const res = await api.get("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        console.log("Fetching UserProfile succeeded\n", res.data);
        let userId = id;
        const dogs = await fetchUserDogs();

        let userProfile = { ...res.data, id: userId, dogs: dogs || [] };
        console.log("User profile: ", JSON.stringify(userProfile));
        await AsyncStorage.setItem("@userProfile", JSON.stringify(userProfile));
      }
    }

    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      await clearUserData();
      const errorMessage =
        error.response.data || "Unauthorized: " + error.message;
      throw new Error(errorMessage);
    } else {
      throw new Error("Error signing in: " + error.message);
    }
  }
};

const signUp = async (username, email, password, fullName) => {
  try {
    const response = await api.post(
      "/users/register",
      {
        username: username,
        email: email,
        password: password,
        fullName: fullName,
      }
    );
    const { token } = response.data;
    return response.data;
  } catch (error) {
    var errorMessage = error.message;
    if (error.response && error.response.status === 400) {
      errorMessage = error.response.data || errorMessage;
      console.log(
        "Request failed with status code 400. Error message: " + errorMessage
      );
      throw new Error(errorMessage);
    } else if (error.response && error.response.status === 405) {
      errorMessage = error.response.data || errorMessage;
      console.log(
        "Request failed with status code 405. Make sure that the request url is correct." +
          errorMessage
      );
      throw new Error(errorMessage);
    } else {
      throw new Error("Error signing up: " + errorMessage);
    }
  }
};

const getUsernames = async () => {
  try {
    const response = await api.get("/users/usernames");
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      const errorMessage =
        error.response.data || "Bad Request: " + error.message;
      throw new Error(errorMessage);
    } else {
      throw new Error("Error fetching usernames: " + error.message);
    }
  }
};

const fetchUserDogs = async () => {
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

export { signIn, signUp, getUsernames };
