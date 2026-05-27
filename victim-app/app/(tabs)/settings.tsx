import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Switch,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../_layout";
import { COLORS } from "../../constants/colors";
import { styles } from "../../constants/(tabs)/settings.styles";

// Firebase
import { auth, db } from "../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { cancelActiveSosForVictim } from "../../utils/sosLifecycle";

export default function SettingsScreen() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const insets = useSafeAreaInsets();

  const [userData, setUserData] = useState({
    fullName: "Đang tải...",
    phoneNumber: "",
  });
  const [isFaceIdEnabled, setIsFaceIdEnabled] = useState(false);

  // ✅ Tự động làm mới dữ liệu mỗi khi màn hình này được hiển thị
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      const storedPhone = await AsyncStorage.getItem("userPhone");
      if (storedPhone) {
        const q = query(
          collection(db, "Users"),
          where("phoneNumber", "==", storedPhone),
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          
          // Định dạng số điện thoại từ +84 sang 0
          const rawPhone = storedPhone;
          const displayPhone = rawPhone.startsWith("+84") 
            ? "0" + rawPhone.slice(3) 
            : rawPhone;

          setUserData({
            fullName: data.fullName,
            phoneNumber: displayPhone,
          });
        }
      }
    } catch (error) {
      console.error("Lỗi cập nhật Settings:", error);
    }
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn thoát tài khoản?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          const storedUid = await AsyncStorage.getItem("userUid");
          const victimId = storedUid || auth.currentUser?.uid;
          if (victimId) {
            await cancelActiveSosForVictim(victimId, "victim_logout");
          }
          await signOut(auth);
          await AsyncStorage.removeItem("userPhone");
          await AsyncStorage.removeItem("userUid");
          await AsyncStorage.removeItem("userRole");
          setAuth(false);
        },
      },
    ]);
  };

  const MenuItem = ({ icon, title, subtitle, isSwitch, value, onToggle, showChevron = true, onPress }: any) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      disabled={isSwitch}
      activeOpacity={0.7}
    >
      <View style={styles.iconWrapper}>
        <View style={styles.iconCircle}>{icon}</View>
      </View>
      <View style={styles.menuText}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: "#D1D1D1", true: COLORS.primary }}
          thumbColor="#FFF"
        />
      ) : (
        showChevron && <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Ionicons name="settings-sharp" size={32} color={COLORS.primary} />
        <Text style={styles.headerTitle}>Cài đặt</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>Hồ sơ</Text>

        <View style={styles.profileCard}>
          <Image source={require("../../assets/images/avatar.png")} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userData.fullName}</Text>
            {/* Hiển thị số điện thoại thay vì username */}
            <Text style={styles.profileUsername}>{userData.phoneNumber}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push("/edit-profile")}
          >
            <Feather name="edit-3" size={32} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuGroup}>
          <MenuItem
            icon={<Ionicons name="person-outline" size={22} color="#5C6BC0" />}
            title="Tài khoản của tôi"
            subtitle="Chỉnh sửa thông tin tài khoản của bạn"
            onPress={() => router.push("/edit-profile")}
          />
          <MenuItem icon={<Ionicons name="people-outline" size={22} color="#5C6BC0" />} title="Người thân liên hệ" subtitle="Quản lý danh sách đã lưu" />
          <MenuItem
            icon={<Ionicons name="lock-closed-outline" size={22} color="#5C6BC0" />}
            title="Xác thực khuôn mặt / Vân tay"
            subtitle="Quản lý bảo mật thiết bị của bạn"
            isSwitch={true}
            value={isFaceIdEnabled}
            onToggle={setIsFaceIdEnabled}
          />
          <MenuItem icon={<Ionicons name="shield-checkmark-outline" size={22} color="#5C6BC0" />} title="Xác thực 2 lớp" subtitle="Tăng cường bảo mật cho tài khoản của bạn" />
          <MenuItem icon={<Ionicons name="log-out-outline" size={22} color="#5C6BC0" />} title="Đăng xuất" subtitle="Đăng xuất tài khoản" onPress={handleLogout} />
        </View>

        <Text style={styles.sectionLabel}>Khác</Text>
        <View style={styles.menuGroup}>
          <MenuItem icon={<Ionicons name="notifications-outline" size={22} color="#5C6BC0" />} title="Trợ giúp & Hỗ trợ" subtitle="" />
        </View>
      </ScrollView>
    </View>
  );
}
