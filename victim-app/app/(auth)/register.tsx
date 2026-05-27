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
// ✅ Thêm useSafeAreaInsets để lấy thông số "cằm" máy chính xác
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { COLORS } from "../../constants/colors";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useAuth } from "../_layout";
import { auth, db } from "../../firebaseConfig";
import { styles } from "../../constants/(auth)/register.styles";

const phoneToAuthEmail = (phone: string) =>
  `${phone.replace(/[^0-9]/g, "")}@lightspeed-rescue.local`;

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // ✅ "Thước đo" thần thánh để fix lề dưới
  const { setAuth } = useAuth();
  const { phone } = useLocalSearchParams();

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const isFormValid = fullName.trim().length > 0 && password.length >= 6;

  const handleRegister = async () => {
    if (!isFormValid) return;
    setLoading(true);
    try {
      if (!phone) {
        Alert.alert("Lỗi", "Thiếu số điện thoại đăng ký.");
        return;
      }
      const formattedPhone = String(phone);
      const credential = await createUserWithEmailAndPassword(
        auth,
        phoneToAuthEmail(formattedPhone),
        password,
      );
      await updateProfile(credential.user, { displayName: fullName.trim() });
      await setDoc(doc(db, "Users", credential.user.uid), {
        uid: credential.user.uid,
        fullName: fullName.trim(),
        phoneNumber: formattedPhone,
        authEmail: phoneToAuthEmail(formattedPhone),
        role: "VICTIM",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await AsyncStorage.setItem("userPhone", formattedPhone);
      await AsyncStorage.setItem("userUid", credential.user.uid);
      await AsyncStorage.setItem("userRole", "VICTIM");
      setAuth(true);
      router.replace("/(tabs)/home");
    } catch (error: any) {
      const message =
        error?.code === "auth/email-already-in-use"
          ? "Số điện thoại này đã được đăng ký. Vui lòng đăng nhập."
          : "Không thể tạo tài khoản. Vui lòng thử lại.";
      Alert.alert("Lỗi đăng ký", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✅ Bỏ thuộc tính container mặc định nếu nó gây xung đột flex
    <View
      style={{ flex: 1, backgroundColor: COLORS.white, paddingTop: insets.top }}
    >
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
            {/* ✅ Dùng minHeight vừa đủ để không ép layout quá mức */}
            <View
              style={[
                styles.content,
                { flex: 1, minHeight: 550, paddingHorizontal: 30 },
              ]}
            >
              {/* --- TOP --- */}
              <View style={styles.topSection}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                >
                  <Ionicons
                    name="chevron-back"
                    size={32}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ĐĂNG KÝ</Text>
              </View>

              {/* --- MIDDLE: FORM --- */}
              <View
                style={[
                  styles.middleSection,
                  { flex: 1, justifyContent: "center" },
                ]}
              >
                {!isKeyboardVisible && (
                  <Image
                    source={require("../../assets/images/splash-icon.png")}
                    style={[styles.logo, { height: 100, marginBottom: 20 }]}
                    resizeMode="contain"
                  />
                )}

                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Tên người dùng</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập tên người dùng"
                      placeholderTextColor={COLORS.textMuted}
                      value={fullName}
                      onChangeText={setFullName}
                      keyboardType="default"
                    />
                  </View>
                </View>

                <View style={styles.inputSection}>
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
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={24}
                        color={COLORS.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ✅ PHẦN NÚT NẰM NGOÀI: Sử dụng insets.bottom để chống dính lề */}
      {!isKeyboardVisible && (
        <View
          style={{
            paddingHorizontal: 30,
            // Cộng thêm phần cằm của máy ảo/điện thoại thật để nút không bao giờ bị "sát lề"
            paddingBottom: Math.max(insets.bottom, 20),
            backgroundColor: COLORS.white,
          }}
        >
          <TouchableOpacity
            style={[
              styles.actionButton,
              (!isFormValid || loading) && { opacity: 0.5 },
            ]}
            onPress={handleRegister}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text
                style={[
                  styles.actionButtonText,
                  isFormValid && styles.actionButtonTextActive,
                ]}
              >
                Đăng ký
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
