import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StatusBar, StyleSheet, ActivityIndicator, Alert } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location"; // ✅ THÊM EXPO LOCATION
import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { COLORS } from "../constants/colors";

export default function RescueArrivalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { rescueTeamName, meetingLat, meetingLng, requestId } = useLocalSearchParams();

  const lat = meetingLat ? parseFloat(meetingLat as string) : 16.077076;
  const lng = meetingLng ? parseFloat(meetingLng as string) : 108.219471;
  const teamName = rescueTeamName ? (rescueTeamName as string) : "Đội cứu hộ";

  const arrivalLocation = { 
    latitude: lat, 
    longitude: lng,
    latitudeDelta: 0.002,
    longitudeDelta: 0.002,
  };

  // ✅ STATE LƯU ĐỊA CHỈ DỊCH NGƯỢC
  const [address, setAddress] = useState("Đang dịch tọa độ...");
  const [isCompleting, setIsCompleting] = useState(false);

  // ✅ CHẠY REVERSE GEOCODING KHI VÀO MÀN HÌNH
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        let res = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng,
        });
        if (res.length > 0) {
          // Lấy Tên đường + Phường/Xã + Quận/Huyện
          const street = res[0].street ? `${res[0].street}, ` : "";
          const subregion = res[0].subregion ? `${res[0].subregion}, ` : "";
          const region = res[0].region || "";
          
          setAddress(`${street}${subregion}${region}`);
        } else {
          setAddress("Không xác định được địa chỉ cụ thể");
        }
      } catch (error) {
        console.log("Lỗi dịch địa chỉ:", error);
        setAddress(`${lat}, ${lng}`); // Fallback nếu mạng lỗi
      }
    };

    fetchAddress();
  }, [lat, lng]);

  const handleCompleteRescue = async () => {
    if (!requestId || isCompleting) {
      router.push("/(tabs)/home");
      return;
    }
    try {
      setIsCompleting(true);
      await updateDoc(doc(db, "sos_alerts", String(requestId)), {
        victimMetRescuer: true,
        rescueConfirmationStatus: "confirmed",
        rescueConfirmedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const missionQuery = query(
        collection(db, "rescue_missions"),
        where("sosId", "==", String(requestId)),
      );
      const missionSnap = await getDocs(missionQuery);
      if (!missionSnap.empty) {
        await updateDoc(doc(db, "rescue_missions", missionSnap.docs[0].id), {
          victimMetRescuer: true,
          rescueConfirmationStatus: "confirmed",
          rescueConfirmedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await addDoc(collection(db, "notifications"), {
        targetRole: "admin",
        title: "Nạn nhân đã gặp đội cứu hộ",
        body: `Nạn nhân đã xác nhận gặp đội cứu hộ cho SOS ${String(requestId)}.`,
        sosId: String(requestId),
        type: "VICTIM_MET_RESCUER",
        read: false,
        createdAt: serverTimestamp(),
      });
      Alert.alert("Thành công", "Giải cứu thành công!");
      router.push("/(tabs)/home");
    } catch (error) {
      console.error("Lỗi hoàn tất giải cứu:", error);
      router.push("/(tabs)/home");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={arrivalLocation}
      >
        <Marker coordinate={arrivalLocation}>
          <View style={styles.markerWrapper}>
             <Text style={styles.markerLabel}>{teamName}</Text>
             <Ionicons name="location" size={40} color="#FF8852" />
          </View>
        </Marker>
      </MapView>

      <View style={styles.sideButtons}>
        <TouchableOpacity style={styles.sideBtn}><MaterialCommunityIcons name="compass" size={24} color="#555" /></TouchableOpacity>
        <TouchableOpacity style={styles.sideBtn}><Ionicons name="search" size={24} color="#555" /></TouchableOpacity>
        <TouchableOpacity style={styles.sideBtn}><Ionicons name="volume-high" size={24} color="#555" /></TouchableOpacity>
      </View>

      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.dragHandle} />
        
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.arrivalTitle}>Bạn đã đến nơi</Text>
            
            {/* ✅ ĐÃ THAY TỌA ĐỘ BẰNG ĐỊA CHỈ TIẾNG VIỆT HOẶC ICON LOADING */}
            {address === "Đang dịch tọa độ..." ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <ActivityIndicator size="small" color="#666" style={{ marginRight: 5 }} />
                <Text style={styles.addressText}>{address}</Text>
              </View>
            ) : (
              <Text style={styles.addressText} numberOfLines={2}>{address}</Text>
            )}

            <Text style={styles.subText}>Trạng thái: Đã tiếp cận</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/home")} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color="#555" />
          </TouchableOpacity>
        </View>

        <View style={styles.placeCard}>
          <View style={styles.placeInfo}>
            <Text style={styles.placeName}>{teamName}</Text>
            <Text style={styles.placeCategory}>Đội cứu hộ</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#FFF5F0' }]}
            onPress={handleCompleteRescue}
            disabled={isCompleting}
          >
            <Ionicons name="checkmark" size={20} color="#FF8852" />
            <Text style={[styles.actionBtnText, { color: '#FF8852' }]}>Xác nhận</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <FontAwesome5 name="walking" size={16} color="#555" />
            <Text style={styles.actionBtnText}>Đi bộ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.parkingText}>P</Text>
            <Text style={styles.actionBtnText}>Lưu chỗ đỗ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  map: { flex: 1 },
  markerWrapper: { alignItems: 'center' },
  markerLabel: { 
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 5, 
    fontSize: 15, 
    color: '#FF5252', 
    fontWeight: 'bold',
    marginBottom: -5,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  sideButtons: { position: 'absolute', right: 15, top: '40%' },
  sideBtn: { 
    backgroundColor: '#FFF', 
    width: 45, 
    height: 45, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  bottomSheet: { 
    backgroundColor: '#FFF', 
    borderTopLeftRadius: 25, 
    borderTopRightRadius: 25, 
    paddingHorizontal: 20, 
    paddingTop: 10,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  dragHandle: { 
    width: 40, 
    height: 5, 
    backgroundColor: '#E0E0E0', 
    borderRadius: 3, 
    alignSelf: 'center', 
    marginBottom: 15 
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  arrivalTitle: { fontSize: 26, fontWeight: 'bold', color: '#2D3142' },
  addressText: { fontSize: 16, color: '#666', marginTop: 5, paddingRight: 10 },
  subText: { fontSize: 15, color: '#999', marginTop: 5 },
  closeBtn: { backgroundColor: '#F0F0F0', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  placeCard: { 
    backgroundColor: '#F8F9FB', 
    borderRadius: 15, 
    padding: 15, 
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#EEE',
    flexDirection: 'row',
    alignItems: 'center'
  },
  placeInfo: {
    flex: 1,
  },
  placeName: { fontSize: 18, fontWeight: 'bold', color: '#2D3142' },
  placeCategory: { fontSize: 16, color: '#888', marginTop: 2 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  actionBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F0F0F0', 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    borderRadius: 20,
    flex: 0.32,
    justifyContent: 'center'
  },
  actionBtnText: { fontSize: 15, fontWeight: '600', color: '#333', marginLeft: 6 },
  parkingText: { color: '#FF8852', fontWeight: 'bold', fontSize: 19 },
});
