import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { styles } from "../constants/contact-detail.styles"; // Huy dùng bộ style sếp gửi

// Dữ liệu danh sách Công an tại Đà Nẵng
const POLICE_LIST = [
  { id: "1", name: "Công an Ngũ Hành Sơn" },
  { id: "2", name: "Công an Sơn Trà" },
  { id: "3", name: "Công an An Khê" },
  { id: "4", name: "Công an Hòa Cường" },
  { id: "5", name: "Công an Thành phố Đà Nẵng" },
];

export default function ContactDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.groupCard} activeOpacity={0.7}>
      <View style={styles.groupInfoLeft}>
        <Image 
          source={require("../assets/images/police_group.png")} 
          style={styles.groupImage} 
        />
        <Text style={styles.groupName}>{item.name}</Text>
      </View>
      {/* Không có text bên phải như màn trước sếp nhé */}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* --- HEADER (Dùng style #dddddd66 sếp vừa sửa) --- */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
            <Ionicons name="chevron-back" size={30} color="#2D3142" />
          </TouchableOpacity>
          <Image 
            source={require("../assets/images/police_group.png")} 
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} 
          />
          <Text style={styles.headerTitle}>Công an</Text>
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color={COLORS.primary} />
          <Text style={styles.addButtonText}>Thêm liên hệ</Text>
        </TouchableOpacity>
      </View>

      {/* --- SEARCH BAR --- */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        <TouchableOpacity>
          <Ionicons name="mic-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* --- LIST ITEMS --- */}
      <FlatList
        data={POLICE_LIST}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}