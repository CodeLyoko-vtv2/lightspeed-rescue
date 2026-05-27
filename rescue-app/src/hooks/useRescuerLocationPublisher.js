import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const LOCATION_INTERVAL_MS = 15000;
const LOCATION_DISTANCE_M = 5;

export function useRescuerLocationPublisher() {
  useEffect(() => {
    let mounted = true;
    let watcher = null;
    let intervalId = null;

    const publishLocation = async () => {
      const rescuerUid = await AsyncStorage.getItem("rescuerUid");
      if (!rescuerUid) return;

      const foreground = await Location.requestForegroundPermissionsAsync();
      if (foreground.status !== "granted") return;
      Location.requestBackgroundPermissionsAsync().catch(() => {});

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      if (!mounted) return;

      const currentLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      await setDoc(
        doc(db, "Users", rescuerUid),
        {
          currentLocation,
          location: currentLocation,
          lastLocationUpdate: serverTimestamp(),
          locationSource: "rescue-app",
          rescueAppOnline: true,
        },
        { merge: true },
      );
    };

    const start = async () => {
      try {
        await publishLocation();
        watcher = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: LOCATION_INTERVAL_MS,
            distanceInterval: LOCATION_DISTANCE_M,
          },
          () => {
            publishLocation().catch((error) => {
              console.warn("Khong the cap nhat vi tri doi cuu ho:", error);
            });
          },
        );
        intervalId = setInterval(() => {
          publishLocation().catch((error) => {
            console.warn("Khong the dong bo vi tri doi cuu ho:", error);
          });
        }, LOCATION_INTERVAL_MS);
      } catch (error) {
        console.warn("Khong the bat dong bo vi tri doi cuu ho:", error);
      }
    };

    start();

    return () => {
      mounted = false;
      if (watcher) watcher.remove();
      if (intervalId) clearInterval(intervalId);
    };
  }, []);
}
