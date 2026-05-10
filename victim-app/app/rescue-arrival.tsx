import React from "react";
import { View, Text, TouchableOpacity, StatusBar, StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";

export default function RescueArrivalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const arrivalLocation = { 
    latitude: 16.077076, 
    longitude: 108.219471,
    latitudeDelta: 0.002,
    longitudeDelta: 0.002,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* --- BẢN ĐỒ NỀN --- */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={arrivalLocation}
      >
        <Marker coordinate={arrivalLocation}>
          <View style={styles.markerWrapper}>
             <Text style={styles.markerLabel}>Đội cứu hộ Công an Thành phố...</Text>
             <Ionicons name="location" size={40} color="#FF8852" />
          </View>
        </Marker>
      </MapView>

      {/* --- CÁC NÚT ĐIỀU KHIỂN PHỤ --- */}
      <View style={styles.sideButtons}>
        <TouchableOpacity style={styles.sideBtn}><MaterialCommunityIcons name="compass" size={24} color="#555" /></TouchableOpacity>
        <TouchableOpacity style={styles.sideBtn}><Ionicons name="search" size={24} color="#555" /></TouchableOpacity>
        <TouchableOpacity style={styles.sideBtn}><Ionicons name="volume-high" size={24} color="#555" /></TouchableOpacity>
      </View>

      {/* --- BOTTOM SHEET --- */}
      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.dragHandle} />
        
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.arrivalTitle}>Bạn đã đến nơi</Text>
            <Text style={styles.addressText}>89 Trần Phú, Hải Châu 1, Hải Châu, Đà Nẵng</Text>
            <Text style={styles.subText}>Đã xem gần đây</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/home")} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color="#555" />
          </TouchableOpacity>
        </View>

        {/* Thẻ thông tin Đội cứu hộ */}
        <View style={styles.placeCard}>
          <View style={styles.placeInfo}>
            <Text style={styles.placeName}>Đội cứu hộ Công an Thành phố Đà Nẵng</Text>
            <Text style={styles.placeCategory}>Đội cứu hộ</Text>
          </View>
        </View>

        {/* Hàng nút chức năng */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFF5F0' }]}>
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
    fontSize: 10, 
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
  arrivalTitle: { fontSize: 22, fontWeight: 'bold', color: '#2D3142' },
  addressText: { fontSize: 13, color: '#666', marginTop: 4 },
  subText: { fontSize: 12, color: '#999', marginTop: 2 },
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
  // ✅ ĐÃ BỔ SUNG: placeInfo bị thiếu
  placeInfo: {
    flex: 1,
  },
  placeName: { fontSize: 15, fontWeight: 'bold', color: '#2D3142' },
  placeCategory: { fontSize: 13, color: '#888', marginTop: 2 },
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
  actionBtnText: { fontSize: 12, fontWeight: '600', color: '#333', marginLeft: 6 },
  parkingText: { color: '#FF8852', fontWeight: 'bold', fontSize: 16 },
});