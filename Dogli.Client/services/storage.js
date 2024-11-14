import AsyncStorage from "@react-native-async-storage/async-storage";

const storeAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem("@auth_token", token);
  } catch (error) {
    console.error("Error storing token", error);
  }
};

const storeUserId = async (userId) => {
  try {
    await AsyncStorage.setItem("@userId", userId);
    console.log(`Stored user id: '${userId}'`);
  } catch (error) {
    console.error("Error storing user id", error);
  }
};

const getUserId = async () => {
  try {
    const userId = await AsyncStorage.getItem("@userId");
    return userId;
  } catch (error) {
    console.error("Error retrieving user id", error);
  }
};

const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem("@auth_token");
    return token;
  } catch (error) {
    console.error("Error retrieving token", error);
  }
};

const getUserProfile = async () => {
  try {
    const userProfile = await AsyncStorage.getItem("@userProfile");
    return userProfile;
  } catch (error) {
    console.error("Error retrieving user profile", error);
  }
};

const checkStorageContent = async () => {
  const userProfile = await AsyncStorage.getItem("@userProfile");
  console.log("Raw storage content:", userProfile);
  console.log("Parsed content:", JSON.parse(userProfile));
};

const updateUserProfileKeyValuePair = async (keyName, value) => {
  try {
    var userProfile = await getUserProfile();
    var userProfileJson = JSON.parse(userProfile);
    userProfileJson[keyName] = value;
    await AsyncStorage.setItem("@userProfile", JSON.stringify(userProfileJson));
  } catch (error) {
    console.log("Error updating user profile key-value pair", error.message);
  }
};

const updateUserProfileProperty = async (keyName, originalValue) => {
  try {
    var userProfile = await getUserProfile();
    var userProfileJson = JSON.parse(userProfile);
    userProfileJson[keyName] = JSON.stringify(originalValue);
    await AsyncStorage.setItem("@userProfile", JSON.stringify(userProfileJson));
  } catch (error) {
    console.log("Error updating user profile property", error.message);
  }
};

const updateDogsInUserProfile = async (dogs) => {
  try {
    console.log("Updating the following dogs in user profile: ", dogs);
    await updateUserProfileProperty("dogs", dogs);
    console.log("Dogs updated in user profile.");
  } catch (error) {
    console.error("Error updating dogs in user profile", error);
  }
};

const addDogToUserProfile = async (dog) => {
  try {
    var userProfile = await getUserProfile();
    var userProfileJson = JSON.parse(userProfile);
    var dogs = userProfileJson.dogs || [];
    dogs.push(dog);
    await updateDogsInUserProfile(dogs);
    console.log("The following dog was added to user profile: ", dog);
  } catch (error) {
    console.error("Error adding dog to user profile", error);
  }
};

const removeValue = async (keyName) => {
  try {
    if (
      keyName === undefined ||
      keyName === null ||
      typeof keyName !== "string"
    ) {
      throw new Error("Key name is missing or not a string");
    }
    await AsyncStorage.removeItem(keyName);
    console.log(keyName + " Removed.");
  } catch (e) {
    console.error("Failed to remove value:", e.message);
  }
};

const getAllKeys = async () => {
  var keys = [];
  try {
    keys = await AsyncStorage.getAllKeys();
  } catch (e) {
    console.log("Error getting all keys", e);
  }
  return keys || [];
};

const clearUserData = async () => {
  try {
    var storedKeys = [];
    storedKeys = await getAllKeys();
    if (storedKeys?.length === 0) {
      return;
    } else {
      var userKeys = ["@userProfile", "@auth_token", "@userId"];
      console.debug("Removing user data...");

      await AsyncStorage.multiRemove(userKeys);
      var remainedKeys = await AsyncStorage.getAllKeys();
      console.debug("Remained keys: ", remainedKeys);
    }
  } catch (error) {
    console.log("Failed to remove user data. ", error);
  }
};

export {
  storeAuthToken,
  getAuthToken,
  getUserProfile,
  getAllKeys,
  removeValue,
  storeUserId,
  getUserId,
  clearUserData,
  updateDogsInUserProfile,
  updateUserProfileProperty,
  checkStorageContent,
  updateUserProfileKeyValuePair,
};
