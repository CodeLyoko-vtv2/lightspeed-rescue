import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
} from "react-native";
import {
  useRouter,
} from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavbar from "../components/navigation/NavigationBarMobile";
import MainActions from "../components/map/MainActions";
import SecondaryActions from "../components/map/SecondaryActions";
import SearchBar from "../components/map/SearchBar";
import FilterPills from "../components/map/FilterPills";

export default function BanDoScreen() {
  const router = useRouter();
  const [rescuerId, setRescuerId] = useState(null);
  const [rescuerLocation, setRescuerLocation] = useState(null);
  const [victimLocation, setVictimLocation] = useState(null);
  const [activeSosId, setActiveSosId] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem("rescuerUid").then((storedId) => {
      if (!storedId) {
        router.replace("/DangNhap");
        return;
      }
      setRescuerId(storedId);
    });
  }, [router]);

  useEffect(() => {
    if (!rescuerId) return undefined;

    const q = query(
      collection(db, "rescue_missions"),
      where("rescuerId", "==", rescuerId),
      where("status", "in", ["pending", "accepted"]),
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        setActiveSosId(null);
        setVictimLocation(null);
        return;
      }

      const missionDoc = snapshot.docs[0];
      const missionData = missionDoc.data();
      const sosId = missionData?.sosId;
      setActiveSosId(sosId || null);

      if (sosId) {
        const sosSnap = await getDoc(doc(db, "sos_alerts", sosId));
        if (sosSnap.exists()) {
          const data = sosSnap.data();
          const loc = data?.location;
          if (loc?.latitude && loc?.longitude) {
            setVictimLocation({ latitude: loc.latitude, longitude: loc.longitude });
          } else if (loc?.lat && loc?.lng) {
            setVictimLocation({ latitude: loc.lat, longitude: loc.lng });
          }
        }
      }
    });

    return () => unsub();
  }, [rescuerId]);

  useEffect(() => {
    if (!activeSosId) return;
    const unsub = onSnapshot(doc(db, "sos_alerts", activeSosId), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const loc = data?.location;
      if (loc?.latitude && loc?.longitude) {
        setVictimLocation({ latitude: loc.latitude, longitude: loc.longitude });
      } else if (loc?.lat && loc?.lng) {
        setVictimLocation({ latitude: loc.lat, longitude: loc.lng });
      }
    });
    return () => unsub();
  }, [activeSosId]);

  useEffect(() => {
    if (!rescuerId) return undefined;

    let intervalId = null;

    const updateRescuerLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const loc = await Location.getCurrentPositionAsync({});
        const nextLoc = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setRescuerLocation(nextLoc);
        await setDoc(doc(db, "Users", rescuerId), {
          currentLocation: nextLoc,
          location: nextLoc,
          lastLocationUpdate: serverTimestamp(),
          locationSource: "rescue-app",
          rescueAppOnline: true,
        }, { merge: true });
      } catch (error) {
        console.error("Lỗi cập nhật vị trí đội cứu hộ:", error);
      }
    };

    updateRescuerLocation();
    intervalId = setInterval(updateRescuerLocation, 10000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [rescuerId]);

  const initialRegion = rescuerLocation
    ? {
        ...rescuerLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : victimLocation
      ? {
          ...victimLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
      : {
          latitude: 16.0544,
          longitude: 108.2022,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
      >
        {rescuerLocation && <Marker coordinate={rescuerLocation} />}
        {victimLocation && <Marker coordinate={victimLocation} />}
      </MapView>

      {/* Search */}
      <SearchBar onPress={() =>
    router.push("/BanDoTimKiem")
  }/>

      {/* Filter */}
      <FilterPills />

      {/* Secondary buttons */}
      <SecondaryActions />

      {/* Main actions */}
      <MainActions />

      {/* Bottom Navbar */}
      <BottomNavbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  map: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  searchContainer: {
    position: "absolute",
    top: 60,
    width: "100%",
    paddingHorizontal: 15,
  },

  searchBar: {
    height: 55,
    backgroundColor: "#FFF",
    borderRadius: 40,
    paddingHorizontal: 20,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },

  searchText: {
    fontSize: 18,
    color: "#707070",
  },

  userIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  filterWrapper: {
    position: "absolute",
    top: 130,
    paddingLeft: 10,
  },

  filterButton: {
    backgroundColor: "#FFF",
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  filterText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "500",
  },

  marker: {
    position: "absolute",
    top: "45%",
    left: "50%",

    width: 28,
    height: 28,
    borderRadius: 20,

    backgroundColor: "#FF8852",
    borderWidth: 4,
    borderColor: "#FFF",

    marginLeft: -14,
    marginTop: -14,
  },
});
