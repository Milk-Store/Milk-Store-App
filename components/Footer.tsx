import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTheme } from '../contexts/ThemeContext';
import { scale, normalize } from '../styles/responsive';

type FooterProps = {
  showInfo?: boolean;
};

const Footer: React.FC<FooterProps> = ({ showInfo = true }) => {
  const { colors } = useTheme();

  const handleCall = () => {
    Linking.openURL('tel:0906532932');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showInfo && (
        <View style={[styles.footerInfo, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.footerTop}>
            <Image
              source={require('../assets/images/logo.jpg')}
              style={styles.footerLogo}
              contentFit="contain"
            />
            <Text style={[styles.footerTitle, { color: colors.text }]}>
              THẾ GIỚI SỮA MẸ XÍU
            </Text>
            <Text style={[styles.footerTagline, { color: colors.text }]}>
              Chăm sóc dinh dưỡng cho mẹ và bé
            </Text>
          </View>
          
          <View style={styles.contactInfo}>
            <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
              <Ionicons name="call-outline" size={18} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                Hotline: 0906532932
              </Text>
            </TouchableOpacity>
            <View style={styles.contactItem}>
              <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                CSKH: 0902741222 (Zalo)
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                CSKH: 0798932932 (Zalo)
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={18} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                CN1: 84 ÂU CƠ, HOÀ KHÁNH BẮC, LIÊN CHIỂU, ĐÀ NẴNG
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={18} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                CN3: 368 TÔN ĐẢN, HOÀ AN, CẨM LỆ, ĐÀ NẴNG
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={18} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                CN4: ĐT 602 HOÀ SƠN, AN NGÃI ĐÔNG, HOÀ VANG, ĐÀ NẴNG (Sát bên Nhà Thuốc Long Châu)
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={18} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                CN5: 865 NGUYỄN LƯƠNG BẰNG, HÒA KHÁNH BẮC, LIÊN CHIỂU, ĐÀ NẴNG
              </Text>
            </View>
          </View>
          
          <View style={styles.copyright}>
            <Text style={[styles.copyrightText, { color: colors.mediumGray }]}>
              © 2025 THẾ GIỚI SỮA MẸ XÍU. Tất cả các quyền được bảo lưu.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  footerInfo: {
    padding: scale(16),
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerTop: {
    alignItems: 'center',
    marginBottom: scale(20),
  },
  footerLogo: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    marginBottom: scale(12),
  },
  footerTitle: {
    fontSize: normalize(18),
    fontWeight: '700',
    marginBottom: scale(8),
    color: '#FF69B4',
  },
  footerTagline: {
    fontSize: normalize(14),
    fontWeight: '500',
    marginBottom: scale(12),
  },
  contactInfo: {
    marginBottom: scale(20),
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(12),
    paddingHorizontal: scale(8),
  },
  contactText: {
    fontSize: normalize(14),
    marginLeft: scale(8),
    flex: 1,
  },
  copyright: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: scale(16),
  },
  copyrightText: {
    fontSize: normalize(12),
    textAlign: 'center',
  },
});

export default Footer; 