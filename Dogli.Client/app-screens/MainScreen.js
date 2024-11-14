import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, FlatList } from "react-native";
import { getUserProfile } from "../services/storage";
import * as Location from "expo-location";
import { api } from "../services/api";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MainScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [dogs, setDogs] = useState([]);
  const [nearbyParks, setNearbyParks] = useState([]);

  useEffect(() => {
    fetchUserProfile();
    fetchNearbyParks();
  }, []);

  const fetchUserProfile = async () => {
    const profile = await getUserProfile();
    const parsedProfile = JSON.parse(profile);
    setUserProfile(parsedProfile);
    setDogs(parsedProfile?.dogs || []);
  };

  const fetchNearbyParks = async () => {
    try
    {
    const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required.");
        return;
      }

    const location = await Location.getCurrentPositionAsync({});
    const response = await api.get(`/parks/nearby`, {
          params: {
            location: `${location.coords.latitude},${location.coords.longitude}`,
            radius: 5000,
          },
        });
      return response.data;
    } catch (error) {
      console.error("Error getting user location", error);
    }
  };

  const renderParkItem = ({ item }) => (
    <TouchableOpacity
      style={styles.parkCard}
      onPress={() =>
        navigation.navigate(
          "ParkProfileScreen",
          item.id === testPark.id ? testPark : testPark2
        )
      }
    >
      <Image source={{ uri: item.profileImageUrl }} style={styles.parkImage} />
      <View style={styles.parkInfo}>
        <Text style={styles.parkName}>{item.name}</Text>
        <Text style={styles.locationText}>
          {item.address || item.name + " Street"}
        </Text>
        <View style={styles.parkDetails}>
          <View style={styles.detailItem}>
            <Icon name="location-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.distance}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="people-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.crowded}</Text>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Icon
              key={star}
              name={star <= item.rating ? "star" : "star-outline"}
              size={16}
              color="#FFB800"
            />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const testrenderParkItem = ({ item }) => (
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

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("@userProfile");
      await AsyncStorage.removeItem("@auth_token"); 
      await AsyncStorage.removeItem("@userId"); 
    } catch (error) {
      console.error("Error removing token:", error);
    } finally {
      navigation.reset({
        index: 0,
        routes: [{ name: "StartScreen" }],
      });
    }
  };

  const ListHeaderComponent = () => (
    <>
      <View style={styles.searchSection}>
        <Text style={styles.welcomeText}>
          Welcome, {userProfile?.fullName || "Dog Lover"}!
        </Text>
        <TouchableOpacity style={styles.advancedSearch} onPress={handleLogout}>
          <Text style={styles.advancedSearchText}>
            logout <Icon name="exit" size={13} color="white" />
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.sectionHeader}>
        <TouchableOpacity
          style={styles.pageCard}
          onPress={() => navigation.navigate("ParkFinderScreen")}
        >
          <Text style={styles.pageCardTitle}>Dogli's Park Finder</Text>
          <Text
            style={{ paddingHorizontal: 10, marginBottom: 5, fontSize: 15 }}
          >
            Plan your next visit with our data-driven Park Finder! We're using
            statistics and real-time data from the most popular parks to help
            you choose the best park for you and your dog! 🐕
          </Text>
          <Image
            source={require("../assets/park-finder-preview-pic1.png")}
            style={{ width: 300, height: 200, alignSelf: "center" }}
            resizeMode="stretch"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <TouchableOpacity
          style={styles.pageCard}
          onPress={() => navigation.navigate("ParksMapScreen")}
        >
          <Text style={styles.pageCardTitle}>Dog Parks Map</Text>
          <Text
            style={{ paddingHorizontal: 10, marginBottom: 5, fontSize: 15 }}
          >
            Explore new parks in new areas ,together with your dog! 🐕
          </Text>
          <Image
            source={require("../assets/parks-map-marker.png")}
            resizeMode="cover"
          />
        </TouchableOpacity>

      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended Parks</Text>
        <Text style={styles.resultCount}>
          {" "}
          based on location and popularity
        </Text>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Dogli{" "}
          <Text style={{ fontSize: 20, color: "white" }}>
            - the best for your dog 🐕{" "}
          </Text>
        </Text>
      </View>

      <FlatList
        data={nearbyParks}
        renderItem={renderParkItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home" size={24} color={"#5D3FD3"} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("ParkFinderScreen")}
        >
          <Icon name="search-outline" size={24} color="#666" />
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
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    backgroundColor: "#5D3FD3",
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFB800",
    fontSize: 40,
    fontWeight: "bold",
  },
  contentContainer: {
    paddingBottom: 20,
  },
  searchSection: {
    backgroundColor: "#5D3FD3",
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  welcomeText: {
    color: "#EBA059",
    fontSize: 20,
    marginBottom: 5,
  },
  searchBar: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 25,
    marginBottom: 10,
  },
  searchText: {
    color: "#666",
    marginLeft: 10,
  },
  advancedSearch: {
    alignItems: "flex-start",
  },
  advancedSearchText: {
    color: "white",
    textDecorationLine: "underline",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  resultCount: {
    color: "#666",
    marginHorizontal: 10,
    paddingTop: 5,
    flex: 2,
  },
  pageCard: {
    backgroundColor: "white",
    borderRadius: 15,
    // marginHorizontal: 20,
    marginBottom: 15,
    // flexDirection: "row",
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pageCardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    paddingTop: 10,
    paddingLeft: 10,
  },
  parkCard: {
    backgroundColor: "white",
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    flexDirection: "row",
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  parkImage: {
    width: 100,
    height: 100,
  },
  parkInfo: {
    flex: 1,
    padding: 12,
  },
  parkName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  locationText: {
    color: "#666",
    fontSize: 14,
  },
  priceText: {
    color: "#5D3FD3",
    fontWeight: "bold",
    marginTop: 4,
  },
  parkDetails: {
    flexDirection: "row",
    marginTop: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  detailText: {
    color: "#666",
    fontSize: 12,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  activeNavText: {
    color: "#5D3FD3",
  },
};

export default MainScreen;
