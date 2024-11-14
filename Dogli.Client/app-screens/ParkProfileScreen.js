import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Ionicon from "react-native-vector-icons/Ionicons";
import { HalfBoneIcon } from "../components/HalfBoneIcon";
import { generateDescription } from "../helpers/parkDescriptionGenerator";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import BackButton from "../components/BackButton";

const FACILITY_OPTIONS = [
  "Off-leash Area",
  "Bikes and Car Parking",
  "Snack bar",
  "Shared Toilet",
  "24/7 Water facility",
];

const IS_TESTING = false;

const ParkProfileScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [parkData, setParkData] = useState(null);

  useEffect(() => {
    const loadParkData = async () => {
      console.log("Route params: ", route.params);
      const park = route.params && Object.keys(route.params).length > 0 && !IS_TESTING
          ? route.params
          : null;

      setParkData(park);
    };
    loadParkData();
  }, [route.params]);

  const renderAverageRatingBones = (rating) => {
    let halfStar = (rating % 1).toFixed(1) >= 0.5 ? 1 : 0;
    let fullStars = Math.floor(rating);
    let emptyStars = 5 - fullStars - halfStar;
    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <FontAwesome5Icon
            style={styles.ratingIcon}
            key={i}
            name="bone"
            size={20}
            color="#FFC107"
          />
        ))}
        {halfStar ? <HalfBoneIcon style={styles.ratingIcon} /> : null}
        {[...Array(emptyStars)].map((_, i) => (
          <FontAwesome5Icon
            style={styles.ratingIcon}
            key={i + fullStars}
            name="bone"
            size={20}
            color="#D3D3D3"
          />
        ))}
      </>
    );
  };

  const navigateToMap = () => {
    navigation.navigate("ParksMapScreen", {
      focusedPark: {
        placeId: parkData.placeId,
        latitude: parkData.latitude,
        longitude: parkData.longitude,
      },
    });
  };

  const renderFacility = (facility) => {
    const isAvailable = parkData.facilities.includes(facility);
    return (
      <View key={facility} style={styles.facilityContainer}>
        <Icon
          name={isAvailable ? "check" : "close"}
          size={20}
          color={isAvailable ? "#4CAF50" : "#F44336"}
        />
        <Text
          style={[
            styles.facilityText,
            !isAvailable && styles.unavailableFacility,
          ]}
        >
          {facility}
        </Text>
      </View>
    );
  };

  const handleContentLayout = () => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  if (!parkData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading park details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading park details...</Text>
        </View>
      )}

      <ScrollView onLayout={handleContentLayout}>
        <View style={styles.additionalActions}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicon name="arrow-back-circle" size={30} color="#6200EE" />
          </TouchableOpacity>
        </View>
        <Image
          source={
            parkData?.profileImageUrl == null
              ? require("../assets/dog-park-sample.jpg")
              : { uri: parkData.profileImageUrl }
          }
          style={styles.image}
        />
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{parkData.name}</Text>
          <View style={styles.ratingContainer}>
            {renderAverageRatingBones(parkData?.rating ?? 0)}
            <Text style={styles.infoText}>
              {parkData.rating > 0
                ? `${parkData.rating?.toFixed(1)} Average Rating `
                : "No ratings yet"}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("ParkReviewsScreen", parkData)}
            >
              <Text style={styles.mapLink}>Park Reviews</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              {parkData.distance < 1000
                ? `${parkData.distance.toFixed(2)} meters away`
                : `${(parkData.distance / 1000).toFixed(2)} km away`}
              {/* {parkData.distance} */}
            </Text>
            <TouchableOpacity onPress={navigateToMap}>
              <Text style={styles.mapLink}>View on Dogli's Maps</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <Icon name="location-on" size={20} color="#6200EE" />
            <Text style={styles.infoText}>{parkData.address}</Text>
          </View>

          <View style={styles.infoContainer}>
            <Icon name="people" size={20} color="#6200EE" />
            <Text style={styles.infoText}>
              {parkData?.visitors ?? "Daily visitors: 50 - 200"}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {parkData?.description ?? generateDescription(parkData)}
          </Text>

          <Text style={styles.sectionTitle}>Facilities</Text>
          {FACILITY_OPTIONS.map(renderFacility)}

          <TouchableOpacity
            style={styles.bookButton}
            onPress={() =>
              navigation.navigate("GParkVisitorScreen", { parkData })
            }
          >
            <Text style={styles.bookButtonText}>Visit Park</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  ratingIcon: {
    // paddingHorizontal: 4,
    transform: [{ rotate: "45deg" }],
    marginRight: 4,
  },
  image: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    color: "#6200EE",
    fontWeight: "bold",
    marginBottom: 16,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#757575",
  },
  mapLink: {
    color: "#6200EE",
    textDecorationLine: "underline",
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#757575",
    marginBottom: 16,
  },
  facilityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  facilityText: {
    marginLeft: 8,
    fontSize: 16,
  },
  bookButton: {
    backgroundColor: "#6200EE",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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

export default ParkProfileScreen;
