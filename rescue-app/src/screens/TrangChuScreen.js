import React, {
  useEffect,
  useState,
} from "react";
import {
  View,
  Image,
  StyleSheet,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
TouchableWithoutFeedback,
} from "react-native";
import {
  useRouter,
} from "expo-router";
import Animated, {
  Layout,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import BoSuuTapModal from "../components/modals/BoSuuTapModal";
import GhiAmModal from "../components/modals/GhiAmModal";
import TopBarMobile from "../components/navigation/TopBarMobile";
import NavigationBarMobile from "../components/navigation/NavigationBarMobile";
import {
  useMission,
} from "../context/MissionContext";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TrangChuScreen() {
  const router = useRouter();
const [showRecording, setShowRecording] =
  useState(false);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showGallery, setShowGallery] =
  useState(false);
  const [showRejectModal,
  setShowRejectModal] =
  useState(false);
  const {
  missionStatus,
  setMissionStatus,
} = useMission();
  const [activeMissionId, setActiveMissionId] = useState(null);
  const [activeSosId, setActiveSosId] = useState(null);
  const [activeSos, setActiveSos] = useState(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [rescuerId, setRescuerId] = useState(null);
  const [rescuerProfile, setRescuerProfile] = useState(null);
  const resetDispatchCard =
  () => {

    setVisible(false);

    setExpanded(false);

    setTimeout(() => {

      setVisible(true);

    }, 30000);

    setTimeout(() => {

      setExpanded(true);

    }, 34000);

};

const [selectedReason,
  setSelectedReason] =
  useState("");

const [rejectText,
  setRejectText] =
  useState("");

const [rejectSuccess,
  setRejectSuccess] =
  useState(false);

useEffect(() => {
  AsyncStorage.getItem("rescuerUid").then((storedId) => {
    if (!storedId) {
      router.replace("/DangNhap");
      return;
    }
    setRescuerId(storedId);
  });
}, [router]);

  useEffect(() => {
    if (!rescuerId) return undefined;

    let mounted = true;

    const loadRescuerProfile = async () => {
      try {
        const snap = await getDoc(doc(db, "Users", rescuerId));
        if (!mounted) return;
        if (snap.exists()) {
          setRescuerProfile({ id: snap.id, ...snap.data() });
        }
      } catch (error) {
        console.error("Lỗi tải thông tin đội cứu hộ:", error);
      }
    };

    loadRescuerProfile();

    return () => {
      mounted = false;
    };
  }, [rescuerId]);

  useEffect(() => {
    if (!rescuerId) {
      return undefined;
    }

    const q = query(
      collection(db, "rescue_missions"),
      where("rescuerId", "==", rescuerId),
      where("status", "==", "pending"),
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        setActiveMissionId(null);
        setActiveSosId(null);
        setActiveSos(null);
        setVisible(false);
        setExpanded(false);
        setMissionStatus("idle");
        return;
      }

      const missionDoc = snapshot.docs[0];
      const missionData = missionDoc.data();
      setActiveMissionId(missionDoc.id);
      setActiveSosId(missionData?.sosId || null);
      setMissionStatus("dispatch");

      if (missionData?.sosId) {
        const sosSnap = await getDoc(doc(db, "sos_alerts", missionData.sosId));
        if (sosSnap.exists()) {
          const sosData = sosSnap.data();
          const shouldHideMission =
            ["cancelled", "completed", "resolved"].includes(sosData?.status) ||
            ["accepted", "completed"].includes(sosData?.dispatchStatus);

          if (shouldHideMission) {
            setActiveMissionId(null);
            setActiveSosId(null);
            setActiveSos(null);
            setVisible(false);
            setExpanded(false);
            setMissionStatus("idle");
            return;
          }

          setActiveSos(await hydrateSosWithVictim(sosSnap.id, sosData));
          setVisible(true);
          setExpanded(true);
        }
      } else {
        setActiveSos(null);
        setVisible(false);
        setExpanded(false);
      }
    });

    return () => unsubscribe();
  }, [rescuerId, setMissionStatus]);

  useEffect(() => {
    if (!activeSosId) return undefined;

    const unsubscribe = onSnapshot(doc(db, "sos_alerts", activeSosId), async (snapshot) => {
      if (!snapshot.exists()) {
        setActiveSos(null);
        setVisible(false);
        setExpanded(false);
        return;
      }

      const sosData = snapshot.data();
      const shouldHideMission =
        ["cancelled", "completed", "resolved"].includes(sosData?.status) ||
        ["accepted", "completed"].includes(sosData?.dispatchStatus);

      if (shouldHideMission) {
        setActiveMissionId(null);
        setActiveSosId(null);
        setActiveSos(null);
        setVisible(false);
        setExpanded(false);
        setMissionStatus("idle");
        return;
      }

      setActiveSos(await hydrateSosWithVictim(snapshot.id, sosData));
      setVisible(true);
      setExpanded(true);
    });

    return () => unsubscribe();
  }, [activeSosId, setMissionStatus]);

  const handleAcceptMission = async () => {
    if (!activeMissionId || !activeSos?.id || isDispatching) return;
    try {
      setIsDispatching(true);
      await updateDoc(doc(db, "rescue_missions", activeMissionId), {
        status: "accepted",
        acceptedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "sos_alerts", activeSos.id), {
        rescuerId,
        dispatchStatus: "accepted",
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setActiveMissionId(null);
      setActiveSosId(null);
      setActiveSos(null);
      setVisible(false);
      setExpanded(false);
      setMissionStatus("accepted");
      router.push("/KichHoatGiap");
    } catch (error) {
      console.error("Lỗi nhận nhiệm vụ:", error);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleRejectMission = async () => {
    if (!activeMissionId || isDispatching) return;
    const reason = rejectText?.trim() || selectedReason || "Không thể tiếp nhận nhiệm vụ";
    try {
      setIsDispatching(true);
      await updateDoc(doc(db, "rescue_missions", activeMissionId), {
        status: "rejected",
        rejectReason: reason,
        rejectedReason: reason,
        rejectedAt: serverTimestamp(),
      });
      if (activeSos?.id) {
        await updateDoc(doc(db, "sos_alerts", activeSos.id), {
          status: "pending",
          rescuerId: null,
          dispatchStatus: "rejected",
          rejectReason: reason,
          updatedAt: serverTimestamp(),
        });
      }
      setActiveMissionId(null);
      setActiveSosId(null);
      setActiveSos(null);
      setSelectedReason("");
      setRejectText("");
      setMissionStatus("idle");
    } catch (error) {
      console.error("Lỗi từ chối nhiệm vụ:", error);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleCompleteMission = async () => {
    if (!activeMissionId || !activeSos?.id || isDispatching) return;

    const rescueName =
      rescuerProfile?.fullName ||
      rescuerProfile?.displayName ||
      rescuerProfile?.name ||
      "Đội cứu hộ";
    const rescuePhone = rescuerProfile?.phoneNumber || rescuerProfile?.phone || "";
    const completeVictimName =
      activeSos?.victimName || activeSos?.name || activeSos?.fullName || "nạn nhân";
    const completeVictimPhone =
      activeSos?.victimPhone || activeSos?.phone || activeSos?.phoneNumber || "";

    try {
      setIsDispatching(true);

      await updateDoc(doc(db, "rescue_missions", activeMissionId), {
        status: "completed",
        completedAt: serverTimestamp(),
        completedBy: rescuerId,
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "sos_alerts", activeSos.id), {
        dispatchStatus: "completed",
        completedBy: rescuerId,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, "notifications"), {
        type: "RESCUE_MISSION_COMPLETED",
        targetRole: "admin",
        title: "Đội cứu hộ hoàn thành nhiệm vụ",
        body: `${rescueName}${rescuePhone ? ` (${rescuePhone})` : ""} đã hoàn thành nhiệm vụ giải cứu ${completeVictimName}${completeVictimPhone ? ` (${completeVictimPhone})` : ""}.`,
        missionId: activeMissionId,
        sosId: activeSos.id,
        rescuerId,
        victimId: activeSos?.victimId || null,
        read: false,
        createdAt: serverTimestamp(),
      });

      setActiveMissionId(null);
      setActiveSosId(null);
      setActiveSos(null);
      setVisible(false);
      setExpanded(false);
      setMissionStatus("idle");
    } catch (error) {
      console.error("Lỗi hoàn thành nhiệm vụ:", error);
    } finally {
      setIsDispatching(false);
    }
  };
  const victimName = activeSos?.victimName || "Nạn nhân";
  const victimPhone = activeSos?.victimPhone || activeSos?.phone || activeSos?.phoneNumber || "";
  const victimAddress =
    activeSos?.address ||
    activeSos?.locationAddress ||
    activeSos?.location?.address ||
    formatLocation(activeSos?.location) ||
    "Chưa có địa chỉ";
  const incidentLabel = activeSos?.incidentName || activeSos?.type || activeSos?.incidentType || "Chưa cập nhật loại sự cố";
  const incidentDesc = activeSos?.description || "Chưa có mô tả bổ sung";

  return (
    <SafeAreaView style={styles.container}>
      {/* TOP BAR */}
      <TopBarMobile profile={rescuerProfile} />

      {/* CONTENT */}
      <View style={styles.content}>
        {/* Background */}
        <Image
          source={require("../../assets/images/trangchubgr.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
          blurRadius={2}
        />
{!visible && (
  <View style={styles.logoWrapper}>

    <Image
      source={require("../../assets/images/Group 483517.png")}
      style={styles.centerLogo}
      resizeMode="contain"
    />

    <Text style={styles.logoTitle}>
      Lightspeed Rescue
    </Text>

    <Text style={styles.logoSubtitle}>
      {'"Tốc độ ánh sáng! Giải cứu!"'}
    </Text>

  </View>
)}
        {/* CARD */}
        {visible && (
  <Animated.View
    entering={FadeIn.duration(700)}
    layout={Layout.springify().damping(18)}
    style={styles.card}
  >
          {/* HEADER */}
          <View style={styles.cardHeader}>
            <View style={styles.alertWrapper}>

              <Text style={styles.alertText}>
                LỆNH ĐIỀU ĐỘNG
              </Text>
            </View>

            {expanded ? (
              <View style={styles.updateTag}>
                <Text style={styles.updateText}>
                  MỚI CẬP NHẬT
                </Text>
              </View>
            ) : (
              <Text style={styles.doneText}>
                Vừa xong
              </Text>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* USER */}
          <View style={styles.infoRow}>
            <Image
              source={require("../../assets/icons/user-trangchu.png")}
              style={styles.smallIcon}
            />

            <Text style={styles.nameText}>
              {victimName}
            </Text>
          </View>

          {/* PHONE */}
          <View style={styles.infoRow}>
            <Image
              source={require("../../assets/icons/phone-trangchu.png")}
              style={styles.smallIcon}
            />

            <Text style={styles.phoneText}>
              {victimPhone}
            </Text>
          </View>

          {/* ADDRESS */}
          <View style={styles.infoRow}>
            <Image
              source={require("../../assets/icons/pin-trangchu.png")}
              style={styles.smallIcon}
            />

            <Text style={styles.addressText}>
              {victimAddress}
            </Text>
          </View>

          {/* EXPANDED CONTENT */}
          {expanded && (
            <Animated.View
              entering={FadeIn.duration(350)}
              exiting={FadeOut}
            >
              {/* Divider */}
              <View style={styles.divider} />

              {/* STATUS */}
              <View style={styles.statusTag}>
              

                <Text style={styles.statusText}>
                  {incidentLabel}
                </Text>
              </View>

              {/* QUOTE */}
              <View style={styles.quoteBox}>
                <View style={styles.quoteBar} />

                <Text style={styles.quoteText}>
                  {`"${incidentDesc}"`}
                </Text>
              </View>

              {/* ACTIONS */}
              <View style={styles.actionRow}>
                <TouchableOpacity
  style={styles.secondaryButton}
onPress={() => setShowRecording(true)}>
  <Image
    source={require("../../assets/icons/fluent_mic-record-24-regular.png")}
    style={styles.actionIcon}
  />

  <Text style={styles.secondaryText}>
    Ghi âm
  </Text>
</TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => setShowGallery(true)}
                >
                  <Image
                    source={require("../../assets/icons/mdi-light_image.png")}
                    style={styles.actionIcon}
                  />

                  <Text style={styles.secondaryText}>
                    Bộ sưu tập
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* BUTTONS */}
          {missionStatus ===
"dispatch" && (

  <View style={styles.bottomRow}>

    <TouchableOpacity
      style={styles.rejectButton}
      onPress={() =>
        setShowRejectModal(true)
      }
    >
      <Text style={styles.rejectText}>
        Từ chối
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.acceptButton}
      onPress={handleAcceptMission}
      disabled={isDispatching}
    >
      <Text style={styles.acceptText}>
        Nhận nhiệm vụ
      </Text>
    </TouchableOpacity>

  </View>

)}
{missionStatus ===
"accepted" && (

  <TouchableOpacity
    style={styles.completeButton}
    onPress={handleCompleteMission}
    disabled={isDispatching}
  >
    <Text style={styles.acceptText}>
      Hoàn thành nhiệm vụ
    </Text>
  </TouchableOpacity>

)}
        </Animated.View>
)}
      </View>
{showRejectModal && (
  <TouchableWithoutFeedback
    onPress={Keyboard.dismiss}
  >
  <View style={styles.rejectOverlay}>
    <View style={styles.rejectCard}>

      {!rejectSuccess ? (
        <>
          {/* ICON */}
          <View style={styles.warningIcon}>
            <Text style={styles.warningText}>
              ⚠
            </Text>
          </View>

          {/* TITLE */}
          <Text style={styles.rejectTitle}>
            Từ chối nhiệm vụ
          </Text>

          <Text style={styles.rejectDesc}>
            Vui lòng cung cấp lý do để
            Trung tâm nhanh chóng điều
            phối đội cứu hộ khác.
          </Text>

          {/* TAGS */}
          <View style={styles.reasonRow}>
            {[
              "Xe đang hỏng",
              "Kẹt xe nghiêm trọng",
              "Đang xử lý ca khác",
              "Lý do khác...",
            ].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.reasonTag,

                  selectedReason ===
                    item &&
                    styles.reasonTagActive,
                ]}
                onPress={() =>
                  setSelectedReason(item)
                }
              >
                <Text
                  style={[
                    styles.reasonText,

                    selectedReason ===
                      item &&
                      styles.reasonTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* INPUT */}
          <TextInput
            placeholder="Nhập lý do chi tiết (nếu có)..."
            placeholderTextColor="#AFAFAF"
            multiline
            value={rejectText}
            onChangeText={setRejectText}
            style={styles.rejectInput}
          />

          {/* BUTTONS */}
          <View style={styles.rejectBottom}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() =>
                setShowRejectModal(
                  false
                )
              }
            >
              <Text style={styles.cancelText}>
                Hủy bỏ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sendBtn}
              onPress={() => {
                handleRejectMission();
                setRejectSuccess(
                  true
                );

                setTimeout(() => {
                  setShowRejectModal(
                    false
                  );

                  setRejectSuccess(
                    false
                  );
                }, 1800);
              }}
            >
              <Text style={styles.sendText}>
                Gửi lý do
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          {/* SUCCESS */}
          <View
            style={
              styles.successCircle
            }
          >
            <Text
              style={
                styles.successCheck
              }
            >
              ✓
            </Text>
          </View>

          <Text style={styles.successTitle}>
            Đã gửi lý do
          </Text>

          <Text style={styles.successDesc}>
            Trung tâm đã nhận được
            phản hồi và đang điều động
            đơn vị khác thay thế.
            Cảm ơn bạn!
          </Text>

          <TouchableOpacity
  style={styles.homeBtn}
  onPress={() => {

    setShowRejectModal(
      false
    );

    setRejectSuccess(
      false
    );

    resetDispatchCard();

  }}
>
            <Text style={styles.homeText}>
              Quay về trang chủ
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  </View>
    </TouchableWithoutFeedback>

)}
      {/* NAV */}
      <NavigationBarMobile />
      {showRecording && (
  <GhiAmModal
    onClose={() =>
      setShowRecording(false)
    }
    audioUrl={activeSos?.audioUrl || null}
  />
)}
{showGallery && (
  <BoSuuTapModal
    onClose={() =>
      setShowGallery(false)
    }
    images={activeSos?.mediaUrl || []}
    victimName={victimName}
    victimPhone={victimPhone}
  />
)}
    </SafeAreaView>
  );
}

async function hydrateSosWithVictim(id, sos) {
  if (!sos?.victimId) return { id, ...sos };

  try {
    const userSnap = await getDoc(doc(db, "Users", sos.victimId));
    const user = userSnap.exists() ? userSnap.data() : null;

    return {
      id,
      ...sos,
      victimName: sos.victimName || sos.name || user?.fullName || user?.displayName || user?.name || "Nạn nhân",
      victimPhone: sos.victimPhone || sos.phone || sos.phoneNumber || user?.phoneNumber || user?.phone || "",
      address: sos.address || sos.locationAddress || user?.address || user?.currentAddress || "",
    };
  } catch (error) {
    console.warn("Không thể tải thông tin nạn nhân:", error);
    return { id, ...sos };
  }
}

function formatLocation(location) {
  if (!location) return "";
  const lat = location.lat ?? location.latitude;
  const lng = location.lng ?? location.longitude;
  if (typeof lat !== "number" || typeof lng !== "number") return "";
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  content: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    position: "relative",
  },

  backgroundImage: {
    position: "absolute",

    width: "118%",
    height: "118%",

    opacity: 0.22,

    transform: [{ scale: 1.08 }],
  },

  card: {
    width: "88%",

    backgroundColor: "#FFF",

    borderRadius: 24,

    paddingHorizontal: 18,
    paddingVertical: 18,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,

    elevation: 6,

    borderTopWidth: 5,
    borderTopColor: "#FF3D3D",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  alertWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 12,
    height: 12,

    marginRight: 6,
  },

  alertText: {
    color: "#FF3D3D",

    fontSize: 12,
    fontWeight: "700",
  },

  doneText: {
    color: "#A8A8A8",

    fontSize: 12,
    fontWeight: "500",
  },

  updateTag: {
    backgroundColor: "#EAF3FF",

    borderRadius: 7,

    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  updateText: {
    color: "#3B82F6",

    fontSize: 10,
    fontWeight: "700",
  },

  divider: {
    height: 1,

    backgroundColor: "#EFEFEF",

    marginVertical: 14,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 10,
  },

  smallIcon: {
    width: 11,
    height: 11,

    marginRight: 10,
  },

  nameText: {
    color: "#FF3D3D",

    fontSize: 28,
    fontWeight: "700",
  },

  phoneText: {
    color: "#313A51",

    fontSize: 18,
    fontWeight: "600",
  },

  addressText: {
    flex: 1,

    color: "#313A51",

    fontSize: 15,
    fontWeight: "700",

    lineHeight: 22,
  },

  statusTag: {
    alignSelf: "flex-start",

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#FF8852",

    borderRadius: 999,

    paddingHorizontal: 12,
    paddingVertical: 7,

    marginBottom: 16,
  },

  statusIcon: {
    width: 13,
    height: 13,

    marginRight: 5,
  },

  statusText: {
    color: "#FF8852",

    fontSize: 13,
    fontWeight: "600",
  },

  quoteBox: {
    height: 58,

    backgroundColor: "#F5F5FA",

    borderRadius: 12,

    flexDirection: "row",
    alignItems: "center",

    overflow: "hidden",

    marginBottom: 18,
  },

  quoteBar: {
    width: 4,
    height: "100%",

    backgroundColor: "#FF3D3D",
  },

  quoteText: {
    marginLeft: 12,

    color: "#5E5E5E",

    fontSize: 15,
    fontStyle: "italic",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",

    marginBottom: 18,
  },

  secondaryButton: {
    width: "47%",
    height: 72,

    borderWidth: 1,
    borderColor: "#FF8852",

    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",
  },

  actionIcon: {
    width: 22,
    height: 22,

    marginBottom: 7,
  },

  secondaryText: {
    color: "#FF8852",

    fontSize: 14,
    fontWeight: "600",
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  rejectButton: {
    width: "47%",
    height: 54,

    backgroundColor: "#F1F1F5",

    borderRadius: 15,

    alignItems: "center",
    justifyContent: "center",
  },

  rejectText: {
    color: "#A0A0A0",

    fontSize: 17,
    fontWeight: "700",
  },

  acceptButton: {
    width: "47%",
    height: 54,

    backgroundColor: "#FF8A1F",

    borderRadius: 15,

    alignItems: "center",
    justifyContent: "center",
  },

  acceptText: {
    color: "#FFF",

    fontSize: 17,
    fontWeight: "700",
  },
  rejectOverlay: {
  position: "absolute",

  top: 0,
  left: 0,
  right: 0,
  bottom: 0,

  backgroundColor:
    "rgba(0,0,0,0.25)",

  justifyContent: "center",
  alignItems: "center",

  zIndex: 999,
},

rejectCard: {
  width: "86%",

  backgroundColor: "#FFF",

  borderRadius: 24,

  padding: 20,

  shadowColor: "#000",
  shadowOpacity: 0.12,
  shadowRadius: 14,

  elevation: 8,
},

warningIcon: {
  width: 34,
  height: 34,

  borderRadius: 999,

  backgroundColor: "#FFF5D8",

  alignSelf: "center",

  alignItems: "center",
  justifyContent: "center",

  marginBottom: 12,
},

warningText: {
  fontSize: 18,
},

rejectTitle: {
  color: "#313A51",

  fontSize: 20,
  fontWeight: "700",

  textAlign: "center",

  marginBottom: 8,
},

rejectDesc: {
  color: "#9A9A9A",

  fontSize: 13,

  lineHeight: 20,

  textAlign: "center",

  marginBottom: 18,
},

reasonRow: {
  flexDirection: "row",
  flexWrap: "wrap",

  marginBottom: 14,
},

reasonTag: {
  paddingHorizontal: 12,
  paddingVertical: 8,

  backgroundColor: "#F4F4F7",

  borderRadius: 999,

  marginRight: 8,
  marginBottom: 8,
},

reasonTagActive: {
  borderWidth: 1,
  borderColor: "#FF5C3A",

  backgroundColor: "#FFF2EE",
},

reasonText: {
  color: "#707070",

  fontSize: 12,
},

reasonTextActive: {
  color: "#FF5C3A",
  fontWeight: "700",
},

rejectInput: {
  height: 88,

  borderWidth: 1,
  borderColor: "#ECECEC",

  borderRadius: 14,

  padding: 14,

  textAlignVertical: "top",

  marginBottom: 16,

  color: "#313A51",
},

rejectBottom: {
  flexDirection: "row",
  justifyContent: "space-between",
},

cancelBtn: {
  width: "46%",
  height: 50,

  borderRadius: 14,

  backgroundColor: "#F3F3F5",

  justifyContent: "center",
  alignItems: "center",
},

cancelText: {
  color: "#A4A4A4",

  fontSize: 15,
  fontWeight: "600",
},

sendBtn: {
  width: "46%",
  height: 50,

  borderRadius: 14,

  backgroundColor: "#FF5A36",

  justifyContent: "center",
  alignItems: "center",
},

sendText: {
  color: "#FFF",

  fontSize: 15,
  fontWeight: "700",
},

successCircle: {
  width: 58,
  height: 58,

  borderRadius: 999,

  backgroundColor: "#EAF9ED",

  alignSelf: "center",

  justifyContent: "center",
  alignItems: "center",

  marginBottom: 16,
},

successCheck: {
  color: "#45C266",

  fontSize: 28,
  fontWeight: "700",
},

successTitle: {
  color: "#313A51",

  fontSize: 22,
  fontWeight: "700",

  textAlign: "center",

  marginBottom: 10,
},

successDesc: {
  color: "#8D8D8D",

  fontSize: 14,

  lineHeight: 22,

  textAlign: "center",

  marginBottom: 24,
},

homeBtn: {
  height: 54,

  borderRadius: 16,

  backgroundColor: "#F3F3F5",

  justifyContent: "center",
  alignItems: "center",
},

homeText: {
  color: "#313A51",

  fontSize: 15,
  fontWeight: "700",
},
completeButton: {
  height: 54,

  backgroundColor: "#FF8A1F",

  borderRadius: 15,

  alignItems: "center",
  justifyContent: "center",

  width: "100%",
},
logoWrapper: {
  alignItems: "center",
  justifyContent: "center",
},

centerLogo: {
  width: 150,
  height: 150,

  marginBottom: 18,
},

logoTitle: {
  fontSize: 30,
  fontWeight: "600",

  color: "#FF8852",

  marginBottom: 8,
},

logoSubtitle: {
  fontSize: 17,

  color: "#8B8B8B",
},
});
