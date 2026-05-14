// app/home-sos-sending.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState, useCallback } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { styles } from "../constants/home-sos-sending.styles";
import { COLORS } from "../constants/colors";

// Firebase
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

// Cấu hình danh sách sự cố
const INCIDENTS = [
  { id: 'NUCLEAR', name: 'Hạt nhân', icon: 'radioactive', bgColor: '#E8F5E9', iconColor: '#000' },
  { id: 'FIRE', name: 'Hoả hoạn', icon: 'fire', bgColor: '#FFEBEE', iconColor: '#000' },
  { id: 'EARTHQUAKE', name: 'Động đất', icon: 'office-building-marker', bgColor: '#E0F2F1', iconColor: '#000' },
  { id: 'DISEASE', name: 'Dịch bệnh', icon: 'virus', bgColor: '#EDE7F6', iconColor: '#000' },
  { id: 'FLOOD', name: 'Bão lũ', icon: 'waves', bgColor: '#FCE4EC', iconColor: '#000' },
  { id: 'OTHER', name: 'Khác', icon: 'plus-circle', bgColor: '#FFF8E1', iconColor: '#000' },
];

export default function HomeSOSSendingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [userData, setUserData] = useState({ fullName: "Đang tải...", phoneNumber: "" });
  const [address, setAddress] = useState("Đang xác định vị trí...");

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      getLocation();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      const storedPhone = await AsyncStorage.getItem("userPhone");
      if (storedPhone) {
        const q = query(collection(db, "Users"), where("phoneNumber", "==", storedPhone));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          setUserData({ fullName: data.fullName, phoneNumber: storedPhone });
        }
      }
    } catch (error) {
      console.error("Lỗi cập nhật Header:", error);
    }
  };

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setAddress("Quyền GPS bị từ chối");
        return;
      }
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      let reverseResult = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (reverseResult.length > 0) {
        const item = reverseResult[0];
        setAddress(`${item.name || ""}, ${item.street || ""}, ${item.district || ""}`);
      }
    } catch (error) {
      setAddress("Không thể lấy vị trí");
    }
  };

  const handleCancelSOS = () => {
    Alert.alert("Xác nhận", "Bạn muốn hủy tín hiệu SOS?", [
      { text: "Không", style: "cancel" },
      { text: "Hủy SOS", style: "destructive", onPress: () => {
        // TODO: Update status Firebase thành CANCELLED
        router.back();
      }}
    ]);
  };

  const handleSelectIncident = (incidentId: string) => {
    console.log("Đã chọn sự cố:", incidentId);
    // TODO: Chuyển sang màn điền thông tin chi tiết
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.userInfo} activeOpacity={0.7}>
          <View style={styles.avatarWrapper}>
            <Image source={require("../assets/images/avatar.png")} style={styles.avatar} />
          </View>
          <View style={styles.userTextContainer}>
            <Text numberOfLines={1}>
              <Text style={styles.userName}>{userData.fullName} </Text>
              <Text style={styles.userPhone}>
                {userData.phoneNumber.startsWith("+84") 
                  ? "0" + userData.phoneNumber.slice(3) 
                  : userData.phoneNumber}
              </Text>
            </Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={18} color={COLORS.primary} />
              <Text style={styles.locationText} numberOfLines={1}>{address}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={28} color={COLORS.textNormal} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <View>
            <MaterialCommunityIcons name="bell" size={32} color="#2D3142" />
            <View style={styles.notificationDot} />
          </View>
        </TouchableOpacity>
      </View>

      {/* --- BODY: NỀN MỜ LAN TỎA (ImageBackground ôm trọn phần dưới) --- */}
      <ImageBackground 
        source={require("../assets/images/sos-broadcast-effect.png")} // Map đúng file nền mới sếp gửi
        style={styles.mainBackground}
        imageStyle={styles.mainBackgroundImage}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
          
          <Text style={styles.statusText}>Tín hiệu đang được phát đi...</Text>

          {/* VÙNG NÚT CHẠM ĐỂ HỦY */}
          <View style={styles.centerButtonContainer}>
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={handleCancelSOS}
            >
              {/* Dùng thẳng ảnh nút "Chạm để hủy" sếp mới gửi */}
              <Image 
                source={require("../assets/images/huy-button.png")} 
                style={styles.huyButtonImage} 
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* CHỌN LOẠI SỰ CỐ */}
          <View style={styles.incidentSection}>
            <Text style={styles.incidentTitle}>CHỌN LOẠI SỰ CỐ ĐANG XẢY RA</Text>
            
            <View style={styles.gridContainer}>
              {INCIDENTS.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.incidentPill}
                  onPress={() => handleSelectIncident(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconCircle, { backgroundColor: item.bgColor }]}>
                    <MaterialCommunityIcons name={item.icon as any} size={20} color={item.iconColor} />
                  </View>
                  <Text style={styles.incidentText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </ScrollView>
      </ImageBackground>
    </View>
  );
}