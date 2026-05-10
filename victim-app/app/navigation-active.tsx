import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StatusBar, Image } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { styles } from "../constants/navigation-active.styles";

export default function NavigationActiveScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const destination = { latitude: 16.077076, longitude: 108.219471 };
  
  const [currentLoc, setCurrentLoc] = useState<any>(null);
  const [remainingRoute, setRemainingRoute] = useState<any[]>([]);
  const [showStreetLabel, setShowStreetLabel] = useState(true);

  useEffect(() => {
    let locationSubscriber: Location.LocationSubscription | null = null;

    // Hiện nhãn 3 giây rồi tắt cho thoáng màn hình
    const timer = setTimeout(() => {
      setShowStreetLabel(false);
    }, 3000);

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const startLocation = await Location.getCurrentPositionAsync({});
      const startLocCoords = {
        latitude: startLocation.coords.latitude,
        longitude: startLocation.coords.longitude,
      };
      
      setCurrentLoc(startLocCoords);

      // Khởi tạo lộ trình gấp khúc ban đầu
      const initialRoute = [
        startLocCoords,
        { latitude: startLocCoords.latitude + (destination.latitude - startLocCoords.latitude) * 0.3, longitude: startLocCoords.longitude },
        { latitude: startLocCoords.latitude + (destination.latitude - startLocCoords.latitude) * 0.3, longitude: destination.longitude - (destination.longitude - startLocCoords.longitude) * 0.5 },
        { latitude: destination.latitude - (destination.latitude - startLocCoords.latitude) * 0.2, longitude: destination.longitude - (destination.longitude - startLocCoords.longitude) * 0.5 },
        { latitude: destination.latitude - (destination.latitude - startLocCoords.latitude) * 0.2, longitude: destination.longitude },
        destination
      ];
      setRemainingRoute(initialRoute);

      if (mapRef.current) {
        mapRef.current.animateCamera({
          center: startLocCoords,
          pitch: 45, 
          heading: 0,
          zoom: 17,
        });
      }

      // Theo dõi vị trí thời gian thực
      locationSubscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (newLocation) => {
          const updatedLoc = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          };
          setCurrentLoc(updatedLoc);

          // ✅ LOGIC TỰ ĐỘNG CHUYỂN MÀN HÌNH KHI ĐẾN ĐÍCH (ĐÃ THÊM)
          const dist = Math.sqrt(
            Math.pow(updatedLoc.latitude - destination.latitude, 2) +
            Math.pow(updatedLoc.longitude - destination.longitude, 2)
          );

          if (dist < 0.0002) { 
             router.replace("/destination-reached");
             return; // Dừng xử lý tiếp khi đã chuyển màn
          }

          // ✅ THUẬT TOÁN "XÉN" ĐƯỜNG: Bỏ các điểm đã đi qua
          setRemainingRoute((prevRoute) => {
            if (prevRoute.length <= 1) return prevRoute;

            let closestIndex = 0;
            let minD = 999;
            for (let i = 0; i < prevRoute.length - 1; i++) {
              const d = Math.sqrt(Math.pow(updatedLoc.latitude - prevRoute[i].latitude, 2) + Math.pow(updatedLoc.longitude - prevRoute[i].longitude, 2));
              if (d < minD) {
                minD = d;
                closestIndex = i;
              }
            }
            return [updatedLoc, ...prevRoute.slice(closestIndex + 1)];
          });

          if (mapRef.current) {
            mapRef.current.animateCamera({ center: updatedLoc }, { duration: 1000 });
          }
        }
      );
    })();

    return () => {
      if (locationSubscriber) locationSubscriber.remove();
      clearTimeout(timer);
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {currentLoc && (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            ...currentLoc,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          }}
          showsUserLocation={false} 
          showsCompass={false}
        >
          {/* Lộ trình cập nhật từ điểm hiện tại đến đích */}
          <Polyline coordinates={remainingRoute} strokeWidth={8} strokeColor="#333" />
          <Polyline coordinates={remainingRoute} strokeWidth={5} strokeColor="#FF8852" />
          
          <Marker coordinate={currentLoc} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={{ width: 40, height: 40, justifyContent: "center", alignItems: "center" }}>
               <Ionicons name="navigate" size={28} color={COLORS.primary} style={{ transform: [{ rotate: '-45deg' }] }} />
            </View>
          </Marker>

          <Marker coordinate={destination}>
             <Image source={require("../assets/images/marker-police.png")} style={{width: 32, height: 32}} />
          </Marker>
        </MapView>
      )}

      {/* PANEL HƯỚNG DẪN TRÊN CÙNG */}
      <View style={[styles.topInstruction, { top: insets.top + 10 }]}>
        <View style={styles.instructionMain}>
          <Ionicons name="arrow-up" size={32} color="#FFF" />
          <Text style={styles.instructionText}>Đi về hướng Bắc</Text>
          <TouchableOpacity style={styles.micBtn}>
            <Ionicons name="mic" size={20} color="#FF5252" />
          </TouchableOpacity>
        </View>
        <View style={styles.nextStep}>
           <Text style={styles.nextStepText}>Sau đó</Text>
           <MaterialCommunityIcons name="arrow-left-top" size={20} color="#FFF" />
        </View>
      </View>

      {/* NHÃN TĨNH: Hiện rồi tự tắt */}
      {showStreetLabel && (
        <View style={styles.streetLabelWrapper}>
           <View style={styles.streetLabel}>
              <Text style={styles.streetLabelText}>về hướng Bắc</Text>
           </View>
           <View style={styles.streetLabelArrow} />
        </View>
      )}

      <View style={styles.speedWrapper}>
         <Text style={styles.speedValue}>0</Text>
         <Text style={styles.speedUnit}>km/h</Text>
      </View>

      <View style={styles.sideControls}>
         <TouchableOpacity style={styles.sideIconBtn}><Ionicons name="compass" size={24} color="#555" /></TouchableOpacity>
         <TouchableOpacity style={styles.sideIconBtn}><Ionicons name="search" size={24} color="#555" /></TouchableOpacity>
         <TouchableOpacity style={styles.sideIconBtn}><Ionicons name="volume-medium" size={24} color="#555" /></TouchableOpacity>
      </View>

      <View style={[styles.bottomInfo, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
           <Ionicons name="close" size={28} color="#555" />
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <Text style={styles.timeValue}>25 phút</Text>
          <Text style={styles.distValue}>15 km • 23:12</Text>
        </View>

        <TouchableOpacity 
          style={styles.recenterBtn}
          onPress={() => {
            if (mapRef.current && currentLoc) {
              mapRef.current.animateCamera({ center: currentLoc, pitch: 45, zoom: 17 }, { duration: 1000 });
            }
          }}
        >
           <MaterialCommunityIcons name="directions-fork" size={24} color="#555" />
        </TouchableOpacity>
      </View>
    </View>
  );
}