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
  ScrollView,
  Switch,
} from "react-native";
import {
  useRouter,
  usePathname,
} from "expo-router";
import BottomNavbar from "../components/navigation/NavigationBarMobile";

const profileMenus = [
  {
    title: "Tài khoản của tôi",
    desc: "Chỉnh sửa thông tin tài khoản của bạn",
    icon: require("../../assets/icons/Group 12334.png"),
  },
  {
    title: "Người thân liên hệ",
    desc: "Quản lý danh sách đã lưu",
    icon: require("../../assets/icons/Group 12334.png"),
  },
  {
    title: "Xác thực 2 lớp",
    desc: "Tăng cường bảo mật cho tài khoản",
    icon: require("../../assets/icons/Group 12334 (2).png"),
  },
  {
    title: "Đăng xuất",
    desc: "Đăng xuất tài khoản",
    icon: require("../../assets/icons/Group 12334 (3).png"),
  },
];

const otherMenus = [
  {
    title: "Trợ giúp & Hỗ trợ",
    icon: require("../../assets/icons/Group 12334 (4).png"),
  },
//   {
//     title: "Về ứng dụng",
//     icon: require("../../assets/icons/Profile-7.png"),
//   },
];

export default function CaiDatScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* TITLE */}
        <View style={styles.settingHeader}>
  <Image
    source={require("../../assets/icons/Frame 483259-2.png")}
    style={styles.settingIcon}
  />

  <Text style={styles.settingTitle}>
    Cài đặt
  </Text>
</View>

<Text style={styles.sectionTitle}>
  Hồ sơ
</Text>

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.profileLeft}>
            <Image
              source={require("../../assets/icons/UserIcon.png")}
              style={styles.avatar}
            />

            <View>
              <Text style={styles.profileName}>
                Tổ Phản Ứng Nhanh - Y Tế P. Ngũ Hành Sơn
              </Text>

              <Text style={styles.profileUsername}>
                @tpnyteNHS
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => router.push("/ThongTinCaNhan")}>
            <Image
              source={require("../../assets/icons/Frame 626049.png")}
              style={styles.editIcon}
            />
          </TouchableOpacity>
        </View>

        {/* PROFILE SETTINGS */}
        {/* PROFILE SETTINGS */}
<View style={styles.card}>
  {/* Tài khoản */}
  <TouchableOpacity
    style={[styles.menuItem, styles.menuBorder]}
  >
    <View style={styles.menuLeft}>
      <Image
        source={require("../../assets/icons/Group 12334.png")}
        style={styles.menuIcon}
      />

      <View>
        <Text style={styles.menuTitle}>
          Tài khoản của tôi
        </Text>

        <Text style={styles.menuDesc}>
          Chỉnh sửa thông tin tài khoản của bạn
        </Text>
      </View>
    </View>

    <Image
      source={require("../../assets/icons/Month Chevron.png")}
      style={styles.arrowIcon}
    />
  </TouchableOpacity>

  {/* Người thân */}
  <TouchableOpacity
    style={[styles.menuItem, styles.menuBorder]}
  >
    <View style={styles.menuLeft}>
      <Image
        source={require("../../assets/icons/Group 12334.png")}
        style={styles.menuIcon}
      />

      <View>
        <Text style={styles.menuTitle}>
          Người thân liên hệ
        </Text>

        <Text style={styles.menuDesc}>
          Quản lý danh sách đã lưu
        </Text>
      </View>
    </View>

    <Image
      source={require("../../assets/icons/Month Chevron.png")}
      style={styles.arrowIcon}
    />
  </TouchableOpacity>

  {/* FACE ID */}
  <View style={[styles.menuItem, styles.menuBorder]}>
    <View style={styles.menuLeft}>
      <Image
        source={require("../../assets/icons/Group 12334 (1).png")}
        style={styles.menuIcon}
      />

      <View>
        <Text style={styles.menuTitle}>
          Xác thực khuôn mặt / Vân tay
        </Text>

        <Text style={styles.menuDesc}>
          Quản lý bảo mật thiết bị của bạn
        </Text>
      </View>
    </View>

    <Switch
      value={false}
      trackColor={{
        false: "#E8E8E8",
        true: "#FF8852",
      }}
      thumbColor="#ABABAB"
    />
  </View>

  {/* Xác thực 2 lớp */}
  <TouchableOpacity
    style={[styles.menuItem, styles.menuBorder]}
  >
    <View style={styles.menuLeft}>
      <Image
        source={require("../../assets/icons/Group 12334 (2).png")}
        style={styles.menuIcon}
      />

      <View>
        <Text style={styles.menuTitle}>
          Xác thực 2 lớp
        </Text>

        <Text style={styles.menuDesc}>
          Tăng cường bảo mật cho tài khoản
        </Text>
      </View>
    </View>

    <Image
      source={require("../../assets/icons/Month Chevron.png")}
      style={styles.arrowIcon}
    />
  </TouchableOpacity>

  {/* Đăng xuất */}
  <TouchableOpacity style={styles.menuItem}>
    <View style={styles.menuLeft}>
      <Image
        source={require("../../assets/icons/Group 12334 (3).png")}
        style={styles.menuIcon}
      />

      <View>
        <Text style={styles.menuTitle}>
          Đăng xuất
        </Text>

        <Text style={styles.menuDesc}>
          Đăng xuất tài khoản
        </Text>
      </View>
    </View>

    <Image
      source={require("../../assets/icons/Month Chevron.png")}
      style={styles.arrowIcon}
    />
  </TouchableOpacity>
