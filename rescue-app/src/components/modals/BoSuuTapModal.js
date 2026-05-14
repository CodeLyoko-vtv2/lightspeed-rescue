import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter }
from "expo-router";
export default function BoSuuTapModal({
  onClose,
}) {
const router = useRouter();
  const images = [
  {
    id: "fire1",
    source: require("../../../assets/images/fire-1.png"),
  },
  {
    id: "fire2",
    source: require("../../../assets/images/fire-2.png"),
  },

  null,

  {
    id: "fire3",
    source: require("../../../assets/images/fire-3.png"),
  },
  {
    id: "fire4",
    source: require("../../../assets/images/fire-4.png"),
  },

  null,
  null,
  null,
];

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              Bộ sưu tập hiện trường
            </Text>

            <Text style={styles.name}>
              Nguyễn Vũ Huy
              <Text style={styles.phone}>
                {" "}
                · (+84) 373 224 840
              </Text>
            </Text>
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        {/* GRID */}
        <View style={styles.grid}>
          {images.map((item, index) => (
            <TouchableOpacity
  key={index}
  style={styles.imageBox}
 onPress={() => {
  if (!item?.source) return;

  // VIDEO
  if (item.id === "fire2") {
    router.push("/VideoViewer");
    return;
  }

  // IMAGE
  router.push({
    pathname: "/ImageViewer",
    params: {
      image: item.id,
    },
  });
}}
>
              {item && (
                <>
                  <Image
                     source={item.source}
                    style={styles.image}
                  />

                  {(index === 1 ||
                    index === 4) && (
                    <View
                      style={
                        styles.timeWrapper
                      }
                    >
                      <Text
                        style={
                          styles.timeText
                        }
                      >
                        {index === 1
                          ? "0:45"
                          : "1:12"}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor:
      "rgba(0,0,0,0.18)",

    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    width: "88%",

    backgroundColor: "#FFF",

    borderRadius: 26,

    paddingTop: 18,
    paddingHorizontal: 14,
    paddingBottom: 22,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",

    marginBottom: 18,
  },

  title: {
    color: "#313A51",

    fontSize: 18,
    fontWeight: "700",

    marginBottom: 7,
  },

  name: {
    color: "#FF6B3D",

    fontSize: 13,
    fontWeight: "700",
  },

  phone: {
    color: "#9B9B9B",

    fontWeight: "400",
  },

  closeButton: {
    width: 26,
    height: 26,

    borderRadius: 999,

    backgroundColor: "#F1F1F5",

    alignItems: "center",
    justifyContent: "center",
  },

  closeText: {
    color: "#7B7B7B",

    fontSize: 14,
    fontWeight: "700",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",

    justifyContent: "space-between",
  },

  imageBox: {
    width: "31%",
    aspectRatio: 1,

    borderRadius: 10,

    backgroundColor: "#EAEAF0",

    marginBottom: 10,

    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  timeWrapper: {
    position: "absolute",

    right: 4,
    bottom: 4,

    backgroundColor:
      "rgba(0,0,0,0.72)",

    borderRadius: 6,

    paddingHorizontal: 5,
    paddingVertical: 2,
  },

  timeText: {
    color: "#FFF",

    fontSize: 9,
    fontWeight: "600",
  },
});