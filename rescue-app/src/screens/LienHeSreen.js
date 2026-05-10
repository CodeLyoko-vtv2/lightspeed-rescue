import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  SafeAreaView,
} from "react-native";
import {
  useRouter,
  usePathname,
} from "expo-router";

import BottomNavbar from "../components/navigation/NavigationBarMobile";
const groups = [
  {
    title: "Chung",
    count: "2 liên hệ",
    icon: require("../../assets/icons/Frame 483312.png"),
  },
  {
    title: "Công an",
    count: "5 liên hệ",
    icon: require("../../assets/icons/Frame 483312-2.png"),
  },
  {
    title: "Bác sĩ",
    count: "6 liên hệ",
    icon: require("../../assets/icons/Frame 483312-3.png"),
  },
  {
    title: "Cứu hỏa",
    count: "2 liên hệ",
    icon: require("../../assets/icons/Frame 483312-4.png"),
  },
];

export default function LienHeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Nhóm liên hệ khẩn cấp
        </Text>

        <TouchableOpacity style={styles.addGroupBtn}>
          <Image
            source={require("../../assets/icons/Add-Orange.png")}
            style={styles.addIcon}
          />

          <Text style={styles.addText}>
            Thêm nhóm
          </Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View style={styles.searchWrapper}>
        <TextInput
          placeholder="Tìm kiếm"
          placeholderTextColor="#8B8B8B"
          style={styles.searchInput}
        />

        <TouchableOpacity>
          <Image
            source={require("../../assets/icons/Mic-Orange.png")}
            style={styles.micIcon}
          />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {groups.map((item, index) => (
          <TouchableOpacity
  key={index}
  style={styles.groupCard}
  onPress={() => {

    if (
      item.title === "Công an"
    ) {
      router.push(
        "/LienHeTab"
      );
    }

  }}
>
            <View style={styles.leftContent}>
              <Image
                source={item.icon}
                style={styles.groupIcon}
              />

              <Text style={styles.groupTitle}>
                {item.title}
              </Text>
            </View>

            <Text style={styles.groupCount}>
              {item.count}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* NAVIGATION */}
      <BottomNavbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  header: {
    backgroundColor: "#F5F5FA",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 18,
    paddingVertical: 16,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#313A51",
  },

  addGroupBtn: {
    flexDirection: "row",
    alignItems: "center",
  },

  addIcon: {
    width: 14,
    height: 14,

    marginRight: 6,
  },

  addText: {
    color: "#FF8852",
    fontSize: 14,
    fontWeight: "600",
  },

  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",

    marginHorizontal: 16,
    marginTop: 18,

    backgroundColor: "#FFF",

    borderRadius: 100,

    borderWidth: 1,
    borderColor: "#EFEFEF",

    paddingHorizontal: 20,
    height: 54,
  },

  searchInput: {
    flex: 1,

    color: "#313A51",
    fontSize: 15,
  },

  micIcon: {
    width: 10,
height: 14,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 130,
  },

  groupCard: {
    height: 72,

    backgroundColor: "#F5F5FA",

    borderRadius: 20,

    paddingHorizontal: 16,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 14,
  },

  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  groupIcon: {
    width: 42,
    height: 42,

    marginRight: 14,
  },

  groupTitle: {
    color: "#313A51",
    fontSize: 16,
    fontWeight: "600",
  },

  groupCount: {
    color: "#8B8B8B",
    fontSize: 12,
    fontWeight: "500",
  },
});