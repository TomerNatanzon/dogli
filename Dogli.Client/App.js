import { Button } from "react-native";
import AppInitializer from "./components/AppInitializer";
import WelcomeToDogliScreen1 from "./app-screens/WelcomeToDogliScreen1";
import WelcomeToDogliScreen2 from "./app-screens/WelcomeToDogliScreen2";
import StartScreen from "./app-screens/StartScreen";
import LoginScreen from "./app-screens/LoginScreen";
import RegisterScreen from "./app-screens/RegisterScreen";
import ResetPasswordScreen from "./app-screens/ResetPasswordScreen";
import Dashboard from "./app-screens/Dashboard";
import AllDogsScreen from "./app-screens/AllDogsScreen";
import MyDogProfileScreen from "./app-screens/MyDogProfileScreen";
import HomeScreen from "./app-screens/HomeScreen";
import ParksMapScreen from "./app-screens/ParksMapScreen";
import ParkReviewsScreen from "./app-screens/ParkReviewsScreen";
import ParkProfileScreen from "./app-screens/ParkProfileScreen";
import ParkFinderScreen from "./app-screens/ParkFinderScreen";
import CheckInScreen from "./app-screens/CheckInScreen";
import GParkVisitorScreen from "./app-screens/GParkVisitorScreen";
import MyProfileScreen from "./app-screens/MyProfileScreen"; 
import MainScreen from "./app-screens/MainScreen";
import UserProfileScreen from "./app-screens/UserProfileScreen";


const App = () => {
  const [hideSplashScreen, setHideSplashScreen] = React.useState(true);

  const [fontsLoaded, error] = useFonts({
    "Inter-ExtraLight": require("./assets/fonts/Inter-ExtraLight.ttf"),
    "Inter-Regular": require("./assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("./assets/fonts/Inter-Medium.ttf"),
    "Inter-SemiBold": require("./assets/fonts/Inter-SemiBold.ttf"),
    "Inter-Bold": require("./assets/fonts/Inter-Bold.ttf"),
    "PlusJakartaSans-Regular": require("./assets/fonts/PlusJakartaSans-Regular.ttf"),
    "PlusJakartaSans-Bold": require("./assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Roboto-Regular": require("./assets/fonts/Roboto-Regular.ttf"),
  });

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <Provider theme={theme}>
      <NavigationContainer>
        {hideSplashScreen ? (
          <Stack.Navigator
            initialRouteName="AppInitializer"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="AppInitializer" component={AppInitializer} />
            <Stack.Screen name="StartScreen" component={StartScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />

            <Stack.Screen name="AllDogsScreen" component={AllDogsScreen} />
            <Stack.Screen
              name="MyDogProfileScreen"
              component={MyDogProfileScreen}
            />
            <Stack.Screen
              name="ParkProfileScreen"
              component={ParkProfileScreen}
            />
            <Stack.Screen name="HomeScreen" component={HomeScreen} />

            <Stack.Screen
              name="ParkFinderScreen"
              component={ParkFinderScreen}
            />
            <Stack.Screen
              name="GParkVisitorScreen"
              component={GParkVisitorScreen}
            />
            <Stack.Screen
              name="ParkReviewsScreen"
              component={ParkReviewsScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen name="CheckInScreen" component={CheckInScreen} />

            <Stack.Screen name="Dashboard" component={Dashboard} />

            <Stack.Screen name="ParksMapScreen" component={ParksMapScreen} />

            <Stack.Screen
              name="ResetPasswordScreen"
              component={ResetPasswordScreen}
            />
            <Stack.Screen
              name="WelcomeToDogliScreen2"
              component={WelcomeToDogliScreen2}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="WelcomeToDogliScreen1"
              component={WelcomeToDogliScreen1}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="MyProfileScreen"
              component={MyProfileScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="MainScreen"
              component={MainScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="UserProfileScreen"
              component={UserProfileScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        ) : null}
      </NavigationContainer>
    </Provider>
  );
};
export default App;
