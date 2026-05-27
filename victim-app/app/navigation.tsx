// app/navigation.tsx
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { styles } from "../constants/navigation.styles";

export default function NavigationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Đích đến: Công an TP Đà Nẵng
  const destination = { latitude: 16.077076, longitude: 108.219471 };

  const [origin, setOrigin] = useState<any>(null);
  const [addressName, setAddressName] = useState("Đang định vị...");
  
  const [distance] = useState(15.0); 
  const [duration] = useState(30);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setAddressName("Quyền GPS bị từ chối");
        return;
      }
      
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setOrigin({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      let reverseResult = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (reverseResult.length > 0) {
        const item = reverseResult[0];
        setAddressName(`${item.street || "Vị trí của bạn"}`);
      } else {
        setAddressName("Vị trí của bạn");
      }
    })();
  }, []);

  // ✅ THUẬT TOÁN VẼ ĐƯỜNG PHỐ ẢO (City Block Path)
  // Huy chia làm 4 điểm bẻ lái để tạo cảm giác đi qua các khối nhà (blocks)
  const routeCoordinates = origin ? [
    origin, // Điểm bắt đầu
    { latitude: origin.latitude + (destination.latitude - origin.latitude) * 0.3, longitude: origin.longitude },
    { latitude: origin.latitude + (destination.latitude - origin.latitude) * 0.3, longitude: destination.longitude - (destination.longitude - origin.longitude) * 0.5 },
    { latitude: destination.latitude - (destination.latitude - origin.latitude) * 0.2, longitude: destination.longitude - (destination.longitude - origin.longitude) * 0.5 },
    { latitude: destination.latitude - (destination.latitude - origin.latitude) * 0.2, longitude: destination.longitude },
    destination // Điểm đích
  ] : [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* --- HEADER --- */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.inputRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#555" />
          </TouchableOpacity>
          
          <View style={styles.inputsWrapper}>
            <View style={styles.inputField}>
              <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
              <TextInput style={styles.textInput} value={addressName} editable={false} />
              <Ionicons name="ellipsis-horizontal" size={20} color="#999" />
            </View>
            
            <View style={styles.verticalDash} />

            <View style={styles.inputField}>
              <View style={[styles.dot, { backgroundColor: '#FF8852' }]} />
              <TextInput style={styles.textInput} value="Công an Thành phố Đà Nẵng" editable={false} />
              <MaterialCommunityIcons name="swap-vertical" size={24} color="#333" />
            </View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modeScroll}>
          <TouchableOpacity style={[styles.modeBtn, styles.modeBtnActive]}>
            <Ionicons name="car" size={20} color={COLORS.primary} />
            <Text style={styles.modeTextActive}>{duration} phút</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modeBtn}>
            <Ionicons name="bus" size={20} color="#555" />
            <Text style={styles.modeText}>28 phút</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modeBtn}>
            <FontAwesome5 name="walking" size={18} color="#555" />
            <Text style={styles.modeText}>3 giờ</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* --- BẢN ĐỒ --- */}
      {!origin ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 10, color: "#777" }}>Đang kết nối vệ tinh...</Text>
        </View>
      ) : (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: (origin.latitude + destination.latitude) / 2,
            longitude: (origin.longitude + destination.longitude) / 2,
            latitudeDelta: Math.abs(origin.latitude - destination.latitude) * 2.5 || 0.05,
            longitudeDelta: Math.abs(origin.longitude - destination.longitude) * 2.5 || 0.05,
          }}
        >
          <Marker coordinate={origin}>
            <View style={styles.originMarker} />
          </Marker>

          <Marker coordinate={destination}>
              <Image source={require("../assets/images/marker-police.png")} style={{width: 32, height: 32}} />
          </Marker>

          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor={COLORS.primary}
            lineDashPattern={[5, 5]} 
          />
        </MapView>
      )}

      {/* --- PANEL THÔNG TIN DƯỚI CÙNG --- */}
      <View style={styles.bottomPanel}>
        <View style={styles.dragHandle} />
        <View style={styles.infoRow}>
          <View>
            <Text style={styles.timeText}>{duration} phút <Text style={styles.distText}>({distance} km)</Text></Text>
            <Text style={styles.subInfoText}>Tuyến đường nhanh nhất, giao thông bình thường</Text>
          </View>
          <TouchableOpacity style={styles.shareIcon}>
            <Ionicons name="share-outline" size={24} color="#555" />
          </TouchableOpacity>
        </View>

        <View style={styles.btnRow}>
          {/* ✅ THÊM ROUTER PUSH VÀO NÚT BẮT ĐẦU */}
          <TouchableOpacity 
            style={styles.startBtn} 
            onPress={() => router.push("/navigation-active")}
          >
            <Ionicons name="navigate" size={22} color="#FFF" />
            <Text style={styles.startBtnText}>Bắt đầu</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.stepsBtn}>
            <Ionicons name="list" size={22} color={COLORS.primary} />
            <Text style={styles.stepsBtnText}>Các bước</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
