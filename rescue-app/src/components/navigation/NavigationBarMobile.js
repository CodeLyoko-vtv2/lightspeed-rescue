import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

import {
  useRouter,
  usePathname,
} from "expo-router";
import {
  useMission,
} from "../../context/MissionContext";
export default function BottomNavbar() {
  const {
  setMissionStatus,
} = useMission();

  const router = useRouter();

  const pathname =
    usePathname();

    const currentTabMap = {
  "/TrangChu": "Trang chủ",
  "/ThongBao": "Trang chủ",
  "/ImageViewer": "Trang chủ",
  "/VideoViewer": "Trang chủ",

  "/BanDo": "Bản đồ",

  "/LienHe": "Liên hệ",

  "/CaiDat": "Cài đặt",
};

const currentTab =
  currentTabMap[pathname];

  const tabs = [
    {
      title: "Trang chủ",

      route: "/TrangChu",

      activeIcon: require("../../../assets/icons/Frame 483255-2.png"),

      inactiveIcon: require("../../../assets/icons/Frame 483255.png"),
    },

    {
      title: "Bản đồ",

      route: "/BanDo",

      activeIcon: require("../../../assets/icons/Frame 483256-2.png"),

      inactiveIcon: require("../../../assets/icons/Frame 483256.png"),
    },

    {
      title: "Liên hệ",

      route: "/LienHe",

      activeIcon: require("../../../assets/icons/Frame 483258-2.png"),

      inactiveIcon: require("../../../assets/icons/Frame 483258.png"),
    },

    {
      title: "Cài đặt",

      route: "/CaiDat",

      activeIcon: require("../../../assets/icons/Frame 483259-2.png"),

      inactiveIcon: require("../../../assets/icons/Frame 483259.png"),
    },
  ];

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {

        const isActive =
  currentTab === tab.title;

        return (
          <TouchableOpacity
            key={tab.title}
            style={styles.navItem}
            onPress={() => {

  if (
    tab.title ===
    "Trang chủ"
  ) {

    setMissionStatus(
      "dispatch"
    );

  }

  router.push(
    tab.route
  );

}}
          >
            <Image
              source={
                isActive
                  ? tab.activeIcon
                  : tab.inactiveIcon
              }
              style={styles.icon}
              resizeMode="contain"
            />

            <Text
              style={[
                styles.navText,

                isActive &&
                  styles.activeText,
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",

    bottom: 20,
    left: 17,
    right: 17,

    height: 85,

    backgroundColor: "#F5F5FA",

    borderRadius: 20,

    flexDirection: "row",

    justifyContent:
      "space-around",

    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,

    elevation: 5,
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    width: 46,
    height: 46,

    marginBottom: 3,
  },

  navText: {
    color: "#313A51",

    fontSize: 12,
    fontWeight: "500",
  },

  activeText: {
    color: "#FF8852",

    fontSize: 12,
    fontWeight: "600",
  },
});