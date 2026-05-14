import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StatusBar,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { doc, onSnapshot } from "firebase/firestore"; // ✅ Import thêm doc, onSnapshot
import { db } from "../../firebaseConfig"; // ✅ Import db
import { COLORS } from "../../constants/colors";
import { styles } from "../../constants/(tabs)/map.styles";
import { router } from "expo-router";

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  
  const [location, setLocation] = useState<any>(null);
  const mapRef = useRef<MapView>(null);

  const [activeRescueId, setActiveRescueId] = useState<string | null>(null);

  // 1. ✅ LẮNG NGHE THÔNG BÁO ĐỂ "MỞ KHÓA" NÚT CHỈ ĐƯỜNG (Tiết kiệm Firebase)
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
  // ✅ Ép kiểu dữ liệu trả về thành any hoặc định nghĩa interface cho nó
  const data = notification.request.content.data as { requestId?: string };
  if (data && data.requestId) {
    setActiveRescueId(data.requestId); // Hết lỗi gán {}
  }
});

    const checkExistingNotifications = async () => {
  const presented = await Notifications.getPresentedNotificationsAsync();
  // ✅ Ép kiểu ở bước find để TypeScript biết n.request.content.data là gì
  const rescueNoti = presented.find(n => {
    const data = n.request.content.data as { requestId?: string };
    return data?.requestId;
  });

  if (rescueNoti) {
    const data = rescueNoti.request.content.data as { requestId?: string };
    setActiveRescueId(data.requestId || null); // Hết lỗi unknown
  }
};
    
    checkExistingNotifications();

    return () => subscription.remove();
  }, []);

  // 2. ✅ LẮNG NGHE ĐỂ "KHÓA LẠI" KHI ĐÃ HỦY HOẶC HOÀN THÀNH CA CỨU HỘ
  useEffect(() => {
    if (!activeRescueId) return; // Nếu chưa bật thì không cần nghe ngóng làm gì

    // Chỉ cắm ống nghe vào ĐÚNG 1 document này, cực kỳ nhẹ máy
    const unsub = onSnapshot(doc(db, "SOS_Requests", activeRescueId), (docSnap) => {
      if (docSnap.exists()) {
        const status = docSnap.data().status;
        
        // Nếu sếp ấn "Hủy SOS" hoặc 2 đội đã "Gặp nhau" (Resolved)
        if (status === "CANCELLED" || status === "RESOLVED") {
          setActiveRescueId(null); // 🔴 Tắt nút ngay lập tức
          Notifications.dismissAllNotificationsAsync(); // 🔴 Dọn dẹp sạch sẽ thông báo trên điện thoại
        }
      }
    });

    return () => unsub();
  }, [activeRescueId]);

  // 3. THEO DÕI VỊ TRÍ REAL-TIME CỦA BẢN THÂN
  useEffect(() => {
    let locationSubscriber: Location.LocationSubscription | null = null;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Lỗi", "Quyền GPS bị từ chối.");
        return;
      }

      let curLocation = await Location.getCurrentPositionAsync({});
      const initialRegion = {
        latitude: curLocation.coords.latitude,
        longitude: curLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setLocation(initialRegion);

      locationSubscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High, 
          timeInterval: 1000, 
          distanceInterval: 1, 
        },
        (newLocation) => {
          setLocation({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      );
    })();

    return () => {
      if (locationSubscriber) locationSubscriber.remove();
    };
  }, []);

  const handleMyLocation = async () => {
    try {
      if (location && mapRef.current) {
        mapRef.current.animateCamera({ center: location, zoom: 15 }, { duration: 1000 });
      }
    } catch (error) {
      console.log("Không thể cập nhật camera:", error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {location && (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={location}
          showsUserLocation={false} 
          showsMyLocationButton={false}
          showsCompass={false}
        >
          <Marker coordinate={location} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.orangeDotOuter}>
              <View style={styles.orangeDotInner} />
            </View>
          </Marker>
        </MapView>
      )}

      <View style={[styles.searchWrapper, { top: insets.top + 10 }]}>
        <View style={styles.searchBar}>
          <Ionicons name="location" size={24} color={COLORS.primary} />
          <TextInput
            placeholder="Tìm kiếm ở đây"
            style={styles.searchInput}
            placeholderTextColor="#777"
            onPressIn={() => router.push("/map-search")}
            showSoftInputOnFocus={false}
          />
          <Ionicons name="mic" size={24} color="#555" style={{ marginRight: 10 }} />
          <Image source={require("../../assets/images/avatar.png")} style={styles.searchAvatar} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <TouchableOpacity style={styles.chip}><FontAwesome5 name="fort-awesome" size={14} color="#000" /><Text style={styles.chipText}>Quân đội</Text></TouchableOpacity>
          <TouchableOpacity style={styles.chip}><MaterialCommunityIcons name="police-badge" size={16} color="#000" /><Text style={styles.chipText}>Công an</Text></TouchableOpacity>
          <TouchableOpacity style={styles.chip}><FontAwesome5 name="fire-extinguisher" size={14} color="#000" /><Text style={styles.chipText}>Cứu hỏa</Text></TouchableOpacity>
          <TouchableOpacity style={styles.chip}><FontAwesome5 name="hospital" size={14} color="#000" /><Text style={styles.chipText}>Bệnh viện</Text></TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.rightButtons}>
        <TouchableOpacity style={styles.sideButton}><MaterialCommunityIcons name="layers-outline" size={24} color="#444" /></TouchableOpacity>
        <TouchableOpacity style={styles.sideButton}><MaterialCommunityIcons name="compass-outline" size={24} color="#E02020" /></TouchableOpacity>
        <TouchableOpacity style={styles.sideButton}><MaterialCommunityIcons name="bus" size={24} color="#444" /></TouchableOpacity>
      </View>

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.myLocationButton} onPress={handleMyLocation}>
          <Ionicons name="navigate-outline" size={28} color="#444" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.directionButton, { backgroundColor: activeRescueId ? COLORS.primary : "#B0BEC5" }]}
          activeOpacity={activeRescueId ? 0.7 : 1}
          onPress={() => {
            if (activeRescueId) {
              router.push({
                pathname: "/tracking-rescue",
                params: { requestId: activeRescueId }
              });
            } else {
              Alert.alert("Thông báo", "Bạn chưa phát tín hiệu cầu cứu hoặc chưa có đội cứu hộ tiếp nhận.");
            }
          }}
        >
          <MaterialCommunityIcons name="directions" size={30} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}