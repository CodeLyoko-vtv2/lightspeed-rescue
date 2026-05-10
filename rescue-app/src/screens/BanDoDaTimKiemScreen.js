import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  useRouter,
  usePathname,
} from "expo-router";
import BottomNavbarBDDTK from "../components/navigation/BottomNavbarBDDTK";
import SecondaryActions from "../components/map/SecondaryActions";
import MainActions from "../components/map/MainActions";

export default function BanDoDaTimKiemScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* FLOATING SEARCH BAR */}
      
      <View style={styles.searchBar}>
        <Text
          numberOfLines={1}
          style={styles.searchText}
        >
          Công an Thành phố Đà Nẵng,...
        </Text>

        <TouchableOpacity onPress={() => router.push("/BanDo")}>
          <Image
            source={require("../../assets/icons/Close.png")}
            style={styles.closeIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* FLOATING ACTIONS */}
     <View style={styles.secondaryWrapper}>
  <TouchableOpacity style={styles.roundButton}>
    <Image
      source={require("../../assets/icons/Round-1.png")}
      style={styles.roundIcon}
    />
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.roundButton, { marginTop: 12 }]}
  >
    <Image
      source={require("../../assets/icons/Round-5.png")}
      style={styles.roundIcon}
    />
  </TouchableOpacity>
</View>
<View style={styles.mainWrapper}>
  <TouchableOpacity style={styles.roundButton}>
    <Image
      source={require("../../assets/icons/Round-3.png")}
      style={styles.roundIcon}
    />
  </TouchableOpacity>

</View>

      {/* FULL SCREEN SCROLL */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* MAP */}
        <Image
          source={require("../../assets/images/Map-Search.png")}
          style={styles.map}
          resizeMode="cover"
        />

        {/* BOTTOM CONTENT */}
        <View style={styles.sheet}>
          {/* HANDLE */}
          <View style={styles.handle} />

          {/* TITLE */}
          <View style={styles.titleRow}>
  <Text
    numberOfLines={1} 
    style={styles.title}
  >
    Công an Thành phố Đà Nẵng
  </Text>

  <TouchableOpacity style={styles.shareWrapper}>
    <Image
      source={require("../../assets/icons/Round-6.png")}
      style={styles.shareIcon}
      resizeMode="contain"
    />
  </TouchableOpacity>
</View>

          {/* ACTION BUTTONS */}
          <BottomNavbarBDDTK />

          {/* GALLERY */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.gallery}
          >
            <Image
              source={require("../../assets/images/Searched-Image.png")}
              style={styles.bigImage}
            />

            <View style={styles.column}>
              <Image
                source={require("../../assets/images/Searched-Image-2.png")}
                style={styles.smallImage}
              />

              <Image
                source={require("../../assets/images/Searched-Image-3.png")}
                style={styles.smallImage}
              />
            </View>

            {/* <Image
              source={require("../../assets/images/Searched-Image-4.png")}
              style={styles.bigImage}
            /> */}
          </ScrollView>

          {/* TABS */}
          <View style={styles.tabs}>
  <TouchableOpacity style={styles.activeTabWrapper}>
    <Text style={styles.activeTab}>
      Tổng quan
    </Text>

    <View style={styles.activeUnderline} />
  </TouchableOpacity>

  <TouchableOpacity>
    <Text style={styles.tab}>
      Ảnh
    </Text>
  </TouchableOpacity>

  <TouchableOpacity>
    <Text style={styles.tab}>
      Tin mới
    </Text>
  </TouchableOpacity>

  <TouchableOpacity>
    <Text style={styles.tab}>
      Giới thiệu
    </Text>
  </TouchableOpacity>

  <TouchableOpacity>
    <Text style={styles.tab}>
      Đánh giá
    </Text>
  </TouchableOpacity>
</View>

          {/* INFO */}
          <View style={styles.infoItem}>
  <Image
    source={require("../../assets/icons/Searched-Icon-5.png")}
    style={styles.infoIcon}
  />

  <View style={styles.infoContent}>
    <Text style={styles.infoText}>
      80 Lê Lợi, Hải Châu, Đà Nẵng 550000
    </Text>
  </View>
</View>

          <View style={styles.infoItem}>
  <Image
    source={require("../../assets/icons/Searched-Icon-6.png")}
    style={styles.infoIcon}
  />

  <View style={styles.infoContent}>
    <Text style={styles.warningText}>
      Sắp đóng cửa
    </Text>

    <Text style={styles.infoSubText}>
      Đóng cửa vào 17:00
    </Text>

    <Text style={styles.infoSubText}>
      Mở lại vào lúc 7:30 T4
    </Text>
  </View>
