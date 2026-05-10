import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImageManipulator from 'expo-image-manipulator';

// ✅ FIX LỖI ĐỎ: Import bản legacy theo đúng gợi ý của thư viện Expo mới
import * as FileSystem from 'expo-file-system/legacy'; 

import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { styles } from "../../constants/(tabs)/home.styles";
import { COLORS } from "../../constants/colors";
import { db } from "../../firebaseConfig";

// Modal components
import { CountdownModal } from "../../components/CountdownModal";
import { IncidentFormModal } from "../../components/IncidentFormModal";

const INCIDENTS = [
  { id: "NUCLEAR", name: "Hạt nhân", icon: "radioactive", bgColor: "#E8F5E9", iconColor: "#000" },
  { id: "FIRE", name: "Hoả hoạn", icon: "fire", bgColor: "#FFEBEE", iconColor: "#000" },
  { id: "EARTHQUAKE", name: "Động đất", icon: "office-building-marker", bgColor: "#E0F2F1", iconColor: "#000" },
  { id: "DISEASE", name: "Dịch bệnh", icon: "virus", bgColor: "#EDE7F6", iconColor: "#000" },
  { id: "FLOOD", name: "Bão lũ", icon: "waves", bgColor: "#FCE4EC", iconColor: "#000" },
  { id: "OTHER", name: "Khác", icon: "plus-circle", bgColor: "#FFF8E1", iconColor: "#000" },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState({ uid: "", fullName: "Đang tải...", phoneNumber: "" });
  const [address, setAddress] = useState("Đang xác định vị trí...");
  const [loading, setLoading] = useState(false);

  const [isSOSActive, setIsSOSActive] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);

  const [isCountdownVisible, setIsCountdownVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [aiDetectedName, setAiDetectedName] = useState("");

  const [isIncidentModalVisible, setIsIncidentModalVisible] = useState(false);
  const [tempIncident, setTempIncident] = useState<any>(null);
  const [description, setDescription] = useState("");

  useEffect(() => {
    const triggerAI = () => {
      if (!isSOSActive && !isCountdownVisible && !isIncidentModalVisible) {
        const rand = INCIDENTS[Math.floor(Math.random() * INCIDENTS.length)];
        setAiDetectedName(rand.name);
        setSecondsLeft(5);
        setIsCountdownVisible(true);
      }
    };
    const t = setTimeout(triggerAI, 4000);
    const i = setInterval(triggerAI, 60000);
    return () => { clearTimeout(t); clearInterval(i); };
  }, [isSOSActive, isCountdownVisible, isIncidentModalVisible]);

  useEffect(() => {
    let t: number;
    if (isCountdownVisible && secondsLeft > 0) {
      t = window.setInterval(() => setSecondsLeft((p) => p - 1), 1000);
    } else if (secondsLeft === 0 && isCountdownVisible) {
      handleStartSOS();
    }
    return () => clearInterval(t);
  }, [isCountdownVisible, secondsLeft]);

  useFocusEffect(useCallback(() => { fetchUserData(); fetchAddress(); }, []));

  const fetchUserData = async () => {
    const phone = await AsyncStorage.getItem("userPhone");
    if (phone) {
      const q = query(collection(db, "Users"), where("phoneNumber", "==", phone));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setUserData({ uid: snap.docs[0].id, fullName: snap.docs[0].data().fullName, phoneNumber: phone });
      }
    }
  };

  const fetchAddress = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    let loc = await Location.getCurrentPositionAsync({});
    let res = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    if (res.length > 0) setAddress(`${res[0].name || ""}, ${res[0].street || ""}`);
  };

  const handleStartSOS = async () => {
    setIsCountdownVisible(false);
    setIsSOSActive(true); 
    
    try {
      setLoading(true);
      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      
      const docRef = await addDoc(collection(db, "SOS_Requests"), {
        victimId: userData.uid,
        victimName: userData.fullName,
        victimPhone: userData.phoneNumber,
        incidentType: "UNCATEGORIZED",
        description: "",
        location: { latitude: loc.coords.latitude, longitude: loc.coords.longitude },
        mediaImages: [], 
        audioRecordings: [], 
        priorityScore: 0, 
        status: "ACTIVE",
        createdAt: serverTimestamp(),
      });
      
      setCurrentRequestId(docRef.id);
    } catch (e) {
      console.error(e);
      Alert.alert("Lỗi hệ thống", "Không thể thiết lập kết nối khẩn cấp.");
    } finally {
      setLoading(false);
    }
  };

  const convertImageToBase64 = async (uri: string) => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 600 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      return `data:image/jpeg;base64,${manipulatedImage.base64}`;
    } catch (error) {
      return null;
    }
  };

  const convertAudioToBase64 = async (uri: string) => {
    try {
      // ✅ Giờ thì hàm này sẽ đọc file mượt mà không bị báo đỏ nữa
      const base64Str = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      return `data:audio/mp4;base64,${base64Str}`;
    } catch (error) {
      console.error("Lỗi chuyển đổi Audio:", error);
      return null;
    }
  };

  const handleSubmitInfo = async (images: string[] = [], audioUri: string | null = null) => {
    if (!currentRequestId || !tempIncident) return;
    try {
      setLoading(true);
      
      let base64Images: string[] = [];
      if (images.length > 0) {
        const results = await Promise.all(images.map(imgUri => convertImageToBase64(imgUri)));
        base64Images = results.filter(item => item !== null) as string[];
      }

      let base64Audio: string[] = [];
      if (audioUri) {
        const audioData = await convertAudioToBase64(audioUri);
        if (audioData) base64Audio.push(audioData);
      }

      await updateDoc(doc(db, "SOS_Requests", currentRequestId), {
        incidentType: tempIncident.id,
        description: description,
        mediaImages: base64Images, 
        audioRecordings: base64Audio, 
      });

      setSelectedIncident(tempIncident.id);
      setIsIncidentModalVisible(false);
      setDescription("");
      Alert.alert("Thành công", "Đã truyền dữ liệu hiện trường về Trung tâm cứu hộ.");
    } catch (e) {
      console.error(e);
      Alert.alert("Lỗi", "Dữ liệu quá lớn, vui lòng kiểm tra lại kết nối.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSOS = () => {
    Alert.alert("Xác nhận", "Bạn muốn tắt tín hiệu khẩn cấp?", [
      { text: "Không", style: "cancel" },
      {
        text: "Đồng ý",
        style: "destructive",
        onPress: async () => {
          if (currentRequestId) {
            await updateDoc(doc(db, "SOS_Requests", currentRequestId), { status: "CANCELLED" });
            setCurrentRequestId(null);
          }
          setIsSOSActive(false);
          setSelectedIncident(null);
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.userInfo} activeOpacity={0.7}>
          <View style={styles.avatarWrapper}>
            <Image source={require("../../assets/images/avatar.png")} style={styles.avatar} />
          </View>
          <View style={styles.userTextContainer}>
            <Text numberOfLines={1}>
              <Text style={styles.userName}>{userData.fullName} </Text>
              <Text style={styles.userPhone}>{userData.phoneNumber}</Text>
            </Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={18} color={COLORS.primary} />
              <Text style={styles.locationText} numberOfLines={1}>{address}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={28} color={COLORS.textNormal} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <View>
            <MaterialCommunityIcons name="bell" size={32} color="#2D3142" />
            <View style={styles.notificationDot} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        {!isSOSActive ? (
          <View>
            <View style={styles.instructionCard}>
              <Text style={styles.instructionTitle}>Hướng dẫn khẩn cấp</Text>
              <Text style={styles.instructionItem}>1. Nhấn nút SOS.</Text>
              <Text style={styles.instructionItem}>2. Vị trí sẽ được truyền tin đến hệ thống điều phối.</Text>
              <Text style={styles.instructionItem}>3. Cập nhật chi tiết hiện trường để được hỗ trợ chuyên sâu.</Text>
            </View>
            <View style={styles.sosContainer}>
              <TouchableOpacity style={styles.sosButtonWrapper} onPress={handleStartSOS}>
                <Image source={require("../../assets/images/sos-button.png")} style={styles.sosImage} resizeMode="contain" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ImageBackground source={require("../../assets/images/sos-broadcast-effect.png")} style={styles.mainBackground} imageStyle={styles.mainBackgroundImage}>
            <Text style={styles.statusText}>Tín hiệu đang truyền phát...</Text>
            <View style={styles.centerButtonContainer}>
              <TouchableOpacity onPress={handleCancelSOS}>
                <Image source={require("../../assets/images/huy-button.png")} style={styles.huyButtonImage} resizeMode="contain" />
              </TouchableOpacity>
            </View>
            <View style={styles.incidentSection}>
              <Text style={styles.incidentTitle}>XÁC ĐỊNH LOẠI SỰ CỐ HIỆN TRƯỜNG</Text>
              <View style={styles.gridContainer}>
                {INCIDENTS.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.incidentPill, selectedIncident === item.id && styles.incidentPillSelected]}
                    onPress={() => {
                      setTempIncident(item);
                      setIsIncidentModalVisible(true);
                    }}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: selectedIncident === item.id ? COLORS.primary : item.bgColor }]}>
                      <MaterialCommunityIcons name={item.icon as any} size={20} color={selectedIncident === item.id ? "#FFF" : item.iconColor} />
                    </View>
                    <Text style={[styles.incidentText, selectedIncident === item.id && styles.incidentTextSelected]}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ImageBackground>
        )}
      </ScrollView>

      <CountdownModal
        visible={isCountdownVisible}
        onClose={() => setIsCountdownVisible(false)}
        onSend={handleStartSOS}
        seconds={secondsLeft}
        incidentName={aiDetectedName}
      />
      
      <IncidentFormModal
        visible={isIncidentModalVisible}
        onClose={() => setIsIncidentModalVisible(false)}
        onSubmit={handleSubmitInfo}
        incident={tempIncident}
        userData={userData}
        address={address}
        description={description}
        setDescription={setDescription}
        loading={loading}
        onReopen={() => setIsIncidentModalVisible(true)}
      />
    </View>
  );
}