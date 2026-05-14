import React, {
  useRef,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Animated,
  PanResponder,
} from "react-native";

import { useRouter }
from "expo-router";
export default function ChuongBaoScreen() {
const router = useRouter();
  const slideAnim = useRef(
    new Animated.Value(0)
  ).current;

  const MAX_SLIDE = 228;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (_, gesture) => {
        if (
          gesture.dx > 0 &&
          gesture.dx <= MAX_SLIDE
        ) {
          slideAnim.setValue(
            gesture.dx
          );
        }
      },

      onPanResponderRelease: (
        _,
        gesture
      ) => {
        if (
          gesture.dx > MAX_SLIDE - 35
        ) {
          Animated.timing(
            slideAnim,
            {
              toValue: MAX_SLIDE,
              duration: 120,
              useNativeDriver: false,
            }
          ).start(() => {
            router.push("/ThongBao");
          });
        } else {
          Animated.spring(
            slideAnim,
            {
              toValue: 0,
              useNativeDriver: false,
            }
          ).start();
        }
      },
    })
  ).current;

  return (
    <SafeAreaView style={styles.container}>
      {/* BACKGROUND */}
{/* BACKGROUND LAYERS */}
<Image
  source={require("../../assets/images/al.png")}
  style={styles.backgroundImage}
  resizeMode="cover"
/>
      {/* TIME */}
      <Text style={styles.time}>
        08:15
      </Text>

      <Text style={styles.date}>
        CN, 10 tháng 5
      </Text>

      {/* CENTER */}
      <View style={styles.centerContent}>
        {/* BELL */}
        <View style={styles.bellOuter}>
          <View style={styles.bellMiddle}>
            <View style={styles.bellInner}>
              <Text style={styles.bellIcon}>
                🔔
              </Text>
            </View>
          </View>
        </View>

        {/* TITLE */}
        <Text style={styles.title}>
          LỆNH ĐIỀU ĐỘNG
        </Text>

        {/* SUB */}
        <Text style={styles.subtitle}>
          Trung tâm cứu hộ đang gọi.
          Có nạn nhân cần{"\n"}
          hỗ trợ khẩn cấp!
        </Text>
      </View>

      {/* SLIDER */}
      <View style={styles.sliderWrapper}>
        <Text style={styles.sliderText}>
          TRƯỢT ĐỂ NHẬN LỆNH
        </Text>

        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.sliderButton,
            {
              transform: [
                {
                  translateX:
                    slideAnim,
                },
              ],
            },
          ]}
        >
          <Text
            style={styles.arrow}
          >
            »
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#000",

    alignItems: "center",
    justifyContent: "center",
  },background: {
  position: "absolute",

  width: "100%",
  height: "100%",

  backgroundColor: "#000",

  alignItems: "center",
  justifyContent: "center",
},

redGlow1: {
  position: "absolute",

  width: 520,
  height: 520,

  borderRadius: 999,

  backgroundColor: "#FF2A00",

  opacity: 0.22,

  transform: [{ scaleY: 1.15 }],
},

redGlow2: {
  position: "absolute",

  width: 420,
  height: 420,

  borderRadius: 999,

  backgroundColor: "#FF3D00",

  opacity: 0.28,

  transform: [{ scaleY: 1.12 }],
},

redGlow3: {
  position: "absolute",

  width: 320,
  height: 320,

  borderRadius: 999,

  backgroundColor: "#FF4800",

  opacity: 0.34,
},

redGlow4: {
  position: "absolute",

  width: 220,
  height: 220,

  borderRadius: 999,

  backgroundColor: "#FF5A1F",

  opacity: 0.42,
},

  redGlow: {
    position: "absolute",

    width: "150%",
    height: "90%",

    backgroundColor: "#FF4D1F",

    opacity: 0.38,

    borderRadius: 999,

    transform: [
      { scaleX: 1.2 },
      { scaleY: 0.9 },
    ],
  },

  time: {
    position: "absolute",
    top: 110,

    color: "#FFF",

    fontSize: 62,
    fontWeight: "200",
  },

  date: {
    position: "absolute",
    top: 190,

    color: "#FFF",

    fontSize: 24,
    fontWeight: "400",
  },

  centerContent: {
    alignItems: "center",
  },

  bellOuter: {
    width: 140,
    height: 140,

    borderRadius: 999,

    backgroundColor:
      "rgba(255,120,50,0.12)",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 36,
  },

  bellMiddle: {
    width: 106,
    height: 106,

    borderRadius: 999,

    backgroundColor:
      "rgba(255,120,50,0.18)",

    alignItems: "center",
    justifyContent: "center",
  },

  bellInner: {
    width: 72,
    height: 72,

    borderRadius: 999,

    backgroundColor: "#FF7426",

    alignItems: "center",
    justifyContent: "center",
  },

  bellIcon: {
    fontSize: 28,
  },

  title: {
    color: "#FFF",

    fontSize: 42,
    fontWeight: "800",

    marginBottom: 14,
  },

  subtitle: {
    color:
      "rgba(255,255,255,0.72)",

    fontSize: 18,

    textAlign: "center",

    lineHeight: 28,
  },

  sliderWrapper: {
    position: "absolute",
    bottom: 90,

    width: 320,
    height: 72,

    borderRadius: 999,

    backgroundColor:
      "rgba(255,255,255,0.06)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.08)",

    justifyContent: "center",

    overflow: "hidden",
  },

sliderText: {
  alignSelf: "center",

  color: "#FF7426",

  fontSize: 16,
  fontWeight: "700",

  letterSpacing: 1.2,

  paddingLeft: 38,
},

  sliderButton: {
    position: "absolute",

    left: 6,

    width: 60,
    height: 60,

    borderRadius: 999,

    backgroundColor: "#FF6B3D",

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#FF6B3D",
    shadowOpacity: 0.45,
    shadowRadius: 12,

    elevation: 8,
  },

  arrow: {
    color: "#FFF",

    fontSize: 26,
    fontWeight: "800",
  },
  backgroundImage: {
  position: "absolute",

  width: "100%",
  height: "100%",
},
});