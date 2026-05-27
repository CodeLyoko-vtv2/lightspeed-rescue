import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { doc, onSnapshot, query, collection, where, updateDoc, getDocs } from "firebase/firestore"; 
import { db } from "../firebaseConfig";
import { COLORS } from "../constants/colors";
import { styles } from "../constants/navigation-active.styles";

export default function TrackingActiveScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const { requestId } = useLocalSearchParams();

  const [destination, setDestination] = useState<any>(null);
  const [currentLoc, setCurrentLoc] = useState<any>(null);
  const [remainingRoute, setRemainingRoute] = useState<any[]>([]);
  const [showStreetLabel, setShowStreetLabel] = useState(true);
  const [rescueTeamInfo, setRescueTeamInfo] = useState<any>(null);

  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ✅ LOGIC 1: LẮNG NGHE ĐỘI CỨU HỘ DI CHUYỂN
  useEffect(() => {
    if (!requestId) return;

    const q = query(
      collection(db, "rescue_missions"),
      where("sosId", "==", requestId),
      where("status", "in", ["accepted", "pending"]),
    );
    let unsubTeam: (() => void) | null = null;
    const unsubMission = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const teamId = snapshot.docs[0].data().rescuerId;
        if (unsubTeam) unsubTeam();
        unsubTeam = onSnapshot(doc(db, "Users", teamId), (teamDoc) => {
          if (teamDoc.exists()) {
            const teamData = teamDoc.data();
            setRescueTeamInfo(teamData);
            setDestination({
              latitude: teamData.currentLocation.latitude,
              longitude: teamData.currentLocation.longitude,
            });
          }
        });
      }
    });
    return () => {
      if (unsubTeam) unsubTeam();
      unsubMission();
    };
  }, [requestId]);

  // ✅ LOGIC 2: THEO DÕI NẠN NHÂN (RULE 10S/LẦN)
  useEffect(() => {
    const updateMe = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCurrentLoc({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    };

    updateMe();
    
    locationIntervalRef.current = setInterval(updateMe, 10000); 
    const timer = setTimeout(() => setShowStreetLabel(false), 3000);

    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
      clearTimeout(timer);
    };
  }, []);

  // ✅ LOGIC 3: VẼ ĐƯỜNG GẤP KHÚC (THUẬT TOÁN MANHATTAN 0.3) VÀ CHECK ĐÍCH
  useEffect(() => {
    if (currentLoc && destination) {
      // 🛣️ Thuật toán nội suy tuyến tính với hệ số 0.3
      setRemainingRoute([
        currentLoc, // Điểm 1: Nạn nhân
        {
          latitude: currentLoc.latitude + (destination.latitude - currentLoc.latitude) * 0.3,
          longitude: currentLoc.longitude,
        }, // Điểm 2: Gấp khúc dọc (chạy 30% vĩ độ)
        {
          latitude: currentLoc.latitude + (destination.latitude - currentLoc.latitude) * 0.3,
          longitude: destination.longitude,
        }, // Điểm 3: Gấp khúc ngang (chạy thẳng sang kinh độ đích)
        destination, // Điểm 4: Đội cứu hộ (chạy nốt 70% vĩ độ còn lại)
      ]);

      const dist = Math.sqrt(
        Math.pow(currentLoc.latitude - destination.latitude, 2) +
          Math.pow(currentLoc.longitude - destination.longitude, 2),
      );

      // --- KHI HAI ĐỘI GẶP NHAU (Khoảng cách < 20m) ---
      if (dist < 0.0002) {
        
        if (locationIntervalRef.current) {
          clearInterval(locationIntervalRef.current);
          locationIntervalRef.current = null;
        }

        const finalizeMeeting = async () => {
          try {
            if (!requestId) return;

            await updateDoc(doc(db, "sos_alerts", requestId as string), {
              status: "accepted",
            });

            const q = query(
              collection(db, "rescue_missions"),
              where("sosId", "==", requestId),
            );
            const missionSnap = await getDocs(q);

            if (!missionSnap.empty) {
              const missionId = missionSnap.docs[0].id;
              await updateDoc(doc(db, "rescue_missions", missionId), {
                status: "accepted",
              });
            }

            // ✅ TRUYỀN THAM SỐ TÊN ĐỘI VÀ VỊ TRÍ GẶP NHAU
            router.replace({
              pathname: "/rescue-arrival",
              params: {
                rescueTeamName: rescueTeamInfo?.fullName || "Đội cứu hộ",
                requestId: requestId as string,
                meetingLat: destination.latitude.toString(),
                meetingLng: destination.longitude.toString(),
              }
            });
          } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái kết thúc:", error);
            router.replace("/rescue-arrival");
          }
        };

        finalizeMeeting();
      }

      if (mapRef.current) {
        mapRef.current.animateCamera(
          { center: currentLoc },
          { duration: 1000 },
        );
      }
    }
  }, [currentLoc, destination]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {!currentLoc || !destination ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#1A1C1E",
          }}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 15, color: "#FFF" }}>
            Đang thiết lập dẫn đường Real-time...
          </Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            ...currentLoc,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          }}
        >
          <Polyline
            coordinates={remainingRoute}
            strokeWidth={8}
            strokeColor="#333"
          />
          <Polyline
            coordinates={remainingRoute}
            strokeWidth={5}
            strokeColor="#FF8852"
          />
          <Marker coordinate={currentLoc} anchor={{ x: 0.5, y: 0.5 }}>
            <View
              style={{
                width: 40,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons
                name="navigate"
                size={28}
                color={COLORS.primary}
                style={{ transform: [{ rotate: "-45deg" }] }}
              />
            </View>
          </Marker>
          
          <Marker coordinate={destination} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.carMarkerWrapper}>
              <Text>🚑</Text>
            </View>
          </Marker>
        </MapView>
      )}

      <View style={[styles.topInstruction, { top: insets.top + 10 }]}>
        <View style={styles.instructionMain}>
          <Ionicons name="arrow-up" size={32} color="#FFF" />
          <Text style={styles.instructionText}>Tiến về phía cứu hộ</Text>
        </View>
        <View style={styles.nextStep}>
          <Text style={styles.nextStepText}>{rescueTeamInfo?.fullName}</Text>
          <MaterialCommunityIcons name="shield-check" size={20} color="#FFF" />
        </View>
      </View>

      <View style={styles.speedWrapper}>
        <Text style={styles.speedValue}>5</Text>
        <Text style={styles.speedUnit}>km/h</Text>
      </View>
      
      <View style={styles.sideControls}>
        <TouchableOpacity style={styles.sideIconBtn}>
          <Ionicons name="compass" size={24} color="#555" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.sideIconBtn}>
          <Ionicons name="search" size={24} color="#555" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.sideIconBtn}>
          <Ionicons name="volume-medium" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      <View style={[styles.bottomInfo, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#555" />
        </TouchableOpacity>
        <View style={styles.statsContainer}>
          <Text style={styles.timeValue}>23 phút</Text>
          <Text style={styles.distValue}>15 km</Text>
        </View>
        <TouchableOpacity
          style={styles.recenterBtn}
          onPress={() =>
            mapRef.current?.animateCamera({
              center: currentLoc,
              pitch: 45,
              zoom: 17,
            })
          }
        >
          <MaterialCommunityIcons
            name="directions-fork"
            size={24}
            color="#555"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
