import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

interface CustomSplashProps {
  onFinish: () => void;
}

export default function CustomSplash({ onFinish }: CustomSplashProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current; // Độ mờ ban đầu là 1

  useEffect(() => {
    // Đợi đúng 3 giây theo yêu cầu của sếp
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0, // Dissolve về 0
        duration: 800, // Tốc độ tan biến
        useNativeDriver: true,
      }).start(() => {
        onFinish(); // Chuyển sang màn hình xác minh số điện thoại
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        {/* Logo chính giữa theo thiết kế */}
        <Image 
          source={require('../assets/images/Logo.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />

        {/* Tên App - Màu sắc chuẩn #FF8852 */}
        <Text style={styles.appName}>Lightspeed Rescue</Text>

        {/* Slogan - Màu xám mờ theo hình Giới thiệu.png */}
        <Text style={styles.slogan}>"Tốc độ ánh sáng! Giải cứu!"</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Đảm bảo đè toàn màn hình
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF', // Nền trắng tinh khôi theo thiết kế
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Luôn nằm trên cùng
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: width * 0.45, // Tỷ lệ logo so với màn hình
    height: width * 0.45,
    marginBottom: 30, // Khoảng cách giữa logo và chữ
  },
  appName: {
    fontSize: 34,
    fontWeight: '700', // Độ đậm vừa phải theo hình
    color: COLORS.primary, // #FF8852
    textAlign: 'center',
    marginBottom: 15,
  },
  slogan: {
    fontSize: 22,
    color: '#999999', // Màu xám chuẩn cho slogan
    textAlign: 'center',
    fontWeight: '400',
  },
});