import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useFocusEffect, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "../../constants/(tabs)/home.styles";
import { COLORS } from "../../constants/colors";
import { db } from "../../firebaseConfig";

// Components
import { CountdownModal } from "../../components/CountdownModal";
import { ExpandableNotification } from "../../components/ExpandableNotification";
import { IncidentFormModal } from "../../components/IncidentFormModal";
import { simulateAdminDispatch } from "../../utils/adminSimulator";

const { height } = Dimensions.get("window");

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const INCIDENTS = [
  {
    id: "NUCLEAR",
    name: "Hạt nhân",
    icon: "radioactive",
    bgColor: "#E8F5E9",
    iconColor: "#000",
  },
  {
    id: "FIRE",
    name: "Hoả hoạn",
    icon: "fire",
    bgColor: "#FFEBEE",
    iconColor: "#000",
  },
  {
    id: "EARTHQUAKE",
    name: "Động đất",
    icon: "office-building-marker",
    bgColor: "#E0F2F1",
    iconColor: "#000",
  },
  {
    id: "DISEASE",
    name: "Dịch bệnh",
    icon: "virus",
    bgColor: "#EDE7F6",
    iconColor: "#000",
  },
  {
    id: "FLOOD",
    name: "Bão lũ",
    icon: "waves",
    bgColor: "#FCE4EC",
    iconColor: "#000",
  },
  {
    id: "OTHER",
    name: "Khác",
    icon: "plus-circle",
    bgColor: "#FFF8E1",
    iconColor: "#000",
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [userData, setUserData] = useState({
    uid: "",
    fullName: "Đang tải...",
    phoneNumber: "",
  });
  const [address, setAddress] = useState("Đang xác định vị trí...");
  const [loading, setLoading] = useState(false);

  const [isSOSActive, setIsSOSActive] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [isRescueAccepted, setIsRescueAccepted] = useState(false);

  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  // ✅ BIẾN ĐỂ THEO DÕI NGƯỜI DÙNG CÓ ĐANG Ở TRANG HOME HAY KHÔNG
  const [isScreenFocused, setIsScreenFocused] = useState(true);

  const [notifications, setNotifications] = useState([
    {
      id: "2",
      title: "Thay đổi mật khẩu thành công!",
      content: ["Bạn đã thay đổi mật khẩu thành công hãy..."],
      isImportant: false,
    },
    {
      id: "3",
      title: "Thông báo hệ thống",
      content: ["App cứu hộ vừa cập nhật tính năng mới."],
      isImportant: false,
    },
  ]);

  const [isNotiVisible, setIsNotiVisible] = useState(false);
  const dropAnim = useRef(new Animated.Value(-height)).current;
  const HEADER_HEIGHT = 80 + insets.top;

  const toggleNotifications = () => {
    const toValue = isNotiVisible ? -height : HEADER_HEIGHT;
    setIsNotiVisible(!isNotiVisible);
    Animated.timing(dropAnim, {
      toValue,
      duration: 1000,
      easing: Easing.out(Easing.poly(4)),
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") console.log("Chưa cấp quyền thông báo");
    })();
  }, []);

  // 1. LẮNG NGHE LỆNH ĐIỀU ĐỘNG TỪ TRUNG TÂM
  useEffect(() => {
    if (!isSOSActive || !currentRequestId) {
      setNotifications((prev) => prev.filter((n) => n.id !== "RESCUE_ACTIVE"));
      return;
    }

    const q = query(
      collection(db, "Dispatches"),
      where("requestId", "==", currentRequestId),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added" || change.type === "modified") {
          const dispatchData = change.doc.data();

          if (dispatchData.status === "ACCEPTED" && !isRescueAccepted) {
            setIsRescueAccepted(true);

            setNotifications((prev) => {
              if (prev.find((n) => n.id === "RESCUE_ACTIVE")) return prev;
              return [
                {
                  id: "RESCUE_ACTIVE",
                  title: "Đội cứu hộ đang tiến về phía bạn!",
                  content: [
                    "• Ở yên tại vị trí an toàn.",
                    "• Di chuyển theo chỉ dẫn trên bản đồ.",
                  ],
                  isImportant: true,
                },
                ...prev,
              ];
            });

            await Notifications.scheduleNotificationAsync({
              content: {
                title: "Đội cứu hộ đang đến! 🚑",
                body: "Yêu cầu của bạn đã được tiếp nhận. Hãy giữ bình tĩnh.",
                sound: true,
                data: { requestId: currentRequestId },
              },
              trigger: null,
            });
          }
        }
      });
    });
    return () => unsubscribe();
  }, [isSOSActive, currentRequestId, isRescueAccepted]);

  // 2. RULE 10S: CẬP NHẬT TỌA ĐỘ NẠN NHÂN LÊN FIREBASE (CHẠY NGẦM)
  useEffect(() => {
    let locationInterval: ReturnType<typeof setInterval>;

    if (isSOSActive && userData?.uid) {
      const updateLocationToFirebase = async () => {
        try {
          let loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          await updateDoc(doc(db, "Users", userData.uid), {
            currentLocation: {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            },
            lastLocationUpdate: serverTimestamp(),
          });

          console.log(
            `[Hệ thống] Đã đồng bộ tọa độ (Rule 10s) cho Victim: ${userData.fullName}`,
          );
        } catch (error) {
          console.error("Lỗi đồng bộ tọa độ định kỳ:", error);
        }
      };

      updateLocationToFirebase();
      locationInterval = setInterval(updateLocationToFirebase, 10000);
    }

    return () => {
      if (locationInterval) {
        clearInterval(locationInterval);
      }
    };
  }, [isSOSActive, userData.uid]);

  // ✅ 3A. BẬT/TẮT TRẠNG THÁI FOCUS KHI CHUYỂN TAB
  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => {
        setIsScreenFocused(false); // Ngay khi rời Home, tắt focus
      };
    }, []),
  );

  // ✅ 3B. LOGIC ĐẾM NGƯỢC AI (Đã sửa lại chu kỳ 15s và điều kiện Focus)
  const [isCountdownVisible, setIsCountdownVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [aiDetectedName, setAiDetectedName] = useState("");
  const [isIncidentModalVisible, setIsIncidentModalVisible] = useState(false);
  const [tempIncident, setTempIncident] = useState<any>(null);
  const [description, setDescription] = useState("");

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    let i: ReturnType<typeof setInterval>;

    const triggerAI = () => {
      // Chỉ bung Modal nếu đang ở Home và chưa kích hoạt các Modal khác
      if (
        isScreenFocused &&
        !isSOSActive &&
        !isCountdownVisible &&
        !isIncidentModalVisible
      ) {
        const rand = INCIDENTS[Math.floor(Math.random() * INCIDENTS.length)];
        setAiDetectedName(rand.name);
        setSecondsLeft(5);
        setIsCountdownVisible(true);
      }
    };

    // Chỉ bắt đầu bộ đếm ẩn khi ở trang Home
    if (
      isScreenFocused &&
      !isSOSActive &&
      !isCountdownVisible &&
      !isIncidentModalVisible
    ) {
      t = setTimeout(triggerAI, 5000); // Khởi động nháp sau 5s đầu tiên
      i = setInterval(triggerAI, 15000); // Sau đó cứ 15 giây check 1 lần
    }

    return () => {
      clearTimeout(t);
      clearInterval(i);
    };
  }, [
    isScreenFocused,
    isSOSActive,
    isCountdownVisible,
    isIncidentModalVisible,
  ]);

  useEffect(() => {
    let t: number;
    // Đồng hồ 5-4-3-2-1 cũng chỉ chạy khi đang ở Home
    if (isScreenFocused && isCountdownVisible && secondsLeft > 0) {
      t = window.setInterval(() => setSecondsLeft((p) => p - 1), 1000);
    } else if (isScreenFocused && secondsLeft === 0 && isCountdownVisible) {
      handleStartSOS();
    }
    return () => clearInterval(t);
  }, [isScreenFocused, isCountdownVisible, secondsLeft]);

  // LẤY DỮ LIỆU USER & ĐỊA CHỈ
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      fetchAddress();
    }, []),
  );

  const fetchUserData = async () => {
    const phone = await AsyncStorage.getItem("userPhone");
    if (phone) {
      const q = query(
        collection(db, "Users"),
        where("phoneNumber", "==", phone),
      );
      const snap = await getDocs(q);
      if (!snap.empty)
        setUserData({
          uid: snap.docs[0].id,
          fullName: snap.docs[0].data().fullName,
          phoneNumber: phone,
        });
    }
  };

  const fetchAddress = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    let loc = await Location.getCurrentPositionAsync({});
    let res = await Location.reverseGeocodeAsync({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
    if (res.length > 0)
      setAddress(`${res[0].name || ""}, ${res[0].street || ""}`);
  };

  const handleStartSOS = async () => {
    setIsCountdownVisible(false);
    setIsSOSActive(true);
    setIsRescueAccepted(false);
    try {
      setLoading(true);
      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const docRef = await addDoc(collection(db, "SOS_Requests"), {
        victimId: userData.uid,
        victimName: userData.fullName,
        victimPhone: userData.phoneNumber,
        incidentType: "UNCATEGORIZED",
        description: "",
        location: {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        },
        mediaImages: [],
        audioRecordings: [],
        priorityScore: 0,
        status: "ACTIVE",
        createdAt: serverTimestamp(),
      });
      setCurrentRequestId(docRef.id);
      setTimeout(() => simulateAdminDispatch(docRef.id), 10000);
    } catch (e) {
      console.error(e);
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
          if (currentRequestId)
            await updateDoc(doc(db, "SOS_Requests", currentRequestId), {
              status: "CANCELLED",
            });
          setIsSOSActive(false);
          setCurrentRequestId(null);
          setSelectedIncident(null);
          setIsRescueAccepted(false);
        },
      },
    ]);
  };

  const handleSubmitInfo = async (
    images: string[] = [],
    audioUri: string | null = null,
  ) => {
    if (!currentRequestId || !tempIncident) return;
    try {
      setLoading(true);
      await updateDoc(doc(db, "SOS_Requests", currentRequestId), {
        incidentType: tempIncident.id,
        description,
      });
      setSelectedIncident(tempIncident.id);
      setIsIncidentModalVisible(false);

      setTimeout(() => {
        setIsSuccessModalVisible(true);
      }, 300);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 4. TỰ ĐỘNG TẮT VÒNG LẶP ĐỊNH VỊ Ở HOME KHI ĐÃ GẶP NHAU (RESOLVED)
  useEffect(() => {
    if (!currentRequestId) return;

    const unsub = onSnapshot(
      doc(db, "SOS_Requests", currentRequestId),
      (docSnap) => {
        if (docSnap.exists() && docSnap.data().status === "RESOLVED") {
          setIsSOSActive(false);
          setCurrentRequestId(null);
          setSelectedIncident(null);
          setIsRescueAccepted(false);
        }
      },
    );

    return () => unsub();
  }, [currentRequestId]);

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      {/* HEADER CỐ ĐỊNH */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, zIndex: 1001, backgroundColor: "#FFF" },
        ]}
      >
        <TouchableOpacity style={styles.userInfo} activeOpacity={0.7}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={() => router.push("/edit-profile")}
          >
            <Image
              source={require("../../assets/images/avatar.png")}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.userTextContainer}
            onPress={() => router.push("/(tabs)/map")}
          >
            <Text numberOfLines={1}>
              <Text style={styles.userName}>{userData.fullName} </Text>
              <Text style={styles.userPhone}>{userData.phoneNumber}</Text>
            </Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={18} color={COLORS.primary} />
              <Text style={styles.locationText} numberOfLines={1}>
                {address}
              </Text>
            </View>
          </TouchableOpacity>
          <Ionicons
            name="chevron-forward"
            size={28}
            color={COLORS.textNormal}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={toggleNotifications}
        >
          <View>
            <MaterialCommunityIcons
              name={isNotiVisible ? "bell-off" : "bell"}
              size={32}
              color={isNotiVisible ? COLORS.primary : "#2D3142"}
            />
            {isRescueAccepted && <View style={styles.notificationDot} />}
          </View>
        </TouchableOpacity>
      </View>

      {/* KHAY THÔNG BÁO ANIMATION */}
      <Animated.View
        style={{
          position: "absolute",
          top: dropAnim,
          left: 0,
          right: 0,
          height: height,
          backgroundColor: "#F8F9FB",
          zIndex: 1000,
          paddingTop: 10,
        }}
      >
        <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 150 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 15,
              color: "#2D3142",
              marginLeft: 5,
            }}
          >
            Thông báo của bạn
          </Text>
          {notifications.map((noti) => (
            <ExpandableNotification
              key={noti.id}
              title={noti.title}
              content={noti.content}
              isImportant={noti.isImportant}
              requestId={currentRequestId}
              onClose={toggleNotifications}
            />
          ))}
          {notifications.length === 0 && (
            <Text style={{ textAlign: "center", marginTop: 50, color: "#999" }}>
              Trống
            </Text>
          )}
        </ScrollView>
      </Animated.View>

      {/* TRANG HOME CHÍNH */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 10,
          paddingBottom: insets.bottom + 120,
        }}
      >
        {!isSOSActive ? (
          <View>
            <View style={styles.instructionCard}>
              <Text style={styles.instructionTitle}>Hướng dẫn khẩn cấp</Text>
              <Text style={styles.instructionItem}>1. Nhấn nút SOS.</Text>
              <Text style={styles.instructionItem}>
                2. Vị trí sẽ được truyền tin đến hệ thống điều phối.
              </Text>
              <Text style={styles.instructionItem}>
                3. Cập nhật chi tiết hiện trường để được hỗ trợ chuyên sâu.
              </Text>
            </View>
            <View style={styles.sosContainer}>
              <TouchableOpacity
                style={styles.sosButtonWrapper}
                onPress={handleStartSOS}
              >
                <Image
                  source={require("../../assets/images/sos-button.png")}
                  style={styles.sosImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ImageBackground
            source={require("../../assets/images/sos-broadcast-effect.png")}
            style={styles.mainBackground}
            imageStyle={styles.mainBackgroundImage}
          >
            <Text style={styles.statusText}>Tín hiệu đang truyền phát...</Text>
            <View style={styles.centerButtonContainer}>
              <TouchableOpacity onPress={handleCancelSOS}>
                <Image
                  source={require("../../assets/images/huy-button.png")}
                  style={styles.huyButtonImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.incidentSection}>
              <Text style={styles.incidentTitle}>
                XÁC ĐỊNH LOẠI SỰ CỐ HIỆN TRƯỜNG
              </Text>
              <View style={styles.gridContainer}>
                {INCIDENTS.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.incidentPill,
                      selectedIncident === item.id &&
                        styles.incidentPillSelected,
                    ]}
                    onPress={() => {
                      setTempIncident(item);
                      setIsIncidentModalVisible(true);
                    }}
                  >
                    <View
                      style={[
                        styles.iconCircle,
                        {
                          backgroundColor:
                            selectedIncident === item.id
                              ? COLORS.primary
                              : item.bgColor,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={20}
                        color={
                          selectedIncident === item.id ? "#FFF" : item.iconColor
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.incidentText,
                        selectedIncident === item.id &&
                          styles.incidentTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ImageBackground>
        )}
      </ScrollView>

      {/* CÁC MODAL */}
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

      <Modal visible={isSuccessModalVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#FFF",
              width: "100%",
              borderRadius: 20,
              padding: 30,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: "#FFF5F0",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Ionicons name="flash" size={34} color={COLORS.primary} />
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#2D3142",
                textAlign: "center",
              }}
            >
              Đã gửi thông tin thành công!
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#555",
                textAlign: "center",
                marginTop: 12,
                lineHeight: 22,
              }}
            >
              Nếu có diễn biến mới, vui lòng tiếp tục cập nhật để đội cứu hộ hỗ
              trợ bạn nhanh nhất.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.primary,
                width: "100%",
                paddingVertical: 16,
                borderRadius: 15,
                marginTop: 30,
                alignItems: "center",
              }}
              onPress={() => setIsSuccessModalVisible(false)}
            >
              <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "bold" }}>
                Về trang chủ
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
