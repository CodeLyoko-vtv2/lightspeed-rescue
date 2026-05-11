import React, {
  useEffect,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  Dimensions
} from "react-native";
import {
  useRouter,
  usePathname,
} from "expo-router";
const { width, height } = Dimensions.get("window"); 
export default function BanDoBatDauScreen() {
  const router = useRouter();
  useEffect(() => {

  const timer =
    setTimeout(() => {

      router.push(
        "/BanDoDenNoi"
      );

    }, 2000);

  return () =>
    clearTimeout(timer);

}, []);
  return (
    <View style={styles.container}>
      {/* MAP */}
      <View style={styles.mapContainer}>
        <ImageBackground
  source={require("../../assets/images/MapStart.png")}
  style={styles.map}
  resizeMode="cover"
></ImageBackground>

        {/* Route */}
        {/* <Image
          source={require("../../assets/images/RouteStart.png")}
          style={styles.route}
          resizeMode="contain"
        /> */}

        {/* TOP NAV */}
        <View style={styles.topNavigation}>
          <View style={styles.navLeft}>
            <Image
              source={require("../../assets/icons/North-Arrow.png")}
              style={styles.arrowIcon}
            />

            <Text style={styles.navText}>
              Đi về hướng Bắc
            </Text>
          </View>

          <TouchableOpacity>
            <Image
              source={require("../../assets/icons/mic-btn.png")}
              style={styles.micIcon}
            />
          </TouchableOpacity>
        </View>

        {/* SMALL TURN CARD */}
        <View style={styles.turnCard}>
          <Text style={styles.turnText}>
            Sau đó ↰
          </Text>
        </View>


        {/* LEFT SPEED */}
        <View style={styles.speedWrapper}>
          <Text style={styles.speedNumber}>0</Text>

          <Text style={styles.speedText}>km/h</Text>
        </View>

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

      {/* BOTTOM PANEL */}
      <View style={styles.bottomPanel}>
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.roundBtn}
          onPress={() => router.push("/BanDoDuongDi")}>
            <Image
              source={require("../../assets/icons/close-btn.png")}
              style={styles.bottomIcon}
            />
          </TouchableOpacity>

          <View style={styles.centerInfo}>
            <Text style={styles.timeMain}>
              25 phút
            </Text>

            <Text style={styles.timeSub}>
              15 km • 23:12
            </Text>
          </View>

          <TouchableOpacity style={styles.roundBtn}>
            <Image
              source={require("../../assets/icons/route-btn.png")}
              style={styles.bottomIcon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.dragBar} />
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

  position: "relative",
},
map: {
  position: "absolute",

  width: width * 1.12,
  height: height * 1.02,

  left: -26,
  top: 0,
},
  route: {
    position: "absolute",

    left: 40,
    top: 110,

    width: 180,
    height: 520,
  },

 topNavigation: {
  position: "absolute",

  top: 70,
  left: 14,
  right: 14,

  backgroundColor: "#00695C",

  borderRadius: 18,

  paddingHorizontal: 18,
  paddingVertical: 14,

  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",

  elevation: 20,
  zIndex: 20,
},

  navLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  arrowIcon: {
    width: 28,
    height: 28,

    marginRight: 12,
  },

  navText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },

  micIcon: {
    width: 40,
    height: 40,
  },
turnCard: {
  position: "absolute",

  top: 132,
  left: 28,

  backgroundColor: "#003D35",

  paddingHorizontal: 16,
  paddingVertical: 11,

  borderRadius: 12,

    elevation: 5,
  zIndex: 5,
},
  turnText: {
  color: "#FFF",

  fontSize: 17,
  fontWeight: "700",
},

  speedWrapper: {
    position: "absolute",

    left: 20,
    bottom: 130,

    width: 50,
    height: 50,

    borderRadius: 50,

    backgroundColor: "#FFF",

    justifyContent: "center",
    alignItems: "center",

    elevation: 4,
  },

  speedNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#5B5B5B",
  },

  speedText: {
    fontSize: 10,
    color: "#8B8B8B",
  },

  actionsWrapper: {
    position: "absolute",

    right: 16,
    bottom: 120,
  },

  actionButton: {
  marginBottom: 12,
},

actionIcon: {
  width: 58,
  height: 58,
},

  bottomPanel: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: "#FFF",

    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,

    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,

    elevation: 10,
  },

 bottomRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",

  paddingHorizontal: 4,
},
roundBtn: {},

  bottomIcon: {
    width: 58,
    height: 58,
  },

  centerInfo: {
    alignItems: "center",
  },

  timeMain: {
    fontSize: 22,
    fontWeight: "700",
    color: "#188038",
  },

  timeSub: {
    marginTop: 2,

    fontSize: 14,
    color: "#7E7E7E",
  },

  dragBar: {
    width: 110,
    height: 5,

    borderRadius: 20,

    backgroundColor: "#D0D0D0",

    alignSelf: "center",

    marginTop: 12,
  },
});