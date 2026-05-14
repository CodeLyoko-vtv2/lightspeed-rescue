import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/colors";
import { styles } from "../../constants/(auth)/verify-phone.styles";

export default function VerifyPhoneScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // ✅ Theo dõi trạng thái bàn phím để ẩn/hiện nút một cách khoa học
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleGoToOTP = async () => {
    if (phoneNumber.length < 9) {
      Alert.alert(
        "Thông báo",
        "Vui lòng nhập số điện thoại hợp lệ (9-10 chữ số)",
      );
      return;
    }
    setLoading(true);
    const formattedPhone = phoneNumber.startsWith("0")
      ? `+84${phoneNumber.slice(1)}`
      : `+84${phoneNumber}`;

    setTimeout(() => {
      setLoading(false);
      router.push({
        pathname: "/(auth)/otp-verification",
        params: { phone: formattedPhone },
      });
    }, 1000);
  };

  const isButtonActive = phoneNumber.length >= 9 || isFocused || loading;

  return (
    <SafeAreaView
      style={[styles.container, { flex: 1, backgroundColor: COLORS.white }]}
    >
      <StatusBar barStyle="dark-content" />

      {/* 1. PHẦN TRÊN & GIỮA: Dùng KeyboardAvoidingView để đẩy Input lên khi cần */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{ flex: 1, paddingHorizontal: 30 }}
          onPress={Keyboard.dismiss}
        >
          {/* --- TOP: TIÊU ĐỀ --- */}
          <View style={[styles.topSection, { marginTop: 40 }]}>
            <Text style={styles.headerTitle}>ĐĂNG KÝ</Text>
          </View>

          {/* --- MIDDLE: LOGO & INPUT --- */}
          <View
            style={[
              styles.middleSection,
              { flex: 1, justifyContent: "center" },
            ]}
          >
            <Image
              source={require("../../assets/images/splash-icon.png")}
              style={[
                styles.logo,
                isKeyboardVisible && { height: 100, marginBottom: 10 },
              ]} // Thu nhỏ logo khi hiện phím cho chuyên nghiệp
              resizeMode="contain"
            />

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Xác minh số điện thoại</Text>
              <View
                style={[
                  styles.inputWrapper,
                  isFocused && { borderColor: COLORS.primary, borderWidth: 2 },
                ]}
              >
                <Text style={styles.countryCode}>+84</Text>
                <View style={styles.separator} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập tại đây..."
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={(text) =>
                    setPhoneNumber(text.replace(/[^0-9]/g, ""))
                  }
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  maxLength={10}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* 2. PHẦN DƯỚI: NẰM NGOÀI KeyboardAvoidingView ĐỂ "NẰM YÊN" */}
      {/* Huy ẩn nút khi hiện bàn phím: Đây là chuẩn UX cho các app cứu hộ/an ninh để tập trung nhập liệu */}
      {!isKeyboardVisible && (
        <View
          style={[
            styles.bottomSection,
            { paddingHorizontal: 30, marginBottom: 20 },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.actionButton,
              !isButtonActive && { opacity: 0.5 },
            ]}
            onPress={handleGoToOTP}
            disabled={loading || !isButtonActive}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text
                style={[
                  styles.actionButtonText,
                  isButtonActive && styles.actionButtonTextActive,
                ]}
              >
                Xác nhận mã OTP
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.footerText}>Đã có tài khoản</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
