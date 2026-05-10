import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
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
import { COLORS } from "../../constants/colors";
import { styles } from "../../constants/(tabs)/contacts.styles";
import { router } from "expo-router";

// Dữ liệu mẫu theo đúng ảnh sếp gửi
const CONTACT_GROUPS = [
  { id: "1", name: "Chung", count: 2, icon: "address-book", type: "icon", color: "#CDDC39" },
  { id: "2", name: "Công an", count: 5, image: require("../../assets/images/police_group.png"), router: "/contact-detail" },
  { id: "3", name: "Bác sĩ", count: 6, image: require("../../assets/images/doctor_group.png") },
  { id: "4", name: "Cứu hỏa", count: 2, icon: "address-book", type: "icon", color: "#C5CAE9" },
];

export default function ContactsScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.groupCard} activeOpacity={0.7} onPress={() => item.router && router.push(item.router)}>
      <View style={styles.groupInfoLeft}>
        {item.image ? (
          <Image source={item.image} style={styles.groupImage} />
        ) : (
          <View style={[styles.groupIconWrapper, { backgroundColor: item.color }]}>
            <FontAwesome5 name={item.icon} size={24} color="#333" />
          </View>
        )}
        <Text style={styles.groupName}>{item.name}</Text>
      </View>
      <Text style={styles.contactCount}>{item.count} Liên Hệ</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nhóm liên hệ khẩn cấp</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color={COLORS.primary} />
          <Text style={styles.addButtonText}>Thêm nhóm</Text>
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

      {/* --- LIST GROUPS --- */}
      <FlatList
        data={CONTACT_GROUPS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}