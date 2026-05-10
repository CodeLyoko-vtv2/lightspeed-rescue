import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../constants/colors";
import { styles } from "../constants/(auth)/edit-profile.styles";

// Firebase
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [docId, setDocId] = useState("");

  useEffect(() => {
    fetchCurrentData();
  }, []);

  const fetchCurrentData = async () => {
    try {
      const storedPhone = await AsyncStorage.getItem("userPhone");
      if (storedPhone) {
        const q = query(collection(db, "Users"), where("phoneNumber", "==", storedPhone));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const data = userDoc.data();
          setDocId(userDoc.id);
          
          const nameParts = data.fullName.split(" ");
          setFirstName(nameParts.pop() || "");
          setLastName(nameParts.join(" ") || "");

          const rawPhone = data.phoneNumber || "";
          const displayPhone = rawPhone.startsWith("+84") ? "0" + rawPhone.slice(3) : rawPhone;
          setPhone(displayPhone);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  const handleUpdate = async () => {
    if (!firstName || !lastName) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ họ và tên.");
      return;
    }
    setLoading(true);
    try {
      const userRef = doc(db, "Users", docId);
      await updateDoc(userRef, {
        fullName: `${lastName} ${firstName}`.trim(),
      });

      Alert.alert("Thành công", "Thông tin đã được cập nhật!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật thông tin.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <ActivityIndicator style={{flex:1}} color={COLORS.primary} />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={32} color={COLORS.textBold} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        <View style={{ width: 32 }} /> 
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              <Image source={require("../assets/images/avatar.png")} style={styles.avatar} />
            </View>
            <Text style={styles.profileName}>{lastName} {firstName}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <TextInput style={styles.input} placeholder="Tên" value={firstName} onChangeText={setFirstName} placeholderTextColor={COLORS.textMuted} />
            </View>

            <View style={styles.inputGroup}>
              <TextInput style={styles.input} placeholder="Họ" value={lastName} onChangeText={setLastName} placeholderTextColor={COLORS.textMuted} />
            </View>

            <View style={[styles.inputGroup, styles.rowInput, { backgroundColor: '#F5F5F5' }]}>
              <View style={styles.countryPicker}>
                <Text style={{ fontSize: 24 }}>🇻🇳</Text>
                <View style={styles.vLine} />
              </View>
              <TextInput style={[styles.input, { flex: 1 }]} value={phone} editable={false} />
            </View>

            <TouchableOpacity style={[styles.inputGroup, styles.rowInput]}>
              <Text style={[styles.inputText, !gender && { color: COLORS.textMuted }]}>{gender || "Chọn giới tính"}</Text>
              <Ionicons name="chevron-down" size={20} color="#BDBDBD" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.inputGroup, styles.rowInput]}>
              <Text style={[styles.inputText, !birthday && { color: COLORS.textMuted }]}>{birthday || "Chọn ngày sinh"}</Text>
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.submitButton, loading && { opacity: 0.7 }]} onPress={handleUpdate} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Cập nhật hồ sơ</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}