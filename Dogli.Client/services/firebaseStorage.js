import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  listAll,
} from "firebase/storage";
import { storage } from "../firebaseConfiguration";

export const uploadImage = async (imageUri, storagePath) => {
  try {
    const storageRef = ref(storage, storagePath);
    const img = await fetch(imageUri);
    const bytes = await img.blob();

    const uploadTask = uploadBytesResumable(storageRef, bytes);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error("Error uploading image:", error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("Image uploaded successfully: ", downloadURL);
            resolve(downloadURL);
          } catch (error) {
            console.error("Error getting download URL:", error.message);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error("Error during image upload:", error);
    throw error;
  }
};

export const fetchImages = async (directoryPath) => {
  try {
    const imagesRef = ref(storage, directoryPath);
    const result = await listAll(imagesRef);
    const urls = await Promise.all(
      result.items.map((itemRef) => getDownloadURL(itemRef))
    );
    return urls;
  } catch (error) {
    console.error("Error fetching images:", error);
    throw error;
  }
};

export const fetchSingleImage = async (imagePath) => {
  try {
    const imageRef = ref(storage, imagePath);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  } catch (error) {
    if (error.code === "storage/object-not-found") {
      console.log("No image found at path:", imagePath);
      return null;
    } else {
      console.error("Error fetching image:", error);
      throw error;
    }
  }
};
