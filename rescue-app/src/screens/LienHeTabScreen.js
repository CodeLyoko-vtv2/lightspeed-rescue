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

const contacts = [
  
  {
    name: "Công an Ngũ Hành Sơn",
    image: require("../../assets/icons/Frame 483312-2.png"),
  },
  {
    name: "Công an Sơn Trà",
    image: require("../../assets/icons/Frame 483312-2.png"),
  },
  {
    name: "Công an An Khê",
    image: require("../../assets/icons/Frame 483312-2.png"),
  },
  {
    name: "Công an Hòa Cường",
    image: require("../../assets/icons/Frame 483312-2.png"),
  },
  {
    name: "Công an Thành phố Đà Nẵng",
    image: require("../../assets/icons/Frame 483312-2.png"),
  },
];

export default function LienHeTabScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <TouchableOpacity style={styles.backButton}
          onPress={() => router.back()}>
            <Image
              source={require("../../assets/icons/Back.png")}
              style={styles.backIcon}
            />
          </TouchableOpacity>

          <Image
            source={require("../../assets/icons/Frame 483312-2.png")}
            style={styles.groupAvatar}
          />

          <Text style={styles.headerTitle}>
            Công an
          </Text>
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Image
            source={require("../../assets/icons/Add-Orange.png")}
            style={styles.addIcon}
          />

          <Text style={styles.addText}>
            Thêm liên hệ
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

      {/* CONTACT LIST */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {contacts.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.contactCard}
          >
            <View style={styles.leftContent}>
              <Image
                source={item.image}
                style={styles.contactImage}
              />

              <Text style={styles.contactName}>
                {item.name}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* NAVBAR */}
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
    height: 70,

    backgroundColor: "#F5F5FA",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 16,
  },

  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    marginRight: 12,
  },

  backIcon: {
    width: 18,
    height: 18,
  },

  groupAvatar: {
    width: 38,
    height: 38,

    borderRadius: 30,

    marginRight: 12,
  },

  headerTitle: {
    color: "#313A51",
    fontSize: 20,
    fontWeight: "600",
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  addIcon: {
    width: 12,
    height: 12,

    marginRight: 6,
  },

  addText: {
    color: "#FF8852",
    fontSize: 14,
    fontWeight: "500",
  },

  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",

    height: 50,

    borderRadius: 100,

    borderWidth: 1,
    borderColor: "#EFEFEF",

    marginHorizontal: 16,
    marginTop: 16,

    paddingHorizontal: 20,

    backgroundColor: "#FFF",
  },

  searchInput: {
    flex: 1,

    color: "#313A51",
    fontSize: 14,
  },

  micIcon: {
   width: 10,
height: 14,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 130,
  },

  contactCard: {
    height: 68,

    backgroundColor: "#F5F5FA",

    borderRadius: 20,

    marginBottom: 14,

    justifyContent: "center",

    paddingHorizontal: 15,
  },

  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  contactImage: {
    width: 41,
    height: 41,

    borderRadius: 40,

    marginRight: 12,
  },

  contactName: {
    color: "#313A51",
    fontSize: 16,
    fontWeight: "500",
  },
});