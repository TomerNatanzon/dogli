import { db } from "../firebaseConfiguration";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
  limit,
  getDoc,
} from "firebase/firestore";

const checkinService = {
  getActiveCheckins: async (parkId) => {
    try {
      const parkCheckinCollection = collection(
        db,
        "checkins",
        parkId,
        "parkCheckins"
      );
      const q = query(
        parkCheckinCollection,
        where("status", "in", ["active", "scheduled", "completed", "pending"])
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.log("Error getting active check-ins:", error);
    }
  },

  checkIn: async (parkId, checkInData) => {
    try {
      const parkCheckinCollection = collection(
        db,
        "checkins",
        parkId,
        "parkCheckins"
      );
      const data = {
        ...checkInData,
        createdAt: serverTimestamp(),
      };

      const checkinRef = await addDoc(parkCheckinCollection, data);
      console.log("Check-in successful:", checkinRef.id);
      return checkinRef.id;
    } catch (error) {
      console.log("Error checking in:", error);
      throw error;
    }
  },

  checkOut: async (parkId, checkinId, dogCount) => {
    try {
      const checkinRef = doc(db, "checkins", parkId, "parkCheckins", checkinId);
      await updateDoc(checkinRef, {
        status: "completed",
        checkoutTime: serverTimestamp(),
        dogCountAtCheckout: dogCount,
      });
      console.log("Check-out successful");
    } catch (error) {
      console.log("Error checking out:", error);
    }
  },

  getParkStatus: async (parkId) => {
    try {
      const parkCheckinCollection = collection(
        db,
        "checkins",
        parkId,
        "parkCheckins"
      );
      const q = query(
        parkCheckinCollection,
        where("status", "==", "completed"),
        orderBy("checkoutTime", "desc"),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const lastCheckout = snapshot.docs[0].data();
        return {
          lastUpdateTime: lastCheckout.checkoutTime,
          dogCount: lastCheckout.dogCountAtCheckout,
        };
      }
      return null;
    } catch (error) {
      console.log("Error getting park status:", error);
    }
  },

  addReminder: async (parkId, userId, checkinId, reminderTime) => {
    try {
      const parkReminderCollection = collection(
        db,
        "reminders",
        parkId,
        "parkReminders"
      );

      const reminderData = {
        userId,
        checkinId,
        reminderTime,
        status: "pending",
        createdAt: serverTimestamp(),
      };

      const reminderRef = await addDoc(parkReminderCollection, reminderData);
      console.log("Reminder added successfully:", reminderRef.id);
      return reminderRef.id;
    } catch (error) {
      console.log("Error adding reminder:", error);
    }
  },

  getPendingReminders: async (parkId, userId) => {
    try {
      const parkReminderCollection = collection(
        db,
        "reminders",
        parkId,
        "parkReminders"
      );
      const q = query(
        parkReminderCollection,
        where("userId", "==", userId),
        where("status", "==", "pending"),
        where("reminderTime", "<=", new Date())
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.log("Error getting pending reminders:", error);
    }
  },

  updateReminderStatus: async (parkId, reminderId, newStatus) => {
    try {
      const reminderRef = doc(
        db,
        "reminders",
        parkId,
        "parkReminders",
        reminderId
      );
      await updateDoc(reminderRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      console.log("Reminder status updated successfully");
    } catch (error) {
      console.log("Error updating reminder status:", error);
    }
  },
};

export default checkinService;
