import { Alert, Linking, Platform } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

type Coordinate = {
  latitude: number;
  longitude: number;
};

export function normalizeCoordinate(location: any): Coordinate | null {
  if (!location) return null;

  const latitude = location.latitude ?? location.lat;
  const longitude = location.longitude ?? location.lng;

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return null;
  }

  return { latitude, longitude };
}

export async function openGoogleMapsNavigation(
  destination: Coordinate | null,
  unavailableMessage = "Chưa có vị trí để chỉ đường.",
) {
  if (!destination) {
    Alert.alert("Chỉ đường", unavailableMessage);
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

export async function openRescuerDirectionsBySosId(requestId?: string | null) {
  if (!requestId) {
    Alert.alert("Chỉ đường", "Không tìm thấy tín hiệu SOS để lấy vị trí đội cứu hộ.");
    return false;
  }

  const sosSnap = await getDoc(doc(db, "sos_alerts", requestId));
  if (!sosSnap.exists()) {
    Alert.alert("Chỉ đường", "Tín hiệu SOS không còn tồn tại.");
    return false;
  }

  const sos = sosSnap.data();
  const rescuerId = sos?.rescuerId;
  if (!rescuerId) {
    Alert.alert("Chỉ đường", "Chưa có đội cứu hộ nhận nhiệm vụ.");
    return false;
  }

  const rescuerSnap = await getDoc(doc(db, "Users", rescuerId));
  if (!rescuerSnap.exists()) {
    Alert.alert("Chỉ đường", "Không tìm thấy thông tin đội cứu hộ.");
    return false;
  }

  const rescuer = rescuerSnap.data();
  const destination = normalizeCoordinate(rescuer?.currentLocation || rescuer?.location);

  return openGoogleMapsNavigation(
    destination,
    "Đội cứu hộ chưa cập nhật vị trí hiện tại.",
  );
}
