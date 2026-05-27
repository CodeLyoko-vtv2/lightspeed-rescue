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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "../_layout";
import { auth, db } from "../../firebaseConfig";
import { styles } from "../../constants/(auth)/login.styles";

const normalizePhone = (value: string) => {
  const digits = value.replace(/[^0-9]/g, "");
  if (digits.startsWith("84")) return `+${digits}`;
  if (digits.startsWith("0")) return `+84${digits.slice(1)}`;
  return `+84${digits}`;
};

const phoneToAuthEmail = (phone: string) =>
  `${phone.replace(/[^0-9]/g, "")}@lightspeed-rescue.local`;

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
      const formattedPhone = normalizePhone(phoneNumber);
      const userQuery = query(
        collection(db, "Users"),
        where("phoneNumber", "==", formattedPhone),
      );
      const userQuerySnap = await getDocs(userQuery);
      const victimDoc = userQuerySnap.docs.find((item) => {
        const role = item.data().role;
        return role === "VICTIM" || role === "victim";
      });
      const authEmail =
        victimDoc?.data().authEmail
          ? victimDoc.data().authEmail
          : phoneToAuthEmail(formattedPhone);
      const credential = await signInWithEmailAndPassword(
        auth,
        authEmail,
        password,
      );
      const userSnap = await getDoc(doc(db, "Users", credential.user.uid));
      const userData = userSnap.exists() ? userSnap.data() : null;

      if (!userData || (userData.role !== "VICTIM" && userData.role !== "victim")) {
        await signOut(auth);
        Alert.alert(
          "Không đúng quyền",
          "Tài khoản này không phải tài khoản nạn nhân.",
        );
        return;
      }

      await AsyncStorage.setItem("userPhone", formattedPhone);
      await AsyncStorage.setItem("userUid", credential.user.uid);
      await AsyncStorage.setItem("userRole", "VICTIM");
      setAuth(true);
      router.replace("/(tabs)/home");
    } catch (error) {
      Alert.alert("Sai thông tin đăng nhập", "Số điện thoại hoặc mật khẩu không chính xác.");
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
