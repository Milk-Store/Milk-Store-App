import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTheme } from '../contexts/ThemeContext';
import { scale, normalize } from '../styles/responsive';

type FooterProps = {
  activeTab?: 'home' | 'products' | 'cart' | 'account';
  onHomePress?: () => void;
  onProductsPress?: () => void;
  onCartPress?: () => void;
  onAccountPress?: () => void;
  showInfo?: boolean;
};

const Footer: React.FC<FooterProps> = () => {
  const { colors } = useTheme();


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.footerInfo, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.footerTop}>
            <Image
              source={require('../assets/images/logo.jpg')}
              style={styles.footerLogo}
              contentFit="contain"
            />
            <Text style={[styles.footerTagline, { color: colors.text }]}>
              Vì sức khỏe của gia đình bạn
            </Text>
            <View style={styles.socialLinks}>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.background }]}>
                <Ionicons name="logo-facebook" size={24} color="#3b5998" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.background }]}>
                <Ionicons name="logo-instagram" size={24} color="#e1306c" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.background }]}>
                <Ionicons name="logo-youtube" size={24} color="#ff0000" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={18} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                Hotline: 1900 6789
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={18} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                Email: support@milkshop.vn
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={18} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                Địa chỉ: 123 Đường ABC, Quận XYZ, TP. HCM
              </Text>
            </View>
          </View>
          
          <View style={styles.copyright}>
            <Text style={[styles.copyrightText, { color: colors.mediumGray }]}>
              © 2023 Milk Shop. All rights reserved.
            </Text>
          </View>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: scale(8),
    borderTopWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: scale(4),
  },
  tabLabel: {
    fontSize: normalize(12),
    marginTop: scale(4),
  },
  footerInfo: {
    padding: scale(16),
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerTop: {
    alignItems: 'center',
    marginBottom: scale(16),
  },
  footerLogo: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    marginBottom: scale(8),
  },
  footerTagline: {
    fontSize: normalize(14),
    fontWeight: '500',
    marginBottom: scale(12),
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(12),
  },
  socialButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactInfo: {
    marginBottom: scale(16),
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  contactText: {
    fontSize: normalize(14),
    marginLeft: scale(8),
  },
  copyright: {
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: normalize(12),
  },
});

export default Footer; 