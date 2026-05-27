import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

export default function BoSuuTapModal({
  onClose,
  images,
  victimName,
  victimPhone,
}) {
  const router = useRouter();
  const mediaItems = normalizeImages(images);

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              Bộ sưu tập hiện trường
            </Text>

            <Text style={styles.name}>
              {victimName || "Nạn nhân"}
              {victimPhone ? (
                <Text style={styles.phone}>
                  {" "}
                  · {victimPhone}
                </Text>
              ) : null}
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

        {mediaItems.length > 0 ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
          >
            {mediaItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.imageBox,
                  index % 2 === 0 && styles.leftImageBox,
                ]}
                activeOpacity={0.88}
                onPress={() => {
                  router.push({
                    pathname: "/ImageViewer",
                    params: {
                      imageUrl: item.url,
                    },
                  });
                }}
              >
                <Image
                  source={{ uri: item.url }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Chưa có hình ảnh hiện trường.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return [];

  return images
    .map((item, index) => {
      if (typeof item === "string" && item.trim()) {
        return { id: `image_${index}`, url: item.trim() };
      }

      if (item?.url) {
        return { id: item.id || `image_${index}`, url: item.url };
      }

      return null;
    })
    .filter(Boolean)
    .slice(0, 12);
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
    maxHeight: "72%",

    backgroundColor: "#FFF",

    borderRadius: 26,

    paddingTop: 18,
    paddingHorizontal: 14,
    paddingBottom: 18,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",

    marginBottom: 18,
  },

  headerText: {
    flex: 1,
    paddingRight: 12,
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
    width: 34,
    height: 34,

    borderRadius: 999,

    backgroundColor: "#F1F1F5",

    alignItems: "center",
    justifyContent: "center",
  },

  closeText: {
    color: "#7B7B7B",

    fontSize: 18,
    fontWeight: "700",
  },

  scroll: {
    maxHeight: 360,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",

    paddingBottom: 2,
  },

  imageBox: {
    width: "48%",
    aspectRatio: 1,

    borderRadius: 12,

    backgroundColor: "#EAEAF0",

    marginBottom: 12,

    overflow: "hidden",
  },

  leftImageBox: {
    marginRight: "4%",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  emptyState: {
    width: "100%",
    minHeight: 132,

    borderRadius: 14,

    backgroundColor: "#F5F5F8",

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 16,
  },

  emptyText: {
    color: "#8B8B8B",

    fontSize: 13,
    fontWeight: "500",
  },
});
