import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { fetchSingleImage, uploadImage } from "../services/firebaseStorage";
import {
  getUserProfile,
  updateUserProfileKeyValuePair,
} from "../services/storage";
import { api } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicon from "react-native-vector-icons/Ionicons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const defaultImageUrl =
  "https://firebasestorage.googleapis.com/v0/b/dogli-app.appspot.com/o/users%2Fmale-default-profile-image.png?alt=media&token=c5f87ee0-1dc8-411f-999c-3b7187c213f7";

const UserProfileScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    fullName: { value: "", error: "" },
    city: { value: "", error: "" },
    age: { value: "", error: "" },
    birthDate: { value: "", error: "" },
    phoneNumber: { value: "", error: "" },
  });
  const [gender, setGender] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState(defaultImageUrl);
  const [userId, setUserId] = useState(null);
  const [imageChange, setImageChange] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthDate, setBirthDate] = useState(new Date());

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userProfileData = await getUserProfile();
      if (userProfileData) {
        console.log("User profile data:", userProfileData);
        const parsedProfile = JSON.parse(userProfileData);
        setUserId(parsedProfile.id);
        setProfile({
          fullName: { value: parsedProfile.fullName || "", error: "" },
          city: { value: parsedProfile.city || "Tel Aviv", error: "" },
          age: { value: parsedProfile.age?.toString() || "25", error: "" },
          birthDate: { value: parsedProfile.birthdate || "", error: "" },
          phoneNumber: { value: parsedProfile.phoneNumber || "", error: "" },
        });
        setGender(parsedProfile.gender || "");
        setProfileImageUrl(parsedProfile.profileImageUrl || defaultImageUrl);
      }
    } catch (error) {
      console.log("Error loading profile:", error);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
      setProfile({
        ...profile,
        birthDate: {
          value: selectedDate.toISOString().slice(0, 10),
          error: "",
        },
      });
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImageUrl(uri);
      setImageChange(true);
    }
  };

  const nameValidator = (name) => {
    if (!name || name.length <= 0) return "Name can't be empty.";
    return "";
  };

  const cityValidator = (city) => {
    if (!city || city.length <= 0) return "City can't be empty.";
    return "";
  };

  const ageValidator = (age) => {
    if (!age || age.length <= 0) return "Age can't be empty.";
    const numAge = parseInt(age);
    if (isNaN(numAge) || numAge <= 0 || numAge > 120)
      return "Please enter a valid age.";
    return "";
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toISOString().slice(0, 10); // Format the date as YYYY-MM-DD
  };

  const handleSave = async () => {
    if (loading) return;
    const nameError = nameValidator(profile.fullName.value);
    const cityError = cityValidator(profile.city.value);
    const ageError = ageValidator(profile.age.value);

    if (nameError || cityError || ageError) {
      setProfile({
        ...profile,
        fullName: { ...profile.fullName, error: nameError },
      });
      return;
    }

    const userData = {
      fullName: profile.fullName.value,
      gender,
      birthdate: profile.birthDate?.value,
      phoneNumber: profile.phoneNumber?.value,
    };

    setLoading(true); 

    try {
      if (userId) {
        const response = await api.put(`/users/profile`, userData);
        console.log("response status: ", response.status);

        if (
          response.status == 200 &&
          profileImageUrl !== response.data.profileImageUrl
        ) {
          const storagePath = `/users/${userId}/profile.jpg`;
          const downloadURL = await uploadImage(profileImageUrl, storagePath);

          const updatedUserData = {
            ...response.data,
            profileImageUrl: downloadURL,
          };
          setProfileImageUrl(downloadURL);
          const imageResponse = await api.put(
            `/users/profile`,
            updatedUserData
          );
          if (imageResponse.status == 200) {
            console.log("Image updated successfully with URL: ", downloadURL);
            console.log("Image response: ", imageResponse.data);
            await updateUserProfileKeyValuePair("profileImageUrl", downloadURL);
            let updatedProfile = await getUserProfile();
            console.log("Updated profile: ", updatedProfile);
          }
        }
        if (response.status == 200) {
          Alert.alert("Profile updated successfully.");
          await updateUserProfileKeyValuePair(
            "fullName",
            profile.fullName.value
          );
          await updateUserProfileKeyValuePair(
            "birthdate",
            formatDate(new Date(profile.birthDate?.value))
          );
          await updateUserProfileKeyValuePair(
            "phoneNumber",
            profile.phoneNumber.value
          );
          navigation.goBack();
        }
      } else {
        throw new Error("User ID not found.");
      }
    } catch (error) {
      console.log("Error while updating profile: ", error.message);
      Alert.alert("Error updating profile: ", error.message);
    } finally {
      setLoading(false); 
      navigation.navigate("MainScreen");
    }
  };

  const handleContentLayout = () => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading Profile...</Text>
        </View>
      )}
      <ScrollView onLayout={handleContentLayout}>
        <View style={styles.additionalActions}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicon name="arrow-back-circle" size={35} />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>My Profile</Text>

        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          <Image
            source={{ uri: profileImageUrl }}
            style={styles.profileImage}
          />
          <Text style={styles.editPhotoText}>
            Edit Picture<Icon name="image-edit-outline" size={25}></Icon>
          </Text>
        </TouchableOpacity>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={[styles.input, profile.fullName.error && styles.errorInput]}
            value={profile.fullName.value}
            onChangeText={(text) =>
              setProfile({
                ...profile,
                fullName: { value: text, error: "" },
              })
            }
            placeholder="Enter your full name"
          />
          {profile.fullName.error ? (
            <Text style={styles.errorText}>{profile.fullName.error}</Text>
          ) : null}
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderContainer}>
            {["Male", "Female", "Other"].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.genderButton,
                  gender === option.toLowerCase() && styles.selectedGender,
                ]}
                onPress={() => setGender(option.toLowerCase())}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === option.toLowerCase() &&
                      styles.selectedGenderText,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Birth Date</Text>
          <TouchableOpacity
            style={[
              styles.input,
              profile.birthDate?.error && styles.errorInput,
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              style={
                profile.birthDate?.value
                  ? styles.dateText
                  : styles.placeholderText
              }
            >
              {profile.birthDate?.value || "Select birth date"}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={birthDate}
              mode="date"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
          {profile.birthDate?.error ? (
            <Text style={styles.errorText}>{profile.birthDate.error}</Text>
          ) : null}
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[
              styles.input,
              profile.phoneNumber?.error && styles.errorInput,
            ]}
            value={profile.phoneNumber?.value}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, "");
              setProfile({
                ...profile,
                phoneNumber: { value: cleaned, error: "" },
              });
            }}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            maxLength={10}
          />
          {profile.phoneNumber?.error ? (
            <Text style={styles.errorText}>{profile.phoneNumber?.error}</Text>
          ) : null}
          <Text style={styles.label}>City</Text>
          <TextInput
            style={[styles.input, profile.city.error && styles.errorInput]}
            value={profile.city.value}
            onChangeText={(text) =>
              setProfile({
                ...profile,
                city: { value: text, error: "" },
              })
            }
            placeholder="Enter your city"
          />
          {profile.city.error ? (
            <Text style={styles.errorText}>{profile.city.error}</Text>
          ) : null}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8B4513",
    textAlign: "center",
    marginVertical: 20,
    paddingTop: 30,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    // marginBottom: 1,
  },
  editPhotoText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    color: "#8B4513",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    fontSize: 16,
  },
  errorInput: {
    borderColor: "#ff0000",
  },
  errorText: {
    color: "#ff0000",
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
  },
  genderContainer: {
    flexDirection: "row",
    marginBottom: 16,
    justifyContent: "space-between",
  },
  genderButton: {
    flex: 1,
    padding: 12,
    borderRadius: 25,
    backgroundColor: "#E8E8E8",
    alignItems: "center",
    marginHorizontal: 5,
  },
  selectedGender: {
    backgroundColor: "#8B4513",
  },
  genderText: {
    color: "#666",
    fontSize: 16,
  },
  selectedGenderText: {
    color: "white",
  },
  saveButton: {
    backgroundColor: "#DEB887",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 16,
    color: "#000",
  },
  placeholderText: {
    fontSize: 16,
    color: "#666",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  additionalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    position: "absolute",
    top: 30,
    left: 4,
    right: 0,
    zIndex: 1,
  },
  backButton: {
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    zIndex: 1,
  },
});

export default UserProfileScreen;
