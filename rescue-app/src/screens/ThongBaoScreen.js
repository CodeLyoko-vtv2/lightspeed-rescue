import React, {
  useEffect,
  useState,
} from "react";
import {
  useRouter,
} from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";

import TopBarMobile from "../components/navigation/TopBarMobile";
import NavigationBarMobile from "../components/navigation/NavigationBarMobile";
import {
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

export default function ThongBaoScreen() {
    const router = useRouter();
  const [expanded, setExpanded] =
    useState(false);
  const [activeSos, setActiveSos] = useState(null);
  const [activeMissionId, setActiveMissionId] = useState(null);
  const [rescuerId, setRescuerId] = useState(null);

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

    const q = query(
      collection(db, "rescue_missions"),
      where("rescuerId", "==", rescuerId),
      where("status", "==", "pending"),
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        setActiveSos(null);
        setActiveMissionId(null);
        return;
      }

      const missionDoc = snapshot.docs[0];
      const missionData = missionDoc.data();
      setActiveMissionId(missionDoc.id);
      if (missionData?.sosId) {
        const sosSnap = await getDoc(doc(db, "sos_alerts", missionData.sosId));
        if (sosSnap.exists()) {
          setActiveSos(await hydrateSosWithVictim(sosSnap.id, sosSnap.data()));
        }
      }
    });

    return () => unsubscribe();
  }, [rescuerId]);

  const incidentDesc = activeSos?.description || "Chưa có mô tả bổ sung";
  const incidentStatus = activeSos?.incidentName || activeSos?.type || activeSos?.incidentType || "Chưa cập nhật loại sự cố";
  const incidentRequest = activeSos
    ? "Lệnh điều động từ Trung tâm cứu hộ."
    : "Chưa có lệnh điều động mới.";

  const handleViewVictim = async () => {
    try {
      if (activeMissionId) {
        await updateDoc(doc(db, "rescue_missions", activeMissionId), {
          status: "accepted",
          acceptedAt: serverTimestamp(),
        });
      }
      if (activeSos?.id) {
        await updateDoc(doc(db, "sos_alerts", activeSos.id), {
          rescuerId,
          dispatchStatus: "accepted",
          acceptedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Lỗi cập nhật nhiệm vụ:", error);
    } finally {
      router.push("/BanDoDuongDi2");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* TOP NAV */}
      <TopBarMobile />

      {/* CONTENT */}
      <View style={styles.content}>
        {/* FIRST NOTIFICATION */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            setExpanded(!expanded)
          }
        >
          <View
            style={[
              styles.item,
              expanded &&
                styles.expandedItem,
            ]}
          >
            <View
              style={styles.textWrapper}
            >
              <Text
                style={styles.activeTitle}
              >
                Lệnh điều động khẩn
                cấp mới!
              </Text>

              {!expanded && (
                <Text
                  style={styles.desc}
                >
                  - {incidentDesc}
                </Text>
              )}

              {/* EXPANDED */}
              {expanded && (
                <View
                  style={
                    styles.expandContent
                  }
                >
                  <Text style={styles.expandText}>
  • <Text style={styles.boldText}>
      Khoảng cách:
    </Text>
  {"  "}
  Cách bạn 2.5 km
</Text>

<Text style={styles.expandText}>
  • <Text style={styles.boldText}>
      Tình trạng:
    </Text>
  {"  "}
  {incidentStatus}
</Text>

<Text style={styles.expandText}>
  • <Text style={styles.boldText}>
      Yêu cầu:
    </Text>
  {"  "}
  {incidentRequest}
</Text>

                  <TouchableOpacity
                  onPress={handleViewVictim}>
                    <Text
                      style={
                        styles.viewVictim
                      }
                    >
                      XEM VỊ TRÍ NẠN
                      NHÂN
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <Text style={styles.arrow}>
              {expanded ? "▲" : "▼"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* OTHER ITEMS */}
        <View style={styles.item}>
          <View style={styles.textWrapper}>
            <Text style={styles.title}>
              Đồng bộ giáp thành
              công!
            </Text>

            <Text style={styles.desc}>
              Hệ thống đã ghi nhận
              cấu hình giáp mới của
              bạn...
            </Text>
          </View>

          <Text style={styles.arrow}>
            ▼
          </Text>
        </View>

        <View style={styles.item}>
          <View style={styles.textWrapper}>
            <Text style={styles.title}>
              Cập nhật mật khẩu
              thành công!
            </Text>

            <Text style={styles.desc}>
              Bạn đã thay đổi mật
              khẩu tài khoản thành
              công...
            </Text>
          </View>

          <Text style={styles.arrow}>
            ▼
          </Text>
        </View>

        <View style={styles.item}>
          <View style={styles.textWrapper}>
            <Text style={styles.title}>
              Kiểm tra định kỳ thiết
              bị
            </Text>

            <Text style={styles.desc}>
              Vui lòng mang thiết bị
              cứu hộ đến trung
              tâm...
            </Text>
          </View>

          <Text style={styles.arrow}>
            ▼
          </Text>
        </View>
      </View>

      {/* BOTTOM NAV */}
      <NavigationBarMobile />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  content: {
    flex: 1,

    paddingTop: 10,
  },

  item: {
    minHeight: 82,

    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",

    paddingHorizontal: 16,
    paddingVertical: 16,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",

    backgroundColor: "#FFF",
  },

  expandedItem: {
    backgroundColor: "#FFF5F2",
  },

  textWrapper: {
    flex: 1,

    paddingRight: 10,
  },

  title: {
    color: "#313A51",

    fontSize: 16,
    fontWeight: "700",

    marginBottom: 6,
  },

  activeTitle: {
    color: "#FF5A2F",

    fontSize: 16,
    fontWeight: "700",

    marginBottom: 6,
  },

  desc: {
    color: "#A2A2A2",

    fontSize: 13,

    lineHeight: 18,
  },

  arrow: {
    color: "#BDBDBD",

    fontSize: 13,

    marginTop: 2,
  },

  expandContent: {
    marginTop: 6,
  },

  expandText: {
    color: "#666",

    fontSize: 13,

    lineHeight: 22,

    marginBottom: 4,
  },

  viewVictim: {
    color: "#FF5A2F",

    fontSize: 14,
    fontWeight: "700",

    marginTop: 14,
  },boldText: {
  fontWeight: "700",
  color: "#4B4B4B",
},

});
