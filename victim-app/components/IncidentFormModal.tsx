import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { styles } from "../constants/(tabs)/home.styles";
import { COLORS } from "../constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { eventEmitter } from "../untils/eventEmitter"; // Lưu ý đường dẫn của sếp là untils
import * as ImagePicker from "expo-image-picker";
import { AudioRecordModal } from "./AudioRecordModal";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
  onReopen: () => void;
  // ✅ CẬP NHẬT: Cho phép truyền cả mảng ảnh và file âm thanh
  onSubmit: (images: string[], audioUri: string | null) => void;
  incident: any;
  userData: any;
  address: string;
  description: string;
  setDescription: (text: string) => void;
  loading: boolean;
}

export const IncidentFormModal = ({
  visible,
  onClose,
  onReopen,
  onSubmit,
  incident,
  userData,
  address,
  description,
  setDescription,
  loading,
}: Props) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const maxModalHeight = SCREEN_HEIGHT - insets.top - 40;

  const [isAudioModalVisible, setIsAudioModalVisible] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);

  useEffect(() => {
    const subscription = eventEmitter.addListener(
      "imageSelected",
      (photoUri: string) => {
        setSelectedImages((prev) => {
          if (prev.length < 3) return [...prev, photoUri];
          return prev;
        });
        onReopen();
      },
    );
    return () => subscription.remove();
  }, []);

  const handleOpenCamera = () => {
    Keyboard.dismiss();
    if (selectedImages.length >= 3) {
      Alert.alert(
        "Thông báo",
        "Hiện trường chỉ cần tối đa 3 ảnh là đủ phân tích rồi ạ.",
      );
      return;
    }
    onClose();
    setTimeout(() => {
      router.push("/camera");
    }, 300);
  };

  const handleOpenGallery = async () => {
    Keyboard.dismiss();
    const remainingSlots = 3 - selectedImages.length;
    if (remainingSlots <= 0) {
      Alert.alert(
        "Thông báo",
        "Đã đủ 3 ảnh. Vui lòng xóa bớt ảnh cũ trước khi chọn thêm.",
      );
      return;
    }

    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Cấp quyền",
          "Sếp cần cho phép ứng dụng truy cập Thư viện ảnh để dùng chức năng này.",
        );
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
        quality: 0.7,
      });

      if (!result.canceled) {
        const newUris = result.assets.map((asset) => asset.uri);
        setSelectedImages((prev) => {
          const combined = [...prev, ...newUris];
          return combined.slice(0, 3);
        });
      }
    } catch (error) {
      console.error("Lỗi khi mở bộ sưu tập:", error);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalBottomOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            style={{ width: "100%", justifyContent: "flex-end" }}
          >
            <View
              style={[
                styles.modalBottomSheetFull,
                {
                  paddingBottom: Math.max(insets.bottom, 20) + 30,
                  maxHeight: maxModalHeight,
                },
              ]}
            >
              <View style={styles.modalHandle} />

              <View style={styles.formHeader}>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="arrow-back" size={28} color="#2D3142" />
                </TouchableOpacity>
                <View style={styles.formTitleContainer}>
                  {incident && (
                    <MaterialCommunityIcons
                      name={incident.icon}
                      size={24}
                      color={COLORS.primary}
                    />
                  )}
                  <Text style={styles.formTitleText}>{incident?.name}</Text>
                </View>
                <View style={{ width: 28 }} />
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Image
                    source={require("../assets/images/avatar.png")}
                    style={styles.smallAvatar}
                  />
                  <View style={styles.infoTextColumn}>
                    <Text style={styles.infoName}>
                      {userData.fullName}{" "}
                      <Text style={styles.infoPhone}>
                        {userData.phoneNumber}
                      </Text>
                    </Text>
                    <View style={styles.infoLocationRow}>
                      <Ionicons
                        name="location"
                        size={16}
                        color={COLORS.primary}
                      />
                      <Text style={styles.infoAddress} numberOfLines={1}>
                        {address}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </View>
              </View>

              {selectedImages.length > 0 && (
                <View
                  style={{ flexDirection: "row", marginBottom: 15, gap: 10 }}
                >
                  {selectedImages.map((uri, index) => (
                    <View key={index} style={styles.formThumbnailWrapper}>
                      <Image source={{ uri }} style={styles.formThumbnail} />
                      <TouchableOpacity
                        style={styles.removeImageBtn}
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons
                          name="close-circle"
                          size={24}
                          color="#FF6347"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <TextInput
                style={styles.formInput}
                placeholder="Mô tả các thông số kỹ thuật, mức độ thiệt hại..."
                multiline
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="#AAA"
                blurOnSubmit={true}
              />

              <View style={styles.mediaActionRow}>
                <TouchableOpacity
                  style={styles.mediaTile}
                  onPress={handleOpenCamera}
                >
                  <Ionicons name="camera-outline" size={32} color="#555" />
                  <Text style={styles.mediaText}>Máy ảnh</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mediaTile}
                  onPress={handleOpenGallery}
                >
                  <Ionicons name="images-outline" size={32} color="#555" />
                  <Text style={styles.mediaText}>Bộ sưu tập</Text>
                </TouchableOpacity>

                {/* ✅ NÚT GHI ÂM CHUẨN UI MỚI */}
                <TouchableOpacity
                  style={[
                    styles.mediaTile,
                    audioUri && { borderColor: COLORS.primary, borderWidth: 2 },
                    { position: "relative" }, // Để gắn cái checkmark lên góc
                  ]}
                  onPress={() => {
                    Keyboard.dismiss();
                    setIsAudioModalVisible(true);
                  }}
                >
                  {/* ✅ FIX LỖI 4: DẤU CHECK CAM Ở GÓC */}
                  {audioUri && (
                    <View
                      style={{
                        position: "absolute",
                        top: -5,
                        right: -5,
                        backgroundColor: "#FFF",
                        borderRadius: 10,
                        zIndex: 10,
                      }}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={COLORS.primary}
                      />
                    </View>
                  )}

                  <Ionicons
                    name="mic-outline"
                    size={32}
                    color={audioUri ? COLORS.primary : "#555"}
                  />
                  <Text
                    style={[
                      styles.mediaText,
                      audioUri && { color: COLORS.primary },
                    ]}
                  >
                    {audioUri ? "Đã ghi âm" : "Ghi âm"}
                  </Text>
                </TouchableOpacity>

                {/* ✅ GỌI MODAL: TRUYỀN DỮ LIỆU ĐI VÀ VỀ */}
                <AudioRecordModal
                  visible={isAudioModalVisible}
                  onClose={() => setIsAudioModalVisible(false)}
                  existingAudioUri={audioUri} // Truyền file cũ vào cho nó biết
                  onDelete={() => setAudioUri(null)} // Nó gọi xóa thì mình xóa
                  onSave={(uri) => {
                    setAudioUri(uri);
                  }}
                />
              </View>

              <TouchableOpacity
                style={styles.sendNowButton}
                onPress={() => {
                  Keyboard.dismiss();
                  // ✅ CẬP NHẬT: Gửi cả mảng ảnh và file âm thanh ra ngoài
                  onSubmit(selectedImages, audioUri);
                  setSelectedImages([]);
                  setAudioUri(null); // Gửi xong thì reset luôn
                }}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.sendNowButtonText}>Gửi thông tin</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
