import { Alert, Linking, Platform } from "react-native";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";

function normalizeCoordinate(location) {
  if (!location) return null;

  const latitude = location.latitude ?? location.lat;
  const longitude = location.longitude ?? location.lng;

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return null;
  }

  return { latitude, longitude };
}

async function openGoogleMaps(destination) {
  if (!destination) {
    Alert.alert("Chỉ đường", "Nạn nhân chưa cập nhật vị trí hiện tại.");
    return false;
  }

  const latLng = `${destination.latitude},${destination.longitude}`;
  const appUrl =
    Platform.OS === "android"
      ? `google.navigation:q=${latLng}&mode=d`
      : `comgooglemaps://?daddr=${latLng}&directionsmode=driving`;
  const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    latLng,
  )}&travelmode=driving`;

  try {
    await Linking.openURL(appUrl);
    return true;
  } catch {
    try {
      await Linking.openURL(webUrl);
      return true;
    } catch {
      Alert.alert("Chỉ đường", "Không thể mở Google Maps trên thiết bị này.");
      return false;
    }
  }
}

export async function openVictimDirectionsForRescuer(rescuerId) {
  if (!rescuerId) {
    Alert.alert("Chỉ đường", "Không tìm thấy tài khoản đội cứu hộ.");
    return false;
  }

  const missionQuery = query(
    collection(db, "rescue_missions"),
    where("rescuerId", "==", rescuerId),
    where("status", "==", "accepted"),
  );
  const missionSnap = await getDocs(missionQuery);

  if (missionSnap.empty) {
    Alert.alert("Chỉ đường", "Bạn chưa nhận nhiệm vụ nào để chỉ đường.");
    return false;
  }

  const mission = missionSnap.docs[0].data();
  const sosId = mission?.sosId;
  if (!sosId) {
    Alert.alert("Chỉ đường", "Lệnh điều động thiếu thông tin nạn nhân.");
    return false;
  }

  const sosSnap = await getDoc(doc(db, "sos_alerts", sosId));
  if (!sosSnap.exists()) {
    Alert.alert("Chỉ đường", "Tín hiệu SOS không còn tồn tại.");
    return false;
  }

  const sos = sosSnap.data();
  return openGoogleMaps(normalizeCoordinate(sos?.location || sos?.victimLocation));
}
