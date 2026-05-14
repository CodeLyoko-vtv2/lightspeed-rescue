import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { styles } from "../constants/map-search.styles";

// Dữ liệu "Gần đây" đúng chuẩn địa bàn của sếp
const RECENT_LOCATIONS = [
  { id: "1", name: "Công an Thành phố Đà Nẵng", address: "80 Lê Lợi, Hải Châu, Đà Nẵng 550000", status: "Sắp đóng cửa", time: "17:00", statusColor: "#FF9800", router: "/place-detail" },
  { id: "2", name: "Bệnh viện Đa khoa Ngũ Hành Sơn", address: "Đường Lê Văn Hiến, Ngũ Hành Sơn, Đà Nẵng", status: "Mở cửa suốt ngày đêm", statusColor: "#4CAF50" },
  { id: "3", name: "Trường THPT Ngũ Hành Sơn", address: "2763+5V9, Bà Bang Nhãn, Ngũ Hành Sơn, Đà Nẵng", status: "Đóng cửa", time: "Mở cửa lúc 7:30 T4", statusColor: "#F44336" },
  { id: "4", name: "Trường Đại học Công nghệ Thông tin và Tr...", address: "470 Trần Đại Nghĩa, Ngũ Hành Sơn, Đà Nẵng 550000", status: "Sắp đóng cửa", time: "17:00", statusColor: "#FF9800" },
  { id: "5", name: "KTX VIỆT - HÀN | VKU", address: "Ngũ Hành Sơn, Đà Nẵng", status: "Mở cửa suốt ngày đêm", statusColor: "#4CAF50" },
  { id: "6", name: "Trường THPT Phan Châu Trinh", address: "Lê Lợi, Hải Châu, Đà Nẵng", status: "Đóng cửa", time: "Mở cửa lúc 7:30 T4", statusColor: "#F44336" },
];

export default function MapSearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  const renderRecentItem = ({ item }: any) => (
    <TouchableOpacity style={styles.recentItem} activeOpacity={0.7} onPress={() => router.push(item.router)}>
      <View style={styles.historyIconWrapper}>
        <Ionicons name="time-outline" size={24} color="#555" />
      </View>
      <View style={styles.locationInfo}>
        <Text style={styles.locationName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.locationAddress} numberOfLines={1}>{item.address}</Text>
        <Text style={[styles.locationStatus, { color: item.statusColor }]}>
          {item.status} <Text style={{ color: "#777" }}>{item.time}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* --- SEARCH HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#555" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm ở đây"
          autoFocus={true} // Tự động bật bàn phím khi vào màn
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        <Ionicons name="mic" size={24} color="#555" />
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            {/* --- QUICK ACTIONS (Nhà riêng, Nơi làm...) --- */}
            <View style={styles.quickActions}>
              <View style={styles.actionItemWrapper}>
                <TouchableOpacity style={styles.actionCircle}>
                  <Ionicons name="home" size={22} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.actionTextWrapper}>
                  <Text style={styles.actionTitle}>Nhà riêng</Text>
                  <Text style={styles.actionSubtitle}>Đặt vị trí</Text>
                </View>
              </View>

              <View style={styles.actionItemWrapper}>
                <TouchableOpacity style={[styles.actionCircle, { backgroundColor: '#E3F2FD' }]}>
                  <MaterialCommunityIcons name="briefcase" size={22} color={COLORS.primary} />
                </TouchableOpacity>
                <View style={styles.actionTextWrapper}>
                  <Text style={styles.actionTitle}>Nơi làm...</Text>
                  <Text style={styles.actionSubtitle}>Đặt vị trí</Text>
                </View>
              </View>

              <View style={styles.actionItemWrapper}>
                <TouchableOpacity style={[styles.actionCircle, { backgroundColor: '#F5F5F5' }]}>
                  <Ionicons name="ellipsis-horizontal" size={22} color="#999" />
                </TouchableOpacity>
                <View style={styles.actionTextWrapper}>
                  <Text style={styles.actionTitle}>Khác</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* --- SECTION LABEL --- */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Gần đây</Text>
              <Ionicons name="information-circle-outline" size={20} color="#555" />
            </View>
          </>
        }
        data={RECENT_LOCATIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderRecentItem}
        ListFooterComponent={
          <TouchableOpacity style={styles.footerButton}>
            <Text style={styles.footerText}>Nội dung tìm kiếm khác gần đây</Text>
          </TouchableOpacity>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}