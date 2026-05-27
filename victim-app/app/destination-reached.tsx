import React, { useState } from "react";
import { View, Text, TouchableOpacity, StatusBar, Image, Alert } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { COLORS } from "../constants/colors";
import { styles } from "../constants/destination-reached.styles";

export default function DestinationReachedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requestId } = useLocalSearchParams();
  const [isCompleting, setIsCompleting] = useState(false);
  const handleCompleteRescue = async () => {
    if (!requestId || isCompleting) {
      router.push("/(tabs)/map");
      return;
    }
    try {
      setIsCompleting(true);
      await updateDoc(doc(db, "sos_alerts", String(requestId)), {
        status: "completed",
      });

      const missionQuery = query(
        collection(db, "rescue_missions"),
        where("sosId", "==", String(requestId)),
      );
      const missionSnap = await getDocs(missionQuery);
      if (!missionSnap.empty) {
        await updateDoc(doc(db, "rescue_missions", missionSnap.docs[0].id), {
          status: "completed",
          completedAt: serverTimestamp(),
        });
      }
      Alert.alert("Thành công", "Giải cứu thành công!");
      router.push("/(tabs)/map");
    } catch (error) {
      console.error("Lỗi hoàn tất giải cứu:", error);
      router.push("/(tabs)/map");
    } finally {
      setIsCompleting(false);
    }
  };

  // Tọa độ đích đến: Công an TP Đà Nẵng
  const destination = { 
    latitude: 16.077076, 
    longitude: 108.219471,
    latitudeDelta: 0.002,
    longitudeDelta: 0.002,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* --- BẢN ĐỒ NỀN (Tĩnh, tập trung vào điểm đến) --- */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={destination}
        scrollEnabled={true}
        zoomEnabled={true}
      >
        <Marker coordinate={destination}>
            <View style={styles.arrivalMarkerWrapper}>
                <View style={styles.orangeDotOuter}>
                    <View style={styles.orangeDotInner} />
                </View>
                <Image 
                  source={require("../assets/images/marker-police.png")} 
                  style={{ width: 32, height: 32, marginLeft: 10 }} 
                />
            </View>
        </Marker>
      </MapView>

      {/* --- CÁC NÚT ĐIỀU KHIỂN PHỤ TRÊN BẢN ĐỒ --- */}
      <View style={styles.sideButtons}>
         <TouchableOpacity style={styles.sideBtn}><MaterialCommunityIcons name="compass-outline" size={24} color="#555" /></TouchableOpacity>
         <TouchableOpacity style={styles.sideBtn}><Ionicons name="search" size={24} color="#555" /></TouchableOpacity>
         <TouchableOpacity style={styles.sideBtn}><Ionicons name="volume-medium" size={24} color="#555" /></TouchableOpacity>
      </View>

      {/* --- BOTTOM PANEL: BẠN ĐÃ ĐẾN NƠI --- */}
      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.arrivalTitle}>Bạn đã đến nơi</Text>
            <Text style={styles.addressText}>80 Lê Lợi, Thạch Thang, Hải Châu, Đà Nẵng</Text>
            <Text style={styles.subText}>Đã xem gần đây</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/map")}>
            <Ionicons name="close-circle" size={30} color="#E0E0E0" />
          </TouchableOpacity>
        </View>

        {/* Thông tin địa điểm phía dưới title */}
        <View style={styles.placeCard}>
          <MaterialCommunityIcons name="police-badge" size={24} color="#777" />
          <View style={{ marginLeft: 15 }}>
            <Text style={styles.placeName}>Công an Thành phố Đà Nẵng</Text>
            <Text style={styles.placeCategory}>Cơ quan công an</Text>
          </View>
        </View>

        {/* Hàng nút chức năng cuối cùng */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleCompleteRescue} disabled={isCompleting}>
             <Ionicons name="checkmark-sharp" size={20} color="#FF8852" />
             <Text style={styles.actionBtnText}>Xác nhận</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
             <FontAwesome5 name="walking" size={18} color="#FF8852" />
             <Text style={styles.actionBtnText}>Đi bộ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
             <View style={styles.parkingIcon}><Text style={styles.parkingText}>P</Text></View>
             <Text style={styles.actionBtnText}>Lưu chỗ đỗ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}