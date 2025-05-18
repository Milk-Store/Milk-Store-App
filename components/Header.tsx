import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Text,
  Platform,
  StatusBar,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { scale, normalize } from '../styles/responsive';
import StyleSheet2 from '../styles/StyleSheet';
import * as Device from 'expo-device';

type HeaderProps = {
  showLogo?: boolean;
  showBackButton?: boolean;
  showCart?: boolean;
  showSearch?: boolean;
  title?: string;
  searchValue?: string;
  placeholder?: string;
  onLogoPress?: () => void;
  onBackPress?: () => void;
  onCartPress?: () => void;
  onSearchPress?: () => void;
  onSearchChange?: (text: string) => void;
  onSearchClear?: () => void;
  isSearchActive?: boolean;
  rightComponent?: React.ReactNode;
};

const Header: React.FC<HeaderProps> = ({
  showLogo = true,
  showBackButton = false,
  showCart = true,
  showSearch = true,
  title,
  searchValue = '',
  placeholder = 'Tìm kiếm sản phẩm...',
  onLogoPress,
  onBackPress,
  onCartPress,
  onSearchPress,
  onSearchChange,
  onSearchClear,
  isSearchActive = false,
  rightComponent,
}) => {
  const { colors, theme } = useTheme();

  return (
    <View style={[
      styles.header,
      {
        backgroundColor: colors.background,
        borderBottomColor: colors.separator,
        zIndex: 10,
        elevation: 3,
        paddingTop: scale(8),
      }
    ]}>
      <View style={styles.topHeader}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )}

        {showLogo && !showBackButton && (
          <TouchableOpacity 
            onPress={onLogoPress}
            style={styles.logoContainer}
          >
            <Image
              source={require('../assets/images/logo.jpg')}
              style={styles.logo}
              contentFit="contain"
            />
          </TouchableOpacity>
        )}
        
        {title && !showLogo && !showBackButton && (
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        )}

        {/* Thanh tìm kiếm */}
        {showSearch && (
          isSearchActive ? (
            <View style={[styles.searchBarActive, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name="search" size={20} color={colors.text} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                value={searchValue}
                onChangeText={onSearchChange}
                placeholder={placeholder}
                placeholderTextColor="#888"
                autoFocus={isSearchActive}
              />
              {searchValue ? (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={onSearchClear}
                >
                  <Ionicons name="close-circle" size={18} color={colors.text} />
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.searchBar, { backgroundColor: colors.cardBackground }]}
              onPress={onSearchPress}
            >
              <Ionicons name="search" size={20} color={colors.text} style={styles.searchIcon} />
              <Text style={styles.searchPlaceholder}>{placeholder}</Text>
            </TouchableOpacity>
          )
        )}

        {/* Button bên phải (mặc định là giỏ hàng) */}
        {rightComponent || (showCart && (
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={onCartPress}
          >
            <Ionicons name="cart-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: scale(16),
    paddingBottom: scale(8),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 10,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: scale(48),
  },
  logoContainer: {
    width: scale(40),
    height: scale(40),
  },
  logo: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
  },
  title: {
    fontSize: normalize(18),
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: scale(20),
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    flex: 1,
    marginHorizontal: scale(10),
  },
  searchBarActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: scale(20),
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    flex: 1,
    marginHorizontal: scale(10),
  },
  searchIcon: {
    marginRight: scale(8),
  },
  searchPlaceholder: {
    fontSize: normalize(14),
    color: '#888',
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: normalize(14),
    paddingVertical: 0,
  },
  clearButton: {
    padding: scale(4),
  },
  cartButton: {
    padding: scale(8),
  },
  backButton: {
    padding: scale(8),
    marginRight: scale(8),
  },
});

export default Header; 