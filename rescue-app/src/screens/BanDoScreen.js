import React, { useEffect, useState } from "react";
import {
  Image,
  View,
  StyleSheet,
} from "react-native";
import {
  useRouter,
} from "expo-router";
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
import { openVictimDirectionsForRescuer } from "../utils/googleMapsNavigation";

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

  return (
    <View style={styles.container}>
      <View style={styles.mapFallback}>
        <View style={styles.landPatchLarge} />
        <View style={styles.landPatchSmall} />
        <View style={[styles.road, styles.roadOne]} />
        <View style={[styles.road, styles.roadTwo]} />
        <View style={[styles.road, styles.roadThree]} />
        <View style={[styles.road, styles.roadFour]} />
        <View style={styles.waterArea} />

        {victimLocation ? (
          <View style={styles.victimMarker}>
            <Image
              source={require("../../assets/icons/pin-trangchu.png")}
              style={styles.markerIcon}
              resizeMode="contain"
            />
          </View>
        ) : null}

        {rescuerLocation ? (
          <View style={styles.rescuerMarker}>
            <View style={styles.rescuerDotOuter}>
              <View style={styles.rescuerDotInner} />
            </View>
          </View>
        ) : null}
      </View>

      {/* Search */}
      <SearchBar onPress={() =>
    router.push("/BanDoTimKiem")
  }/>

      {/* Filter */}
      <FilterPills />

      {/* Secondary buttons */}
      <SecondaryActions />

      {/* Main actions */}
      <MainActions
        directionsEnabled={Boolean(victimLocation)}
        onDirections={() => openVictimDirectionsForRescuer(rescuerId)}
      />

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

  mapFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#EEF3EA",
    overflow: "hidden",
  },

  landPatchLarge: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#D8ECCE",
    top: 70,
    left: -90,
    transform: [{ rotate: "-18deg" }],
  },

  landPatchSmall: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "#E8E2C8",
    right: -45,
    bottom: 210,
    transform: [{ rotate: "12deg" }],
  },

  waterArea: {
    position: "absolute",
    width: 180,
    height: "120%",
    right: -70,
    top: -40,
    backgroundColor: "#B9DCEC",
    transform: [{ rotate: "8deg" }],
  },

  road: {
    position: "absolute",
    height: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D7DED7",
  },

  roadOne: {
    width: "135%",
    top: 190,
    left: -80,
    transform: [{ rotate: "-17deg" }],
  },

  roadTwo: {
    width: "125%",
    top: 390,
    left: -50,
    transform: [{ rotate: "18deg" }],
  },

  roadThree: {
    width: "110%",
    top: 520,
    left: -20,
    transform: [{ rotate: "-8deg" }],
  },

  roadFour: {
    width: 14,
    height: "115%",
    top: -20,
    left: "48%",
    transform: [{ rotate: "4deg" }],
  },

  victimMarker: {
    position: "absolute",
    top: "43%",
    left: "55%",
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },

  markerIcon: {
    width: 34,
    height: 34,
    tintColor: "#E53935",
  },

  rescuerMarker: {
    position: "absolute",
    top: "54%",
    left: "38%",
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  rescuerDotOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255, 136, 82, 0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  rescuerDotInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FF8852",
    borderWidth: 3,
    borderColor: "#FFFFFF",
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
