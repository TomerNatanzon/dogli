import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ImageBackground,
  SafeAreaView,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import checkinService from "../services/FirebaseCheckInService";
import { getUserProfile } from "../services/storage";
import BackButton from "../components/BackButton";
import checkInDataTemplate from "../models/checkInDataTemplate";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";

const defaultImageUrl =
  "https://firebasestorage.googleapis.com/v0/b/dogli-app.appspot.com/o/users%2Fmale-default-profile-image.png?alt=media&token=c5f87ee0-1dc8-411f-999c-3b7187c213f7";

const FemaleDefaultImageUrl =
  "https://firebasestorage.googleapis.com/v0/b/dogli-app.appspot.com/o/users%2Ffemale-default-profile-image.png?alt=media&token=c5f87ee0-1dc8-411f-999c-3b7187c213f7";

const DogDefaultImageUrl =
  "https://firebasestorage.googleapis.com/v0/b/dogli-app.appspot.com/o/dogs%2Fdefault-dog-picture.png?alt=media&token=6f3096ac-a38a-440b-bd86-3a072bba385f";

const CheckInScreen = ({ navigation, route }) => {
  const [park, setPark] = useState(route.params || {});
  const [activeCheckins, setActiveCheckins] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedDog, setSelectedDog] = useState(null);
  const [step, setStep] = useState(1);
  const [arrivalInMinutes, setArrivalInMinutes] = useState(10);
  const [leavingInMinutes, setLeavingInMinutes] = useState(40);
  const [modalVisible, setModalVisible] = useState(false);
  const [dogSelectionModalVisible, setDogSelectionModalVisible] =
    useState(false);
  const [immediateCheckIn, setImmediateCheckIn] = useState(true);
  const [dogCount, setDogCount] = useState("");
  const [checkOutModalVisible, setCheckOutModalVisible] = useState(false);
  const [activeCheckIn, setActiveCheckIn] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    loadCheckins();
    fetchParkStatus();
  }, []);

  useEffect(() => {
    if (userProfile) {
      checkForActiveCheckIn();
    }
  }, [userProfile, activeCheckins]);

  const checkForActiveCheckIn = () => {
    if (userProfile && activeCheckins.length > 0) {
      const userActiveCheckIn = activeCheckins.find(
        (checkin) =>
          checkin.userId === userProfile.id && checkin.status === "active"
      );
      setActiveCheckIn(userActiveCheckIn || null);
    } else {
      setActiveCheckIn(null);
    }
  };
  // test above

  const fetchUserProfile = async () => {
    const profile = await getUserProfile();
    setUserProfile(JSON.parse(profile));
  };

  const loadCheckins = async () => {
    setIsLoading(true);
    try {
      const checkins = await checkinService.getActiveCheckins(park.id);
      const sortedCheckins = checkins.sort(
        (a, b) => b.arrivalTime.toDate() - a.arrivalTime.toDate()
      );
      setActiveCheckins(sortedCheckins);
    } catch (error) {
      console.log("Error loading check-ins:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParkStatus = async () => {
    try {
      const status = await checkinService.getParkStatus(park.id);
      if (status && status.lastUpdateTime) {
        Alert.alert(
          "Park Status",
          `Last updated: ${status.lastUpdateTime
            .toDate()
            .toLocaleString()}\nDogs in park: ${status.dogCount || "Unknown"}`
        );
      }
    } catch (error) {
      console.log("Error fetching park status:", error);
    }
  };

  const handleConfirm = async () => {
    if (!selectedDog) {
      Alert.alert("Error", "Please select a dog for check-in.");
      return;
    }

    try {
      const arrivalTime = immediateCheckIn
        ? new Date()
        : new Date(Date.now() + arrivalInMinutes * 60000);
      const leavingTime = new Date(
        arrivalTime.getTime() + leavingInMinutes * 60000
      );

      const checkInData = { ...checkInDataTemplate };
      checkInData.userId = userProfile.id;
      checkInData.userFullName = userProfile.fullName || "Haim";
      checkInData.userProfileImageUrl =
        userProfile.profileImageUrl || userProfile.gender === "male"
          ? defaultImageUrl
          : FemaleDefaultImageUrl;
      checkInData.dogProfileImageUrl =
        selectedDog.profileImageUrl || DogDefaultImageUrl;
      checkInData.dogId = selectedDog.id;
      checkInData.dogName = selectedDog.name || "Rex";
      checkInData.dogBreed = selectedDog.breed || "Bulldog";
      checkInData.dogSize = selectedDog.size || "Medium";
      checkInData.dogGender = selectedDog.gender || "Unknown";
      checkInData.dogSpayedNeutered = selectedDog.IsSpayedOrNeutered || false;
      checkInData.arrivalTime = arrivalTime;
      checkInData.leavingTime = leavingTime;
      checkInData.status = immediateCheckIn ? "active" : "scheduled";
      checkInData.createdAt = new Date();
      checkInData.parkLocation = {
        latitude: park.latitude,
        longitude: park.longitude,
      };

      const checkinId = await checkinService.checkIn(park.id, checkInData);

      if (!immediateCheckIn) {
        const reminderTime = new Date(arrivalTime.getTime() - 15 * 60000); // 15 minutes before arrival
        console.log("Checkin data:", checkInData);

        await checkinService.addReminder(
          park.id,
          checkInData.userId,
          checkinId,
          reminderTime > arrivalTime ? reminderTime : arrivalTime
        );
      }

      Alert.alert(
        "Success",
        immediateCheckIn
          ? "You have successfully checked in!"
          : "Your future visit has been scheduled!"
      );
      loadCheckins();
    } catch (error) {
      Alert.alert(
        "Error while checking in",
        error.message || "Failed to check in. Please try again."
      );
    } finally {
      setModalVisible(false);
      setStep(1);
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkinService.checkOut(
        park.id,
        activeCheckIn.id,
        parseInt(dogCount) || null
      );
      Alert.alert("Success", "You have successfully checked out!");
      setCheckOutModalVisible(false);
      loadCheckins();
    } catch (error) {
      Alert.alert("Error", "Failed to check out. Please try again.");
    }
  };

  const renderCheckOutButton = () => {
    if (activeCheckIn) {
      return (
        <TouchableOpacity
          style={styles.checkOutButton}
          onPress={() => setCheckOutModalVisible(true)}
        >
          <Text style={styles.checkOutButtonText}>Check Out</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderCheckOutModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={checkOutModalVisible}
      onRequestClose={() => setCheckOutModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Check Out</Text>
          <Text>How many dogs were at the park when you left?</Text>
          <TextInput
            style={styles.input}
            onChangeText={setDogCount}
            value={dogCount}
            keyboardType="numeric"
            placeholder="Number of dogs (optional)"
          />
          <TouchableOpacity style={styles.button} onPress={handleCheckOut}>
            <Text style={styles.buttonText}>Confirm Check Out</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ ...styles.button, backgroundColor: "red" }}
            onPress={() => setCheckOutModalVisible(false)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderCheckIn = ({ item }) => (
    <View style={styles.checkInItem}>
      <Image
        source={
          item.dogProfileImageUrl
            ? { uri: item.dogProfileImageUrl }
            : { uri: DogDefaultImageUrl }
        }
        style={styles.dogCheckinImage}
      />
      <Image
        source={
          item.profileImageUrl
            ? { uri: item.userProfileImageUrl }
            : { uri: defaultImageUrl }
        }
        style={styles.userCheckinImage}
      />
      <View style={styles.checkInInfo}>
        <Text style={styles.userName}>{item.userFullName}</Text>
        <Text>
          {item.dogName} -{" "}
          {item.dogBreed === "other"
            ? "poodle"
            : item.dogBreed === "string"
            ? "beagle"
            : item.dogBreed}
        </Text>
        <Text style={{ color: "#3E3CBE", fontWeight: "bold", fontSize: 12 }}>
          {new Date(item.arrivalTime.toDate()).toLocaleTimeString([], {
            timeStyle: "short",
          })}
          {" - " +
            item.leavingTime
              .toDate()
              .toLocaleTimeString([], { timeStyle: "short" })}
          ,{" "}
          {new Date(item.arrivalTime.toDate()).toLocaleDateString() ==
          new Date().toLocaleDateString()
            ? " Today "
            : new Date(item.arrivalTime.toDate()).toLocaleDateString("en-GB")}
        </Text>
      </View>
      <View
        style={[
          styles.statusDot,
          {
            backgroundColor:
              item.status === "active"
                ? "green"
                : item.status === "completed"
                ? "red"
                : "orange",
          },
        ]}
      />
    </View>
  );

  const renderDogSelectionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={dogSelectionModalVisible}
      onRequestClose={() => setDogSelectionModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select a Dog</Text>
          <FlatList
            data={userProfile?.dogs || []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dogOption}
                onPress={() => {
                  setSelectedDog(item);
                  setDogSelectionModalVisible(false);
                  setStep(2);
                }}
              >
                <Image
                  source={{ uri: item.profileImageUrl || defaultImageUrl }}
                  style={styles.dogImage}
                />
                <Text style={styles.dogName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setDogSelectionModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderStep1 = () => (
    <>
      <FlatList
        data={activeCheckins}
        renderItem={renderCheckIn}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text
            style={{
              fontSize: 16,
              fontWeight: "semi-bold",
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            No Checkins yet. Be the first to check-in!
          </Text>
        }
      />
      <View
        style={{ alignSelf: "center", flexDirection: "row", marginBottom: 15 }}
      >
        <TouchableOpacity
          style={styles.checkInButton}
          onPress={() => setDogSelectionModalVisible(true)}
        >
          <Text style={{ ...styles.buttonText, paddingHorizontal: 5 }}>
            <MaterialIcon name="schedule" size={20} /> Check-in with your dog
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 15, fontWeight: "bold", color: "brown" }}>
          {immediateCheckIn ? "Checking in now" : "I am arriving in"}
        </Text>
        {!immediateCheckIn && (
          <View style={styles.timePickerContainer}>
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() =>
                setArrivalInMinutes((prev) => Math.max(prev - 5, 0))
              }
            >
              <Text
                style={{ fontSize: 17, fontWeight: "bold", color: "brown" }}
              >
                -
              </Text>
            </TouchableOpacity>
            <Text style={styles.timePickerValue}>{arrivalInMinutes} min</Text>
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => setArrivalInMinutes((prev) => prev + 5)}
            >
              <Text
                style={{ fontSize: 17, fontWeight: "bold", color: "brown" }}
              >
                +
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Text
          style={{
            fontSize: 15,
            fontWeight: "bold",
            color: "brown",
            marginTop: 20,
          }}
        >
          I am staying for
        </Text>
        <View style={styles.timePickerContainer}>
          <TouchableOpacity
            style={styles.timePickerButton}
            onPress={() =>
              setLeavingInMinutes((prev) =>
                Math.max(prev - 5, immediateCheckIn ? 5 : arrivalInMinutes)
              )
            }
          >
            <Text style={{ fontSize: 17, fontWeight: "bold", color: "brown" }}>
              -
            </Text>
          </TouchableOpacity>
          <Text style={styles.timePickerValue}>{leavingInMinutes} min</Text>
          <TouchableOpacity
            style={styles.timePickerButton}
            onPress={() => setLeavingInMinutes((prev) => prev + 5)}
          >
            <Text style={{ fontSize: 17, fontWeight: "bold", color: "brown" }}>
              +
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm!</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/background-paw.png")}
        style={{
          flex: 1,
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
        resizeMode="cover"
      >
        <View style={styles.containerHeader}>
          <BackButton goBack={() => navigation.goBack()} />
          <Image
            source={require("../assets/dog-park-sample.jpg")}
            style={styles.parkImage}
          />
          <Text style={styles.parkName}>{park.name}</Text>
          <Text>{park.address}</Text>
          <Text style={{ marginLeft: 8, fontSize: 16, color: "#757575" }}>
            <Icon name="location-outline" size={16} color="#666" />
            {park.distance < 1000
              ? `${park.distance.toFixed(2)} meters away`
              : `${(park.distance / 1000).toFixed(2)} km away`}
          </Text>
        </View>
        {isLoading ? (
          <View style={{ flex: 1, alignSelf: "center" }}>
            <Text style={{ fontWeight: "bold" }}>Loading check-ins...</Text>
          </View>
        ) : (
          <>
            {activeCheckIn ? (
              <View style={{ marginTop: 20, flex: 1 }}>
                <Text style={styles.activeCheckInText}>
                  You are currently checked in
                </Text>
                {renderCheckOutButton()}
                <ScrollView>
                  <FlatList
                    data={activeCheckins}
                    scrollEnabled={false}
                    renderItem={renderCheckIn}
                    keyExtractor={(item) => item.id.toString()}
                  />
                </ScrollView>
              </View>
            ) : (
              <>
                {step === 1 && (
                  <TouchableOpacity
                    style={styles.reloadButton}
                    onPress={loadCheckins}
                  >
                    <Text style={styles.reloadButtonText}>
                      Reload Check-ins <Icon name="refresh" size={20}></Icon>
                    </Text>
                  </TouchableOpacity>
                )}
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
              </>
            )}
          </>
        )}
        {renderDogSelectionModal()}
        {renderCheckOutModal()}
        {step === 2 && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setImmediateCheckIn(!immediateCheckIn)}
          >
            <Text style={styles.toggleButtonText}>
              {immediateCheckIn ? "Schedule Future Visit" : "Check In Now"}
            </Text>
          </TouchableOpacity>
        )}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  containerHeader: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 16,
  },
  parkImage: {
    width: "80%",
    height: 200,
    marginTop: 50,
    borderRadius: 10,
  },
  parkName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
    color: "brown",
  },
  checkInItem: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    width: "80%",
    marginBottom: 10,
    padding: 10,
    borderRadius: 30,
    backgroundColor: "#ccc",
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userCheckinImage: {
    width: 30,
    height: 30,
    borderRadius: 30,
    marginLeft: 5,
    borderWidth: 1,
    borderColor: "white",
  },
  dogCheckinImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "white",
  },
  checkInInfo: {
    marginLeft: 10,
    flex: 1,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 15,
  },
  statusDot: {
    width: 15,
    height: 15,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  checkInButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  dogOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  dogImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  dogName: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#ccc",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  timePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  timePickerButton: {
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  timePickerValue: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    width: "100%",
  },
  checkOutButton: {
    marginHorizontal: 20,
  },
  checkOutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  toggleButton: {
    backgroundColor: "#4169E1",
    padding: 10,
    borderRadius: 10,
    alignSelf: "center",
    alignItems: "center",
    width: "70%",
    marginTop: 15,
    marginHorizontal: 20,
  },
  toggleButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  reloadButton: {
    width: "40%",
    backgroundColor: "#fff",
    padding: 5,
    borderRadius: 10,
    borderColor: "#4CAF50",
    borderWidth: 2,
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 15,
    marginHorizontal: 20,
  },
  reloadButtonText: {
    color: "#4CAF50",
    // fontSize: 15,
    fontWeight: "bold",
  },
  activeCheckInContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  activeCheckInText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "center",
  },
  checkOutButton: {
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    alignSelf: "center",
    marginVertical: 10,
  },
  checkOutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CheckInScreen;
