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

  // ✅ Dùng useRef để nắm thóp cái vòng lặp 10s, tiện cho việc "khai tử" nó sau này
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ✅ LOGIC 1: LẮNG NGHE ĐỘI CỨU HỘ DI CHUYỂN
  useEffect(() => {
    if (!requestId) return;

    const q = query(
      collection(db, "Dispatches"),
      where("requestId", "==", requestId),
    );
    const unsubDispatch = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const teamId = snapshot.docs[0].data().rescueTeamId;
        const unsubTeam = onSnapshot(doc(db, "Users", teamId), (teamDoc) => {
          if (teamDoc.exists()) {
            const teamData = teamDoc.data();
            setRescueTeamInfo(teamData);
            setDestination({
              latitude: teamData.currentLocation.latitude,
              longitude: teamData.currentLocation.longitude,
            });
          }
        });
        return () => unsubTeam();
      }
    });
    return () => unsubDispatch();
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
    
    // Gán vòng lặp 10s vào biến Ref
    locationIntervalRef.current = setInterval(updateMe, 10000); 
    const timer = setTimeout(() => setShowStreetLabel(false), 3000);

    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
      clearTimeout(timer);
    };
  }, []);

  // ✅ LOGIC 3: VẼ ĐƯỜNG VÀ CHECK ĐÍCH KHI GẶP NHAU
  useEffect(() => {
    if (currentLoc && destination) {
      setRemainingRoute([
        currentLoc,
        {
          latitude:
            currentLoc.latitude +
            (destination.latitude - currentLoc.latitude) * 0.5,
          longitude: destination.longitude,
        },
        destination,
      ]);

      const dist = Math.sqrt(
        Math.pow(currentLoc.latitude - destination.latitude, 2) +
          Math.pow(currentLoc.longitude - destination.longitude, 2),
      );

      // --- KHI HAI ĐỘI GẶP NHAU (Khoảng cách < 20m) ---
      if (dist < 0.0002) {
        
        // 🔴 1. TẮT NGAY VÒNG LẶP ĐỊNH VỊ 10S ĐỂ BẢO VỆ PIN VÀ MÁY
        if (locationIntervalRef.current) {
          clearInterval(locationIntervalRef.current);
          locationIntervalRef.current = null;
          console.log("🛑 Đã ngắt vòng lặp định vị 10s thành công!");
        }

        const finalizeMeeting = async () => {
          try {
            if (!requestId) return;

            // 2. Chuyển status của SOS_Requests thành RESOLVED
            await updateDoc(doc(db, "SOS_Requests", requestId as string), {
              status: "RESOLVED",
            });

            // 3. Tìm Dispatch tương ứng và chuyển thành MET_VICTIM
            const q = query(collection(db, "Dispatches"), where("requestId", "==", requestId));
            const dispatchSnap = await getDocs(q);
            
            if (!dispatchSnap.empty) {
              const dispatchId = dispatchSnap.docs[0].id;
              await updateDoc(doc(db, "Dispatches", dispatchId), {
                status: "MET_VICTIM",
              });
            }

            console.log("✅ Hệ thống: Đã cập nhật trạng thái Hoàn thành.");

            // 4. Chuyển sang màn hình xác nhận cuối cùng
            router.replace("/rescue-arrival");
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
          
          <Marker
            coordinate={destination}
            title={rescueTeamInfo?.fullName}
            pinColor="#FF8852"
          />
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
          <Text style={styles.timeValue}>15km</Text>
          <Text style={styles.distValue}>23 phút</Text>
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