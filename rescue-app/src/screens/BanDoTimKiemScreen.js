import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import {
  useRouter,
  usePathname,
} from "expo-router";
import SearchResultItem from "../components/map/SearchResultItem";

export default function BanDoTimKiemScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          {/* back */}
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require("../../assets/icons/Back.png")}
              style={styles.backIcon}
            />
          </TouchableOpacity>

          {/* input */}
          <TextInput
            placeholder="Tìm kiếm ở đây"
            placeholderTextColor="#707070"
            style={styles.input}
          />

          {/* mic */}
          <TouchableOpacity>
            <Image
              source={require("../../assets/icons/MicIcon.png")}
              style={styles.mic}
            />
          </TouchableOpacity>
        </View>

        {/* quick */}
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickItem}>
            <View style={styles.quickIconBox}>
              <Image
                source={require("../../assets/icons/HomeLocation.png")}
                style={styles.quickIcon}
              />
            </View>

            <View>
              <Text style={styles.quickTitle}>
                Nhà riêng
              </Text>

              <Text style={styles.quickSub}>
                Đặt vị trí
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickItem}>
            <View style={styles.quickIconBox}>
              <Image
                source={require("../../assets/icons/Work.png")}
                style={styles.quickIcon}
              />
            </View>

            <View>
              <Text style={styles.quickTitle}>
                Nơi làm...
              </Text>

              <Text style={styles.quickSub}>
                Đặt vị trí
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickItem}>
            <View style={styles.quickIconBox}>
              <Image
                source={require("../../assets/icons/More.png")}
                style={styles.quickIcon}
              />
            </View>

            <Text style={styles.quickTitle}>
              Khác
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* results */}
      <View style={styles.results}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentText}>
            Gần đây
          </Text>

          <Image
            source={require("../../assets/icons/Info.png")}
            style={styles.info}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <SearchResultItem
  title="Công an Thành phố Đà Nẵng"
  address="80 Lê Lợi, Hải Châu, Đà Nẵng"
  status="Sắp đóng cửa 17:00"
  onPress={() =>
    router.push(
      "/BanDoDaTimKiem"
    )
  }
/>

          <SearchResultItem
            title="Bệnh viện Đa khoa Ngũ Hành Sơn"
            address="Đường Lê Văn Hiến, Ngũ Hành Sơn"
            status="Mở cửa suốt ngày đêm"
          />

          <SearchResultItem
            title="Trường THPT Ngũ Hành Sơn"
            address="Bà Bang Nhãn, Ngũ Hành Sơn"
            status="Đóng cửa mở lúc 7:30"
          />

          <SearchResultItem
            title="VKU"
            address="470 Trần Đại Nghĩa"
            status="Sắp đóng cửa 17:00"
          />

          <SearchResultItem
            title="KTX Việt - Hàn"
            address="Ngũ Hành Sơn"
            status="Mở cửa suốt ngày đêm"
          />
          <SearchResultItem
    title="Trường THPT Phan Châu Trinh"
    address="Lê Lợi, Hải Châu, Đà Nẵng"
    status="Đóng cửa mở lúc 7:30 T4"
  />
  <SearchResultItem
    title="Bệnh viện C Đà Nẵng"
    address="122 Hải Phòng, Hải Châu, Đà Nẵng"
    status="Mở cửa suốt ngày đêm"
  />

   <View style={styles.moreTextWrapper}>
    <Text style={styles.moreText}>
      Nội dung tìm kiếm khác gần đây
    </Text>
  </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F3F4",
  },

  header: {
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFF",

    borderWidth: 1,
    borderColor: "#D9D9D9",

    borderRadius: 40,

    paddingHorizontal: 12,
    height: 52,

    marginTop: 8,
  },
  moreContainer: {
  paddingBottom: 16,
},moreTextWrapper: {
  width: "100%",
  alignItems: "center",
  justifyContent: "center",

  marginTop: 10,
},

moreText: {
  marginTop: 10,

  fontSize: 14,
  fontWeight: "500",

  color: "#FF8852",
},

  backIcon: {
    width: 26,
    height: 26,
  },

  input: {
    flex: 1,
    fontSize: 18,
    marginLeft: 10,
  },

  mic: {
    width: 26,
    height: 26,
  },

  quickRow: {
    flexDirection: "row",
    marginTop: 14,
    justifyContent: "space-between",
  },

  quickItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  quickIconBox: {
    width: 34,
    height: 34,
    borderRadius: 20,

    backgroundColor: "#E8F0FE",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 6,
  },

  quickIcon: {
    width: 20,
    height: 20,
  },

  quickTitle: {
    fontSize: 15,
    color: "#000",
  },

  quickSub: {
    fontSize: 12,
    color: "#867F7F",
  },

  results: {
    flex: 1,
    backgroundColor: "#FFF",
    marginTop: 6,
  },

  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  recentText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },

  info: {
    width: 20,
    height: 20,
  },
});