</View>

         <View style={styles.infoItem}>
  <Image
    source={require("../../assets/icons/Searched-Icon-7.png")}
    style={styles.infoIcon}
  />

  <View style={styles.infoContent}>
    <Text style={styles.infoText}>
      Đề xuất chỉnh sửa
    </Text>
  </View>
</View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  content: {
    paddingBottom: 40,
  },

  /* MAP */
 map: {
  width: "100%",
  height: 760,
},
  /* SEARCH BAR */
  searchBar: {
    position: "absolute",

    top: 58,
    left: 12,
    right: 12,

    zIndex: 1000,
elevation: 1000,

    height: 56,

    backgroundColor: "#FFF",

    borderRadius: 40,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingLeft: 22,
    paddingRight: 16,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },

  searchText: {
    flex: 1,

    fontSize: 18,
    color: "#040404",

    marginRight: 12,
  },

  closeIcon: {
    width: 24,
    height: 24,
  },

  /* SHEET */
  sheet: {
    marginTop: -26,

    backgroundColor: "#FFF",

    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,

    paddingHorizontal: 16,
    paddingTop: 10,

    minHeight: 500,
  },

  handle: {
    width: 72,
    height: 4,

    borderRadius: 10,

    backgroundColor: "#C5C6CD",

    alignSelf: "center",

    marginBottom: 14,
  },

  /* GALLERY */
  gallery: {
    marginTop: 18,
  marginBottom: 18,
  },

 bigImage: {
  width: 205,
  height: 230,

  borderRadius: 22,

  marginRight: 12,
},

  column: {
  justifyContent: "space-between",

  height: 230,

  marginRight: 12,
},

  smallImage: {
  width: 120,
  height: 108,

  borderRadius: 18,
},

  /* TABS */
  tabs: {
  flexDirection: "row",
  alignItems: "center",

  marginBottom: 8,

  borderBottomWidth: 1,
  borderBottomColor: "#EEEEEE",
},
  floatingContainer: {
  position: "absolute",

  top: 0,
  left: 0,
  right: 0,
  bottom: 0,

  zIndex: 999,
  elevation: 999,

  pointerEvents: "box-none",
},

  activeTab: {
  color: "#FF8852",
  fontSize: 14,
  fontWeight: "700",

  marginBottom: 10,
},
 tab: {
  color: "#6F6F6F",
  fontSize: 14,

  marginRight: 24,
  marginBottom: 13,
},

  /* INFO */
 infoItem: {
  flexDirection: "row",
  alignItems: "center",

  paddingVertical: 18,

  borderBottomWidth: 1,
  borderBottomColor: "#F1F1F1",
},

  infoText: {
    fontSize: 15,
    color: "#404040",
  },
  secondaryWrapper: {
  position: "absolute",

  top: 120,
  right: 16,

  zIndex: 999,
},

mainWrapper: {
  position: "absolute",

  bottom: 220,
  right: 16,

  zIndex: 999,
},

roundButton: {
  width: 58,
  height: 58,

  justifyContent: "center",
  alignItems: "center",
},

roundIcon: {
  width: 58,
  height: 58,
},
titleRow: {
  flexDirection: "row",

  alignItems: "center",
  justifyContent: "space-between",

  width: "100%",

  marginBottom: 14,
},

title: {
  flex: 1,

  fontSize: 18,
  fontWeight: "700",

  color: "#000",

  marginRight: 12,
},
shareWrapper: {
  justifyContent: "center",
  alignItems: "center",
},

shareButton: {
  width: 34,
  height: 34,

  borderRadius: 17,

  backgroundColor: "#F5F5F5",

  justifyContent: "center",
  alignItems: "center",

  marginLeft: 12,
},
shareIcon: {
  width: 36,
  height: 36,
},
activeUnderline: {
  width: "100%",
  height: 3,

  backgroundColor: "#FF8852",

  borderRadius: 10,
},

activeTabWrapper: {
  marginRight: 24,
  alignItems: "center",
},
infoIcon: {
  width: 30,
  height: 30,

  marginRight: 14,
},

infoContent: {
  flex: 1,
},

warningText: {
  fontSize: 15,

  color: "#FF8852",

  fontWeight: "600",
},

infoSubText: {
  fontSize: 13,
  color: "#666",

  marginTop: 1,
},
});