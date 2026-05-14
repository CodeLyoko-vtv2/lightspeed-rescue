import { Ionicons } from "@expo/vector-icons";
import {
    CameraType,
    CameraView,
    FlashMode,
    useCameraPermissions,
} from "expo-camera";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../constants/colors";
import { eventEmitter } from "../utils/eventEmitter"; // ✅ Import cầu nối

const { width, height } = Dimensions.get("window");

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [type, setType] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [permission, requestPermission] = useCameraPermissions();
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);

  // Yêu cầu quyền camera khi vào màn hình
  useEffect(() => {
    if (!permission || !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center", color: "#FFF" }}>
          Chúng tôi cần quyền truy cập camera của sếp!
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionBtn}
        >
          <Text style={{ color: "#000", fontWeight: "bold" }}>Cấp quyền</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 1. Logic chuyển đổi Flash
  const toggleFlash = () => {
    setFlash((current) => (current === "off" ? "on" : "off"));
  };

  // 2. Logic chuyển đổi camera trước/sau
  const toggleCameraType = () => {
    setType((current) => (current === "back" ? "front" : "back"));
  };

  // 3. Logic chụp ảnh
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7, // Giảm chất lượng một chút để nhẹ hơn
          base64: false,
          exif: false,
        });
        setLastPhoto(photo.uri); // Cập nhật ảnh thu nhỏ

        // ✅ Phát sự kiện truyền URI ảnh về màn Form
        eventEmitter.emit("imageSelected", photo.uri);

        Alert.alert(
          "Thành công",
          "Đã chụp ảnh và đưa vào form, sếp có muốn chụp thêm không?",
          [
            { text: "Chụp thêm", style: "cancel" },
            { text: "Quay về Form", onPress: () => router.back() },
          ],
        );
      } catch (error) {
        Alert.alert("Lỗi", "Không thể chụp ảnh.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* --- ✅ CAMERA VIEW --- */}
      <CameraView
        style={styles.camera}
        facing={type}
        flash={flash}
        ref={cameraRef}
      >
        {/* --- TOP ACTIONS (FLASH, CLOSE) --- */}
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={toggleFlash}>
            <Ionicons
              name={flash === "on" ? "flash" : "flash-off"}
              size={32}
              color="#FFF"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={32} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* --- Thu phóng (Chỉ hiển thị, chưa code logic zoom) --- */}
        <View style={styles.zoomContainer}>
          <Text style={styles.zoomText}>0.5</Text>
          <View style={styles.zoomActive}>
            <Text style={styles.zoomTextActive}>1x</Text>
          </View>
          <Text style={styles.zoomText}>2</Text>
          <Text style={styles.zoomText}>3</Text>
        </View>

        {/* --- BOTTOM ACTIONS (THUMBNAIL, CAPTURE, FLIP) --- */}
        <View style={styles.bottomActions}>
          {/* Ảnh thu nhỏ cuối cùng (Nếu có) */}
          <View style={styles.thumbnailWrapper}>
            {lastPhoto && (
              <Image source={{ uri: lastPhoto }} style={styles.thumbnail} />
            )}
          </View>

          {/* Nút chụp ảnh chính (Vòng tròn trắng lớn) */}
          <TouchableOpacity
            style={styles.captureBtnWrapper}
            onPress={takePicture}
          >
            <View style={styles.captureBtnInner} />
          </TouchableOpacity>

          {/* Nút chuyển đổi camera */}
          <TouchableOpacity style={styles.iconBtn} onPress={toggleCameraType}>
            <Ionicons name="camera-reverse-outline" size={32} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* --- Chế độ chụp (Chỉ hiển thị) --- */}
        <View style={styles.modeContainer}>
          <Text style={styles.modeText}>PHOTO</Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 30,
  },
  topActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    marginTop: 60, // Chừa chỗ cho status bar
  },
  iconBtn: {
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 25,
  },
  zoomContainer: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 15,
    position: "absolute",
    bottom: height * 0.3,
  },
  zoomText: { color: "#FFF", fontSize: 14, fontWeight: "bold" },
  zoomActive: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  zoomTextActive: { color: "#000", fontSize: 14, fontWeight: "bold" },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  thumbnailWrapper: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  captureBtnWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  captureBtnInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#FFF",
  },
  modeContainer: {
    alignSelf: "center",
    position: "absolute",
    bottom: height * 0.18,
  },
  modeText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  permissionBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 20,
    alignSelf: "center",
  },
});
