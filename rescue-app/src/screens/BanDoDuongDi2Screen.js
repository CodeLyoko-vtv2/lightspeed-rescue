import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import {
  useRouter,
  usePathname,
} from "expo-router";

export default function BanDoDuongDiScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* MAP */}
      <View style={styles.mapContainer}>
        <Image
          source={require("../../assets/images/Map Directions.png")}
          style={styles.map}
          resizeMode="cover"
        />

       

        {/* Top right buttons */}
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
      </View>

      {/* TOP SEARCH */}
      <View style={styles.topPanel}>
        <TouchableOpacity style={styles.backButton}>
  <Image
    source={require("../../assets/icons/Back.png")}
    style={styles.backIcon}
    resizeMode="contain"
  />
</TouchableOpacity>
        {/* Row 1 */}
        <View style={styles.inputRow}>
          <View style={styles.orangeDot} />

          <View style={styles.inputBox}>
            <Text style={styles.inputText}>Vị trí của bạn</Text>
          </View>

          <TouchableOpacity>
            <Text style={styles.more}>⋯</Text>
          </TouchableOpacity>
        </View>

        {/* dashed line */}
        <View style={styles.dashedLine} />

        {/* Row 2 */}
        <View style={styles.inputRow}>
          <Image
            source={require("../../assets/icons/Searched-Icon-5.png")}
            style={styles.smallMarker}
          />

          <View style={styles.inputBox}>
            <Text style={styles.inputText}>
              Nguyễn Vũ Huy
            </Text>
          </View>

          <TouchableOpacity>
            <Text style={styles.swap}>⇅</Text>
          </TouchableOpacity>
        </View>

        {/* Transport */}
        <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.transportRow}
>
  <TouchableOpacity style={styles.activeTransport}>
    <Image
      source={require("../../assets/icons/Directions-Icon-1.png")}
      style={styles.transportIcon}
    />

    <Text style={styles.activeTransportText}>
      30 phút
    </Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.transport}>
    <Image
      source={require("../../assets/icons/Directions-Icon-2.png")}
      style={styles.transportIcon}
    />

    <Text style={styles.transportText}>
      28 phút
    </Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.transport}>
    <Image
      source={require("../../assets/icons/Directions-Icon-3.png")}
      style={styles.transportIcon}
    />

    <Text style={styles.transportText}>
      3 giờ
    </Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.transport}>
    <Image
      source={require("../../assets/icons/Directions-Icon-4.png")}
      style={styles.transportIcon}
    />

    <Text style={styles.transportText}>
      1 giờ
    </Text>
  </TouchableOpacity>
</ScrollView>
      </View>

      {/* BOTTOM SHEET */}
      <View style={styles.bottomSheet}>
        <View style={styles.dragBar} />

<View style={styles.timeRow}>
  <Text style={styles.timeText}>
    <Text style={styles.timeMain}>30 phút</Text>

    <Text style={styles.timeSub}> (15 km)</Text>
  </Text>

  <TouchableOpacity style={styles.shareWrapper}>
    <Image
      source={require("../../assets/icons/Round-6.png")}
      style={styles.shareIcon}
      resizeMode="contain"
    />
  </TouchableOpacity>
</View>
        <Text style={styles.descText}>
          Tuyến đường nhanh nhất, giao thông bình thường
        </Text>

        <View style={styles.bottomButtons}>
  <TouchableOpacity style={styles.startButton}
  onPress={() =>
    router.push("/BanDoBatDau2")
  }>
    <Image
      source={require("../../assets/icons/Directions-Icon-5.png")}
      style={styles.bottomButtonIcon}
      resizeMode="contain"
    />

    <Text style={styles.startButtonText}>
      Bắt đầu
    </Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.stepsButton}>
    <Image
      source={require("../../assets/icons/Directions-Icon-6.png")}
      style={styles.bottomButtonIcon}
      resizeMode="contain"
    />

    <Text style={styles.stepsButtonText}>
      Các bước
    </Text>
  </TouchableOpacity>
</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  mapContainer: {
    flex: 1,
  },

  map: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  routeLine: {
    width: 320,
    height: 220,
    position: "absolute",
    top: 180,
    left: 20,
  },

  marker: {
    width: 26,
    height: 35,
    position: "absolute",
    top: 260,
    left: 290,
  },

 topPanel: {
  position: "absolute",

  top: 40,
  left: 0,
  right: 0,

  backgroundColor: "#FFF",

  paddingHorizontal: 14,
  paddingTop: 12,
  paddingBottom: 10,

  zIndex: 1000,
},

