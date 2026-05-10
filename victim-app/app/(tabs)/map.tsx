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
// ✅ Đã thêm lại Marker để vẽ chấm cam custom
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../constants/colors";
import { styles } from "../../constants/(tabs)/map.styles";
import { router } from "expo-router";

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  
  // ✅ State này giờ sẽ cập nhật liên tục tọa độ real
  const [location, setLocation] = useState<any>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    let locationSubscriber: Location.LocationSubscription | null = null;

    (async () => {
      // 1. Xin quyền
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Lỗi", "Quyền GPS bị từ chối.");
        return;
      }

      // 2. Lấy vị trí ban đầu nhanh để hiện bản đồ
      let curLocation = await Location.getCurrentPositionAsync({});
      const initialRegion = {
        latitude: curLocation.coords.latitude,
        longitude: curLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setLocation(initialRegion);

      // ✅ 3. BẮT ĐẦU THEO DÕI VỊ TRÍ REAL-TIME (Thay vì dùng interval 3s thủ công)
      // Cách này mượt hơn và chính xác hơn việc cứ 3 giây gọi hàm lấy vị trí 1 lần.
      locationSubscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High, // Độ chính xác cao
          timeInterval: 1000, // Gợi ý cập nhật sau mỗi 1 giây (nhanh hơn 3s sếp yêu cầu để nhìn chấm nó di chuyển mượt)
          distanceInterval: 1, // Cập nhật nếu di chuyển quá 1 mét
        },
        (newLocation) => {
          // Cập nhật tọa độ mới vào state để Marker chấm cam nhảy theo
          setLocation({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          // console.log("GPS cập nhật:", newLocation.coords);
        }
      );
    })();

    // ✅ CLEANUP: Khi thoát màn hình Map, phải tắt thám tử theo dõi GPS để đỡ tốn pin
    return () => {
      if (locationSubscriber) {
        locationSubscriber.remove();
      }
    };
  }, []);

  const handleMyLocation = async () => {
    try {
      // Vì location state giờ luôn update real-time, mình lấy luôn nó để dùng
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

      {/* --- BẢN ĐỒ GOOGLE --- */}
      {location && (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={location}
          // ✅ 1. ẨN CHẤM XANH MẶC ĐỊNH CỦA GOOGLE ĐI SẾP
          showsUserLocation={false} 
          showsMyLocationButton={false}
          showsCompass={false}
        >
          {/* ✅ 2. HIỆN CHẤM CAM CỦA MÌNH (Coordinate gắn với state location update liên tục) */}
          <Marker coordinate={location} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.orangeDotOuter}>
              <View style={styles.orangeDotInner} />
            </View>
          </Marker>
        </MapView>
      )}

      {/* --- THANH TÌM KIẾM NỔI --- */}
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

      {/* --- NÚT ĐIỀU KHIỂN BÊN PHẢI --- */}
      <View style={styles.rightButtons}>
        <TouchableOpacity style={styles.sideButton}><MaterialCommunityIcons name="layers-outline" size={24} color="#444" /></TouchableOpacity>
        <TouchableOpacity style={styles.sideButton}><MaterialCommunityIcons name="compass-outline" size={24} color="#E02020" /></TouchableOpacity>
        <TouchableOpacity style={styles.sideButton}><MaterialCommunityIcons name="bus" size={24} color="#444" /></TouchableOpacity>
      </View>

      {/* --- NÚT ĐỊNH VỊ VÀ CHỈ ĐƯỜNG PHÍA DƯỚI --- */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.myLocationButton} onPress={handleMyLocation}>
          <Ionicons name="navigate-outline" size={28} color="#444" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.directionButton, { backgroundColor: "#B0BEC5" }]}
          activeOpacity={1}
          onPress={() => Alert.alert("Thông báo", "Bạn chưa phát tín hiệu cầu cứu nên chưa có tuyến đường đến đội cứu hộ.")}
        >
          <MaterialCommunityIcons name="directions" size={30} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}