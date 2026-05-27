import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../constants/(auth)/otp-verification.styles";
import { COLORS } from "../../constants/colors";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function OTPVerificationScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false); // ✅ Theo dõi bàn phím
  const inputRef = useRef<TextInput>(null);

  // --- LOGIC TIMER ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // ✅ THEO DÕI BÀN PHÍM ĐỂ XỬ LÝ GIAO DIỆN "NẰM YÊN"
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleResendOTP = async () => {
    setResendLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setTimer(30);
    setOtp("");
    setResendLoading(false);
    Alert.alert("Thành công", "Mã xác thực mới đã được gửi đến số điện thoại của bạn.");
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const existingUserQuery = query(
        collection(db, "Users"),
        where("phoneNumber", "==", phone),
      );
      const existingUserSnap = await getDocs(existingUserQuery);
      const hasAccount = existingUserSnap.docs.some((item) => {
        const role = item.data().role;
        return role === "VICTIM" || role === "victim";
      });

      if (phone && hasAccount) {
        router.replace({ pathname: "/(auth)/login", params: { phone } });
      } else {
        router.replace({ pathname: "/(auth)/register", params: { phone } });
      }
    } catch (error) {
      console.error("Lỗi xác thực:", error);
      Alert.alert("Lỗi hệ thống", "Không thể kết nối với trung tâm cứu hộ.");
    } finally {
      setLoading(false);
    }
  };

  const isButtonActive = otp.length === 4 && !loading;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.white }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* 1. PHẦN TRÊN & GIỮA: Chỉ đẩy phần này khi hiện phím */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.content, { flex: 1, paddingHorizontal: 30 }]}>
            
            {/* --- TOP: TIÊU ĐỀ & BACK --- */}
            <View style={styles.topSection}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={32} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>ĐĂNG KÝ</Text>
            </View>

            {/* --- MIDDLE: NHẬP OTP --- */}
            <View style={[styles.middleSection, { flex: 1, justifyContent: 'center' }]}>
              <Text style={styles.inputLabel}>Nhập mã OTP</Text>

              {/* Bấm vào các ô OTP thì mới hiện bàn phím */}
              <TouchableOpacity 
                activeOpacity={1} 
                onPress={() => inputRef.current?.focus()} 
                style={styles.otpContainer}
              >
                {[0, 1, 2, 3].map((index) => (
                  <View key={index} style={styles.otpBox}>
                    <Text style={styles.otpText}>{otp[index] || ""}</Text>
                  </View>
                ))}
              </TouchableOpacity>

              <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                keyboardType="number-pad"
                maxLength={4}
                value={otp}
                onChangeText={setOtp}
                autoFocus={false} // ✅ Tắt tự động hiện phím khi vào trang
              />

              {/* TIMER & RESEND */}
              <View style={styles.resendContainer}>
                {resendLoading ? (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={[styles.resendText, { marginLeft: 10 }]}>Đang gửi lại mã...</Text>
                  </View>
                ) : timer > 0 ? (
                  <Text style={styles.resendText}>Gửi lại mã sau {timer}s</Text>
                ) : (
                  <TouchableOpacity onPress={handleResendOTP}>
                    <Text style={styles.resendLink}>Gửi lại mã ngay</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* 2. PHẦN DƯỚI: Nằm ngoài KeyboardAvoidingView để không bị "trồi" lên */}
      {!isKeyboardVisible && (
        <View style={[styles.bottomSection, { paddingHorizontal: 30, marginBottom: 20 }]}>
          <TouchableOpacity
            style={[styles.actionButton, !isButtonActive && { opacity: 0.5 }]}
            onPress={handleVerifyOTP}
            disabled={loading || !isButtonActive}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={[styles.actionButtonText, isButtonActive && styles.actionButtonTextActive]}>
                Xác nhận mã OTP
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
