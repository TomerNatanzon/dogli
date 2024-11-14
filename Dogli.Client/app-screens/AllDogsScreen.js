import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import BackButton from "../components/BackButton";
import Button from "../components/Button";
import { api } from "../services/api";
import { Color, FontFamily, FontSize, Padding, Border } from "../GlobalStyles";
import PawBackground from "../components/PawBackground";
import { theme } from "../core/theme";
import { Icon } from "react-native-paper";
import Ionicon from "react-native-vector-icons/Ionicons";
import { color } from "@rneui/base";
const defaultImageUrl = "../assets/clip-cartoon-dog-pic-32.png";

const AllDogsScreen = ({ navigation }) => {
  const [dogs, setDogs] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      fetchDogs();
    }, [])
  );

  const fetchDogs = async () => {
    try {
      const response = await api.get("/dogs/my-dogs");
      console.log("My dogs: " + JSON.stringify(response.data));
      setDogs(response.data);
    } catch (error) {
      console.error("Error fetching dogs", error);
    }
  };

  const handleDeleteDog = async (dogId) => {
    try {
      await api.delete(`/dogs/${dogId}`);
      fetchDogs();
    } catch (error) {
      console.error("Error deleting dog", error);
    }
  };

  const renderDog = ({ item }) => (
    <View style={styles.card}>
      <Image
        style={styles.dogImage}
        source={
          item.profileImageUrl
            ? { uri: item.profileImageUrl }
            : require(defaultImageUrl)
        }
      />
      <View style={styles.dogInfo}>
        <Text style={styles.dogName}>{item.name}</Text>
        <Text style={styles.dogDetails}>Breed: {item.breed}</Text>
        <Text style={styles.dogDetails}>Gender: {item.gender}</Text>
        <Text style={styles.dogDetails}>
          Age: {calculateAge(item.birthDate)}
        </Text>
        <Text style={styles.dogDetails}>
          Spayed/Neutered: {item.isSpayedOrNeutered ? "Yes" : "No"}
        </Text>
        <View style={styles.actions}>
          <Pressable
            style={styles.editButton}
            onPress={() =>
              navigation.navigate("MyDogProfileScreen", {
                dog: item,
                image: item.profileImageUrl || null,
              })
            }
          >
            <Text style={styles.buttonText}>edit</Text>
          </Pressable>
          <Pressable
            style={styles.deleteButton}
            onPress={() =>
              Alert.alert(
                "Delete Dog",
                "Are you sure you want to delete this dog?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "OK", onPress: () => handleDeleteDog(item.id) },
                ]
              )
            }
          >
            <Text style={styles.buttonText}>delete</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.allDogsScreen}>
      <PawBackground>
        <BackButton goBack={navigation.goBack} />
        <Text style={styles.allDogsTitle}>My Dogs</Text>
        <ScrollView>
          <FlatList
            data={dogs}
            scrollEnabled={false}
            renderItem={renderDog}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={styles.noDogsHeader}>
                No Dogs yet. Add a new dog to get started!
              </Text>
            }
          />
        </ScrollView>

        <TouchableOpacity
          mode="contained"
          style={{
            margin: "auto",
            marginBottom: 50,
            // width: "70%",
            // backgroundColor: "#E4BE72",
            backgroundColor: "#DEB887",
            padding: 10,
            borderRadius: 8,
            alignItems: "center",
          }}
          onPress={() =>
            navigation.navigate("MyDogProfileScreen", { isNew: true })
          }
        >
          <Text
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: "bold",
            }}
          >
            + Add a New Dog
          </Text>
        </TouchableOpacity>
      </PawBackground>
      <View style={styles.navContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("MainScreen")}
          >
            <Ionicon name="home" size={24} color="#666" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("ParkFinderScreen")}
          >
            <Ionicon name="search" size={24} color="#666" />
            <Text style={styles.navText}>Park Finder</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("AllDogsScreen")}
          >
            <Ionicon name="paw" size={24} color="#5D3FD3" />
            <Text style={styles.navText}>My Dogs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("UserProfileScreen")}
          >
            <Ionicon name="person-outline" size={24} color="#666" />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const calculateAge = (birthDate) => {
  const birth = new Date(birthDate);
  const diff = Date.now() - birth.getTime();
  const age = new Date(diff).getUTCFullYear() - 1970;
  return age > 0 ? `${age} years old` : "Less than a year old";
};

const styles = StyleSheet.create({
  allDogsScreen: {
    flex: 1,
    // backgroundColor: Color.colorWhite,
    backgroundColor: "#fff",
    // padding: 20,
    width: "100%",
  },
  allDogsTitle: {
    fontSize: FontSize.size_xl,
    fontFamily: FontFamily.interSemiBold,
    textAlign: "center",
    marginTop: 30,
    paddingVertical: 5,
  },
  card: {
    flexDirection: "row",
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: Color.colorWhite,
    borderRadius: Border.br_xs,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1,
  },
  dogImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  dogInfo: {
    marginLeft: 15,
    flex: 1,
  },
  dogName: {
    fontSize: FontSize.size_mini,
    fontFamily: FontFamily.interSemiBold,
  },
  dogDetails: {
    fontSize: FontSize.size_2xs,
    fontFamily: FontFamily.smallText,
    marginTop: 3,
  },
  actions: {
    flexDirection: "row",
    alignSelf: "flex-end",
    justifyContent: "space-between",
    marginTop: 10,
  },
  editButton: {
    backgroundColor: "#2C6A2E",
    padding: 5,
    marginHorizontal: 5,
    borderRadius: 10,
  },
  primaryButton: {
    backgroundColor: Color.primary50,
    padding: 5,
    borderRadius: Border.br_5xs,
  },
  deleteButton: {
    backgroundColor: "#B82F2F",
    padding: 5,
    borderRadius: Border.br_5xs,
  },
  buttonText: {
    color: Color.colorWhite,
    fontFamily: FontFamily.smallText,
    fontSize: FontSize.size_2xs,
  },
  addDogButton: {
    backgroundColor: Color.primary50,
    padding: 15,
    borderRadius: Border.br_xs,
    margin: 20,
    alignItems: "center",
  },
  addDogButtonText: {
    color: Color.colorWhite,
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.size_mini,
  },
  noDogsHeader: {
    fontSize: 15,
    fontWeight: "semi-bold",
    marginBottom: 10,
    textAlign: "center",
    // color: "#aaa",
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
});

export default AllDogsScreen;
