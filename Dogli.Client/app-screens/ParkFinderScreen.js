import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Alert,
  Keyboard,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { theme } from "../core/theme";
import { calculateDistance } from "../helpers/distanceCalculator";
import * as Location from "expo-location";
import { api } from "../services/api";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import Header from "../components/Header";
import { FullWindowOverlay } from "react-native-screens";

const ParkFinderScreen = ({ navigation }) => {
  const [parks, setParks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const fetchParks = async () => {
      try {
        const location = await getUserLocation();
        setUserLocation(location);
        const response = await api.get("/parks");
        parkData = response.data;
        if (parkData) {
          parksWithDistance = parkData.map((park) => ({
            ...park,
            distance: calculateDistance(location.coords, {
              latitude: park.latitude,
              longitude: park.longitude,
            }),
          }));
          setParks(parksWithDistance);
        } else {
          setParks([]);
        }

      } catch (error) {
        console.error("Error fetching parks", error);
        Alert.alert("Error", "Could not fetch parks. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchParks();
  }, []);

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
      console.error("Error getting user location", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <Text>Loading...</Text>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const renderParkItem = ({ item }) => (
    <View style={styles.parkItem}>
      <Image
        source={{
          uri:
            item.profileImageUrl ||
            "https://img.freepik.com/free-photo/sportive-dog-performing-lure-coursing-competition_155003-43810.jpg"
        }}
        style={styles.parkImage}
      />
      <View style={styles.parkInfo}>
        <Text style={styles.parkName}>{item.name}</Text>
        <Text style={styles.parkRating}>
          {item?.rating >= 1.0
            ? "★".repeat(Math.floor(item.rating))
            : "No Reviews yet"}
        </Text>
        <View style={styles.parkLocation}>
          <Text style={styles.parkPrice}>{item.address}</Text>

          <Text style={styles.parkDistance}>
            <Icon name="location-outline" size={16} color="#666" />
            {item.distance < 1000
              ? `${item.distance.toFixed(2)} meters away`
              : `${(item.distance / 1000).toFixed(2)} km away`}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("ParkProfileScreen", item)}
          >
            <Text style={styles.viewParkButton}>View Park</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderSection = (title, data) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={data}
        renderItem={renderParkItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );

  const renderSearchResultsSection = (title, data) => (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchResults}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <FlatList
          data={data}
          renderItem={renderParkItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );

  const handleSearch = () => {
    Keyboard.dismiss();
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const results = parks.filter(
      (park) =>
        park.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        park.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (results.length === 0) {
      Alert.alert("No Results", "No parks match your search criteria.");
      setSearchQuery("");
      setSearchResults([]);
    } else {
      setSearchResults(results);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>Park Finder</Text>
          <View style={styles.searchArea}>
            <Header style={styles.searchHeader}>Find a Dog Park nearby</Header>
            <View style={styles.searchContainer}>
              <Icon
                name="search-outline"
                size={24}
                color="#666"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Find a Dog park nearby"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>

          {searchResults.length > 0 ? (
            renderSearchResultsSection("Search Results", searchResults)
          ) : (
            <>
              {renderSection(
                "Popular Dog Parks",
                parks.sort((a, b) => b.rating - a.rating).slice(0, 5)
              )}
              {renderSection(
                "Nearby Dog Parks",
                parks.sort((a, b) => a.distance - b.distance).slice(0, 5)
              )}
              {renderSection(
                "All Parks",
                parks.sort((a, b) => {
                  const aFacilitiesLength = Array.isArray(a.facilities)
                    ? a.facilities.length
                    : 0;
                  const bFacilitiesLength = Array.isArray(b.facilities)
                    ? b.facilities.length
                    : 0;
                  return bFacilitiesLength - aFacilitiesLength;
                })
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.navContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("MainScreen")}
          >
            <Icon name="home" size={24} color="#666" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Icon name="search" size={24} color="#5D3FD3" />
            <Text style={styles.navText}>Park Finder</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("AllDogsScreen")}
          >
            <Icon name="paw-outline" size={24} color="#666" />
            <Text style={styles.navText}>My Dogs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("UserProfileScreen")}
          >
            <Icon name="person-outline" size={24} color="#666" />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#41245C",
  },
  header: {
    fontSize: 30,
    fontFamily: "sans-serif-condensed",
    fontWeight: "bold",
    color: "#EBA059",
    padding: 20,
    alignSelf: "center",
  },
  searchHeader: {
    fontSize: 20,
    fontWeight: "bold",
    // color: "#EBA059",
    padding: 10,
  },
  searchArea: {
    backgroundColor: "white",
    padding: 10,
    margin: 10,
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    overflow: "hidden",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 25,
    margin: 10,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
  },
  searchButton: {
    backgroundColor: "#41245C",
    // backgroundColor: "white",
    borderRadius: 25,
    padding: 15,
    marginBottom: 20,
    width: "50%",
    alignSelf: "center",
    alignItems: "center",
  },
  searchButtonText: {
    // color: "#5D3FD3",
    color: "white",
    fontWeight: "bold",
  },
  advancedSearch: {
    color: "#FFF",
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    flex: 1,
    marginBottom: 20,
  },
  searchResults: {
    color: "#FFF",
    textAlign: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginLeft: 20,
    marginBottom: 10,
  },
  parkItem: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginLeft: 20,
    padding: 10,
    width: 300,
  },
  parkImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  parkInfo: {
    marginLeft: 10,
    flex: 1,
  },
  parkName: {
    fontWeight: "bold",
  },
  parkRating: {
    color: "#EBA059",
    // color: "#FFD700",
  },
  parkPrice: {
    // fontWeight: "bold",
  },
  parkLocation: {
    flexDirection: "column",
    // alignItems: "center",
  },
  parkDistance: {
    fontSize: 12,
    color: "#666",
    // marginLeft: 5,
    // paddingBottom: 5,
  },
  viewParkButton: {
    color: "#5D3FD3",
    fontWeight: "bold",
    marginTop: 5,
    // marginBottom: 2,
  },
  navContainer: {
    // position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#FFF",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFF",
    paddingVertical: 10,
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    marginTop: 5,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
});

export default ParkFinderScreen;
