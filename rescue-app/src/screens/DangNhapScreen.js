import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

const normalizePhone = (value) => {
  const digits = value.replace(/[^0-9]/g, "");
  if (digits.startsWith("84")) return `+${digits}`;
  if (digits.startsWith("0")) return `+84${digits.slice(1)}`;
  return `+84${digits}`;
};

const phoneToAuthEmail = (phone) =>
  `${phone.replace(/[^0-9]/g, "")}@lightspeed-rescue.local`;


export default function DangNhapScreen() {
  const [phone, setPhone] = useState("");
const [password, setPassword] = useState("");
  const router = useRouter();

const handleLogin = async () => {
  if (phone.trim() === "" || password.trim() === "") {
    Alert.alert("Thiếu thông tin", "Vui lòng nhập tài khoản đội cứu hộ.");
    return;
  }

  try {
    const formattedPhone = normalizePhone(phone);
    const accountQuery = query(
      collection(db, "Users"),
      where("phoneNumber", "==", formattedPhone),
    );
    const accountSnap = await getDocs(accountQuery);
    const rescueDoc = accountSnap.docs.find((item) => {
      const role = item.data().role;
      return role === "RESCUE_TEAM" || role === "rescuer";
    });
    const authEmail =
      rescueDoc?.data().authEmail
        ? rescueDoc.data().authEmail
        : phoneToAuthEmail(formattedPhone);
    const credential = await signInWithEmailAndPassword(
      auth,
      authEmail,
      password,
    );
    const userSnap = await getDoc(doc(db, "Users", credential.user.uid));
    const authUserData = userSnap.exists() ? userSnap.data() : null;
    const authUserRole = authUserData?.role;
    const accountData = rescueDoc?.data();
    const userData =
      authUserRole === "RESCUE_TEAM" || authUserRole === "rescuer"
        ? authUserData
        : accountData;
    const rescuerUid =
      authUserRole === "RESCUE_TEAM" || authUserRole === "rescuer"
        ? credential.user.uid
        : rescueDoc?.id || credential.user.uid;
    const role = userData?.role;

    if (userData?.disabled || userData?.deletedAt) {
      await signOut(auth);
      Alert.alert("Tài khoản đã bị khóa", "Vui lòng liên hệ quản trị hệ thống.");
      return;
    }

    if (role !== "RESCUE_TEAM" && role !== "rescuer") {
      await signOut(auth);
      Alert.alert("Không đúng quyền", "Tài khoản này không phải đội cứu hộ.");
      return;
    }

    await AsyncStorage.setItem("rescuerUid", rescuerUid);
    await AsyncStorage.setItem("rescuerPhone", userData.phoneNumber || formattedPhone);
    await AsyncStorage.setItem("rescuerRole", role);
    router.replace("/TrangChu");
  } catch (_error) {
    Alert.alert(
      "Sai thông tin đăng nhập",
      "Tài khoản đội cứu hộ không tồn tại hoặc mật khẩu không chính xác.",
    );
  }
};
  return (
    <SafeAreaView style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>ĐĂNG NHẬP</Text>

      <Text style={styles.subtitle}>Dành cho đội cứu hộ</Text>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Svg width={92} height={90} style={styles.leftShape}>
          <Defs>
            <LinearGradient
              id="grad1"
              x1="70.7427"
              y1="0.707413"
              x2="17.2302"
              y2="91.8314"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor="#FFB15C" />
              <Stop offset="1" stopColor="#FF7A4D" />
            </LinearGradient>
          </Defs>

          <Path
            d="M64.9451 77.8414H7.11026C0.741787 77.8414 -2.40276 70.1016 2.16112 65.66L67.5396 2.0322C72.3309 -2.63072 80.3227 1.31377 79.5355 7.95297L71.9918 71.5807C71.5685 75.1516 68.541 77.8414 64.9451 77.8414Z"
            fill="url(#grad1)"
          />
        </Svg>

        <Svg width={92} height={90} style={styles.rightShape}>
          <Defs>
            <LinearGradient
              id="grad2"
              x1="-2.30388"
              y1="84.2979"
              x2="56.3037"
              y2="-15.3103"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor="#FFAD5C" />
              <Stop offset="1" stopColor="#FF8450" />
            </LinearGradient>
          </Defs>

          <Path
            d="M14.6447 -0.00153351H72.4796C78.8481 -0.00153351 81.9926 7.73821 77.4287 12.1799L12.0502 75.8076C7.25898 80.4706 -0.732819 76.5261 0.0543213 69.8869L7.598 6.2591C8.02136 2.68822 11.0489 -0.00153351 14.6447 -0.00153351Z"
            fill="url(#grad2)"
          />
        </Svg>
      </View>

      {/* Phone */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Số điện thoại</Text>

        <View
  style={styles.inputBox}
>
  <Text style={styles.prefix}>+84</Text>

  <View style={styles.divider} />

  <TextInput
    style={[styles.input, !phone && styles.placeholderText]}
    value={phone}
    onChangeText={(value) => setPhone(value.replace(/[^0-9]/g, ""))}
    keyboardType="phone-pad"
    placeholder="Nhập tại đây..."
    placeholderTextColor="rgba(0,0,0,0.3)"
  />
</View>
      </View>

      {/* Password */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mật khẩu</Text>

        <View
  style={styles.inputBox}
>
          <TextInput
            style={[styles.input, styles.passwordInput, !password && styles.placeholderText]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            autoCapitalize="none"
            autoCorrect={false}
            selectionColor="#313A51"
            placeholder="Nhập tại đây..."
            placeholderTextColor="rgba(0,0,0,0.3)"
          />
        </View>
      </View>

      {/* Button */}
     <TouchableOpacity
  style={[
    styles.button,
    (!phone || !password) && styles.buttonDisabled,
  ]}
  activeOpacity={0.9}
  onPress={handleLogin}
>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    alignItems: "center",
    paddingTop: 70,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FF8852",
  },

  subtitle: {
    fontSize: 18,
    color: "#8B8B8B",
    marginTop: 10,
  },

  logoContainer: {
    width: 138,
    height: 153,
    marginTop: 60,
    marginBottom: 50,
    position: "relative",
  },

  leftShape: {
    position: "absolute",
    left: 0,
    top: 0,
  },

  rightShape: {
    position: "absolute",
    right: 0,
    bottom: 0,
  },

  inputContainer: {
    width: "85%",
    marginBottom: 25,
  },

  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(0,0,0,0.7)",
    marginBottom: 10,
  },

  inputBox: {
    height: 50,
    borderWidth: 1,
    borderColor: "#FF8852",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  buttonDisabled: {
  opacity: 0.6,
},
    divider: {
  width: 1,
  height: 20,
  backgroundColor: "rgba(0,0,0,0.3)",
  marginRight: 10,
},
  prefix: {
    color: "rgba(0,0,0,0.3)",
    fontSize: 14,
    marginRight: 10,
  },

  input: {
  flex: 1,
  fontSize: 14,
  paddingVertical: 0,
  color: "#313A51",
},

  passwordInput: {
    color: "#111827",
    includeFontPadding: false,
  },

  button: {
    width: "85%",
    height: 65,
    backgroundColor: "#FF8852",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 90,
  },

  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },

});