inputRow: {
  flexDirection: "row",
  alignItems: "center",

  marginBottom: 2,

  paddingLeft: 30,
},
orangeDot: {
  width: 12,
  height: 12,

  borderRadius: 20,

  backgroundColor: "#FF8852",

  marginRight: 14,
},

  inputBox: {
  flex: 1,

  borderWidth: 1,
  borderColor: "#D3D3D3",

  borderRadius: 10,

  paddingVertical: 8,
  paddingHorizontal: 12,

  backgroundColor: "#FFF",
},

 inputText: {
  fontSize: 14,
  color: "#404040",
},

  more: {
    fontSize: 26,
    marginLeft: 10,
  },

  dashedLine: {
  width: 2,
  height: 24,

  borderStyle: "dashed",
  borderWidth: 1,
  borderColor: "#9B9B9B",

  marginLeft: 40,
  marginTop: -2,
  marginBottom: -2,
},

smallMarker: {
  width: 28,
  height: 28,

},
  swap: {
    fontSize: 22,
    marginLeft: 10,
  },

  transportRow: {
    paddingTop: 8,
  },

 activeTransport: {
  flexDirection: "row",
  alignItems: "center",

  backgroundColor: "#E9F4FF",

  borderWidth: 1,
  borderColor: "#86BAFF",

  paddingHorizontal: 14,
  paddingVertical: 8,

  borderRadius: 30,

  marginRight: 8,
},

  activeTransportText: {
    color: "#FF8852",
    fontWeight: "600",
  },

  transport: {
  flexDirection: "row",
  alignItems: "center",

  paddingHorizontal: 14,
  paddingVertical: 8,

  marginRight: 8,
},

  transportText: {
    color: "#000",
  },

  rightActions: {
    position: "absolute",
    top: 210,
    right: 16,
  },

  bottomActions: {
    position: "absolute",
    bottom: 210,
    right: 16,
  },

  roundButton: {
    width: 52,
    height: 52,

    borderRadius: 50,
    backgroundColor: "#FFF",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 14,

    elevation: 4,
  },

  bigRoundButton: {
    width: 62,
    height: 62,

    borderRadius: 50,
    backgroundColor: "#FFF",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 14,

    elevation: 4,
  },

  roundIcon: {
    width: 24,
    height: 24,
  },

  bigRoundIcon: {
    width: 28,
    height: 28,
  },

  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    backgroundColor: "#FFF",

    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,

    elevation: 8,
  },

  dragBar: {
    width: 70,
    height: 5,

    borderRadius: 20,

    backgroundColor: "#C5C6CD",

    alignSelf: "center",

    marginBottom: 14,
  },

timeText: {
  flex: 1,
},
  descText: {
    fontSize: 14,
    color: "#867F7F",

    marginBottom: 18,
  },

  bottomButtons: {
    flexDirection: "row",
    alignItems: "center",
  },

  startButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",

  backgroundColor: "#FF8852",

  paddingVertical: 14,
  paddingHorizontal: 26,

  borderRadius: 40,

  marginRight: 12,
},

  startButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  stepsButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",

  backgroundColor: "#ECF3FE",

  paddingVertical: 14,
  paddingHorizontal: 26,

  borderRadius: 40,
},
bottomButtonIcon: {
  width: 18,
  height: 18,

  marginRight: 8,
},
  stepsButtonText: {
    color: "#FF8852",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryWrapper: {
  position: "absolute",

  top: 200,
  right: 16,

  zIndex: 999,
},timeMain: {
  fontSize: 22,
  color: "#5F5F5F",
  fontWeight: "700",
},

timeSub: {
  fontSize: 22,
  color: "#9E9E9E",
  fontWeight: "500",
},

mainWrapper: {
  position: "absolute",

  bottom: 180,
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
}
,backButton: {
  position: "absolute",

  left: 4,
  top: 18,

  width: 34,
  height: 34,

  zIndex: 9999,
marginRight: 10,
  justifyContent: "center",
  alignItems: "center",
},

backIcon: {
  width: 22,
  height: 22,
},
shareWrapper: {
  width: 42,
  height: 42,

  justifyContent: "center",
  alignItems: "center",

  marginLeft: 12,
},shareIcon: {
  width: 42,
  height: 42,
},
timeRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",

  marginBottom: 6,
},
});