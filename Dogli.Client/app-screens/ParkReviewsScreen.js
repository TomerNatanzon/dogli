import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ImageBackground,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";
import Icon from "react-native-vector-icons/FontAwesome5";
import MyCard from "../components/Card";
import BackButton from "../components/BackButton";
import Paragraph from "../components/Paragraph";
import Header from "../components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../core/theme";
import { IconButton } from "react-native-paper";
import { HalfBoneIcon } from "../components/HalfBoneIcon";
import { api } from "../services/api";
import { getRandomInt } from "../helpers/randomIntGenerator";

function ParkReviewsScreen({ navigation, route }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [newReview, setNewReview] = useState("");
  const [park, setPark] = useState(null);
  const [score, setScore] = useState(0);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const loadParkData = async () => {
      const parkData = route.params || {};
      setPark(parkData);
      let avgRating = parkData?.rating ?? 0;
      setAverageRating(avgRating);
      fetchReviews(parkData);
    };
    loadParkData();
  }, [route.params]);

  const fetchReviews = async (parkData) => {
    console.log("reviews for park: " + JSON.stringify(parkData));
    let park = parkData;
    try {
      if (!park) {
        console.log("park is missing");
        return;
      }
      const parkId = park?.id.toString() || "";
      const placeId = park?.placeId || "";
      if (parkId === "" || placeId === "") {
        throw new Error("Park ID or place ID is missing");
      }
      const response = await api.get(`/reviews/${parkId}`);
      console.log("reviews response: " + JSON.stringify(response.data));
      setReviews(response.data);
    } catch (error) {
      let statusCode = error.response?.status || 500;
      let errMessage = error.response?.data?.Message || error.message;

      console.log(
        "Error fetching parks",
        error.response?.data || error.message
      );
      Alert.alert(
        "Error",
        `Could not fetch parks. Please try again later.\nStatusCode: ${statusCode}, Message: ${errMessage}`
      );
    }
  };

  const calculateAverageRating = (reviews) => {
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  };

  const renderAverageRatingBones = (rating) => {
    let halfStar = (rating % 1).toFixed(1) >= 0.5 ? 1 : 0;
    let fullStars = Math.floor(rating);
    let emptyStars = 5 - fullStars - halfStar;
    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <Icon
            style={styles.ratingIcon}
            key={i}
            name="bone"
            size={20}
            color="#FFC107"
          />
        ))}
        {halfStar ? (
          <HalfBoneIcon style={styles.ratingIcon} />
        ) : null}
        {[...Array(emptyStars)].map((_, i) => (
          <Icon
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

  const renderRatingBones = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Icon
        style={styles.ratingIcon}
        key={i}
        name="bone"
        size={20}
        color={i < rating ? "#FFC107" : "#D3D3D3"}
      />
    ));
  };

  const submitReview = async () => {
    try {
      const reviewData = {
        parkPlaceId: park.placeId,
        title: title,
        description: newReview,
        rating: score,
        likes: [],
        dislikes: [],
      };

      const response = await api.post(`/reviews`, reviewData);
      console.log(reviewData);
      if (response.status === 201) {
        Keyboard.dismiss();
        let avgRating = calculateAverageRating([...reviews, response.data]);
        setAverageRating(avgRating);
        setReviews([...reviews, response.data]);
        Alert.alert("Success", "Review posted successfully.");
        setScore(0);
        setTitle("");
        setNewReview("");
        park.rating = avgRating;
      }
    } catch (error) {
      let statusCode = error.response?.status || 500;
      let errMessage = error.response?.data?.Message || error.message;
      console.log(
        "Error while posting a review",
        error.response?.data || error.message
      );
      Alert.alert(
        "Error",
        `Failt to post a review. Please try again later.\nStatusCode: ${statusCode}, Message: ${errMessage}`
      );
    }
  };

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewListItem}>
      <View style={styles.reviewItem}>
        <Image
          source={require("../assets/ellipse-2.png")}
          style={styles.avatar}
        />
        <View style={styles.reviewContent}>
          <Text style={styles.username}>{item.user}</Text>
          <View style={styles.ratingBonesContainer}>
            {renderRatingBones(item.rating)}
          </View>
          <Text style={styles.reviewText}>{item.text}</Text>
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="thumbs-up" size={20} color="#4CAF50" />
              <Text>{item.likes || 3}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="thumbs-down" size={20} color="#F44336" />
              <Text>{item.dislikes}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/background-paw.png")}
        resizeMode="cover"
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
        }}
      >
        <SafeAreaView>
          <BackButton goBack={navigation.goBack} />
        </SafeAreaView>

        <View style={styles.containerHeader}>
          <View>
            <Text style={styles.ratingTitle}>{park?.name || "Park Name"} </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            {renderAverageRatingBones(averageRating)}
          </View>
          <View>
            <Text style={styles.ratingText}>
              This park has received a rating of {averageRating.toFixed(1)} out
              of 5 bones by {reviews.length} user
              {reviews.length !== 1 ? "s" : ""} of Dogli 🐶.
            </Text>
          </View>
        </View>

        <ScrollView style={styles.reviewsList} showsVerticalScrollIndicator>
          {reviews.length === 0 ? (
            <View style={styles.noReviewsContainer}>
              <Text style={styles.noReviewsText}>No reviews yet.</Text>
              <Text style={styles.noReviewsSubText}>
                Write a Review and be the first to share your experience!
              </Text>
            </View>
          ) : (
            reviews
              .sort(
                (a, b) =>
                  new Date(b.timestamps.createdAt) -
                  new Date(a.timestamps.createdAt)
              )
              .map((review) => (
                <View key={review.id} style={styles.reviewListItem}>
                  <View style={styles.reviewItem}>
                    <Image
                      // source={require("../assets/ellipse-2.png")}
                      source={{
                        uri:
                          review?.userProfile?.profileImageUrl ||
                          "https://firebasestorage.googleapis.com/v0/b/dogli-app.appspot.com/o/users%2Fmale-default-profile-image.png?alt=media&token=c5f87ee0-1dc8-411f-999c-3b7187c213f7",
                      }}
                      style={styles.avatar}
                    />
                    <View style={styles.reviewContent}>
                      <Text style={styles.username}>
                        {review?.userProfile?.fullName || "Haim"}
                      </Text>
                      <View style={styles.ratingBonesContainer}>
                        {renderRatingBones(review.rating)}
                      </View>
                      {review.title && (
                        <Text style={styles.reviewTitle}>{review.title}</Text>
                      )}
                      <Text style={styles.reviewText}>
                        {review.description}
                      </Text>
                      <View style={styles.actionContainer}>
                        <TouchableOpacity style={styles.actionButton}>
                          <Icon name="thumbs-up" size={20} color="#4CAF50" />
                          <Text>
                            {review?.likes.length ?? getRandomInt(0, 10)}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                          <Icon name="thumbs-down" size={20} color="#F44336" />
                          <Text>
                            {review?.dislikes.length ?? getRandomInt(0, 2)}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))
          )}
        </ScrollView>
        <KeyboardAvoidingView style={styles.addReviewContainer}>
          <Text style={styles.addReviewHeader}>Add a Review</Text>
          <Text style={{ fontSize: 14, textAlign: "center", paddingBottom: 5 }}>
            Share your own experience, and explain what did you like/dislike the
            most.
          </Text>
          <View style={styles.stars}>
            {[...Array(5)].map((_, index) => (
              <TouchableOpacity key={index} onPress={() => setScore(index + 1)}>
                {/* <FontAwesome
                name={index < score ? "star" : "star-o"}
                size={30}
                color="#FFD700"
              /> */}
                <Icon
                  style={styles.ratingIcon}
                  name="bone"
                  size={30}
                  color={index < score ? "#FFC107" : "#D3D3D3"}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.reviewInput]}
            placeholder="Review"
            value={newReview}
            onChangeText={setNewReview}
            multiline
          />
          <TouchableOpacity style={styles.submitButton} onPress={submitReview}>
            <Text style={styles.submitButtonText}>Post</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
        {/* TODO: TEST ABOVE FROM "../ReviewScreen.js" */}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 25,
    backgroundColor: "#fff",
  },
  containerHeader: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 16,
    paddingHorizontal: 25,
  },
  parkName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },

  ratingBonesContainer: {
    flex: 1,
    alignItems: "center",
    marginBottom: 10,
    flexDirection: "row",
  },
  ratingIcon: {
    // paddingHorizontal: 4,
    transform: [{ rotate: "45deg" }],
    marginRight: 4,
  },
  ratingIconHalfBone: {
    // width: 16,
    // height: 16,
    // fontSize: 20,
    marginRight: 4,
    transform: [{ rotate: "45deg" }],
  },
  stars: {
    flexDirection: "row",
    marginVertical: 5,
    justifyContent: "center",
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  ratingText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 8,
  },
  reviewItem: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#E6E0E9",
    padding: 16,
    borderRadius: 30,
    // paddingBottom: 16,
    // marginBottom: 16,
  },
  reviewsList: {
    borderTopWidth: 1,
    borderTopColor: "black",
    padding: 15,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    // borderBottomWidth: 2,
    // borderBottomColor: "black",
  },
  reviewListItem: {
    // borderTopWidth: 1,
    // borderTopColor: theme.colors.onBackground,
    // borderBottomWidth: 1,
    // borderBottomColor: theme.colors.onBackground,
    paddingVertical: 15,
  },
  // no reviews styles below
  noReviewsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    height: 200,
  },
  noReviewsText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  noReviewsSubText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  // no reviews styles above
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  reviewContent: {
    flex: 1,
    // backgroundColor: "#E6E0E9",
  },
  username: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  reviewTitle: {
    fontWeight: "medium",
    marginBottom: 5,
  },
  reviewText: {
    marginBottom: 8,
  },
  actionContainer: {
    flexDirection: "row",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  addReviewContainer: {
    // flex: 1,
    borderWidth: 2,
    borderColor: "gray",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "white",
    margin: 20,
  },
  input: {
    borderWidth: 2,
    borderColor: "gray",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  addReviewHeader: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 5,
  },
});

export default ParkReviewsScreen;
