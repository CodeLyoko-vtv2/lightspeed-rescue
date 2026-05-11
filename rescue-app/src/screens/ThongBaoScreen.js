import React, {
  useState,
} from "react";
import {
  useRouter,
  usePathname,
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

export default function ThongBaoScreen() {
    const router = useRouter();
  const [expanded, setExpanded] =
    useState(false);

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
                  - Có nạn nhân đang
                  cần hỗ trợ y tế
                  tại...
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
  Chấn thương, chảy máu chân.
</Text>

<Text style={styles.expandText}>
  • <Text style={styles.boldText}>
      Yêu cầu:
    </Text>
  {"  "}
  Xuất kích ngay lập tức để hỗ trợ y tế.
</Text>

                  <TouchableOpacity
                  onPress={() =>
                    router.push("/BanDoDuongDi2")
                  }>
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