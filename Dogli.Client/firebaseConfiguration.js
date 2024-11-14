import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import {
  getFirestore,
  initializeFirestore,
  setLogLevel as setFirestoreLogLevel,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FB_API_KEY,
  authDomain: process.env.FB_AUTH_DOMAIN,
  projectId: process.env.FB_PROJECT_ID,
  storageBucket: process.env.FB_STORAGE_BUCKET,
  messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
  appId: process.env.FB_APP_ID,
  measurementId: process.env.FB_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app, "gs://dogli-app.appspot.com");

const db = getFirestore(app);
setFirestoreLogLevel("silent");

export { storage, db };