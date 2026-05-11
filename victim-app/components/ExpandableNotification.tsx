// components/ExpandableNotification.tsx
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // ✅ Thêm router để điều hướng
import { COLORS } from '../constants/colors';

interface Props {
  title: string;
  content: string[];
  isImportant?: boolean;
  defaultExpanded?: boolean;
  requestId?: string | null; // ✅ Thêm requestId vào props
  onClose?: () => void;      // ✅ Thêm để đóng khay thông báo khi bấm
}

export const ExpandableNotification = ({ title, content, isImportant, defaultExpanded = false, requestId, onClose }: Props) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const animation = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const height = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 140], // Tăng nhẹ độ cao để chứa nút bấm
  });

  return (
    <View style={styles.card}>
      <TouchableOpacity 
        activeOpacity={0.7} 
        style={styles.cardHeader} 
        onPress={toggleExpand}
      >
        <Text style={[styles.cardTitle, isImportant && { fontWeight: 'bold' }]}>
          {title}
        </Text>
        <Animated.View style={{ transform: [{ rotate: animation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}>
          <Ionicons name="chevron-down" size={20} color="#000" />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={{ height, opacity: animation, overflow: 'hidden' }}>
        <View style={styles.cardContent}>
          {content.map((line, index) => (
            <Text key={index} style={styles.contentText}>{line}</Text>
          ))}
          
          {isImportant && (
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => {
                if (onClose) onClose(); // Thu khay thông báo lại trước khi đi
                // ✅ Chuyển sang trang theo dõi thực tế
                router.push({
                  pathname: "/tracking-rescue",
                  params: { requestId: requestId }
                });
              }}
            >
              <Text style={styles.actionBtnText}>XEM VỊ TRÍ ĐỘI CỨU HỘ</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#EEF2F5', borderRadius: 15, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  cardTitle: { fontSize: 14, color: '#2D3142', flex: 0.9 },
  cardContent: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: '#DEE4E9', paddingTop: 10 },
  contentText: { fontSize: 13, color: '#555', marginBottom: 4 },
  actionBtn: { 
    marginTop: 12, 
    alignSelf: 'center', 
    backgroundColor: '#FFF', 
    paddingHorizontal: 20, 
    paddingVertical: 8, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF7A45'
  },
  actionBtnText: { color: '#FF7A45', fontWeight: 'bold', fontSize: 14 }
});