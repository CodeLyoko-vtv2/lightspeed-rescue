import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getDownloadURL, ref, uploadBytes, getStorage } from "firebase/storage";
import { styles } from "../constants/(tabs)/home.styles";
import { COLORS } from "../constants/colors";
import { eventEmitter } from "../utils/eventEmitter"; 
import { app } from "../firebaseConfig";
import { AudioRecordModal } from "./AudioRecordModal";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
  onReopen: () => void;
  onSubmit: (images: string[], audioUri: string | null) => void;
  onViewLocation?: () => void;
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
  onViewLocation,
  incident,
  userData,
  address,
  description,
  setDescription,
  loading,
}: Props) => {
  const insets = useSafeAreaInsets();
  const storage = getStorage(app);

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const maxModalHeight = SCREEN_HEIGHT - insets.top - 40;

  const [isAudioModalVisible, setIsAudioModalVisible] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [usedCamera, setUsedCamera] = useState(false);
  const [usedGallery, setUsedGallery] = useState(false);

  useEffect(() => {
    const subscription = eventEmitter.addListener(
      "imageSelected",
      (photoUri: string) => {
        setSelectedImages((prev) => {
          if (prev.length < 3) return [...prev, photoUri];
          return prev;
        });
        setUsedCamera(true); 
        onReopen();
      },
    );
    return () => subscription.remove();
  }, []);

  const uploadFile = async (uri: string, path: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleUploadImage = async (source: "camera" | "gallery") => {
    Keyboard.dismiss();
    try {
      if (selectedImages.length >= 3) {
        Alert.alert(
          "Thông báo",
          "Hiện trường chỉ cần tối đa 3 ảnh là đủ phân tích rồi ạ.",
        );
        return;
      }

      const remainingSlots = 3 - selectedImages.length;
      const permission =
        source === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== "granted") {
        Alert.alert(
          "Cấp quyền",
          source === "camera"
            ? "Sếp cần cho phép ứng dụng truy cập Camera để dùng chức năng này."
            : "Sếp cần cho phép ứng dụng truy cập Thư viện ảnh để dùng chức năng này.",
        );
        return;
      }

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsMultipleSelection: true,
              selectionLimit: remainingSlots,
              quality: 0.7,
            });

      if (result.canceled) return;

      const newUris = result.assets.map((asset) => asset.uri).slice(0, remainingSlots);
      const uploadedUrls = await Promise.all(
        newUris.map((uri, index) =>
          uploadFile(
            uri,
            `incident_images/${userData?.uid || "anonymous"}/${Date.now()}_${index}.jpg`,
          ),
        ),
      );

      setSelectedImages((prev) => [...prev, ...newUris].slice(0, 3));
      setUploadedImageUrls((prev) => [...prev, ...uploadedUrls].slice(0, 3));
      if (source === "camera") setUsedCamera(true);
      if (source === "gallery") setUsedGallery(true);
    } catch (error) {
      console.error("Lỗi khi mở bộ sưu tập:", error);
    }
  };

  const handleOpenAudio = async () => {
    Keyboard.dismiss();
    const permission = await Audio.requestPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert(
        "Cấp quyền",
        "Sếp cần cho phép ứng dụng ghi âm để dùng chức năng này.",
      );
      return;
    }
    setIsAudioModalVisible(true);
  };

  const handleUploadAudio = async () => {
    if (!audioUri) return null;
    const ext = audioUri.split(".").pop() || "m4a";
    const audioUrl = await uploadFile(
      audioUri,
      `incident_audio/${userData?.uid || "anonymous"}/${Date.now()}.${ext}`,
    );
    setUploadedAudioUrl(audioUrl);
    return audioUrl;
  };

  const handleSubmitIncident = async () => {
    if (loading || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const mergedImageUrls = [...uploadedImageUrls];
      for (let i = 0; i < selectedImages.length; i += 1) {
        if (!mergedImageUrls[i]) {
          mergedImageUrls[i] = await uploadFile(
            selectedImages[i],
            `incident_images/${userData?.uid || "anonymous"}/${Date.now()}_${i}.jpg`,
          );
        }
      }

      const audioUrl = await handleUploadAudio();

      await onSubmit(mergedImageUrls, audioUrl ?? null);

      setSelectedImages([]);
      setUploadedImageUrls([]);
      setAudioUri(null);
      setUploadedAudioUrl(null);
      setUsedCamera(false);
      setUsedGallery(false);
    } catch (error) {
      console.error("Lỗi khi gửi thông tin:", error);
      Alert.alert("Lỗi", "Không thể gửi thông tin. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      if (newImages.length === 0) {
        setUsedCamera(false);
        setUsedGallery(false);
      }
      return newImages;
    });
    setUploadedImageUrls((prev) => prev.filter((_, i) => i !== index));
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
                <TouchableOpacity
                  style={styles.infoRow}
                  onPress={onViewLocation}
                  disabled={!onViewLocation}
                  activeOpacity={0.7}
                >
                  <Image
                    source={require("../assets/images/avatar.png")} // ✅ Đã trả lại đường dẫn chuẩn của sếp
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
                </TouchableOpacity>
              </View>

              {selectedImages.length > 0 && (
                <View style={{ flexDirection: "row", marginBottom: 15, gap: 10 }}>
                  {selectedImages.map((uri, index) => (
                    <View key={index} style={styles.formThumbnailWrapper}>
                      <Image source={{ uri }} style={styles.formThumbnail} />
                      <TouchableOpacity
                        style={styles.removeImageBtn}
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons name="close-circle" size={24} color="#FF6347" />
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
                  style={[
                    styles.mediaTile,
                    usedCamera && { borderColor: COLORS.primary, borderWidth: 2 },
                    { position: "relative" }
                  ]}
                  onPress={() => handleUploadImage("camera")}
                >
                  {usedCamera && (
                    <View style={{ position: "absolute", top: -5, right: -5, backgroundColor: "#FFF", borderRadius: 10, zIndex: 10 }}>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                    </View>
                  )}
                  <Ionicons name="camera-outline" size={32} color={usedCamera ? COLORS.primary : "#555"} />
                  <Text style={[styles.mediaText, usedCamera && { color: COLORS.primary }]}>
                    {usedCamera ? "Đã chụp" : "Máy ảnh"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.mediaTile,
                    usedGallery && { borderColor: COLORS.primary, borderWidth: 2 },
                    { position: "relative" }
                  ]}
                  onPress={() => handleUploadImage("gallery")}
                >
                  {usedGallery && (
                    <View style={{ position: "absolute", top: -5, right: -5, backgroundColor: "#FFF", borderRadius: 10, zIndex: 10 }}>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                    </View>
                  )}
                  <Ionicons name="images-outline" size={32} color={usedGallery ? COLORS.primary : "#555"} />
                  <Text style={[styles.mediaText, usedGallery && { color: COLORS.primary }]}>
                    {usedGallery ? "Đã chọn" : "Bộ sưu tập"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.mediaTile,
                    audioUri && { borderColor: COLORS.primary, borderWidth: 2 },
                    { position: "relative" }, 
                  ]}
                  onPress={handleOpenAudio}
                >
                  {audioUri && (
                    <View style={{ position: "absolute", top: -5, right: -5, backgroundColor: "#FFF", borderRadius: 10, zIndex: 10 }}>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                    </View>
                  )}
                  <Ionicons name="mic-outline" size={32} color={audioUri ? COLORS.primary : "#555"} />
                  <Text style={[styles.mediaText, audioUri && { color: COLORS.primary }]}>
                    {audioUri ? "Đã ghi âm" : "Ghi âm"}
                  </Text>
                </TouchableOpacity>

                <AudioRecordModal
                  visible={isAudioModalVisible}
                  onClose={() => setIsAudioModalVisible(false)}
                  existingAudioUri={audioUri} 
                  onDelete={() => setAudioUri(null)} 
                  onSave={(uri) => { setAudioUri(uri); }}
                />
              </View>

              <TouchableOpacity
                style={styles.sendNowButton}
                onPress={() => {
                  Keyboard.dismiss();
                  handleSubmitIncident();
                }}
                disabled={loading || isSubmitting}
              >
                {loading || isSubmitting ? (
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