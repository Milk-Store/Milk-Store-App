import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../contexts/ThemeContext';
import { BannerPopup as BannerPopupType } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface BannerPopupProps {
  banner: BannerPopupType | null;
  onClose: () => void;
}

const BannerPopup: React.FC<BannerPopupProps> = ({ banner, onClose }) => {
  const { colors } = useTheme();
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  console.log('BannerPopup render with:', { 
    hasBanner: !!banner, 
    bannerData: banner 
  });

  const handleClose = () => {
    console.log('Closing banner from component');
    onClose();
  };

  // Không render gì nếu không có banner hoặc visible là false
  if (!banner) {
    console.log('BannerPopup not rendering because:', { hasBanner: !!banner });
    return null;
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <View style={styles.touchableOverlay}>
          <TouchableOpacity 
            style={[
              styles.modalContent,
              { backgroundColor: colors.cardBackground }
            ]}
            activeOpacity={1}
            onPress={(e) => {
              // Ngăn sự kiện click truyền lên overlay
              e.stopPropagation();
            }}
          >
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <Image
              source={{ uri: banner.image }}
              style={[styles.bannerImage, { width: '100%' }]}
              contentFit="cover"
              transition={300}
            />
            
            <View style={styles.bannerInfo}>
              <Text style={[styles.title, { color: colors.text }]}>{banner.title}</Text>
              <Text style={[styles.description, { color: colors.primary }]}>
                {banner.description}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchableOverlay: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImage: {
    height: 200,
    width: '100%',
  },
  bannerInfo: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default BannerPopup; 