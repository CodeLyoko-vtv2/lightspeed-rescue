import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  TouchableWithoutFeedback,
  View,
  ScrollView,
} from "react-native";
// ✅ Sử dụng insets để đo đạc vùng an toàn chuẩn xác
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../constants/colors";

// Firebase Import
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../_layout";
import { styles } from "../../constants/(auth)/login.styles";

export default function LoginScreen() {
  const { setAuth } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const initialPhone = params.phone ? String(params.phone).replace("+84", "0") : "";

  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false); // ✅ Cảm biến bàn phím

  // ✅ 1. Lắng nghe bàn phím để kích hoạt hiệu ứng thu nhỏ/ẩn logo
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const isFormValid = phoneNumber.length >= 9 && password.length >= 6;

  const handleLogin = async () => {
    if (!isFormValid) return;
    setLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith("0") ? `+84${phoneNumber.slice(1)}` : `+84${phoneNumber}`;
      const usersRef = collection(db, "Users");
      const q = query(usersRef, where("phoneNumber", "==", formattedPhone), where("password", "==", password));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        await AsyncStorage.setItem("userPhone", formattedPhone);
        setAuth(true);
      } else {
        Alert.alert("Lỗi", "Thông tin tài khoản hoặc mật khẩu không đúng.");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Kết nối hệ thống thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white, paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          bounces={false} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.content, { flex: 1, minHeight: 550, paddingHorizontal: 30 }]}>
              
              {/* --- TOP: TIÊU ĐỀ --- */}
              <View style={styles.topSection}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                  <Ionicons name="chevron-back" size={32} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ĐĂNG NHẬP</Text>
              </View>

              {/* --- MIDDLE: FORM --- */}
              <View style={[styles.middleSection, { flex: 1, justifyContent: 'center' }]}>
                {/* ✅ HIỆU ỨNG THU NHỎ/ẨN: Khi bàn phím hiện thì ẩn logo cho chuyên nghiệp */}
                {!isKeyboardVisible && (
                  <Image
                    source={require("../../assets/images/splash-icon.png")}
                    style={[styles.logo, { height: 100, marginBottom: 30 }]}
                    resizeMode="contain"
                  />
                )}

                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Số điện thoại</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.countryCode}>+84</Text>
                    <View style={styles.separator} />
                    <TextInput
                      style={styles.input}
                      placeholder="9xx xxx xxx"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="phone-pad"
                      value={phoneNumber}
                      onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ""))}
                      maxLength={10}
                    />
                  </View>
                </View>

                <View style={[styles.inputSection, { marginTop: 20 }]}>
                  <Text style={styles.inputLabel}>Mật khẩu</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập mật khẩu"
                      placeholderTextColor={COLORS.textMuted}
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- BOTTOM: NÚT BẤM (CỐ ĐỊNH THEO INSETS) --- */}
      {!isKeyboardVisible && (
        <View style={{ 
          paddingHorizontal: 30, 
          paddingBottom: Math.max(insets.bottom, 20), 
          backgroundColor: COLORS.white 
        }}>
          <TouchableOpacity
            style={[styles.actionButton, (!isFormValid || loading) && { opacity: 0.5 }]}
            onPress={handleLogin}
            disabled={!isFormValid || loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionButtonText}>Đăng nhập</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}