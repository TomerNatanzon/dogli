import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  Linking,
  Image,
  StatusBar,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Svg, Image as ImageSvg } from "react-native-svg";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { api } from "../services/api";
import { calculateDistance } from "../helpers/distanceCalculator";
import { theme } from "../core/theme";
import BackButton from "../components/BackButton";
import Ionicon from "react-native-vector-icons/Ionicons";

const ParksMapScreen = ({ navigation }) => {
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusFinish, setFocusFinish] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const [parkNotFound, setParkNotFound] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [parksLoaded, setParksLoaded] = useState(false);
  navigation = useNavigation();
  const mapRef = useRef(null);
  const route = useRoute();
  const { focusedPark } = route.params || {};

  useEffect(() => {
    const fetchParks = async () => {
      try {
        const location = await getUserLocation();
        setUserLocation(location);
        const response = await api.get("/parks");

        setParks(response.data);
        setParksLoaded(true);
        console.log("Parks loaded:", response.data.length);
      } catch (error) {
        console.error(
          "Error fetching parks",
          error.response?.data || error.message
        );
        Alert.alert(
          "Error",
          `Could not fetch parks. Please try again later.\n Error: ${
            error.response?.data || error.message
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchParks();
  }, []);

  const markerRefs = useRef({});
  useEffect(() => {
    const focusOnPark = () => {
      console.log("Focus effect running with conditions:", {
        hasFocusedPark: !!focusedPark,
        hasMapRef: !!mapRef.current,
        parksLoaded,
        mapReady,
        hasUserLocation: !!userLocation,
      });

      if (
        focusedPark &&
        mapRef.current &&
        parksLoaded &&
        mapReady &&
        userLocation
      ) {
        try {
          const parkToFocus = parks.find(
            (park) => park.placeId === focusedPark.placeId
          );

          if (!parkToFocus) {
            console.log("Park not found in the list:", focusedPark.placeId);
            setParkNotFound(true);
            fitMapToShowAllParks();
          } else {
            setParkNotFound(false);
            console.log("Found park to focus:", parkToFocus);

            if (
              typeof parkToFocus.latitude === "number" &&
              typeof parkToFocus.longitude === "number"
            ) {
              mapRef.current.animateToRegion(
                {
                  latitude: parkToFocus.latitude,
                  longitude: parkToFocus.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                },
                1000
              );

              setTimeout(() => {
                if (markerRefs.current[parkToFocus.placeId]) {
                  markerRefs.current[parkToFocus.placeId].showCallout();
                }
              }, 1500); 
            } else {
              console.error("Invalid coordinates for park:", parkToFocus);
              Alert.alert(
                "Error",
                "The selected park has invalid coordinates."
              );
            }
          }
        } catch (error) {
          console.error("Error focusing on park:", error);
          Alert.alert(
            "Error",
            "An unexpected error occurred while focusing on the park."
          );
        } finally {
          setFocusFinish(true);
        }
      } else {
        console.log("Not all conditions met for focusing on park");
      }
    };

    focusOnPark();
    setFocusFinish(true);
  }, [focusedPark, parks, parksLoaded, mapReady, userLocation, focusFinish]);

  const fitMapToShowAllParks = useCallback(() => {
    if (mapRef.current && parks.length > 0) {
      const sumLat = parks.reduce((sum, park) => sum + park.latitude, 0);
      const sumLng = parks.reduce((sum, park) => sum + park.longitude, 0);
      const avgLat = sumLat / parks.length;
      const avgLng = sumLng / parks.length;

      const minLat = Math.min(...parks.map((park) => park.latitude));
      const maxLat = Math.max(...parks.map((park) => park.latitude));
      const minLng = Math.min(...parks.map((park) => park.longitude));
      const maxLng = Math.max(...parks.map((park) => park.longitude));

      const latDelta = (maxLat - minLat) * 1.5; 
      const lngDelta = (maxLng - minLng) * 1.5;

      const minDelta = 0.02; 
      const finalLatDelta = Math.max(latDelta, minDelta);
      const finalLngDelta = Math.max(lngDelta, minDelta);

      mapRef.current.animateToRegion(
        {
          latitude: avgLat,
          longitude: avgLng,
          latitudeDelta: finalLatDelta,
          longitudeDelta: finalLngDelta,
        },
        1000
      );

      console.log("Fitted map to show parks centered at:", { avgLat, avgLng });
    } else {
      console.log("Unable to fit map to show parks");
    }
  }, [parks]);

  const handleMapReady = () => {
    console.log("Map is ready");
    setMapReady(true);
  };

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      return location;
    } catch (error) {
      console.log("Error getting user location", error);
    }
  };

  const handleVisitPark = (park) => {
    const parkData = { ...park };
    console.log("Park data: ", parkData);
    navigation.navigate("GParkVisitorScreen", { parkData });
  };

  const toggleFavorite = async (park) => {
    try {
      const response = await api.post("/parks/favorite", {
        parkPlaceId: park.placeId,
      });

      if (response.status === 200) {
        Alert.alert("Success", "Park added to favorites.");
      }
    } catch (error) {
      console.log("Error adding park to favorites", error);
      Alert.alert(
        "Error",
        "Could not add park to favorites. Please try again."
      );
    }
  };

  const renderMarkers = () => {
    return parks.map((park) => {
      const distance = calculateDistance(userLocation.coords, {
        latitude: park.latitude,
        longitude: park.longitude,
      });
      park.distance = distance;
      return (
        <Marker
          key={park.placeId}
          ref={(ref) => (markerRefs.current[park.placeId] = ref)}
          coordinate={{
            latitude: park.latitude,
            longitude: park.longitude,
          }}
          title={park.name}
          description={park.address}
          pinColor="green"
          image={require("../assets/paw-park-marker.png")}
        >
          <Callout onPress={() => handleVisitPark(park)}>
            <View style={styles.calloutView}>
              <Text style={styles.calloutTitle}>{park.name}</Text>
              <Text style={styles.calloutAddress}>{park.address}</Text>
              <Text style={styles.calloutDistance}>
                {distance < 1000
                  ? `${distance.toFixed(2)} meters away`
                  : `${(distance / 1000).toFixed(2)} km away`}
              </Text>
              <Pressable
                style={styles.button}
                onPress={() => handleVisitPark(park)}
              >
                <Text style={styles.buttonText}>Visit Park</Text>
              </Pressable>
            </View>
          </Callout>
        </Marker>
      );
    });
  };

  const focusOnUserLocation = async () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: 0.25,
          longitudeDelta: 0.25,
        },
        1000
      );
    }
    setParkNotFound(false);
  };

  if (loading || !userLocation || !focusFinish) {
    return (
      <View style={styles.loader}>
        <Text>Loading...</Text>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const statusBarHeight = StatusBar.currentHeight || 0;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
          latitudeDelta: 0.25,
          longitudeDelta: 0.25,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        customMapStyle={mapStyle}
        onMapReady={handleMapReady}
        mapPadding={{
          top: statusBarHeight + 10, 
          right: 0,
          bottom: 0,
          left: 0,
        }}
      >
        {renderMarkers()}
      </MapView>
      <View style={styles.additionalActions}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicon name="arrow-back-circle" size={30} color="#6200EE" />
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={parkNotFound}
        onRequestClose={() => setParkNotFound(false)}
      >
        <TouchableWithoutFeedback onPress={() => setParkNotFound(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.notFoundText}>
                  The selected park was not found on the map.
                </Text>
                <Pressable
                  style={styles.viewAllButton}
                  onPress={focusOnUserLocation}
                >
                  <Text style={styles.viewAllButtonText}>
                    View Nearby Parks
                  </Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ... Debug information ... */}
      {parkNotFound === false && TEST_LOCATION === true && (
        <View style={styles.debugInfo}>
          <Text>Focused Park ID: {focusedPark?.id || "None"}</Text>
          <Text>Parks Loaded: {parksLoaded ? "Yes" : "No"}</Text>
          <Text>Number of Parks: {parks.length}</Text>
        </View>
      )}
    </View>
  );
};

const mapStyle = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels",
    stylers: [{ visibility: "on" }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    // flex: 1,
    ...StyleSheet.absoluteFillObject,
    // zIndex: 0,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calloutView: {
    flexDirection: "column",
    width: 200,
    padding: 15,
  },
  calloutImage: {
    width: "100%",
    height: 80,
    borderRadius: 5,
    marginBottom: 5,
  },
  calloutTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  calloutDistance: {
    marginBottom: 5,
  },
  calloutAddress: {
    color: "#555",
    marginBottom: 5,
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#4682B4",
    borderRadius: 5,
    marginTop: 5,
  },
  buttonText: {
    color: "#FFF",
    textAlign: "center",
  },
  debugInfo: {
    position: "absolute",
    bottom: 20,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 5,
    borderRadius: 5,
  },
  // NEW: Styles for modal
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },

  notFoundBanner: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  notFoundText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  viewAllButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
  },
  viewAllButtonText: {
    color: "white",
    fontWeight: "bold",
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
  // test styles for backButton above
});

export default ParksMapScreen;
