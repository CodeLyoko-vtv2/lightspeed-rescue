import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore"; // ✅ Dùng getDoc lấy 1 lần
import { db } from "../firebaseConfig";
import { COLORS } from "../constants/colors";
import { styles } from "../constants/navigation.styles";

export default function TrackingRescueScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requestId } = useLocalSearchParams();

  const [origin, setOrigin] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [rescueTeamInfo, setRescueTeamInfo] = useState<any>(null);
  const [addressName, setAddressName] = useState("Đang định vị...");

  const [distance] = useState(15.0);
  const [duration] = useState(23);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setOrigin({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      let res = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (res.length > 0)
        setAddressName(`${res[0].street || "Vị trí của bạn"}`);
    })();
  }, []);

  // ✅ LẤY DỮ LIỆU TĨNH (CHỈ LẤY 1 LẦN ĐỂ MINH HỌA)
  useEffect(() => {
    if (!requestId) return;

    const fetchDataOnce = async () => {
      try {
        const q = query(
          collection(db, "rescue_missions"),
          where("sosId", "==", requestId),
        );
        const missionSnap = await getDocs(q);

        if (!missionSnap.empty) {
          const teamId = missionSnap.docs[0].data().rescuerId;
          const teamDoc = await getDoc(doc(db, "Users", teamId));

          if (teamDoc.exists()) {
            const teamData = teamDoc.data();
            setRescueTeamInfo(teamData);
            setDestination({
              latitude: teamData.currentLocation.latitude,
              longitude: teamData.currentLocation.longitude,
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchDataOnce();
  }, [requestId]);

  const routeCoordinates =
    origin && destination
      ? [
          origin,
          {
            latitude:
              origin.latitude + (destination.latitude - origin.latitude) * 0.3,
            longitude: origin.longitude,
          },
          {
            latitude:
              origin.latitude + (destination.latitude - origin.latitude) * 0.3,
            longitude: destination.longitude,
          },
          destination,
        ]
      : [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.inputRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#555" />
          </TouchableOpacity>
          <View style={styles.inputsWrapper}>
            <View style={styles.inputField}>
              <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
              <TextInput
                style={styles.textInput}
                value={addressName}
                editable={false}
              />
              <Ionicons name="ellipsis-horizontal" size={20} color="#999" />
            </View>
            <View style={styles.verticalDash} />
            <View style={styles.inputField}>
              <View style={[styles.dot, { backgroundColor: "#FF8852" }]} />
              <TextInput
                style={styles.textInput}
                value={
                  rescueTeamInfo ? rescueTeamInfo.fullName : "Đang tìm đội..."
                }
                editable={false}
              />
              <MaterialCommunityIcons
                name="swap-vertical"
                size={24}
                color="#333"
              />
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.modeScroll}
        >
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

      {!origin || !destination ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 10, color: "#777" }}>
            Đang tính toán lộ trình...
          </Text>
        </View>
      ) : (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: (origin.latitude + destination.latitude) / 2,
            longitude: (origin.longitude + destination.longitude) / 2,
            latitudeDelta: Math.abs(origin.latitude - destination.latitude) * 3,
            longitudeDelta:
              Math.abs(origin.longitude - destination.longitude) * 3,
          }}
        >
          <Marker coordinate={origin}>
            <View style={styles.originMarker} />
          </Marker>
          <Marker
            coordinate={destination}
            anchor={{ x: 0.5, y: 0.5 }}
            title={rescueTeamInfo?.fullName}
            pinColor={COLORS.primary}
          >
            <View style={styles.carMarkerWrapper}><Text>🚑</Text></View>
          </Marker>
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor={COLORS.primary}
            lineDashPattern={[5, 5]}
          />
        </MapView>
      )}

      <View style={styles.bottomPanel}>
        <View style={styles.dragHandle} />
        <View style={styles.infoRow}>
          <View>
            <Text style={styles.timeText}>
              {duration} phút{" "}
              <Text style={styles.distText}>({distance} km)</Text>
            </Text>
            <Text style={styles.subInfoText}>
              Xem trước lộ trình đội cứu hộ
            </Text>
          </View>
          <TouchableOpacity
            style={styles.shareIcon}
            onPress={() =>
              Alert.alert("Liên hệ", `Hotline: ${rescueTeamInfo?.phoneNumber}`)
            }
          >
            <Ionicons name="share-outline" size={24} color="#555" />
          </TouchableOpacity>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() =>
              router.push({
                pathname: "/tracking-active",
                params: { requestId: requestId },
              })
            }
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
