import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  useRouter,
  usePathname,
} from "expo-router";
import {
  useMission,
} from "../context/MissionContext";
const { width, height } = Dimensions.get("window");

export default function BanDoDenNoi2Screen() {
  const {
  setMissionStatus,
} = useMission();
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* MAP */}
      <View style={styles.mapContainer}>
        <Image
          source={require("../../assets/images/Map-DenNoi-2.png")}
          style={styles.map}
          resizeMode="cover"
        />

        {/* LOCATION MARKER */}
        <View style={styles.locationWrapper}>
          

          <Image
            source={require("../../assets/icons/Frame 626042.png")}
            style={styles.locationPin}
          />
        </View>

        {/* LABEL */}
        

        {/* RIGHT ACTIONS */}
        <View style={styles.actionsWrapper}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Image
                      source={require("../../assets/icons/control-btn.png")}
                      style={styles.actionIcon}
                    />
                  </TouchableOpacity>
        
                  <TouchableOpacity style={styles.actionButton}>
                    <Image
                      source={require("../../assets/icons/Search-Map.png")}
                      style={styles.actionIcon}
                    />
                  </TouchableOpacity>
        
                  <TouchableOpacity style={styles.actionButton}>
                    <Image
                      source={require("../../assets/icons/Speaker.png")}
                      style={styles.actionIcon}
                    />
                  </TouchableOpacity>
                </View>
        
      </View>

      {/* BOTTOM SHEET */}
      <View style={styles.bottomSheet}>
        <View style={styles.dragBar} />

        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>
              Bạn đã đến nơi
            </Text>

            <Text style={styles.address}>
              89 Trần Phú, Hải Châu 1, Hải Châu, Đà Nẵng
            </Text>

            <Text style={styles.subText}>
              Đã xem gần đây
            </Text>
          </View>

          <TouchableOpacity onPress={() => router.push("/BanDoDuongDi2")}>
            <Image
              source={require("../../assets/icons/close-btn.png")}
              style={styles.closeIcon}
            />
          </TouchableOpacity>
        </View>

        {/* PLACE CARD */}
        <View style={styles.placeCard}>
          <Text style={styles.placeTitle}>
            Nguyễn Vũ Huy
          </Text>

          <Text style={styles.placeType}>
            Nạn nhân
          </Text>
        </View>

        {/* ACTIONS */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
  style={styles.confirmBtn}
  onPress={() => {

    setMissionStatus(
      "accepted"
    );

    router.push(
      "/TrangChu?instant=true"
    );

  }}
>
            <Image
              source={require("../../assets/icons/icon-confirm.png")}
              style={styles.bottomBtnIcon}
            />

            <Text style={styles.confirmText}>
              Xác nhận
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn}>
            <Image
              source={require("../../assets/icons/Walk-Icon.png")}
              style={styles.bottomBtnIcon}
            />

            <Text style={styles.secondaryText}>
              Đi bộ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn}>
            <Image
              source={require("../../assets/icons/mdi_parking.png")}
              style={styles.bottomBtnIcon}
            />

            <Text style={styles.secondaryText}>
              Lưu chỗ đỗ
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  mapContainer: {
    flex: 1,
    overflow: "hidden",
  },

  map: {
    position: "absolute",

    width: width * 1.12,
    height: height * 1.02,

    left: -22,
    top: 0,
  },

  locationWrapper: {
    position: "absolute",

    top: "61%",
    left: "52%",

    alignItems: "center",
    justifyContent: "center",
  },

  locationShadow: {
    width: 54,
    height: 54,

    position: "absolute",
  },

  locationPin: {
    width: 36,
    height: 36,
  },

  labelWrapper: {
    position: "absolute",

    top: "49%",
    left: "46%",
  },

  labelText: {
    color: "#FF2B2B",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  actionsWrapper: {
    position: "absolute",

    right: 14,
    top: "38%",
  },

  actionButton: {
    marginBottom: 12,
  },

  actionIcon: {
    width: 58,
    height: 58,
  },
bottomSheet: {
  position: "absolute",

  left: 0,
  right: 0,
  bottom: 0,

  backgroundColor: "#F7F7F7",

  borderTopLeftRadius: 32,
  borderTopRightRadius: 32,

  paddingHorizontal: 20,
  paddingTop: 14,
  paddingBottom: 30,

  shadowColor: "#000",
  shadowOpacity: 0.16,
  shadowRadius: 12,

  elevation: 20,
},

 dragBar: {
  width: 74,
  height: 5,

  borderRadius: 10,

  backgroundColor: "#D3D3D3",

  alignSelf: "center",

  marginBottom: 18,
},

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2F2F2F",

    marginBottom: 4,
  },

  address: {
    fontSize: 14,
    color: "#707070",

    marginBottom: 2,
  },

  subText: {
    fontSize: 14,
    color: "#707070",
  },

  closeIcon: {
    width: 48,
    height: 48,
  },

  placeCard: {
    backgroundColor: "#EFEFEF",

    borderRadius: 16,

    paddingHorizontal: 16,
    paddingVertical: 14,

    marginTop: 18,
  },

  placeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2F2F2F",

    marginBottom: 4,
  },

  placeType: {
    fontSize: 14,
    color: "#707070",
  },

  bottomActions: {
    flexDirection: "row",
      alignItems: "center",

    justifyContent: "space-between",

    marginTop: 18,
  },

  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFE8DC",

    borderRadius: 40,

    paddingVertical: 12,
    paddingHorizontal: 18,
  },

  confirmText: {
    color: "#FF8852",
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#EFEFEF",

    borderRadius: 40,

    paddingVertical: 12,
    paddingHorizontal: 18,
  },

  secondaryText: {
    color: "#3D3D3D",
    fontSize: 15,
    fontWeight: "600",
  },

  bottomBtnIcon: {
    width: 18,
    height: 18,

    marginRight: 8,
  },
});