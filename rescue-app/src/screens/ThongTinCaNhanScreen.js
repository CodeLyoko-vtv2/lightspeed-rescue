import React, {
  useEffect,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import {
  useRouter,
  usePathname,
} from "expo-router";

import BottomNavbar from "../components/navigation/NavigationBarMobile";

export default function ThongTinCaNhanScreen() {
  const router = useRouter();
  const [showAlert, setShowAlert] =
    useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAlert(true);
    }, 5000);
  
    return () => clearTimeout(timer);
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require("../../assets/icons/Back.png")}
              style={styles.backIcon}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Thông tin cá nhân
          </Text>
        </View>

        {/* AVATAR */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarOuter}>
            <Image
              source={require("../../assets/icons/UserIcon.png")}
              style={styles.avatar}
            />
          </View>

          <Text style={styles.profileName}>
            Tổ Phản Ứng Nhanh - Y Tế P. Ngũ Hành Sơn
          </Text>

          <Text style={styles.username}>
            @tpnyteNHS
          </Text>
        </View>

        {/* FORM */}
        <View style={styles.formWrapper}>
          {/* FIRST NAME */}
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Tên của bạn là gì?"
              placeholderTextColor="#555"
              style={styles.input}
            />
          </View>

          {/* LAST NAME */}
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Và họ của bạn?"
              placeholderTextColor="#555"
              style={styles.input}
            />
          </View>

          {/* PHONE */}
          <View style={styles.inputWrapper}>
            <View style={styles.phoneRow}>
              <Image
                source={require("../../assets/icons/VietnamFlag.png")}
                style={styles.flagIcon}
              />

              <View style={styles.phoneDivider} />

              <TextInput
                placeholder="Số điện thoại"
                placeholderTextColor="#555"
                style={styles.phoneInput}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* GENDER */}
          <TouchableOpacity style={styles.inputWrapper}>
            <View style={styles.selectRow}>
              <Text style={styles.selectText}>
                Chọn giới tính của bạn
              </Text>

              <Image
                source={require("../../assets/icons/Arrow-Down.png")}
                style={styles.arrowDown}
              />
            </View>
          </TouchableOpacity>

          {/* DATE */}
          <TouchableOpacity style={styles.inputWrapper}>
            <View style={styles.selectRow}>
              <Text style={styles.selectText}>
                Ngày sinh của bạn là gì?
              </Text>

              <Image
                source={require("../../assets/icons/Calendar.png")}
                style={styles.calendarIcon}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* BUTTON */}
        <TouchableOpacity style={styles.updateButton}>
          <Text style={styles.updateText}>
            Cập nhật hồ sơ
          </Text>
        </TouchableOpacity>
      </View>

