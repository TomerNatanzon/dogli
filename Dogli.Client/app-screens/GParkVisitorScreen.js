import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Linking,
  ScrollView,
} from "react-native";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import BackButton from "../components/BackButton";
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  listAll,
} from "firebase/storage";
import { storage } from "../firebaseConfiguration";
import Header from "../components/Header";
import Icon from "react-native-vector-icons/MaterialIcons";
import moment from "moment";
import checkinService from "../services/FirebaseCheckInService";
import { BarChart, PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import CrowdedHoursGraph from "../components/CrowdedHoursGraph";

const DEFAULT_PARK_IMAGES = [
  "https://img.freepik.com/free-photo/dog-playing-with-ball-park_23-2147902137.jpg",
  "https://images.unsplash.com/photo-1667230228326-c881966e2a29?q=80&w=2071&auto=format&fit=crop",
  "https://www.cosumnescsd.gov/ImageRepository/Document?documentID=17054",
];

const GParkVisitorScreen = ({ navigation, route }) => {
  const park = route.params.parkData || {};
  const [parkDetails, setParkDetails] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [userName, setUserName] = useState("Emily_g");
  const [checkinData, setCheckinData] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchParkDetails = async () => {
      try {
        setParkDetails(park);
        const imagesRef = ref(storage, `parks/${park.placeId}/`);
        const result = await listAll(imagesRef);
        const urls = await Promise.all(
          result.items.map(async (itemRef) => {
            const downloadURL = await getDownloadURL(itemRef);
            return downloadURL;
          })
        );
        setImageUrls(
          urls.length > 0
            ? urls
            : [park.profileImageUrl, ...DEFAULT_PARK_IMAGES]
        );

        // Fetch check-in data from Firebase
        const checkins = await checkinService.getActiveCheckins(park.id);
        setCheckinData(checkins);

        calculateStatistics(checkins);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching park details", error.message);
        setIsLoading(false);
        Alert.alert(
          "Error",
          "An error occurred while fetching park details. Please try again later."
        );
      }
    };
    fetchParkDetails();
  }, [route.params, park]);

  const calculateStatistics = (checkins) => {
    const breedsCount = {};
    const sizesCount = {};
    const gendersCount = {};
    const spayedNeuteredCount = { spayed: 0, neutered: 0, intact: 0 };
    const hourlyCheckins = Array(24).fill(0);

    checkins.forEach((checkin) => {
      const breed = checkin.dogBreed || "Unknown";
      breedsCount[breed] = (breedsCount[breed] || 0) + 1;

      const size = checkin.dogSize || "Unknown";
      sizesCount[size] = (sizesCount[size] || 0) + 1;

      const gender = checkin.dogGender || "Unknown";
      gendersCount[gender] = (gendersCount[gender] || 0) + 1;

      const status = checkin.dogSpayedNeutered || "Unknown";
      if (status === "spayed") {
        spayedNeuteredCount.spayed += 1;
      } else if (status === "neutered") {
        spayedNeuteredCount.neutered += 1;
      } else {
        spayedNeuteredCount.intact += 1;
      }

      const checkinTime = checkin.arrivalTime.toDate();
      const hour = checkinTime.getHours();
      hourlyCheckins[hour] += 1;
    });

    setStatistics({
      breedsCount,
      sizesCount,
      gendersCount,
      spayedNeuteredCount,
      hourlyCheckins,
    });
  };

  const renderBreedStatistics = () => {
    const data = Object.entries(statistics.breedsCount).map(
      ([breed, count]) => ({
        name: breed,
        population: count,
        color: getRandomColor(),
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      })
    );
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Breeds Distribution</Text>
        <PieChart
          data={data}
          width={Dimensions.get("window").width - 32}
          height={220}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />
      </View>
    );
  };

  const renderCrowdedHoursChart = () => {
    const data = {
      labels: [...Array(24).keys()].map((h) => h.toString()),
      datasets: [
        {
          data: statistics.hourlyCheckins,
        },
      ],
    };

    return (
      <View style={{ ...styles.chartContainer, marginTop: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
          Crowded Hours
        </Text>
        <CrowdedHoursGraph data={statistics.hourlyCheckins} />
      </View>
    );
  };

  const getRandomColor = () => {
    return (
      "rgba(" +
      Math.floor(Math.random() * 256) +
      "," +
      Math.floor(Math.random() * 256) +
      "," +
      Math.floor(Math.random() * 256) +
      ",1)"
    );
  };

  const chartConfig = {
    backgroundColor: "#e26a00",
    backgroundGradientFrom: "#fb8c00",
    backgroundGradientTo: "#ffa726",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  const handleUpload = async (imageUri) => {
    try {
      const uniqueFileName = `${park.placeId}/${new Date().getTime()}.jpg`;
      const storageRef = ref(storage, `parks/${uniqueFileName}`);
      const img = await fetch(imageUri);
      const bytes = await img.blob();

      const uploadTask = uploadBytesResumable(storageRef, bytes);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
        },
        (error) => {
          console.error("Error uploading image:", error);
          Alert.alert("Error", "Could not upload the image. Please try again.");
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              setImageUrls((prev) => [...prev, downloadURL]);
              console.log("Image uploaded successfully: ", downloadURL);
            })
            .catch((error) => {
              console.error("Error getting download URL:", error.message);
              Alert.alert(
                "Error",
                "Could not get download URL. Please try again."
              );
            });
        }
      );
    } catch (error) {
      console.error("Error during image upload:", error);
      Alert.alert("Error", "Could not upload the image. Please try again.");
    }
  };

  const selectImage = async () => {
    let result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (result.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      handleUpload(pickerResult.assets[0].uri);
    }
  };

  const renderItem = ({ item }) => (
    <Image source={{ uri: item }} style={styles.carouselImage} />
  );

  const navigateToPark = () => {
    const lat = parkDetails.latitude;
    const lng = parkDetails.longitude;

    Alert.alert(
      "Navigate to Park",
      "Choose an app to navigate with:",
      [
        {
          text: "Google Maps",
          onPress: () => {
            const url = `geo:${lat},${lng}`;
            Linking.openURL(url);
          },
        },
        {
          text: "Waze",
          onPress: () => {
            const url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
            Linking.openURL(url);
          },
        },
        {
          text: "Apple Maps",
          onPress: () => {
            const url = `https://maps.apple.com/?daddr=${lat},${lng}`;
            Linking.openURL(url);
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator animating={true} color={MD2Colors.red800} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton
        style={{ paddingLeft: 16 }}
        goBack={() => navigation.goBack()}
      />
      <ScrollView style={{}}>
        <View style={{}}>
          <Text style={styles.title}>{parkDetails.name}</Text>
          <Text style={styles.address}>{parkDetails.address}</Text>
          <Header
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 8,
              alignSelf: "center",
            }}
          >
            Traveler Photos
          </Header>
          <Text style={styles.subHeader}>
            <Text style={{ color: "black", fontWeight: "bold" }}>
              @{userName}
            </Text>{" "}
            and {Math.max(3, imageUrls.length || 0)} other Dogli's users have
            shared their photos.{" "}
            <Text style={{ color: "black", fontWeight: "light" }}>
              Want to feature your creature?
            </Text>{" "}
            Upload a photo of your pet at {parkDetails?.name || "this park"}.
          </Text>
          <FlatList
            data={imageUrls.length > 0 ? imageUrls : DEFAULT_PARK_IMAGES}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.carousel}
          />
        </View>

        {/* Park Statistics */}
        <View style={styles.statisticsContainer}>
          <View style={styles.statItem}>
            <Icon name="pets" size={30} color="#4682B4" />
            <Text style={styles.statText}>
              {checkinData.length} Dogs Checked In via Dogli App
            </Text>
          </View>
        </View>

        {/* Render charts and statistics */}
        {statistics && (
          <>
            {renderCrowdedHoursChart()}
            {renderBreedStatistics()}
          </>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={selectImage}>
            <Icon name="photo-camera" size={24} color="#FFF" />
            <Text style={styles.actionButtonText}>Upload Images</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("CheckInScreen", park)}
          >
            <Icon name="check-circle" size={24} color="#FFF" />
            <Text style={styles.actionButtonText}>Check-In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={navigateToPark}
          >
            <Icon name="navigation" size={24} color="#FFF" />
            <Text style={styles.actionButtonText}>Navigate to Park</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.additionalActions}>
          <TouchableOpacity style={styles.additionalButton}>
            <Icon name="favorite-border" size={24} color="#6200EE" />
            <Text style={styles.additionalButtonText}>Follow Park</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.additionalButton}>
            <Icon name="share" size={24} color="#6200EE" />
            <Text style={styles.additionalButtonText}>Share Park</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.additionalButton}
            onPress={() => navigation.navigate("ParkReviewsScreen", park)}
          >
            <Icon name="rate-review" size={24} color="#6200EE" />
            <Text style={styles.additionalButtonText}>View Reviews</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  carousel: {
    marginBottom: 16,
  },
  carouselImage: {
    width: 300,
    height: 200,
    borderRadius: 10,
    marginRight: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginTop: 16,
    paddingTop: 16,
    alignSelf: "center",
  },
  address: {
    fontSize: 16,
    color: "#555",
    marginHorizontal: 16,
    marginBottom: 16,
    alignSelf: "center",
  },
  subHeader: {
    fontSize: 16,
    color: "#555",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statisticsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statText: {
    fontSize: 16,
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginVertical: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4682B4",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    width: "40%",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#FFF",
    marginLeft: 8,
    fontSize: 16,
  },
  additionalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 32,
  },
  additionalButton: {
    alignItems: "center",
  },
  additionalButtonText: {
    color: "#6200EE",
    marginTop: 4,
  },
  chartContainer: {
    marginVertical: 16,
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  parkName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  parkAddress: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
});

export default GParkVisitorScreen;