</View>

        {/* OTHER */}
        <Text style={[styles.sectionTitle, { marginTop: 22 }]}>
          Khác
        </Text>

        <View style={styles.card}>
          {otherMenus.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index !== otherMenus.length - 1 &&
                  styles.menuBorder,
              ]}
            >
              <View style={styles.menuLeft}>
                <Image
                  source={item.icon}
                  style={styles.menuIcon}
                />

                <Text style={styles.menuTitle}>
                  {item.title}
                </Text>
              </View>

              <Image
                source={require("../../assets/icons/Month Chevron.png")}
                style={styles.arrowIcon}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 130,
  },

  sectionTitle: {
    color: "#181D27",
    fontSize: 15,
    fontWeight: "600",

    marginBottom: 14,
  },

  profileCard: {
    backgroundColor: "#FF8852",

    borderRadius: 14,

    padding: 16,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 18,
  },

  profileLeft: {
    flexDirection: "row",
    alignItems: "center",

    flex: 1,
  },

  avatar: {
    width: 57,
    height: 57,

    borderRadius: 50,

    marginRight: 12,
  },

  profileName: {
    color: "#FFF",

    fontSize: 14,
    fontWeight: "700",

    width: 190,
  },

  profileUsername: {
    color: "#F4D7CB",

    fontSize: 11,

    marginTop: 5,
  },

  editIcon: {
    width: 20,
    height: 20,

    tintColor: "#FFF",
  },

  card: {
    backgroundColor: "#FFF",

    borderRadius: 14,

    paddingHorizontal: 16,
  },

  menuItem: {
    minHeight: 72,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingVertical: 14,
  },

  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",

    flex: 1,
  },

  menuIcon: {
    width: 40,
    height: 40,

    marginRight: 14,

    resizeMode: "contain",
  },

  menuTitle: {
    color: "#181D27",

    fontSize: 14,
    fontWeight: "600",
  },

  menuDesc: {
    color: "#ABABAB",

    fontSize: 11,

    marginTop: 4,
  },

  arrowIcon: {
    width: 7,
    height: 12,

    resizeMode: "contain",
  },
  settingHeader: {
  flexDirection: "row",
  alignItems: "center",

  marginBottom: 20,
},

settingIcon: {
  width: 55,
  height: 55,

  marginRight: 10,

  resizeMode: "contain",
},

settingTitle: {
  color: "#181D27",

  fontSize: 24,
  fontWeight: "700",
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

});