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
  isAdmin?: boolean;
  onLogout?: () => void;
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
  isAdmin = false,
  onLogout,
}) => {
  const { colors, theme } = useTheme();

  const renderRightComponent = () => {
    if (rightComponent) {
      return rightComponent;
    }

    if (isAdmin && onLogout) {
      return (
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={onLogout}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      );
    }

    if (showCart) {
      return (
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={onCartPress}
        >
          <Ionicons name="cart-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={[
      styles.header,
      {
        backgroundColor: colors.background,
        borderBottomColor: colors.separator,
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

        {renderRightComponent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    backgroundColor: 'white',
    zIndex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
  },
  logoContainer: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    marginHorizontal: 10,
    height: 40,
  },
  searchBarActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    marginHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: '#888',
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  cartButton: {
    padding: 8,
    marginLeft: 8,
  },
  logoutButton: {
    padding: 8,
    marginLeft: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
});

export default Header; 