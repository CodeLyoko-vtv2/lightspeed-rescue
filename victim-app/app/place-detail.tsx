import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Linking,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Alert
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { COLORS } from "../constants/colors";
import { styles } from "../constants/place-detail.styles";

import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function PlaceDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);

  // ✅ State lưu vị trí của người dùng (để vẽ chấm cam và lướt về)
  const [userLocation, setUserLocation] = useState<any>(null);

  // Tọa độ: Công an TP Đà Nẵng
  const location = {
    latitude: 16.077076,
    longitude: 108.219471,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  useEffect(() => {
    let subscription: Location.LocationSubscription;

    const startTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      // 1. Ép bản đồ zoom vào đồn công an ngay khi vừa mở màn
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...location,
          latitudeDelta: 0.001, // Zoom sâu
          longitudeDelta: 0.001,
        }, 1000);
      }

      // 2. Bắt đầu "thám tử" quét GPS mỗi giây
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (newLocation) => {
          setUserLocation({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          });
        }
      );
    };

    startTracking();

    // Dọn dẹp thám tử khi thoát trang để đỡ hao pin
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const snapPoints = useMemo(() => ["25%", "82%"], []);

  const handleCall = () => {
    Linking.openURL("tel:02363822300");
  };

  const handleDirections = () => {
    router.push("/navigation");
  };

  // ✅ HÀM XỬ LÝ KHI BẤM NÚT ĐỊNH VỊ
  const handleMyLocation = async () => {
    if (userLocation && mapRef.current) {
      // Nếu đã có sẵn GPS chạy ngầm thì bắn camera về luôn cho mượt
      mapRef.current.animateCamera({ center: userLocation, zoom: 15 }, { duration: 1000 });
    } else {
      // Backup trong trường hợp thám tử chưa kịp bắt được tín hiệu
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Lỗi", "Bạn chưa cấp quyền truy cập vị trí.");
          return;
        }
        let curLocation = await Location.getCurrentPositionAsync({});
        const currentRegion = {
          latitude: curLocation.coords.latitude,
          longitude: curLocation.coords.longitude,
        };
        setUserLocation(currentRegion);
        if (mapRef.current) {
          mapRef.current.animateCamera({ center: currentRegion, zoom: 15 }, { duration: 1000 });
        }
      } catch (error) {
        console.log("Không thể cập nhật vị trí:", error);
      }
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        {/* --- BẢN ĐỒ NỀN --- */}
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={location}
          showsUserLocation={false} // ✅ ĐÃ ẨN CHẤM XANH MẶC ĐỊNH
          showsMyLocationButton={false}
          showsCompass={false}
        >
          {/* ✅ MARKER: CHẤM CAM CỦA SẾP (Viết style inline để chống lỗi crash) */}
          {userLocation && (
            <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={{
                width: 30, height: 30, borderRadius: 15,
                backgroundColor: "rgba(255, 136, 82, 0.3)",
                justifyContent: "center", alignItems: "center",
              }}>
                <View style={{
                  width: 14, height: 14, borderRadius: 7,
                  backgroundColor: COLORS.primary,
                  borderWidth: 2, borderColor: "#FFF",
                }} />
              </View>
            </Marker>
          )}

          {/* Marker Công an */}
          <Marker coordinate={location}>
            <Image
              source={require("../assets/images/marker-police.png")}
              style={{ width: 32, height: 32 }}
            />
          </Marker>
        </MapView>

        {/* --- THANH TÌM KIẾM TRÊN CÙNG (Static) --- */}
        <View style={[styles.floatingHeader, { top: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#555" />
          </TouchableOpacity>
          <Text style={styles.headerSearchText} numberOfLines={1}>
            Công an Thành phố Đà Nẵng,...
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#555" />
          </TouchableOpacity>
        </View>

        {/* --- NÚT ĐỊNH VỊ --- */}
        <TouchableOpacity 
          style={[styles.myLocationBtn, { bottom: "27%" }]}
          onPress={handleMyLocation}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#555" />
        </TouchableOpacity>

        {/* --- CHI TIẾT ĐỊA ĐIỂM (INTERACTIVE BOTTOM SHEET) --- */}
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          handleIndicatorStyle={styles.dragHandleIndicator}
          backgroundStyle={styles.bottomSheetBackground}
        >
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View style={styles.titleSection}>
              <View style={{ flex: 1 }}>
                <Text style={styles.placeName}>Công an Thành phố Đà Nẵng</Text>
              </View>
              <TouchableOpacity style={styles.shareBtn}>
                <Ionicons name="share-social-outline" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* HÀNG NÚT THAO TÁC */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.primary }]} onPress={handleDirections}>
                <FontAwesome name="send" size={16} color="#FFF" />
                <Text style={styles.actionBtnTextWhite}>Đường đi</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtnOutline}>
                <Ionicons name="navigate" size={18} color={COLORS.primary} />
                <Text style={styles.actionBtnText}>Bắt đầu</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtnOutline} onPress={handleCall}>
                <Ionicons name="call" size={18} color={COLORS.primary} />
                <Text style={styles.actionBtnText}>Gọi</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtnOutline}>
                <Ionicons name="bookmark-outline" size={18} color={COLORS.primary} />
                <Text style={styles.actionBtnText}>Lưu</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* THƯ VIỆN ẢNH */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGallery}>
              <Image source={require("../assets/images/police-building.jpg")} style={styles.galleryImgLarge} />
              <View style={{ gap: 10 }}>
                <Image source={require("../assets/images/police-patrol.jpg")} style={styles.galleryImgSmall} />
                <Image source={require("../assets/images/police-meeting.jpg")} style={styles.galleryImgSmall} />
              </View>
            </ScrollView>

            {/* TAB BAR NỘI BỘ */}
            <View style={styles.tabBar}>
              <Text style={[styles.tabItem, styles.tabActive]}>Tổng quan</Text>
              <Text style={styles.tabItem}>Ảnh</Text>
              <Text style={styles.tabItem}>Tin mới</Text>
              <Text style={styles.tabItem}>Giới thiệu</Text>
            </View>

            {/* THÔNG TIN CHI TIẾT */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={24} color={COLORS.primary} />
                <Text style={styles.infoText}>80 Lê Lợi, Hải Châu, Đà Nẵng 550000</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={24} color={COLORS.primary} />
                <View>
                  <Text style={styles.statusText}>
                    Sắp đóng cửa <Text style={{ color: "#777" }}>• Đóng cửa vào 17:00</Text>
                  </Text>
                  <Text style={styles.subInfoText}>Mở lại vào lúc 7:30 T4</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="pencil-outline" size={24} color={COLORS.primary} />
                <Text style={styles.infoText}>Đề xuất chỉnh sửa</Text>
              </View>
            </View>
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}