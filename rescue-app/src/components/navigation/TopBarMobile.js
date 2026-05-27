import React from "react";
import PropTypes from "prop-types";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";

import {
  useRouter,
} from "expo-router";

export default function TopBarMobile({ profile }) {

  const router = useRouter();
  const teamName =
    profile?.fullName ||
    profile?.name ||
    profile?.displayName ||
    "Đội cứu hộ";
  const phone = formatPhone(
    profile?.phoneNumber ||
    profile?.hotline ||
    profile?.phone,
  );
  const locationText = getProfileLocation(profile);

  return (
    <View style={styles.container}>

      {/* Avatar */}
      <Image
        source={require("../../../assets/images/avatar.png")}
        style={styles.avatar}
      />

      {/* Info */}
      <TouchableOpacity
        style={styles.infoWrapper}
        activeOpacity={0.9}
        onPress={() =>
          router.push("/BanDo")
        }
      >
        <Text style={styles.teamText} numberOfLines={2}>
          {phone ? `${teamName} ${phone}` : teamName}
        </Text>

        <View style={styles.locationButton}>
          <Image
            source={require("../../../assets/icons/Searched-Icon-5.png")}
            style={styles.locationIcon}
          />

          <Text style={styles.locationText} numberOfLines={1}>
            {locationText}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Arrow */}
      <TouchableOpacity
        style={styles.arrowWrapper}
        onPress={() =>
          router.push("/ThongBao")
        }
      >
        <Image
          source={require("../../../assets/icons/Month Chevron.png")}
          style={styles.arrowIcon}
        />
      </TouchableOpacity>

      {/* Notification */}
      <TouchableOpacity
        style={styles.notificationWrapper}
        onPress={() =>
          router.push("/ThongBao")
        }
      >
        <Image
          source={require("../../../assets/icons/Frame 483260.png")}
          style={styles.bellIcon}
        />

        <View style={styles.dot} />
      </TouchableOpacity>

    </View>
  );
}

function formatPhone(phone) {
  if (!phone) return "";
  const normalized = String(phone).trim();
  if (normalized.startsWith("+")) return normalized;
  if (normalized.startsWith("0")) return `+84${normalized.slice(1)}`;
  return normalized;
}

function getProfileLocation(profile) {
  const address =
    profile?.address ||
    profile?.locationAddress ||
    profile?.currentAddress ||
    profile?.stationAddress;
  if (address) return shortenText(address, 42);

  const location = profile?.currentLocation || profile?.location;
  const lat = location?.lat ?? location?.latitude;
  const lng = location?.lng ?? location?.longitude;
  if (typeof lat === "number" && typeof lng === "number") {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }

  return "Chưa cập nhật vị trí";
}

function shortenText(value, maxLength) {
  const text = String(value).trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

TopBarMobile.propTypes = {
  profile: PropTypes.object,
};

TopBarMobile.defaultProps = {
  profile: null,
};

const styles = StyleSheet.create({
  container: {
    height: 74 + (StatusBar.currentHeight || 0),

    backgroundColor: "#F5F5FA",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 10,
    paddingTop: StatusBar.currentHeight || 0,

    position: "relative",
     zIndex: 999,
  elevation: 999
  },

  avatar: {
    width: 42,
    height: 42,

    borderRadius: 12,

    borderWidth: 1,
    borderColor: "#FF8852",

    marginRight: 12,
  },

  infoWrapper: {
    flex: 1,

    justifyContent: "center",
  },

  teamText: {
    color: "rgba(49,58,81,0.7)",

    fontSize: 14,
    fontWeight: "400",

    lineHeight: 18,
  },

  locationButton: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 5,
  },

  locationIcon: {
    width: 11,
    height: 13,

    resizeMode: "contain",

    marginRight: 6,
  },

  locationText: {
    color: "#313A51",

    fontSize: 14,
    fontWeight: "500",
  },

  arrowWrapper: {
    width: 22,
    height: 22,

    alignItems: "center",
    justifyContent: "center",

    marginLeft: 6,
  },

  arrowIcon: {
    width: 11,
    height: 18,

    resizeMode: "contain",
  },

  notificationWrapper: {
    width: 38,
    height: 38,

    alignItems: "center",
    justifyContent: "center",

    marginLeft: 8,

    position: "relative",
  },

  bellIcon: {
    width: 40,
    height: 40,

    resizeMode: "contain",
  },

  dot: {
    width: 6,
    height: 6,

    borderRadius: 999,

    backgroundColor: "#FF8852",

    position: "absolute",

    top: 8,
    right: 9,

    borderWidth: 1.5,
    borderColor: "#F3F5F6",
  },
});