{showAlert && (
  <View style={styles.alertWrapper}>
    <View style={styles.alertCard}>
      {/* TOP */}
      <View style={styles.alertHeader}>
        <View style={styles.alertLeft}>
          <Text style={styles.alertMini}>
            TRUNG TÂM CỨU HỘ
          </Text>
        </View>
        <Text style={styles.alertTime}>
          Bây giờ
        </Text>
      </View>
      {/* TITLE */}
      <Text style={styles.alertTitle}>
        LỆNH ĐIỀU ĐỘNG KHẨN CẤP
      </Text>
      {/* DESC */}
      <Text style={styles.alertDesc}>
  {"Có nạn nhân đang chờ hỗ trợ khẩn cấp tại khu vực "}
  <Text style={styles.alertLocation}>
    Ngũ Hành Sơn.
  </Text>
</Text>
      {/* BUTTONS */}
      <View style={styles.alertButtons}>
        <TouchableOpacity
          style={styles.ignoreButton}
          onPress={() =>
            setShowAlert(false)
          }
        >
          <Text style={styles.ignoreText}>
            Bỏ qua
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => router.push("/TrangChu")}
        >
          <Text style={styles.viewText}>
            Xem lệnh ngay
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
)}    
      <BottomNavbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },

  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 55,
    paddingBottom: 130,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 36,
  },

  backIcon: {
    width: 22,
    height: 22,

    resizeMode: "contain",

    marginRight: 75,
  },

  headerTitle: {
    color: "#181D27",

    fontSize: 15,
    fontWeight: "600",
  },

  avatarWrapper: {
    alignItems: "center",

    marginBottom: 18,
  },

  avatarOuter: {
    width: 82,
    height: 82,

    borderRadius: 50,

    backgroundColor: "rgba(6,1,180,0.12)",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 10,
  },

  avatar: {
    width: 72,
    height: 72,

    borderRadius: 50,
  },

  profileName: {
    width: 210,

    textAlign: "center",

    color: "#181D27",

    fontSize: 14,
    fontWeight: "700",

    lineHeight: 19,
  },

  username: {
    color: "#D7D7D7",

    fontSize: 13,

    marginTop: 5,
  },

  formWrapper: {
    marginTop: 8,
  },

  inputWrapper: {
    height: 54,

    backgroundColor: "#FFF",

    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,

    justifyContent: "center",

    paddingHorizontal: 16,

    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",

    marginBottom: 20,
  },

  input: {
    color: "#181D27",

    fontSize: 13,
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  flagIcon: {
    width: 18,
    height: 18,

    resizeMode: "contain",
  },

  phoneDivider: {
    width: 1,
    height: 36,

    backgroundColor: "#C7CAD3",

    opacity: 0.4,

    marginHorizontal: 16,
  },

  phoneInput: {
    flex: 1,

    color: "#181D27",

    fontSize: 13,
  },

  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectText: {
    color: "#555",

    fontSize: 13,
  },

  arrowDown: {
    width: 9,
    height: 5,

    resizeMode: "contain",
  },

  calendarIcon: {
    width: 17,
    height: 17,

    resizeMode: "contain",
  },

  updateButton: {
    height: 55,

    backgroundColor: "#FF8852",

    borderRadius: 15,

    alignItems: "center",
    justifyContent: "center",

    marginTop: 22,
    marginHorizontal: 43,
  },

  updateText: {
    color: "#FFF",

    fontSize: 14,
    fontWeight: "600",
  },
  
alertWrapper: {
  position: "absolute",

  top: 45,
  left: 0,
  right: 0,

  alignItems: "center",

  zIndex: 99,
},

alertCard: {
  width: "88%",

  backgroundColor: "#FFF",

  borderRadius: 24,

  paddingHorizontal: 18,
  paddingVertical: 16,

  borderLeftWidth: 5,
  borderLeftColor: "#FF5A2F",

  shadowColor: "#000",
  shadowOpacity: 0.12,
  shadowRadius: 14,

  elevation: 10,
},

alertHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",

  marginBottom: 10,
},

alertLeft: {
  flexDirection: "row",
  alignItems: "center",
},

alertIcon: {
  width: 12,
  height: 12,

  marginRight: 7,
},

alertMini: {
  color: "#A1A1A1",

  fontSize: 10,
  fontWeight: "700",
},

alertTime: {
  color: "#B5B5B5",

  fontSize: 11,
},

alertTitle: {
  color: "#313A51",

  fontSize: 18,
  fontWeight: "800",

  marginBottom: 8,
},

alertDesc: {
  color: "#707070",

  fontSize: 13,

  lineHeight: 20,

  marginBottom: 18,
},

alertLocation: {
  color: "#FF5A2F",
  fontWeight: "700",
},

alertButtons: {
  flexDirection: "row",
  justifyContent: "space-between",
},
ignoreButton: {
  width: "46%",
  height: 44,

  borderRadius: 14,

  backgroundColor: "#F1F1F5",

  alignItems: "center",
  justifyContent: "center",
},

ignoreText: {
  color: "#8D8D8D",

  fontSize: 14,
  fontWeight: "700",
},

viewButton: {
  width: "46%",
  height: 44,

  borderRadius: 14,

  backgroundColor: "#FF7A3D",

  alignItems: "center",
  justifyContent: "center",
},

viewText: {
  color: "#FFF",

  fontSize: 14,
  fontWeight: "700",
},
});