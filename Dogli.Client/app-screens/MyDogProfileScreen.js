import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import Button from "../components/Button";
import { uploadImage, fetchSingleImage } from "../services/firebaseStorage";
import { api } from "../services/api";
import CustomDateTimePicker from "../components/CustomDatePicker";
import PawBackground from "../components/PawBackground";
import { updateDogsInUserProfile } from "../services/storage";
import dogBreeds from "../services/dogBreeds";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const defaultImageUrl =
  "https://firebasestorage.googleapis.com/v0/b/dogli-app.appspot.com/o/dogs%2Fdefault-dog-picture.png?alt=media&token=6f3096ac-a38a-440b-bd86-3a072bba385f";

const nameValidator = (name) =>
  name.length === 0 ? "Name cannot be empty" : "";
const breedValidator = (breed) =>
  breed.length === 0 ? "Breed cannot be empty" : "";
const dateValidator = (date) =>
  date.length === 0 ? "Date cannot be empty" : "";
const weightValidator = (weight) =>
  weight !== "" && (!weight || isNaN(weight)) ? "Invalid weight" : "";

const MyDogProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dog = route.params?.dog || {};
  const [isNewDog, setIsNewDog] = useState(dog.id ? false : true);

  const [name, setName] = useState({ value: dog.name || "", error: "" });

  const [breed, setBreed] = useState({
    value: dog.breed || "other",
    error: "",
  });
  const [birthDate, setBirthDate] = useState({
    value: dog.birthDate?.split("T")[0] || "",
    error: "",
  });
  const [gender, setGender] = useState(dog.gender || "N/A");
  const [isSpayed, setIsSpayed] = useState(dog.isSpayedOrNeutered || false);
  const [description, setDescription] = useState({
    value: dog.description || "",
    error: "",
  });
  const [weight, setWeight] = useState({
    value: dog.weight && dog.weight > 0 ? Number(dog.weight) : "",
    error: "",
  });
  const [profileImageUrl, setProfileImageUrl] = useState(
    dog.profileImageUrl || defaultImageUrl
  );

  const [date, setDate] = useState(
    dog.birthDate ? new Date(dog.birthDate) : new Date()
  );
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);

  const breedsList = [...dogBreeds.getBaseBreedsList(), "other"];

  useEffect(() => {
    if (route.params?.image) {
      setProfileImageUrl(route.params.image);
    } else {
      loadDogImage();
    }
  }, [route.params?.image]);

  const loadDogImage = async () => {
    try {
      let id = route.params?.dog?.id || dog.id;
      if (!id) {
        console.debug("Dog id does not exist, showing default image");
        return;
      }
      const imagePath = `/dogs/${dog.id}/profile.jpg`;
      const url = await fetchSingleImage(imagePath);
      console.log("route url:", route.params?.image || route.params);
      if (url) {
        console.log("Dog's profile picture url:", url);
        setProfileImageUrl(url);
      } else {
        setProfileImageUrl(route.params?.image || defaultImageUrl);
      }
    } catch (error) {
      if (error.code === "storage/object-not-found") {
        console.log(
          "Dog's profile picture not found : 'storage/object-not-found'"
        );
        setProfileImageUrl(route.params?.image || defaultImageUrl);
      } else {
        console.error("Error fetching dog's profile picture:", error);
        setProfileImageUrl(route.params?.image || defaultImageUrl);
      }
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImageUrl(uri);
    }
  };

  const updateDogProfilePicture = async (url) => {
    try {
      const updatedDogData = { ...dog, profileImageUrl: url };
      await api.put(`/dogs/${dog.id}`, updatedDogData);
    } catch (error) {
      console.error("Error updating dog's profile picture:", error);
    }
  };

  const fetchAndUpdateUserDogs = async () => {
    try {
      const response = await api.get("/dogs/my-dogs");

      if (response.status === 200) {
        console.log("Updated dogs: " + JSON.stringify(response.data));
        await updateDogsInUserProfile(response.data);
      }
    } catch (error) {
      console.log("Error fetching and updating dogs", error);
    }
  };

  const handleSave = async () => {
    const nameError = nameValidator(name.value);
    const breedError = breedValidator(breed.value);
    const birthDateError = dateValidator(birthDate.value);
    const weightError = weightValidator(weight.value);

    if (nameError || breedError || birthDateError || weightError) {
      setName({ ...name, error: nameError });
      setBreed({ ...breed, error: breedError });
      setBirthDate({ ...birthDate, error: birthDateError });
      setWeight({ ...weight, error: weightError });
      return;
    }

    const dogData = {
      name: name.value,
      breed: breed.value,
      birthDate: birthDate.value,
      gender,
      isSpayedOrNeutered: isSpayed,
      description: description.value,
      profileImageUrl,
    };

    isNaN(weight.value) || weight.value <= 0
      ? (dogData.weight = -1)
      : (dogData.weight = weight.value);

    console.log("Dog data:", isSpayed, dogData);

    // *** Fetch random image of the breed if no image was uploaded ***
    if (profileImageUrl === defaultImageUrl && dog.id == undefined) {
      try {
        let imageResponse;
        if (breed.value !== "other") {
          console.debug("Fetching random image of breed:", breed.value);
          imageResponse = await dogBreeds.getRandomImageOfBreed(breed.value);
        } else {
          console.debug("Fetching random dog image");
          imageResponse = await dogBreeds.getRandomDog();
        }
        if (imageResponse.data.status === "success") {
          const newImageUrl = imageResponse.data.message;
          setProfileImageUrl(newImageUrl);
          dogData.profileImageUrl = newImageUrl;
        } else {
          const randomImageResponse = await dogBreeds.getRandomDog();
          if (randomImageResponse.data.status === "success") {
            const newImageUrl = randomImageResponse.data.message;
            setProfileImageUrl(newImageUrl);
            dogData.profileImageUrl = newImageUrl;
          }
        }
      } catch (error) {
        console.error("Error fetching random image:", error);
      }
    }

    try {
      if (dog.id) {
        await api.put(`/dogs/${dog.id}`, dogData);
      } else {
        var response = await api.post("/dogs/add", dogData);
        console.log("response.data: " + JSON.stringify(response.data));
        if (response.data.id) {
          dog.id = response.data.id;
          const storagePath = `/dogs/${response.data.id}/profile.jpg`;
          const downloadURL = await uploadImage(
            dogData.profileImageUrl,
            storagePath
          );
          const updatedDogData = {
            ...response.data,
            profileImageUrl: downloadURL,
          };
          await api.put(`/dogs/${dog.id}`, updatedDogData);
        }
      }
      await fetchAndUpdateUserDogs();
      navigation.navigate("AllDogsScreen");
    } catch (error) {
      console.error("Error saving dog", error.message);
    }
  };

  const formatDate = (date) => {
    return date.toISOString().slice(0, 10); // Format the date as YYYY-MM-DD
  };

  return (
    <View style={styles.dogProfileScreen}>
      <ScrollView style={{ flex: 1, marginTop: 30 }}>
        {isNewDog && <Text style={styles.title}>Add a new dog</Text>}
        <Pressable onPress={pickImage}>
          <Image
            style={[styles.profileImage, isNewDog && { marginTop: 20 }]}
            source={{ uri: profileImageUrl }}
          />
          <Text style={styles.uploadText}>
            Edit Picture <Icon name="image-edit-outline" size={25}></Icon>
          </Text>
        </Pressable>
        <View style={styles.formContainer}>
          <Text style={styles.label} nativeID="dogNameLabel">
            Name:
          </Text>
          <TextInput
            aria-label="input"
            aria-labelledby="dogNameLabel"
            style={styles.input}
            placeholder="Dog Name"
            value={name.value}
            onChangeText={(text) => setName({ value: text, error: "" })}
          />
          {name.error ? (
            <Text style={styles.errorText}>{name.error}</Text>
          ) : null}
          <Text style={styles.label} nativeID="breedLabel">
            Breed:
          </Text>
          <View style={styles.breedPickerContainer}>
            <Picker
              style={styles.pickerStyles}
              mode="dropdown"
              selectedValue={breed.value}
              onValueChange={(itemValue, itemIndex) =>
                setBreed({ value: itemValue, error: "" })
              }
            >
              {breedsList.map((breedName) => (
                <Picker.Item
                  label={breedName}
                  value={breedName}
                  key={breedName}
                />
              ))}
            </Picker>
          </View>
          {breed.error ? (
            <Text style={styles.errorText}>{breed.error}</Text>
          ) : null}

          <View style={styles.pickerContainer}>
            <Text style={styles.label} nativeID="birthDateLabel">
              Date of Birth{" "}
              <Text style={{ fontSize: 12, color: "#8B6453" }}>
                (YYYY-MM-DD)
              </Text>{" "}
              :
            </Text>
            <CustomDateTimePicker
              aria-label="input"
              aria-labelledby="birthDateLabel"
              date={date}
              mode={mode}
              show={show}
              onChange={(event, selectedDate) => {
                const currentDate = selectedDate || date;
                setShow(false);
                setDate(currentDate);
                const selectedBirthDate = formatDate(currentDate);
                setBirthDate({ value: selectedBirthDate, error: "" });
                console.log(`Selected birth date : ${selectedBirthDate}`);
              }}
              onShowMode={(currentMode) => {
                setShow(true);
                setMode(currentMode);
              }}
            />
          </View>
          {birthDate.error ? (
            <Text style={styles.errorText}>{birthDate.error}</Text>
          ) : null}

          <Text style={styles.label} nativeID="weightLabel">
            Weight:
          </Text>
          <TextInput
            aria-label="input"
            aria-labelledby="weightLabel"
            style={styles.input}
            placeholder="Weight (In Kilos)"
            value={weight.value === "" ? "" : weight.value.toString()}
            onChangeText={(text) => setWeight({ value: text, error: "" })}
          />
          {weight.error ? (
            <Text style={styles.errorText}>{weight.error}</Text>
          ) : null}

          <View style={styles.genderContainer}>
            <Text style={styles.label}>Gender: </Text>
            <Pressable
              style={[
                styles.genderButton,
                gender === "Male" && styles.selectedButton,
              ]}
              onPress={() => setGender("Male")}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  gender === "Male" && styles.selectedButtonText,
                ]}
              >
                Male
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.genderButton,
                gender === "Female" && styles.selectedButton,
              ]}
              onPress={() => setGender("Female")}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  gender === "Female" && styles.selectedButtonText,
                ]}
              >
                Female
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.genderButton,
                gender === "N/A" && styles.selectedButton,
              ]}
              onPress={() => setGender("N/A")}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  gender === "N/A" && styles.selectedButtonText,
                ]}
              >
                N/A
              </Text>
            </Pressable>
          </View>

          <View style={styles.spayedContainer}>
            <Text style={styles.label}>Spayed/Neutered: </Text>
            <Pressable
              style={[
                styles.spayedButton,
                isSpayed === true && styles.selectedButton,
              ]}
              onPress={() => setIsSpayed(true)}
            >
              <Text
                style={[
                  styles.spayedButtonText,
                  isSpayed === true && styles.selectedButtonText,
                ]}
              >
                Yes
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.spayedButton,
                isSpayed === false && styles.selectedButton,
              ]}
              onPress={() => setIsSpayed(false)}
            >
              <Text
                style={[
                  styles.spayedButtonText,
                  isSpayed === false && styles.selectedButtonText,
                ]}
              >
                No
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.spayedButton,
                isSpayed === null && styles.selectedButton,
              ]}
              onPress={() => setIsSpayed(null)}
            >
              <Text
                style={[
                  styles.spayedButtonText,
                  isSpayed === null && styles.selectedButtonText,
                ]}
              >
                N/A
              </Text>
            </Pressable>
          </View>

          <Text style={styles.label} nativeID="descriptionLabel">
            A Few Words About Your Dog...
          </Text>
          <TextInput
            aria-label="input"
            aria-labelledby="descriptionLabel"
            style={[styles.input, { lineHeight: 20 }]}
            multiline={true}
            placeholder="Josh is the COOLEST POODLE in town, just let him a chance and he'll prove that to you ;)"
            value={description.value}
            onChangeText={(text) => setDescription({ value: text, error: "" })}
          />
          {description.error ? (
            <Text style={styles.errorText}>{description.error}</Text>
          ) : null}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              style={styles.saveButton}
              onPress={handleSave}
            >
              Save
            </Button>
            <Button
              mode="contained"
              style={styles.cancelButton}
              onPress={() => navigation.navigate("AllDogsScreen")}
            >
              Cancel
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  dogProfileScreen: {
    flex: 1,
    backgroundColor: "#FFF5F5",
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8B4513",
    textAlign: "center",
    marginVertical: 10,
    paddingTop: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 60,
    alignSelf: "center",
    marginTop: 30,
    marginBottom: 5,
  },
  uploadText: {
    textAlign: "center",
    // color: "#007AFF",
    marginBottom: 15,
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  formContainer: {
    // flexDirection: "column",
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
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  genderButton: {
    flex: 1,
    padding: 12,
    borderRadius: 25,
    backgroundColor: "#E8E8E8",
    alignItems: "center",
    marginHorizontal: 5,
  },
  genderButtonText: {
    color: "#666",
    fontSize: 13,
    textAlign: "center",
  },
  spayedContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  spayedButton: {
    flex: 1,
    padding: 12,
    borderRadius: 25,
    backgroundColor: "#E8E8E8",
    alignItems: "center",
    marginHorizontal: 5,
  },
  spayedButtonText: {
    color: "#666",
    fontSize: 13,
    textAlign: "center",
  },
  selectedButton: {
    backgroundColor: "#8B4513",
  },
  selectedButtonText: {
    color: "#FFF",
  },
  errorText: {
    color: "#ff0000",
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
  },
  pickerContainer: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "start",
    marginTop: 10,
    marginBottom: 10,
  },
  breedPickerContainer: {
    // flex: 1,
    // padding: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 20,
    width: "50%",
  },
  pickerStyles: {
    // flex: 1,
    width: "100%",
    // borderColor: "#CCC",
    // borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "white",
    color: "#000",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "rgba(214, 61, 57, 1)",
  },
  saveButton: {
    // width: "50%",
    marginHorizontal: 20,
    flex: 3,
    backgroundColor: "#E4BE72",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});

export default MyDogProfileScreen;
