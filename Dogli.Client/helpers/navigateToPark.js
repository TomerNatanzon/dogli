import { Alert, Linking } from "react-native";

export const navigateToPark = (park) => {
  console.log("Navigating to park: ", park);
  const lat = park.latitude;
  const lng = park.longitude;

  Alert.alert(
    "Navigate to Park",
    "Choose an app to navigate with:",
    [
      {
        text: "Google Maps",
        onPress: () => {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
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
